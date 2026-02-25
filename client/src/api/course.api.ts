// client/src/api/course.api.ts
import axiosClient from './axiosClient';

export interface LessonMapNode {
  id: number;
  title: string;
  order_index: number;
  xp_reward: number;
  status: 'locked' | 'active' | 'completed';
  stars: number; // 0, 1, 2, 3
}

export interface UnitMap {
  id: number;
  title: string;
  description: string;
  lessons: LessonMapNode[];
}

export interface CourseSummary {
  id: number;
  title: string;
  img_url?: string;
  level: string;
  description: string;
}

export const courseApi = {
  // Por ahora hardcodeamos el ID 1 (Álgebra), luego puede ser dinámico
  getCourseMap: async (courseId: number) => {
    const response = await axiosClient.get<{ status: string; data: { courseInfo: CourseSummary, units: UnitMap[] } }>(
      `/courses/${courseId}/map`
    );
    return response.data.data;
  },

  getAllCourses: async () => {
    const response = await axiosClient.get<{ status: string; data: CourseSummary[] }>(
      '/courses'
    );
    return response.data.data;
  }
};