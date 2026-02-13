import { useReducer, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { lessonApi, type LessonContent } from '../api/lessons.api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

// --- Types & Interfaces ---

interface EarnedStats {
  xp: number;
  gems: number;
  leveledUp?: boolean;
  levelRewards?: {
    gems: number;
    lives: number;
    items: string[]
  };
  appliedBonuses?: string[];
}

type GameStatus = 'intro' | 'playing' | 'finished';
type FeedbackStatus = 'idle' | 'correct' | 'wrong';

interface LessonState {
  status: GameStatus;
  currentIdx: number;
  lives: number;
  feedbackStatus: FeedbackStatus;
  selectedOption: string; // Para multiple choice / true_false
  textInput: string;      // Para fill_in
  isChecking: boolean;
  isTransitioning: boolean;
  earnedStats: EarnedStats;
}

type LessonAction =
  | { type: 'INIT_LIVES'; payload: number }
  | { type: 'START_PLAYING' }
  | { type: 'SET_OPTION'; payload: string }
  | { type: 'SET_TEXT_INPUT'; payload: string }
  | { type: 'CHECK_START' }
  | { type: 'CHECK_RESULT'; payload: { isCorrect: boolean } }
  | { type: 'NEXT_EXERCISE' }
  | { type: 'FINISH_LESSON'; payload: EarnedStats }
  | { type: 'RESET_TRANSITION' };

// --- Reducer ---

const initialState: LessonState = {
  status: 'intro',
  currentIdx: 0,
  lives: 0, // Se inicializa luego con el user data
  feedbackStatus: 'idle',
  selectedOption: '',
  textInput: '',
  isChecking: false,
  isTransitioning: false,
  earnedStats: { xp: 0, gems: 0 }
};

function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'INIT_LIVES':
      return { ...state, lives: action.payload };
    case 'START_PLAYING':
      return { ...state, status: 'playing' };
    case 'SET_OPTION':
      return { ...state, selectedOption: action.payload };
    case 'SET_TEXT_INPUT':
      return { ...state, textInput: action.payload };
    case 'CHECK_START':
      return { ...state, isChecking: true };
    case 'CHECK_RESULT':
      const newLives = action.payload.isCorrect ? state.lives : Math.max(0, state.lives - 1);
      return {
        ...state,
        isChecking: false,
        feedbackStatus: action.payload.isCorrect ? 'correct' : 'wrong',
        lives: newLives
      };
    case 'NEXT_EXERCISE':
      return {
        ...state,
        currentIdx: state.currentIdx + 1,
        selectedOption: '',
        textInput: '',
        feedbackStatus: 'idle',
        isTransitioning: true
      };
    case 'RESET_TRANSITION':
      return { ...state, isTransitioning: false };
    case 'FINISH_LESSON':
      return { ...state, status: 'finished', earnedStats: action.payload };
    default:
      return state;
  }
}

// --- Hook ---

