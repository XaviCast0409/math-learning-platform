import axiosClient from '../axiosClient';
import type{ UsersListResponse, UserFilters, UserCourseProgress, UserItem, UserLog } from '../../types/admin.types';
import type { User } from '../../types/index';

export const adminUsersApi = {
  
  // 1. Obtener usuarios (Paginado + Filtros)
  getAll: async (filters: UserFilters): Promise<UsersListResponse> => {
    const { data } = await axiosClient.get<UsersListResponse>('/admin/users', { 
      params: filters 
    });
    return data;
  },

  // 2. Cambiar contraseña forzada
  forcePasswordChange: async (userId: number, newPassword: string) => {
    const { data } = await axiosClient.put(`/admin/users/${userId}/password`, { newPassword });
    return data;
  },

  // 3. Banear (Deshabilitar)
  banUser: async (userId: number) => {
    const { data } = await axiosClient.delete(`/admin/users/${userId}`);
    return data;
  },

  // 4. Desbanear (Restaurar)
  unbanUser: async (userId: number) => {
    const { data } = await axiosClient.post(`/admin/users/${userId}/restore`);
    return data;
  },

  // Obtener usuario individual
  getById: async (id: number) => {
    const { data } = await axiosClient.get<User>(`/admin/users/${id}`);
    return data;
  },

  // Obtener progreso académico
  getAcademicProgress: async (userId: number) => {
    const { data } = await axiosClient.get<UserCourseProgress[]>(`/admin/users/${userId}/academic`);
    return data;
  },

  // Obtener inventario
  getInventory: async (userId: number) => {
    const { data } = await axiosClient.get<UserItem[]>(`/admin/users/${userId}/inventory`);
    return data;
  },

  // Obtener logs
  getActivityLogs: async (userId: number) => {
    const { data } = await axiosClient.get<UserLog[]>(`/admin/users/${userId}/logs`);
    return data;
  },

  // ✨ PODER DE ADMIN: Regalar ítem manualmente
  grantItem: async (userId: number, productId: number) => {
    return await axiosClient.post(`/admin/users/${userId}/inventory`, { productId });
  },

  // ✨ PODER DE ADMIN: Quitar ítem (Corrección)
  revokeItem: async (userId: number, itemId: number) => {
    return await axiosClient.delete(`/admin/users/${userId}/inventory/${itemId}`);
  },
  // ✨ NUEVO: Dar/Quitar Gemas
  grantGems: async (userId: number, amount: number) => {
    // Retornamos la respuesta para poder leer el 'newBalance' si queremos
    const { data } = await axiosClient.post<{ newBalance: number }>(`/admin/users/${userId}/gems`, { amount });
    return data;
  }
};