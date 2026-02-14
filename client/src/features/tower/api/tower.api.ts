import axiosClient from '../../../api/axiosClient';

// Definimos interfaces locales para no depender del backend directo
export interface TowerRunState {
    id: number;
    current_floor: number;
    lives_left: number;
    is_active: boolean;
    score: number;
}

export interface TowerQuestion {
    id: number;
    prompt: string;
    type: string;
    options?: any;
}

export interface TowerStatusResponse {
    run: TowerRunState;
    question: TowerQuestion;
}

export interface TowerAnswerResponse {
    correct: boolean;
    lives: number;
    floor: number;
    gameOver?: boolean;
    rewards?: {
        xp: number;
        gems: number;
        floor: number;
        score: number;
        bonuses?: string[];
    };
    // New fields for global update
    newTotalXp?: number;
    newTotalGems?: number;
    newLevel?: number;
    leveledUp?: boolean;
    levelRewards?: any;
}

export const towerApi = {
    startRun: async () => {
        const { data } = await axiosClient.post('/tower/start');
        // El backend ahora devuelve { data: { run, costType } }
        // Ajustamos para devolver ambos o manejarlo
        return data.data as { run: TowerRunState, costType?: string };
    },

    getStatus: async () => {
        const { data } = await axiosClient.get('/tower/status');
        return data.data as TowerStatusResponse | null;
    },

    submitAnswer: async (exerciseId: number, answer: string) => {
        const { data } = await axiosClient.post('/tower/submit', { exerciseId, answer });
        return data.data as TowerAnswerResponse;
    },

    getLeaderboard: async () => {
        const { data } = await axiosClient.get('/tower/leaderboard');
        return data.data as TowerLeaderboardEntry[];
    }
};

export interface TowerLeaderboardEntry {
    id: number;
    user_id: number;
    floor_reached: number;
    score_achieved: number;
    ended_at: string;
    User: {
        username: string;
        metadata?: {
            avatar_url?: string;
        };
    };
}
