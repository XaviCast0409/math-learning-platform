import { useState, useEffect } from 'react';
import { raidApi } from '../../../api/raid.api'; // Asumiendo que crearás este archivo api
import type { RaidBossData } from '../../../types/raid.types';

export const useCurrentRaid = () => {
  const [activeRaid, setActiveRaid] = useState<RaidBossData | null>(null);
  const [loading, setLoading] = useState(true);

  const checkRaidStatus = async () => {
    try {
      setLoading(true);
      // Llama a tu endpoint GET /api/raids/current
      const response = await raidApi.getCurrentBoss();
      
      if (response.active && response.boss) {
        setActiveRaid(response.boss);
      } else {
        setActiveRaid(null);
      }
    } catch (error) {
      console.error("Error checking raid status", error);
      setActiveRaid(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkRaidStatus();
  }, []);

  return { activeRaid, loading, refresh: checkRaidStatus };
};