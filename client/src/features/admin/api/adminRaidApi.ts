import axiosClient from '../../../api/axiosClient';

export interface SpawnBossDto {
    name: string;
    hp: number;
    duration: number; // in minutes
    image?: string;
}

export const adminRaidApi = {
    // Get current boss status (public endpoint is enough, but we might want admin specific details later)
    getCurrentBoss: async () => {
        const { data } = await axiosClient.get('/raids/current');
        return data; // { active: boolean, boss: ... }
    },

    spawnBoss: async (bossData: SpawnBossDto) => {
        const { data } = await axiosClient.post('/raids/spawn', bossData);
        return data;
    }
};
