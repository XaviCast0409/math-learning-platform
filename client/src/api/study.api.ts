import axiosClient from './axiosClient';

// Interfaces (Tipos)
export interface FlashcardData {
  id: number;
  front: string;
  back: string;
  image_url?: string;
  type: 'new' | 'review';
}

export interface StudySessionResponse {
  deckName: string;
  cards: FlashcardData[];
}

export interface DeckSummary {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  Unit?: { 
    title: string;
    Course?: { title: string; img_url?: string } 
  };
}
// 👇 1. Definimos qué nos devuelve el backend ahora
export interface StudySyncResponse {
  processed: number;
  xpEarned: number;

  // Nuevos campos del backend
  gemsEarned: number;        // 👈 Soluciona el error de "Property 'gemsEarned' does not exist"
  appliedBonuses: string[];  // 👈 Soluciona el error de "Property 'appliedBonuses' does not exist"

  newTotalXp: number;
  newTotalGems: number;
  newLevel: number;
  leveledUp: boolean;
  levelRewards?: {
    gems: number;
    lives: number;
    items: string[];
    bonusesApplied: string[];
  };
}

export interface PaginatedDecks {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  decks: DeckSummary[];
}

export const studyApi = {
  // Obtener mazos de una unidad (para el selector)
  getDecksByUnit: async (unitId: number) => {
    const { data } = await axiosClient.get(`/study/unit/${unitId}/decks`);
    return data.data.decks as DeckSummary[];
  },

  // Iniciar sesión (Pedir las cartas)
  startSession: async (deckId: number) => {
    const { data } = await axiosClient.get(`/study/deck/${deckId}/start`);
    return data.data as StudySessionResponse;
  },

  // Sincronizar progreso (Enviar respuestas)
  // 👇 2. Tipamos la respuesta de la función (Promise<StudySyncResponse>)
  syncProgress: async (payload: {
    updates: { cardId: number; quality: number }[];
    xpToAdd: number;
    gemsToAdd: number;
  }): Promise<StudySyncResponse> => {
    
    // Enviamos el payload directamente
    const { data } = await axiosClient.post('/study/sync', payload);

    return data.data; 
  },

  // Obtener todos los mazos (para el hub de estudio)
getAllDecks: async (page = 1, search = '', courseId?: number): Promise<PaginatedDecks> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', '6'); // Mostramos 6 por página para que se vea bonito
    if (search) params.append('search', search);
    if (courseId) params.append('course_id', courseId.toString());

    const { data } = await axiosClient.get(`/study/decks?${params.toString()}`);
    return data.data.decks; // Según tu controller: res.data.data.decks
  },

  getCoursesList: async () => {
     // Asumo que tienes un endpoint /courses o similar. 
     // Si no, usa el que tengas para el Home.
     const { data } = await axiosClient.get('/courses'); 
     return data.data || []; // Ajusta según tu respuesta de cursos
  }
};