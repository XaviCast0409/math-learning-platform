// src/pages/study/StudySession.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/common/Button';
import { GlobalLoading } from '../../../components/common/GlobalLoading';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';
import { FloatingXP } from '../../../components/common/FloatingXP';

// Nuevos Imports
import { useStudySession } from '../hooks/useStudySession';
import { StudyHeader } from '../components/session/StudyHeader';
import { AFKOverlay } from '../components/session/AFKOverlay';
import { FlashcardScene } from '../components/session/FlashcardScene';
import { StudyControls } from '../components/session/StudyControls';
// import { MilestoneToast } from '../../../components/gamification/MilestoneToast'; // Asumiendo que extrajiste el popup de hito

import { SessionSummaryModal } from '../components/session/SessionSummaryModal'; // 👈 IMPORTAR

export default function StudySession() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const {
    loading,
    cards,
    activeCard,
    cardsCompleted,
    totalCards,
    isFlipped,
    setIsFlipped,
    secondsElapsed,
    showMilestone,
    canInteract,
    isExiting,
    xpEarned,
    milestone20Reached,
    handleRate,
    handleExit,
    isActive,
    isTabHidden,
    sessionSummary, // 👈 ASEGÚRATE DE QUE TU HOOK RETORNE ESTO
    setSessionSummary, // 👈 Y ESTO PARA CERRARLO
  } = useStudySession(deckId);

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    ' ': () => !isFlipped && canInteract && setIsFlipped(true),  // SPACE = flip
    '1': () => isFlipped && canInteract && handleRate(1),         // 1 = Olvidé
    '2': () => isFlipped && canInteract && handleRate(3),         // 2 = Difícil
    '3': () => isFlipped && canInteract && handleRate(4),         // 3 = Bien
    '4': () => isFlipped && canInteract && handleRate(5),         // 4 = Fácil
    'Escape': handleExit                                          // ESC = exit
  }, canInteract);

  // Estados de carga y error
  if (loading) return <GlobalLoading />;

  if (cards.length === 0) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
      <p className="text-gray-500 font-medium">No hay cartas para estudiar.</p>
      <Button className="mt-4" onClick={() => navigate('/learn')}>Volver</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative overflow-hidden font-sans">

      <AFKOverlay isActive={isActive} isTabHidden={isTabHidden} />

      <StudyHeader
        secondsElapsed={secondsElapsed}
        isActive={isActive}
        onExit={handleExit}
        cardsCompleted={cardsCompleted}
        totalCards={totalCards}
        milestone20Reached={milestone20Reached}
      />

      {/* Pop-up de Hito (Si tienes el componente, si no, puedes dejar el div original) */}
      <AnimatePresence>
        {showMilestone && (
          /* Tu componente de MilestonePopup aquí */
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-400 text-white px-4 py-2 rounded-full font-bold shadow-lg z-50 animate-bounce">
            ¡Checkpoint! +50 XP
          </div>
        )}
      </AnimatePresence>

      {/* 👇 LÓGICA DE MODALES SECUENCIALES - ACTUALIZADO: LevelUp es global ahora */}
      <AnimatePresence>
        {/* Session Summary (El Level Up sale por encima vía Global Layer) */}
        {sessionSummary && (
          <SessionSummaryModal
            summary={sessionSummary}
            onClose={() => {
              setSessionSummary(null);
              navigate('/learn');
            }}
          />
        )}
      </AnimatePresence>

      <FlashcardScene
        card={activeCard}
        isFlipped={isFlipped}
        canInteract={canInteract}
        onFlip={() => setIsFlipped(!isFlipped)}
        isExiting={isExiting}
      />

      {/* FloatingXP Animation */}
      <FloatingXP
        xpAmount={xpEarned}
        show={xpEarned > 0}
        onComplete={() => { }}
      />

      <StudyControls
        isFlipped={isFlipped}
        canInteract={canInteract}
        onReveal={() => setIsFlipped(true)}
        onRate={handleRate}
      />
    </div>
  );
};
