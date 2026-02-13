import axiosClient from '../../../api/axiosClient';
// Definimos tipos básicos aquí o en un archivo types.d.ts
export interface Clan {
  id: number;
  name: string;
  description: string;
  emblem_id: string;
  total_xp: number;
  level: number;
  members_count?: number;
  min_elo_required: number;
  owner_id: number;
  my_role?: 'leader' | 'member';
  members?: ClanMember[];
}

// Tipos
export interface ClanMember {
  id: number;
  username: string;
  elo_rating: number;
  role: 'member' | 'leader' | 'elder'; // Asegúrate que tu back mande esto
  xp_total: number;
  avatar?: string;
}

// 👇 AQUÍ ESTÁ EL CAMBIO IMPORTANTE
export interface WarStatus {
  warId: number;
  status: 'active' | 'pending' | 'finished';
  // Agregamos el objeto scores
  scores: {
    myScore: number;
    opponentScore: number;
  };
  // Agregamos el objeto opponent completo
  opponent: {
    id: number;
    name: string;
    emblem_id: string;
  };
  endTime: string;
  timeLeftMs: number;
  // Eliminamos las propiedades sueltas antiguas (myScore, opponentScore) para evitar confusión
}

export const clanApi = {
  // 1. Obtener mi clan (o null si no tengo)
  getMyClan: async () => {
    // Ajusta la ruta según tu backend real
    const response = await axiosClient.get<{ clan: Clan | null }>('/clans/me');
    return response.data;
  },

  // 2. Buscar clanes (con filtro opcional)
  searchClans: async (query: string = '') => {
    const response = await axiosClient.get<Clan[]>(`/clans?search=${query}`);
    return response.data;
  },

  // 3. Crear un clan
  createClan: async (data: { name: string; description: string; emblemId: string }) => {
    const response = await axiosClient.post<Clan>('/clans', data);
    return response.data;
  },

  // 4. Unirse a un clan
  joinClan: async (clanId: number) => {
    const response = await axiosClient.post(`/clans/${clanId}/join`);
    return response.data;
  },

  // 5. Salir del clan
  leaveClan: async () => {
    const response = await axiosClient.post('/clans/leave');
    return response.data;
  },

  // 6. Obtener detalles de un clan (para verlo antes de unirse)
  getClanDetails: async (clanId: number) => {
    const response = await axiosClient.get<Clan>(`/clans/${clanId}`);
    return response.data;
  },

  // 👇 NUEVOS MÉTODOS

  // 7. Expulsar miembro (Solo Líder)
  kickMember: async (userId: number) => {
    const response = await axiosClient.delete(`/clans/members/${userId}`);
    return response.data;
  },

  // 8. Obtener estado de guerra actual
  getCurrentWar: async () => {
    // Asumiendo que creaste una ruta GET /clans/war/current
    const response = await axiosClient.get<WarStatus | null>('/clans/war/current');
    return response.data;
  },
  // 9. Ver perfil público de un clan (con miembros)
  getClanById: async (clanId: number) => {
    const response = await axiosClient.get<{ clan: Clan }>(`/clans/${clanId}`);
    return response.data; // Retorna { clan: ... }
  },

  // 10. Enviar Reto (Challenge)
  challengeClan: async (targetClanId: number) => {
    const response = await axiosClient.post('/clans/war/challenge', { targetClanId });
    return response.data;
  },

  // 11. Responder Reto (Aceptar/Rechazar)
  respondToChallenge: async (warId: number, accept: boolean) => {
    const response = await axiosClient.post('/clans/war/respond', { warId, accept });
    return response.data;
  },

  // 12. Obtener retos pendientes (Incoming Challenges)
  getPendingChallenges: async () => {
    const response = await axiosClient.get<WarStatus[]>('/clans/war/pending');
    return response.data;
  }
};