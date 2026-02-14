import axios from 'axios';

// 1. Crear la instancia base
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Lee http://localhost:3000/api del .env
  headers: {
    'Content-Type': 'application/json',

  },
});

// 2. Interceptor de SOLICITUD (Request)
// Antes de que salga la petición, le pegamos el token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Asumiremos que guardamos el token con la key 'token'

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de RESPUESTA (Response)
// Si el backend nos responde, o si hay un error
import { gamificationEvents } from '../utils/gamificationEvents';

// ... (imports)

// 3. Interceptor de RESPUESTA (Response)
// Si el backend nos responde, o si hay un error
axiosClient.interceptors.response.use(
  (response) => {
    // Detectar Level Up Globalmente
    const data = response.data?.data; // Asumiendo estructura estandar { success: true, data: { ... } }

    // A veces la respuesta es directa, a veces anidada en data.data
    // Verificamos ambos casos por si acaso
    const payload = data || response.data;

    if (payload && payload.leveledUp && payload.levelRewards) {
      // Emitir evento global
      gamificationEvents.emitLevelUp({
        level: payload.levelRewards.currentLevel || 0,
        currentLevel: payload.levelRewards.currentLevel,
        previousLevel: payload.levelRewards.previousLevel,
        rewards: payload.levelRewards
      });
    }

    // Si todo sale bien, devolvemos la data limpia
    return response;
  },
  (error) => {
    // Si el error es 401 (No autorizado/Token vencido)
    if (error.response && error.response.status === 401) {
      // Borramos el token local
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Opcional: Redirigir al login
      // window.location.href = '/login'; 
      // (Es mejor manejar esto con React Router, pero esto es un fail-safe)
    }

    return Promise.reject(error);
  }
);

export default axiosClient;