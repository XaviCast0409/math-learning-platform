import { useParams } from 'react-router-dom';
import { useRaid } from './hooks/useRaid';
import { useRaidAudio } from './hooks/useRaidAudio';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, EyeOff, MicOff, Zap } from 'lucide-react';

// Componentes Modulares
import { RaidHUD } from './components/RaidHUD';
import { RaidQuestionDisplay } from './components/RaidQuestionDisplay';
import { RaidLeaderboard } from './components/RaidLeaderboard';
import { RaidLoadingScreen, RaidVictoryScreen, RaidDefeatScreen } from './components/RaidScreens';

export default function RaidGameContainer() {
  const { raidId } = useParams();
  const numericRaidId = Number(raidId) || 0;

  // 1. Hook de Lógica
  const {
    loading, bossData, currentQuestion, battleLogs, 
    isVictory, isDefeat, timeLeft,
    uiState, actions,
    combo, leaderboard, activeDebuff, mvpData, rewards // 👇 Datos nuevos
  } = useRaid(numericRaidId);

  // 2. Hook de Audio
  useRaidAudio({
    isVictory,
    isDefeat,
    isAnswerCorrect: uiState.isAnswerCorrect
  });

  // --- RENDERIZADO CONDICIONAL DE PANTALLAS ---

  if (loading || !bossData) return <RaidLoadingScreen />;
  // Pasamos mvpData a la pantalla de victoria
  if (isVictory) return <RaidVictoryScreen mvpData={mvpData} rewards={rewards} />;
  if (isDefeat) return <RaidDefeatScreen />;

  // --- JUEGO ACTIVO ---

  // Clases CSS dinámicas para efectos visuales (Ceguera / Silencio)
  const containerEffectClass = clsx({
      "blur-[3px] scale-[1.02] transition-all duration-300": activeDebuff === 'blind', // Ceguera
      "grayscale contrast-125": activeDebuff === 'silence', // Silencio
      "hue-rotate-90": activeDebuff === 'shuffle', // Confusión
      "": !activeDebuff
  });

  return (
    <div className={`min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden font-sans ${containerEffectClass}`}>
      
      {/* Fondo Ambiental */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/20 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-800/40 blur-[100px] rounded-full" />
      </div>

      {/* 1. DEBUFF OVERLAY (Mensaje Gigante cuando el Boss ataca) */}
      <AnimatePresence>
        {activeDebuff && (
            <motion.div 
                initial={{ opacity: 0, scale: 1.5 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
                <div className="bg-red-600/90 text-white px-8 py-4 rounded-xl font-black text-3xl uppercase tracking-widest shadow-2xl flex items-center gap-4 animate-pulse border-4 border-red-400 transform -rotate-2">
                    {activeDebuff === 'blind' && <><EyeOff size={40}/> ¡CEGUERA!</>}
                    {activeDebuff === 'silence' && <><MicOff size={40}/> ¡SILENCIO!</>}
                    {activeDebuff === 'shuffle' && <><Zap size={40}/> ¡CONFUSIÓN!</>}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 2. LEADERBOARD (Tabla de Clasificación lateral) */}
      <RaidLeaderboard data={leaderboard} />

      {/* 3. COMBO COUNTER (Animado) */}
      <AnimatePresence>
        {combo >= 2 && (
             <motion.div 
                key="combo-counter"
                initial={{ scale: 0, x: -50, rotate: -10 }} 
                animate={{ scale: 1, x: 0, rotate: -6 }} 
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-24 left-4 z-20 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(234,88,12,0.5)] border border-orange-400"
             >
                <div className="text-xl font-black italic">🔥 {combo}x COMBO</div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-center bg-black/20 rounded mt-1">
                    {combo >= 5 ? 'Daño x1.5' : 'Daño x1.2'}
                </span>
             </motion.div>
        )}
      </AnimatePresence>

      {/* 4. HUD (Vida y Tiempo) */}
      <RaidHUD bossData={bossData} timeLeft={timeLeft} />

      {/* 5. Área Central (Preguntas y Logs) */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 relative z-10 mt-4">
        
        {/* Logs de Batalla */}
        <div className="h-16 mb-4 flex flex-col-reverse overflow-hidden mask-linear-fade">
             <AnimatePresence>
                {battleLogs.map((log) => (
                    <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0 }}
                        className="text-xs font-mono font-bold text-slate-400 mb-1 flex items-center gap-2"
                    >
                        <span className="text-red-500"><Sword size={12}/></span>
                        <span>{log.message}</span>
                    </motion.div>
                ))}
             </AnimatePresence>
        </div>

        {/* Pregunta */}
        <RaidQuestionDisplay 
            question={currentQuestion}
            selectedOption={uiState.selectedOption}
            isAnswerCorrect={uiState.isAnswerCorrect}
            onOptionClick={actions.handleOptionClick}
        />

      </div>
    </div>
  );
}