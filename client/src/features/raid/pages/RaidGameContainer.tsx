import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useRaid } from '../hooks/useRaid';
import { useRaidAudio } from '../hooks/useRaidAudio';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, EyeOff, MicOff, Zap } from 'lucide-react';

// Componentes Modulares
import { RaidHUD } from '../components/RaidHUD';
import { RaidQuestionDisplay } from '../components/RaidQuestionDisplay';
import { RaidLeaderboard } from '../components/RaidLeaderboard';
import { RaidLoadingScreen, RaidVictoryScreen, RaidDefeatScreen } from '../components/RaidScreens';

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

  // --- EFECTOS VISUALES (JUICE) ---
  // MOVIDO ARRIBA: Los hooks deben ejecutarse antes de cualquier return condicional
  const [floatingTexts, setFloatingTexts] = useState<{ id: number, text: string, x: number, y: number }[]>([]);
  const [isBossHurt, setIsBossHurt] = useState(false);
  const [showProjectile, setShowProjectile] = useState(false); // Proyectil del jugador
  const [ghostProjectiles, setGhostProjectiles] = useState<{ id: number, left: boolean }[]>([]);

  // Detectar daño local para feedback instantáneo
  useEffect(() => {
    if (uiState.isAnswerCorrect) {
      // 1. Disparar proyectil
      setShowProjectile(true);

      // 2. Después del impacto (aprox 300ms), mostrar daño y herir boss
      setTimeout(() => {
        // Boss Hurt
        setIsBossHurt(true);
        setTimeout(() => setIsBossHurt(false), 200);

        // Floating Text
        const damage = combo >= 5 ? 75 : (combo >= 2 ? 60 : 50); // Estimado visual
        const id = Date.now();
        setFloatingTexts(prev => [...prev, {
          id,
          text: `-${damage}`,
          x: 50 + (Math.random() * 10 - 5), // Center +/- variations
          y: 30
        }]);

        // Limpiar texto después de 1s
        setTimeout(() => {
          setFloatingTexts(prev => prev.filter(t => t.id !== id));
        }, 1000);

        setShowProjectile(false);
      }, 300);
    }
  }, [uiState.isAnswerCorrect, combo]);

  // Ghost Attacks (Simulación Multijugador)
  useEffect(() => {
    // 10% de probabilidad cada tick de ver un ataque aliado
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 2s
        const id = Date.now();
        setGhostProjectiles(prev => [...prev, { id, left: Math.random() > 0.5 }]);
        setTimeout(() => {
          setGhostProjectiles(prev => prev.filter(p => p.id !== id));
        }, 500);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Clases CSS dinámicas para efectos visuales (Ceguera / Silencio)
  const containerEffectClass = clsx({
    "blur-[3px] scale-[1.02] transition-all duration-300": activeDebuff === 'blind', // Ceguera
    "grayscale contrast-125": activeDebuff === 'silence', // Silencio
    "hue-rotate-90": activeDebuff === 'shuffle', // Confusión
    "": !activeDebuff
  });

  // --- RENDERIZADO CONDICIONAL DE PANTALLAS ---

  if (loading || !bossData) return <RaidLoadingScreen />;
  // Pasamos mvpData a la pantalla de victoria
  if (isVictory) return <RaidVictoryScreen mvpData={mvpData} rewards={rewards} />;
  if (isDefeat) return <RaidDefeatScreen />;

  // --- JUEGO ACTIVO ---

  // Cálculo de Porcentaje de HP para fases
  const hpPercentage = bossData ? (bossData.currentHp / bossData.maxHp) * 100 : 100;
  const isRageMode = hpPercentage <= 50;

  return (
    <div className={`min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden font-sans ${containerEffectClass}`}>

      {/* Fondo Ambiental Dinámico (Rage Mode) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          backgroundColor: isRageMode ? '#450a0a' : '#0f172a',
        }}
        transition={{ duration: 2 }}
      >
        {/* Orbes de luz ambiental */}
        <motion.div
          animate={{
            opacity: isRageMode ? [0.2, 0.5, 0.2] : [0.1, 0.3, 0.1],
            scale: isRageMode ? [1, 1.2, 1] : [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[100px] rounded-full transition-colors duration-1000 ${isRageMode ? 'bg-red-600/30' : 'bg-blue-900/20'}`}
        />
        <motion.div
          animate={{
            opacity: isRageMode ? [0.2, 0.5, 0.2] : [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[100px] rounded-full transition-colors duration-1000 ${isRageMode ? 'bg-orange-600/30' : 'bg-slate-800/40'}`}
        />

        {/* Partículas Flotantes */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              y: "110vh",
              x: Math.random() * 100 + "vw",
              opacity: 0,
              scale: 0
            }}
            animate={{
              y: "-10vh",
              opacity: [0, 1, 0],
              scale: [0, Math.random() * 0.5 + 0.5, 0],
              rotate: 360
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 20,
              ease: "linear"
            }}
            className={`absolute w-2 h-2 rounded-full ${isRageMode ? 'bg-red-500 blur-[1px]' : 'bg-white blur-[2px]'}`}
            style={{
              left: 0,
              filter: isRageMode ? 'drop-shadow(0 0 5px red)' : 'none'
            }}
          />
        ))}
      </motion.div>

      {/* --- PROYECTILES & VFX LAYER --- */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">

        {/* Player Projectile */}
        <AnimatePresence>
          {showProjectile && (
            <motion.div
              initial={{ bottom: '20%', left: '50%', scale: 0.5, opacity: 0 }}
              animate={{ bottom: '80%', left: '50%', scale: 1.5, opacity: 1 }}
              exit={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.3, ease: 'easeIn' }}
              className="absolute w-8 h-8 bg-cyan-400 rounded-full blur-[2px] shadow-[0_0_20px_cyan]"
            />
          )}
        </AnimatePresence>

        {/* Ghost Projectiles (Other Players) */}
        <AnimatePresence>
          {ghostProjectiles.map(p => (
            <motion.div
              key={p.id}
              initial={{
                top: '20%',
                left: p.left ? '-10%' : '110%',
                opacity: 0
              }}
              animate={{
                top: '20%',
                left: '50%',
                opacity: 1
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute w-2 h-2 bg-yellow-200 rounded-full blur-[1px]"
            />
          ))}
        </AnimatePresence>

        {/* Floating Damage Numbers */}
        <AnimatePresence>
          {floatingTexts.map(ft => (
            <motion.div
              key={ft.id}
              initial={{ top: '25%', left: `${ft.x}%`, scale: 0.5, opacity: 0 }}
              animate={{ top: '15%', scale: 1.5, opacity: 1 }}
              exit={{ top: '5%', opacity: 0 }}
              className="absolute font-black text-4xl text-yellow-300 italic drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] stroke-black"
              style={{ textShadow: '0 0 10px orange' }}
            >
              {ft.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 1. DEBUFF OVERLAY */}
      <AnimatePresence>
        {activeDebuff && (
          <motion.div
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-red-600/90 text-white px-8 py-4 rounded-xl font-black text-3xl uppercase tracking-widest shadow-2xl flex items-center gap-4 animate-pulse border-4 border-red-400 transform -rotate-2">
              {activeDebuff === 'blind' && <><EyeOff size={40} /> ¡CEGUERA!</>}
              {activeDebuff === 'silence' && <><MicOff size={40} /> ¡SILENCIO!</>}
              {activeDebuff === 'shuffle' && <><Zap size={40} /> ¡CONFUSIÓN!</>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. LEADERBOARD */}
      <RaidLeaderboard data={leaderboard} />

      {/* 3. COMBO COUNTER */}
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

      {/* 4. HUD (Vida y Tiempo) - CON PROP DE HURT */}
      <RaidHUD bossData={bossData} timeLeft={timeLeft} isHurt={isBossHurt} />

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
                <span className="text-red-500"><Sword size={12} /></span>
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
