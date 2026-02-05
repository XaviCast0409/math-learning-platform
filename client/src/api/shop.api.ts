import axiosClient from './axiosClient';
import type { Product, UserItem } from '../types';

export const shopApi = {
  // --- TIENDA ---
  getProducts: async () => {
    const { data } = await axiosClient.get('/shop'); 
    if (data.data && Array.isArray(data.data.products)) {
        return data.data.products as Product[];
    }
    return [] as Product[]; 
  },

  buyProduct: async (productId: number) => {
    const { data } = await axiosClient.post('/shop/buy', { productId });
    return data; 
  },

  // --- INVENTARIO ---
  getInventory: async () => {
    const { data } = await axiosClient.get('/inventory');
    // Ajuste para leer data.data.items (estándar de tu respuesta backend)
    if (data.data && Array.isArray(data.data.items)) {
        return data.data.items as UserItem[];
    }
    return [] as UserItem[];
  },

  // 👇 NUEVO: Obtener solo lo equipado (Para dibujar el avatar rápido)
  getAvatar: async () => {
    const { data } = await axiosClient.get('/inventory/avatar');
    // El backend devuelve { data: { equippedItems: [...] } }
    if (data.data && Array.isArray(data.data.equippedItems)) {
        return data.data.equippedItems as UserItem[];
    }
    return [] as UserItem[];
  },

  equipItem: async (userItemId: number) => {
    const { data } = await axiosClient.post('/inventory/equip', { userItemId });
    // Retorna { message, data: { updatedAvatar } }
    return data;
  },

  useItem: async (userItemId: number) => {
    const { data } = await axiosClient.post('/inventory/use', { userItemId });
    return data;
  }
};