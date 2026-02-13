import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { studyApi, type FlashcardData } from '../api/study.api';
import { useAuth } from '../../../context/AuthContext';
import { useActivity } from '../../../hooks/useActivity';

// --- ⚙️ CONFIGURACIÓN DE LA SESIÓN ---
const SESSION_CONFIG = {
  // Intervalos de recompensa (Checkpoints)
  CHECKPOINT_INTERVAL_SECONDS: 30,

  // Cantidad de premios por intervalo
  XP_PER_INTERVAL: 20,
  GEMS_PER_INTERVAL: 10,

  // Anti-Spam (Tiempo mínimo para voltear carta)
  MIN_READ_TIME_MS: 2000
};

export const useStudySession = (deckId: string | undefined) => {
  const navigate = useNavigate();
  const { updateUserStats, refreshUser } = useAuth();

  // Anti-AFK
  const { isActive, isTabHidden } = useActivity();

  // State
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Feedback Visual
  const [showMilestone, setShowMilestone] = useState(false);
  const [canInteract, setCanInteract] = useState(false);
  const [levelRewards, setLevelRewards] = useState<{ gems: number, lives: number, items: string[] } | null>(null);

  // Estado para el Modal de Resumen Final
  const [sessionSummary, setSessionSummary] = useState<{ xpEarned: number, gemsEarned: number, bonuses: string[] } | null>(null);

  // Refs para colas de sincronización (Backend)
  const syncQueue = useRef<{ cardId: number; quality: number }[]>([]);
  const rewardsQueue = useRef({ xp: 0, gems: 0 });

  // Ref para acumular el total ganado en la sesión (Frontend UI)
  const totalSessionRewards = useRef({ xp: 0, gems: 0, bonuses: new Set<string>() });

  // 1. Cargar datos
  useEffect(() => {
    const init = async () => {
      try {
        if (!deckId) return;
        const session = await studyApi.startSession(Number(deckId));
        setCards(session.cards);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [deckId]);

  // 2. Cooldown Effect (Evitar spam)
  useEffect(() => {
    setCanInteract(false);
    const timer = setTimeout(() => setCanInteract(true), SESSION_CONFIG.MIN_READ_TIME_MS);
    return () => clearTimeout(timer);
  }, [currentIndex, isFlipped]);

  // 3. Checkpoint Trigger (Gamificación)
  const triggerCheckpoint = useCallback(() => {
    rewardsQueue.current.xp += SESSION_CONFIG.XP_PER_INTERVAL;
    rewardsQueue.current.gems += SESSION_CONFIG.GEMS_PER_INTERVAL;

    setShowMilestone(true);
    setTimeout(() => setShowMilestone(false), 4000);
  }, []);

  // 4. Timer & Sync Logic
  const pushSync = useCallback(async () => {
    // Si no hay nada pendiente, no hacemos llamada
    if (syncQueue.current.length === 0 && rewardsQueue.current.xp === 0 && rewardsQueue.current.gems === 0) return null;

    const updates = [...syncQueue.current];
    const xpToSend = rewardsQueue.current.xp;
    const gemsToSend = rewardsQueue.current.gems;

    // Reset optimista
    syncQueue.current = [];
    rewardsQueue.current = { xp: 0, gems: 0 };

    try {
      // Llamada a la API con la estructura corregida (Objeto único)
      const data = await studyApi.syncProgress({
        updates,
        xpToAdd: xpToSend,
        gemsToAdd: gemsToSend
      });

      // Manejo de Level Up
      if (data.leveledUp && data.levelRewards) {
        setLevelRewards(data.levelRewards);
      }

      // Actualizar contexto global
      updateUserStats({
        xp_total: data.newTotalXp,
        gems: data.newTotalGems,
        level: data.newLevel
      });

      // Acumular totales para el resumen final (Modal)
      totalSessionRewards.current.xp += (data.xpEarned || 0);
      totalSessionRewards.current.gems += (data.gemsEarned || 0);
      if (data.appliedBonuses) {
        data.appliedBonuses.forEach((b: string) => totalSessionRewards.current.bonuses.add(b));
      }

      return data;
    } catch (e) {
      console.error("Error sync", e);
      // Rollback en caso de error
      syncQueue.current = [...updates, ...syncQueue.current];
      rewardsQueue.current.xp += xpToSend;
      rewardsQueue.current.gems += gemsToSend;
      return null;
    }
  }, [updateUserStats]);

  // Intervalos de tiempo
  useEffect(() => {
    if (loading) return;

    const timer = setInterval(() => {
      if (isActive) {
        setSecondsElapsed(prev => {
          const next = prev + 1;
          // Usamos la configuración centralizada
          if (next > 0 && next % SESSION_CONFIG.CHECKPOINT_INTERVAL_SECONDS === 0) {
            triggerCheckpoint();
          }
          return next;
        });
      }
    }, 1000);

    const autoSave = setInterval(() => pushSync(), 30000);
    return () => { clearInterval(timer); clearInterval(autoSave); };
  }, [loading, isActive, triggerCheckpoint, pushSync]);

  // 5. Acciones del Usuario
  const handleRate = (quality: number) => {
    if (!canInteract) return;

    const currentCard = cards[currentIndex];
    syncQueue.current.push({ cardId: currentCard.id, quality });

    if (quality < 3) setCards(prev => [...prev, currentCard]);

    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex + 1 >= cards.length) setCurrentIndex(0);
      else setCurrentIndex(prev => prev + 1);
    }, 200);
  };

  // 6. Salida con Modal de Resumen
  const handleExit = async () => {
    // Forzamos sync final
    await pushSync();

    // Verificamos totales acumulados en la sesión
    const totalXp = totalSessionRewards.current.xp;
    const totalGems = totalSessionRewards.current.gems;

    if (totalXp > 0 || totalGems > 0) {
      // Mostramos modal con el resumen
      setSessionSummary({
        xpEarned: totalXp,
        gemsEarned: totalGems,
        bonuses: Array.from(totalSessionRewards.current.bonuses)
      });
      refreshUser();
    } else {
      // Salida directa si no ganó nada
      navigate('/learn');
    }
  };

  return {
    loading,
    cards,
    activeCard: cards[currentIndex],
    isFlipped,
    setIsFlipped,
    secondsElapsed,
    showMilestone,
    canInteract,
    levelRewards,
    setLevelRewards,

    // 👇 Esto es vital para el Modal en StudySession.tsx
    sessionSummary,
    setSessionSummary,

    handleRate,
    handleExit,
    isActive,
    isTabHidden
  };
};