import axiosClient from "./axiosClient";  // Tu instancia de axios configurada

export interface RankingUser {
  id: number;
  username: string;
  elo: number;
  level: number;
  league?: { name: string; icon: string };
  isMe?: boolean; // Para resaltar al usuario
}

export const rankingApi = {
  getGlobal: async (page = 1) => {
    const { data } = await axiosClient.get(`/ranking/global?page=${page}&limit=20`);
    return data.data; // { ranking: [], total: ... }
  },
  
  getMyRank: async () => {
    const { data } = await axiosClient.get('/ranking/me');
    return data.data; // { myRank: 5, context: [] }
  }
};