export const useLesson = (lessonId: number) => {
  const navigate = useNavigate();
  const { user, updateUserStats } = useAuth();

  // 1. Data Fetching con SWR (Caching + Revalidación automática)
  const { data: content, error, isLoading } = useSWR<LessonContent>(
    lessonId ? `/lessons/${lessonId}/play` : null,
    () => lessonApi.getLessonContent(lessonId),
    {
      revalidateOnFocus: false, // No queremos que se recargue mientras juega
      shouldRetryOnError: false
    }
  );

  // 2. State Management con Reducer
  const [state, dispatch] = useReducer(lessonReducer, initialState);

  // 3. Derived State para seguridad (Reemplaza useEffect de redirección)
  const hasLives = (user?.lives ?? 0) > 0;

  // Sincronizar Vidas Iniciales solo una vez al cargar
  useEffect(() => {
    if (user) {
      dispatch({ type: 'INIT_LIVES', payload: user.lives });
    }
  }, [user?.lives]); // Solo si cambian las vidas desde fuera (ej: recarga)

  // Actions
  const currentExercise = content?.exercises[state.currentIdx];

  const checkAnswer = useCallback(() => {
    if (!currentExercise) return;

    dispatch({ type: 'CHECK_START' });

    // Simular delay de red/procesamiento visual
    setTimeout(() => {
      const isTextType = currentExercise.type === 'fill_in';
      const rawUserAnswer = isTextType ? state.textInput : state.selectedOption;
      const userAnswer = String(rawUserAnswer).trim().toLowerCase();
      const correctAnswerKey = String(currentExercise.correct_answer).trim().toLowerCase();

      let isCorrect = false;

      // Validación
      if (userAnswer === correctAnswerKey) {
        isCorrect = true;
      } else if (currentExercise.options && !Array.isArray(currentExercise.options)) {
        // Fallback legacy para objetos (Record<string, string>)
        // TypeScript strict: Validamos que sea objeto antes de acceder
        const opts = currentExercise.options as Record<string, string>;
        const correctValue = opts[correctAnswerKey];
        if (correctValue && String(correctValue).trim().toLowerCase() === userAnswer) {
          isCorrect = true;
        }
      }

      dispatch({ type: 'CHECK_RESULT', payload: { isCorrect } });
    }, 600);
  }, [currentExercise, state.textInput, state.selectedOption]);

  const handleContinue = async () => {
    if (!content) return;

    // A. Game Over (Sin vidas)
    if (state.lives === 0) {
      try {
        await lessonApi.completeLesson(lessonId, 0, 0); // Registrar derrota
        updateUserStats({ lives: 0 });
      } catch (e) {
        console.error("Error sync derrota", e);
      }
      toast.error("💀 Te has quedado sin vidas");
      navigate('/courses');
      return;
    }

    // B. Victoria (Fin de lección)
    if (state.currentIdx >= content.exercises.length - 1) {
      // Calcular estrellas locales (optimista)
      let stars = 1;
      if (state.lives === 5) stars = 3;
      else if (state.lives >= 3) stars = 2;

      try {
        const result = await lessonApi.completeLesson(lessonId, stars, state.lives);

        // Actualizar contexto global
        updateUserStats({
          gems: result.newTotalGems,
          xp_total: result.newTotalXp,
          lives: result.newLives,
          level: result.newLevel
        });

        dispatch({
          type: 'FINISH_LESSON',
          payload: {
            xp: result.xpEarned,
            gems: result.gemsEarned,
            leveledUp: result.leveledUp,
            levelRewards: result.levelRewards,
            appliedBonuses: result.appliedBonuses
          }
        });
      } catch (error) {
        toast.error("Error al guardar progreso");
        navigate('/courses');
      }
      return;
    }

    // C. Siguiente Pregunta
    dispatch({ type: 'NEXT_EXERCISE' });
    setTimeout(() => {
      dispatch({ type: 'RESET_TRANSITION' });
    }, 300); // Sincronizado con CSS transition
  };

  return {
    loading: isLoading,
    error: error ? "Error cargando lección" : (user && !hasLives ? "No tienes vidas" : null),
    content,
    gameState: state.status,
    setGameState: (s: 'intro' | 'playing') => s === 'playing' ? dispatch({ type: 'START_PLAYING' }) : null,

    currentIdx: state.currentIdx,
    currentExercise,
    lives: state.lives,
    progress: content ? ((state.currentIdx + 1) / content.exercises.length) * 100 : 0,

    selectedOption: state.selectedOption,
    setSelectedOption: (opt: string) => dispatch({ type: 'SET_OPTION', payload: opt }),

    textInput: state.textInput,
    setTextInput: (txt: string) => dispatch({ type: 'SET_TEXT_INPUT', payload: txt }),

    feedbackStatus: state.feedbackStatus,
    checkAnswer,
    handleContinue,

    isChecking: state.isChecking,
    isTransitioning: state.isTransitioning,
    earnedStats: state.earnedStats
  };
};