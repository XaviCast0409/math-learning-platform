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
axiosClient.interceptors.response.use(
  (response) => {
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