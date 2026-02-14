
import useSWR from 'swr';
import { clanApi } from '../api/clan.api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../../../context/ConfirmContext';
import { useCallback, useMemo } from 'react';

// Llaves de caché
const KEYS = {
  MY_CLAN: '/clans/me',
  WAR_STATUS: '/clans/war/current',
  PENDING_WARS: '/clans/war/pending',
};

export const useClan = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  // 1. Obtener mi clan
  const {
    data: myClanData,
    isLoading: loadingMyClan,
    mutate: mutateMyClan
  } = useSWR(KEYS.MY_CLAN, async () => {
    try {
      const data = await clanApi.getMyClan();
      return data.clan; // Puede ser null
    } catch (err) {
      if ((err as any).response?.status === 404) return null;
      throw err;
    }
  });

  const myClan = myClanData || null;

  // 2. Obtener estado de guerra (Solo si tengo clan)
  const {
    data: warStatus,
    mutate: mutateWarStatus
  } = useSWR(
    myClan ? KEYS.WAR_STATUS : null,
    clanApi.getCurrentWar,
    { refreshInterval: 10000 } // Polling cada 10s para "casi tiempo real"
  );

  // 3. Obtener retos pendientes (Para todos los miembros, aunque solo líder acepte)
  const isLeader = myClan?.my_role === 'leader';

  const {
    data: pendingWars = [],
    mutate: mutatePendingWars
  } = useSWR(
    myClan ? KEYS.PENDING_WARS : null,
    clanApi.getPendingChallenges,
    { refreshInterval: 15000 }
  );

  // --- ACCIONES ---

  const searchClans = useCallback(async (query: string) => {
    return await clanApi.searchClans(query);
  }, []);

  const createClan = useCallback(async (name: string, desc: string, emblem: string) => {
    try {
      await clanApi.createClan({ name, description: desc, emblemId: emblem });
      toast.success("¡Clan creado!");
      mutateMyClan();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear clan");
      return false;
    }
  }, [mutateMyClan]);

  const joinClan = useCallback(async (clanId: number) => {
    try {
      await clanApi.joinClan(clanId);
      toast.success("¡Te has unido al clan!");
      await mutateMyClan();
      navigate('/clan');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No pudiste unirte");
    }
  }, [mutateMyClan, navigate]);

  const leaveClan = useCallback(async () => {
    const ok = await confirm("¿Seguro que quieres salir del clan?", {
      title: 'Salir del Clan',
      confirmText: 'Salir',
      variant: 'danger'
    });
    if (!ok) return;

    try {
      await clanApi.leaveClan();
      toast.success("Has salido del clan");
      mutateMyClan(null, false);
      navigate('/clan');
    } catch (error) {
      toast.error("Error al salir");
      mutateMyClan();
    }
  }, [confirm, mutateMyClan, navigate]);

  const kickMember = useCallback(async (memberId: number) => {
    const ok = await confirm("¿Expulsar miembro de forma permanente?", {
      title: 'Expulsar Miembro',
      confirmText: 'Expulsar',
      variant: 'danger'
    });
    if (!ok) return;

    try {
      await clanApi.kickMember(memberId);
      toast.success("Expulsado");
      mutateMyClan();
    } catch (error: any) {
      toast.error("Error al expulsar");
    }
  }, [confirm, mutateMyClan]);

  const respondChallenge = useCallback(async (warId: number, accept: boolean) => {
    try {
      await clanApi.respondToChallenge(warId, accept);
      if (accept) {
        toast.success("¡Guerra aceptada!");
        mutateWarStatus();
      } else {
        toast.success("Rechazado");
      }
      mutatePendingWars();
    } catch (error: any) {
      toast.error("Error al responder");
    }
  }, [mutateWarStatus, mutatePendingWars]);

  const sendChallenge = useCallback(async (targetClanId: number) => {
    try {
      await clanApi.challengeClan(targetClanId);
      toast.success("¡Desafío enviado!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al desafiar");
      return false;
    }
  }, []);

  const refreshAll = useCallback(() => {
    mutateMyClan();
    mutateWarStatus();
    mutatePendingWars();
  }, [mutateMyClan, mutateWarStatus, mutatePendingWars]);

  // Memoizar el objeto de retorno para evitar re-renders infinitos si se usa en dependencias
  return useMemo(() => ({
    myClan,
    warStatus,
    pendingWars,
    loading: loadingMyClan,
    actions: {
      searchClans,
      createClan,
      joinClan,
      leaveClan,
      kickMember,
      respondChallenge,
      sendChallenge,
      refresh: refreshAll,
      refreshWar: mutateWarStatus,
      refreshPending: mutatePendingWars
    }
  }), [
    myClan,
    warStatus,
    pendingWars,
    loadingMyClan,
    searchClans,
    createClan,
    joinClan,
    leaveClan,
    kickMember,
    respondChallenge,
    sendChallenge,
    refreshAll,
    mutateWarStatus,
    mutatePendingWars
  ]);
};
