import axiosClient from '../../../api/axiosClient';
import type { AuthResponse, User, AdminAuthResponse } from '../../../types'; // 👈 Importamos desde la carpeta types

export const authApi = {

  // POST /api/auth/register
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    age?: number;
    phone?: string;
    grade_level: string;
  }) => {
    const response = await axiosClient.post<{ status: string; data: { message: string; email: string } }>('/auth/register', userData);
    return response.data;
  },

  // POST /api/auth/verify-email
  verifyEmail: async (email: string, code: string) => {
    const response = await axiosClient.post<AuthResponse>('/auth/verify-email', { email, code });
    return response.data;
  },

  // POST /api/auth/resend-code
  resendCode: async (email: string) => {
    const response = await axiosClient.post<{ status: string; message: string }>('/auth/resend-code', { email });
    return response.data;
  },

  // POST /api/auth/login
  login: async (credentials: { email: string; password: string }) => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // GET /api/auth/me
  getProfile: async () => {
    // Aquí la respuesta suele ser { status: 'success', data: { user: ... } }
    // Reutilizamos AuthResponse aunque no devuelva token nuevo, o usamos un tipo genérico
    const response = await axiosClient.get<{ status: string; data: { user: User } }>('/auth/me');
    return response.data;
  },

  loginAdmin: async (credentials: { email: string; password: string }) => {
    // 👇 Aquí especificamos que esperamos AdminAuthResponse
    const response = await axiosClient.post<AdminAuthResponse>('/admin/auth/login', credentials);
    return response.data;
  }
};