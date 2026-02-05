import axiosClient from '../axiosClient';
import type{ Product, ProductListResponse, ProductFilters } from '../../types/admin.types';

export const adminProductsApi = {
  getAll: async (filters: ProductFilters) => {
    const { data } = await axiosClient.get<ProductListResponse>('/admin/products', { params: filters });
    return data;
  },

  create: async (productData: Partial<Product>) => {
    // El backend espera el body con effect_metadata ya formateado
    const { data } = await axiosClient.post<Product>('/admin/products', productData);
    return data;
  },

  update: async (id: number, productData: Partial<Product>) => {
    const { data } = await axiosClient.put<Product>(`/admin/products/${id}`, productData);
    return data;
  },

  delete: async (id: number) => {
    // Si falla por FK (ya comprado), el catch del frontend debe manejarlo
    return await axiosClient.delete(`/admin/products/${id}`);
  }
};