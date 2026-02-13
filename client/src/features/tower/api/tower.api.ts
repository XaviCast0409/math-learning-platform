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
    };
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
    }
};
