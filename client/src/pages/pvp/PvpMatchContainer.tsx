import { Loader2 } from 'lucide-react';
import { usePvpMatch } from './hooks/usePvpMatch';

// Componentes modulares
import { MatchHUD } from './components/match/MatchHUD';
import { QuestionDisplay } from './components/match/QuestionDisplay';
import { FloatingEmotes } from './components/match/FloatingEmotes';
import { EmoteSelector } from './EmoteSelector'; // Asegura la ruta correcta

const PvpMatchContainer = () => {
  // Usamos nuestro Custom Hook que encapsula toda la lógica
  const {
    gameState, countdown, currentQuestionIndex, gameTimeLeft,
    myScore, opponentScore, selectedOption, isAnswerCorrect, isSubmitting,
    activeEmote, matchData, user, handlers
  } = usePvpMatch();

  // --- RENDERS CONDICIONALES ---

  if (gameState === 'FINISHED') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-6 animate-in fade-in">
         <div className="relative">
           <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
           <Loader2 className="h-16 w-16 text-brand-yellow animate-spin relative z-10" />
         </div>
         <div className="text-center">
           <h2 className="text-3xl font-black italic uppercase tracking-wider mb-2">¡Partida Finalizada!</h2>
           <p className="text-slate-400 font-medium">Calculando resultados...</p>
         </div>
      </div>
    );
  }

  if (!matchData || !matchData.questions) return null;

  if (gameState === 'WAITING') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 animate-pulse">
          <h2 className="text-xl text-slate-400 font-bold uppercase tracking-widest">Tu Oponente</h2>
          <div className="text-4xl font-black text-white">{matchData.opponent.username}</div>
          <div className="my-10">
            <div className="text-8xl font-black text-brand-yellow drop-shadow-lg">{countdown}</div>
            <p className="text-slate-500 mt-2">La batalla comienza en...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER JUEGO ACTIVO ---
  const currentQuestion = matchData.questions[currentQuestionIndex];
  if (!currentQuestion) return <div className="text-white text-center mt-20">Cargando pregunta...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
      
      <FloatingEmotes activeEmote={activeEmote} currentUserId={user?.id} />

      <MatchHUD 
        myScore={myScore}
        opponentScore={opponentScore}
        gameTimeLeft={gameTimeLeft}
        currentQuestionIndex={currentQuestionIndex}
        matchData={matchData}
      />

      <QuestionDisplay 
        question={currentQuestion}
        selectedOption={selectedOption}
        isAnswerCorrect={isAnswerCorrect}
        isSubmitting={isSubmitting}
        gameTimeLeft={gameTimeLeft}
        onOptionClick={handlers.handleOptionClick}
      />

      <div className="absolute bottom-6 left-6 z-20">
         <EmoteSelector 
            onSendEmote={handlers.handleSendEmote} 
            disabled={gameState !== 'PLAYING'} 
         />
      </div>
    </div>
  );
};

export default PvpMatchContainer;