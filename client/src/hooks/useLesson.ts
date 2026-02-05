import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lessonApi, type LessonContent } from '../api/lessons.api'; 
import { useAuth } from '../context/AuthContext';

// Interfaz para el estado de recompensas
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

export const useLesson = (lessonId: number) => {
  const navigate = useNavigate();
  const { user, updateUserStats } = useAuth();
  
  // Estados de Datos
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<LessonContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados del Juego
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'finished'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Inicializamos con las vidas reales del usuario
  const [lives, setLives] = useState(user?.lives ?? 0);
  
  // Estados de Respuesta
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textInput, setTextInput] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Estados Visuales
  const [isChecking, setIsChecking] = useState(false); 
  const [isTransitioning, setIsTransitioning] = useState(false); 
  
  const [earnedStats, setEarnedStats] = useState<EarnedStats>({ xp: 0, gems: 0 });

  // 1. SEGURIDAD EXTRA
  useEffect(() => {
    if (user && user.lives <= 0) {
        setTimeout(() => {
            alert("No tienes suficientes vidas para jugar.");
            navigate('/courses');
        }, 100);
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const data = await lessonApi.getLessonContent(lessonId);
        setContent(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la lección");
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) fetchLesson();
  }, [lessonId]);

  const checkAnswer = () => {
    if (!content) return;
    
    setIsChecking(true);

    setTimeout(() => {
        const currentExercise = content.exercises[currentIdx];
        const isTextType = currentExercise.type === 'fill_in';
        
        // Lo que mandó el usuario (ej: "125")
        const rawUserAnswer = isTextType ? textInput : selectedOption;
        const userAnswer = String(rawUserAnswer).trim().toLowerCase();
        
        // La respuesta correcta de la BD (ej: "b")
        const correctAnswerKey = String(currentExercise.correct_answer).trim().toLowerCase();
        
        let isCorrect = false;

        // CASO 1: Coincidencia exacta (Para fill_in o si la BD guarda el valor)
        if (userAnswer === correctAnswerKey) {
            isCorrect = true;
        } 
        // CASO 2: Búsqueda por clave (Para multiple_choice donde BD guarda 'b' y user manda '125')
        // 👇 CORRECCIÓN AQUÍ: Agregamos !Array.isArray para asegurar que es objeto
        else if (currentExercise.options && typeof currentExercise.options === 'object' && !Array.isArray(currentExercise.options)) {
            
            // 👇 SOLUCIÓN AL ERROR TS2352: Usamos 'as unknown' primero
            const opts = currentExercise.options as unknown as Record<string, string>;
            const correctValue = opts[correctAnswerKey];

            if (correctValue && String(correctValue).trim().toLowerCase() === userAnswer) {
                isCorrect = true;
            }
        }
    
        if (isCorrect) {
          setFeedbackStatus('correct');
        } else {
          setFeedbackStatus('wrong');
          setLives((prev) => Math.max(0, prev - 1));
        }
        
        setIsChecking(false);
    }, 600);
  };

  const handleContinue = async () => {
    if (!content) return;

    setFeedbackStatus('idle');

    // 2. SINCRONIZACIÓN DE DERROTA
    if (lives === 0) {
      try {
         await lessonApi.completeLesson(lessonId, 0, 0); 
         updateUserStats({ lives: 0 });
      } catch(e) {
         console.error("Error guardando derrota", e);
      }
      alert("💀 Ups, te quedaste sin vidas.");
      navigate('/courses');
      return;
    }

    // VICTORIA (Última pregunta)
    if (currentIdx >= content.exercises.length - 1) {
      setLoading(true);
      try {
        let stars = 1;
        if (lives === 5) stars = 3;
        else if (lives >= 3) stars = 2;

        const result = await lessonApi.completeLesson(lessonId, stars, lives);
        
        updateUserStats({
          gems: result.newTotalGems,
          xp_total: result.newTotalXp,
          lives: result.newLives,
          level: result.newLevel 
        });

        setEarnedStats({
          xp: result.xpEarned,     
          gems: result.gemsEarned,  
          leveledUp: result.leveledUp,       
          levelRewards: result.levelRewards,
          appliedBonuses: result.appliedBonuses 
        });

        setLoading(false);
        setGameState('finished');

      } catch (e) {
        navigate('/courses');
      }
      return;
    }

    // SIGUIENTE PREGUNTA
    setIsTransitioning(true);

    setTimeout(() => {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOption('');
        setTextInput('');
        
        setTimeout(() => {
            setIsTransitioning(false);
        }, 50);
        
    }, 300);
  };

  return {
    loading, error, content, gameState, setGameState,
    currentIdx, currentExercise: content?.exercises[currentIdx],
    lives,
    progress: content ? ((currentIdx + 1) / content.exercises.length) * 100 : 0,
    selectedOption, setSelectedOption,
    textInput, setTextInput,
    feedbackStatus, checkAnswer, handleContinue,
    isChecking, isTransitioning, earnedStats 
  };
};