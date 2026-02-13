import { useNavigate, useParams } from 'react-router-dom';
import { useLesson } from '../hooks/useLesson';

// Componentes UI
import { GlobalLoading } from '../../../components/common/GlobalLoading';
import { LessonHeader } from '../components/LessonHeader';
import { FeedbackSheet } from '../components/FeedbackSheet';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { RichText } from '../../../components/common/RichText';
import { BookOpen, Loader2 } from 'lucide-react';

// Subcomponentes
import { MultipleChoice } from '../components/MultipleChoice';
import { TextInput } from '../components/TextInput';
import { LessonVictory } from '../components/LessonVictory'; // 👈 Importante
import { clsx } from 'clsx';

export default function LessonContainer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    loading, content, gameState, setGameState,
    currentExercise, lives, progress,
    selectedOption, setSelectedOption,
    textInput, setTextInput,
    feedbackStatus, checkAnswer, handleContinue,
    // Nuevos estados visuales
    isChecking, isTransitioning,
    earnedStats // 👈 Datos ganados para la pantalla de victoria
  } = useLesson(Number(id));

  if (loading || !content) return <GlobalLoading />;

  // 1. PANTALLA DE VICTORIA 🎉
  if (gameState === 'finished') {
    return (
      <LessonVictory
        xp={earnedStats.xp}
        gems={earnedStats.gems}
        lives={lives}
        leveledUp={earnedStats.leveledUp}
        levelRewards={earnedStats.levelRewards}
        // 👇 Pasamos los bonos visuales si existen
        appliedBonuses={earnedStats.appliedBonuses}
        onContinue={() => navigate('/learn')}
      />
    );
  }

  // 2. PANTALLA DE INTRO (TEORÍA)
  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-in zoom-in-95">
          <div className="bg-brand-blue w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-black shadow-retro-sm">
            <BookOpen className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black text-center mb-4 uppercase">{content.lesson.title}</h1>
          <div className="bg-blue-50 p-4 rounded-xl border-2 border-brand-blue/20 text-gray-700 font-medium mb-8 leading-relaxed text-left">
            <RichText content={content.lesson.theory_content || "Prepárate..."} />
          </div>
          <Button className="w-full" onClick={() => setGameState('playing')}>
            ¡ENTENDIDO!
          </Button>
        </Card>
      </div>
    );
  }

  // 3. PANTALLA DE JUEGO
  if (!currentExercise) return <div>Error: Ejercicio no encontrado</div>;

  const exerciseType = currentExercise.type?.toLowerCase() || 'unknown';

  const isCheckDisabled = (exerciseType === 'fill_in' && !textInput) ||
    (exerciseType !== 'fill_in' && !selectedOption) ||
    isChecking; // Deshabilitar si está cargando

  return (
    <div className="min-h-screen bg-brand-light font-sans pb-32 transition-colors duration-500">

      <LessonHeader progress={progress} lives={lives} />

      {/* Transiciones suaves de opacidad y movimiento */}
      <div className={clsx(
        "max-w-md mx-auto pt-28 px-4 transition-all duration-300 ease-in-out",
        isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}>

        {/* Pregunta */}
        <div className="mb-8 text-left min-h-[60px]">
          <RichText
            content={currentExercise.prompt}
            className="text-2xl font-black text-gray-800 leading-tight"
          />
        </div>

        {/* --- OPCIONES --- */}
        {(exerciseType === 'multiple_choice' || exerciseType === 'true_false') && (
          <MultipleChoice
            options={currentExercise.options}
            selectedOption={selectedOption}
            onSelect={(opt) => feedbackStatus === 'idle' && !isChecking && setSelectedOption(opt)}
            disabled={feedbackStatus !== 'idle' || isChecking}
          />
        )}

        {exerciseType === 'fill_in' && (
          <TextInput
            value={textInput}
            onChange={setTextInput}
            disabled={feedbackStatus !== 'idle' || isChecking}
          />
        )}

        {/* Debug (Fallback por si hay un tipo raro en BD) */}
        {exerciseType !== 'multiple_choice' &&
          exerciseType !== 'true_false' &&
          exerciseType !== 'fill_in' && (
            <div className="p-4 bg-yellow-100 border-2 border-yellow-400 rounded-xl text-yellow-800 text-xs font-mono">
              ⚠️ Tipo desconocido: "{exerciseType}"
            </div>
          )}

      </div>

      {/* Botón de Acción */}
      {feedbackStatus === 'idle' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t-2 border-gray-200 bg-white z-30">
          <div className="max-w-md mx-auto">
            <Button
              className="w-full transition-all active:scale-95"
              onClick={checkAnswer}
              disabled={isCheckDisabled}
            >
              {isChecking ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>COMPROBANDO...</span>
                </div>
              ) : (
                "COMPROBAR"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Feedback Sheet */}
      <FeedbackSheet
        status={feedbackStatus}
        correctAnswer={currentExercise.correct_answer}
        explanation={currentExercise.solution_explanation}
        onContinue={handleContinue}
      />
    </div>
  );
}