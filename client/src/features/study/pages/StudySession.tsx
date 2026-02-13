// src/pages/study/StudySession.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/common/Button';
import { GlobalLoading } from '../../../components/common/GlobalLoading';
import { LevelUpModal } from '../../../components/gamification/LevelUpModal';

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
    isFlipped,
    setIsFlipped,
    secondsElapsed,
    showMilestone,
    canInteract,
    levelRewards,
    setLevelRewards,
    handleRate,
    handleExit,
    isActive,
    isTabHidden,
    sessionSummary, // 👈 ASEGÚRATE DE QUE TU HOOK RETORNE ESTO
    setSessionSummary, // 👈 Y ESTO PARA CERRARLO
  } = useStudySession(deckId);

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

      {/* 👇 AGREGAR ESTE MODAL AL FINAL */}
      <AnimatePresence>
        {sessionSummary && (
          <SessionSummaryModal
            summary={sessionSummary}
            onClose={() => {
              setSessionSummary(null);
              navigate('/learn'); // 👈 AL CERRAR, NOS VAMOS
            }}
          />
        )}
      </AnimatePresence>

      <FlashcardScene
        card={activeCard}
        isFlipped={isFlipped}
        canInteract={canInteract}
        onFlip={() => setIsFlipped(!isFlipped)}
      />

      <StudyControls
        isFlipped={isFlipped}
        canInteract={canInteract}
        onReveal={() => setIsFlipped(true)}
        onRate={handleRate}
      />

      <AnimatePresence>
        {levelRewards && (
          <LevelUpModal rewards={levelRewards} onClose={() => setLevelRewards(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};
