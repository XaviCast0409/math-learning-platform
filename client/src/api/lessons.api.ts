import axiosClient from './axiosClient';

export interface Exercise {
  id: number;
  type: 'multiple_choice' | 'fill_in' | 'true_false';
  prompt: string;
  options: string[]; // Puede venir vacío si es fill_in
  correct_answer: string;
  solution_explanation: string;
  difficulty: number;
}

export interface LessonContent {
  lesson: {
    id: number;
    title: string;
    theory_content: string;
    xp_reward: number;
  };
  exercises: Exercise[];
}

export const lessonApi = {
  // Obtener contenido para jugar
  getLessonContent: async (lessonId: number) => {
    const response = await axiosClient.get<{ status: string; data: LessonContent }>(
      `/lessons/${lessonId}/play`
    );
    return response.data.data;
  },

  // Enviar resultado final
  completeLesson: async (lessonId: number, stars: number, lives: number) => {
    const response = await axiosClient.post<{ status: string; data: any }>(
      `/lessons/${lessonId}/complete`,
      { stars, lives } // Enviamos lives
    );
    return response.data.data; // Esto devuelve { newTotalGems, newLives, etc. }
  }
};