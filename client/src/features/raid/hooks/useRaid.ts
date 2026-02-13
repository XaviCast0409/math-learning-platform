import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';
import type { RaidBossData, RaidQuestion, RaidLog } from '../../../types/raid.types';

interface LeaderboardEntry { username: string; totalDamage: number; }
interface MvpData { username: string; totalDamage: number; }
interface RaidRewards { xp: number; gems: number; }

export const useRaid = (raidId: number) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [bossData, setBossData] = useState<RaidBossData | null>(null);
  const [questions, setQuestions] = useState<RaidQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [battleLogs, setBattleLogs] = useState<RaidLog[]>([]);
  const [isVictory, setIsVictory] = useState(false);

  // Estados UI
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Estados de Tiempo y Derrota
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("00:00");
  const [isDefeat, setIsDefeat] = useState(false);

  // Estados Nuevos (Mecánicas Avanzadas)
  const [combo, setCombo] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeDebuff, setActiveDebuff] = useState<string | null>(null);
  const [mvpData, setMvpData] = useState<MvpData | null>(null);

  const [rewards, setRewards] = useState<RaidRewards | null>(null); // 👈 NUEVO

  const fetchingMore = useRef(false);

  useEffect(() => {
    if (!socket || !user) return;

    // 1. Unirse a la sala
    socket.emit('raid_join', { raidId, userId: user.id });

    // 2. Inicialización
    socket.on('raid_init', (data) => {
      setBossData({
        name: data.bossName,
        maxHp: data.totalHp,
        currentHp: data.currentHp,
        image: data.image
      });
      setQuestions(data.questions || []);
      setEndTime(data.endTime);
      setLoading(false);
    });

    // 3. Actualización de Vida y Logs
    socket.on('raid_hp_update', (data) => {
      setBossData(prev => prev ? { ...prev, currentHp: data.newHp } : null);

      const newLog: RaidLog = {
        id: Date.now().toString() + Math.random(),
        message: `Héroe #${data.attackerId} hizo -${data.damageDealt}`,
        type: 'damage'
      };

      setBattleLogs(prev => [newLog, ...prev].slice(0, 4));

      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    });

    // 4. Habilidad del Boss (Debuff)
    socket.on('raid_boss_skill', (data) => {
      setActiveDebuff(data.skill); // 'blind', 'silence', 'shuffle'
      setTimeout(() => {
        setActiveDebuff(null);
      }, data.duration || 3000);
    });

    // 5. Victoria y MVP
    socket.on('raid_victory', (data) => {
      setIsVictory(true);
      if (data.mvp) setMvpData(data.mvp);
      if (data.rewards) setRewards(data.rewards); // 👈 GUARDAR RECOMPENSAS
    });

    // 6. Más preguntas
    socket.on('raid_more_questions', (data) => {
      setQuestions(prev => [...prev, ...data.questions]);
      fetchingMore.current = false;
    });

    // 7. Derrota por tiempo
    socket.on('raid_timeout', () => {
      setIsDefeat(true);
    });

    return () => {
      socket.emit('raid_leave', { raidId });
      socket.off('raid_init');
      socket.off('raid_hp_update');
      socket.off('raid_boss_skill'); // No olvides apagar este
      socket.off('raid_victory');
      socket.off('raid_more_questions');
      socket.off('raid_timeout');
      socket.off('raid_error');
    };
  }, [socket, user, raidId]);

  // Lógica del Reloj
  useEffect(() => {
    if (!endTime || isVictory || isDefeat) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        setIsDefeat(true);
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, isVictory, isDefeat]);

  // Manejo de Respuesta
  const handleOptionClick = useCallback((optionText: string, index: number) => {
    // 🛑 Bloqueo por Silencio
    if (activeDebuff === 'silence') return;

    if (isAnswerCorrect !== null || !user || !questions[currentIndex]) return;

    const currentQ = questions[currentIndex];
    const correctVal = String(currentQ.correct_answer).trim().toLowerCase();
    let isCorrect = false;

    // Validación Universal (Letra, Bool, Texto)
    const selectedLetter = String.fromCharCode(97 + index); // 'a', 'b'...

    if (selectedLetter === correctVal) {
      isCorrect = true;
    } else if ((correctVal === 'true' || correctVal === 'verdadero') && index === 0) {
      isCorrect = true;
    } else if ((correctVal === 'false' || correctVal === 'falso') && index === 1) {
      isCorrect = true;
    } else if (String(optionText).trim().toLowerCase() === correctVal) {
      isCorrect = true;
    }

    setSelectedOption(optionText);
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      // 🔥 Lógica de Combo
      const newCombo = combo + 1;
      setCombo(newCombo);

      // Multiplicador de Daño
      let multiplier = 1;
      if (newCombo >= 2) multiplier = 1.2;
      if (newCombo >= 5) multiplier = 1.5;

      const damage = Math.floor(50 * multiplier);

      socket?.emit('raid_submit_damage', { raidId, userId: user.id, damage });
    } else {
      // ❌ Reset Combo
      setCombo(0);
      setIsAnswerCorrect(false);
    }

    // Delay para siguiente pregunta
    setTimeout(() => {
      setSelectedOption(null);
      setIsAnswerCorrect(null);

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      // Cargar más preguntas si faltan pocas
      if (questions && questions.length - nextIndex < 3 && !fetchingMore.current) {
        fetchingMore.current = true;
        const currentIds = questions.map(q => q.id);
        socket?.emit('raid_fetch_more_questions', {
          userId: user.id,
          existingQuestionIds: currentIds
        });
      }
    }, 1000);

  }, [currentIndex, questions, isAnswerCorrect, socket, raidId, user, combo, activeDebuff]);
  // 👆 IMPORTANTE: 'combo' y 'activeDebuff' deben estar aquí para que funcionen

  const safeCurrentQuestion = (questions && questions.length > 0) ? questions[currentIndex] : null;

  return {
    loading, bossData, currentQuestion: safeCurrentQuestion, battleLogs, isVictory,
    uiState: { selectedOption, isAnswerCorrect },
    actions: { handleOptionClick },
    timeLeft,
    isDefeat,
    combo,
    leaderboard,
    activeDebuff,
    mvpData,
    rewards,
  };
};