// src/api/admin/courses.api.ts
import axiosClient from '../../../api/axiosClient';
import type { Course, CourseListResponse, CourseFilters, Unit, Lesson, Exercise } from '../../../types/admin.types';

export const adminCoursesApi = {
  // --- CURSOS ---
  getAll: async (filters: CourseFilters) => {
    const { data } = await axiosClient.get<CourseListResponse>('/admin/courses', { params: filters });
    return data;
  },

  getStructure: async (id: number) => {
    const { data } = await axiosClient.get<Course>(`/admin/courses/${id}/structure`);
    return data;
  },

  createCourse: async (courseData: Partial<Course>) => {
    const { data } = await axiosClient.post<Course>('/admin/courses', courseData);
    return data;
  },

  updateCourse: async (id: number, courseData: Partial<Course>) => {
    const { data } = await axiosClient.put<Course>(`/admin/courses/${id}`, courseData);
    return data;
  },

  deleteCourse: async (id: number) => {
    return await axiosClient.delete(`/admin/courses/${id}`);
  },

  restoreCourse: async (id: number) => {
    return await axiosClient.post(`/admin/courses/${id}/restore`);
  },

  // --- UNIDADES ---
  createUnit: async (unitData: Partial<Unit>) => {
    const { data } = await axiosClient.post<Unit>('/admin/units', unitData);
    return data;
  },

  updateUnit: async (id: number, unitData: Partial<Unit>) => {
    const { data } = await axiosClient.put<Unit>(`/admin/units/${id}`, unitData);
    return data;
  },

  deleteUnit: async (id: number) => {
    return await axiosClient.delete(`/admin/units/${id}`);
  },

  // --- LECCIONES ---
  getLessonDetail: async (id: number) => {
    const { data } = await axiosClient.get<Lesson>(`/admin/lessons/${id}`);
    return data;
  },

  createLesson: async (lessonData: Partial<Lesson>) => {
    const { data } = await axiosClient.post<Lesson>('/admin/lessons', lessonData);
    return data;
  },

  updateLesson: async (id: number, lessonData: Partial<Lesson>) => {
    const { data } = await axiosClient.put<Lesson>(`/admin/lessons/${id}`, lessonData);
    return data;
  },

  deleteLesson: async (id: number) => {
    return await axiosClient.delete(`/admin/lessons/${id}`);
  },

  // --- EJERCICIOS ---
  createExercise: async (exData: Partial<Exercise>) => {
    const { data } = await axiosClient.post<Exercise>('/admin/exercises', exData);
    return data;
  },

  updateExercise: async (id: number, exData: Partial<Exercise>) => {
    const { data } = await axiosClient.put<Exercise>(`/admin/exercises/${id}`, exData);
    return data;
  },

  deleteExercise: async (id: number) => {
    return await axiosClient.delete(`/admin/exercises/${id}`);
  }
};