import { useState, useEffect, useCallback } from 'react';
import { clanApi, type Clan, type WarStatus } from '../api/clan.api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../../../context/ConfirmContext';

export const useClan = () => {
  const [myClan, setMyClan] = useState<Clan | null>(null);
  const [warStatus, setWarStatus] = useState<WarStatus | null>(null);
  const [pendingWars, setPendingWars] = useState<WarStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchList, setSearchList] = useState<Clan[]>([]);
  const navigate = useNavigate();

  // 👇 FUNCIÓN AUXILIAR: Espera X milisegundos
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Cargar datos iniciales (Mi Clan)
  const fetchMyClan = useCallback(async () => {
    try {
      setLoading(true);

      // 👇 TRUCO DE MAGIA: Ejecutamos la petición Y un temporizador al mismo tiempo
      // La app esperará a que AMBOS terminen.
      const [data] = await Promise.all([
        clanApi.getMyClan(),        // 1. Petición real
        wait(1500)                  // 2. Espera mínima de 1.5 segundos (ajusta a tu gusto)
      ]);

      if (!data || !data.clan) {
        setMyClan(null);
      } else {
        setMyClan(data.clan);
      }

    } catch (error) {
      console.error("Error cargando perfil del clan:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWarStatus = useCallback(async () => {
    if (!myClan) return;
    try {
      const data = await clanApi.getCurrentWar();
      setWarStatus(data);
    } catch (error) { /* Silent fail */ }
  }, [myClan]);

  const fetchPendingChallenges = useCallback(async () => {
    if (!myClan || myClan.my_role !== 'leader') return;
    try {
      const data = await clanApi.getPendingChallenges();
      setPendingWars(data);
    } catch (error) { /* Silent fail */ }
  }, [myClan]);

  useEffect(() => {
    fetchMyClan();
  }, [fetchMyClan]);

  useEffect(() => {
    if (myClan) {
      fetchWarStatus();
      fetchPendingChallenges();
    }
  }, [myClan, fetchWarStatus, fetchPendingChallenges]);

  // --- ACCIONES ---

  /* 👇 INTEGRACIÓN DE CONFIRM CONTEXT */
  const { confirm } = useConfirm();

  // También le ponemos un pequeño delay a la búsqueda para que se sienta "procesando"
  const searchClans = async (query: string) => {
    try {
      setLoading(true);
      const [results] = await Promise.all([
        clanApi.searchClans(query),
        wait(800) // 0.8 segundos para búsqueda
      ]);
      setSearchList(results);
    } catch (error) {
      toast.error("Error buscando clanes");
    } finally {
      setLoading(false);
    }
  };

  const createClan = async (name: string, desc: string, emblem: string) => {
    try {
      await Promise.all([
        clanApi.createClan({ name, description: desc, emblemId: emblem }),
        wait(1000)
      ]);
      toast.success("¡Clan creado!");
      fetchMyClan();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear clan");
      return false;
    }
  };

  // ... Resto de acciones (joinClan, etc.) igual ...
  // Si quieres que todas tengan delay, agrégales el Promise.all con wait(1000)
  const joinClan = async (clanId: number) => {
    try {
      await clanApi.joinClan(clanId);
      toast.success("¡Te has unido al clan!");
      fetchMyClan();
      navigate('/clan');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No pudiste unirte");
    }
  };

  const leaveClan = async () => {
    const ok = await confirm("¿Seguro que quieres salir del clan?", {
      title: 'Salir del Clan',
      confirmText: 'Salir',
      variant: 'danger'
    });
    if (!ok) return;

    try {
      await clanApi.leaveClan();
      setMyClan(null);
      toast.success("Has salido del clan");
    } catch (error) {
      toast.error("Error al salir");
    }
  };

  const respondChallenge = async (warId: number, accept: boolean) => {
    try {
      await clanApi.respondToChallenge(warId, accept);
      if (accept) {
        toast.success("¡Guerra aceptada!");
        fetchWarStatus();
      } else {
        toast.success("Rechazado");
      }
      fetchPendingChallenges();
    } catch (error: any) {
      toast.error("Error");
    }
  };

  const kickMember = async (memberId: number) => {
    const ok = await confirm("¿Expulsar miembro de forma permanente?", {
      title: 'Expulsar Miembro',
      confirmText: 'Expulsar',
      variant: 'danger'
    });
    if (!ok) return;

    try {
      await clanApi.kickMember(memberId);
      toast.success("Expulsado");
      fetchMyClan();
    } catch (error: any) {
      toast.error("Error");
    }
  };

  const sendChallenge = async (targetClanId: number) => {
    try {
      await clanApi.challengeClan(targetClanId);
      toast.success("¡Desafío enviado!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error");
      return false;
    }
  };

  return {
    myClan,
    warStatus,
    pendingWars,
    loading,
    searchList,
    actions: {
      searchClans,
      createClan,
      joinClan,
      leaveClan,
      kickMember,
      respondChallenge,
      sendChallenge,
      refresh: fetchMyClan,
      refreshWar: fetchWarStatus,
      refreshPending: fetchPendingChallenges
    }
  };
};