import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "skip_zrok_interstitial": true,
  },
});

// 1. Interceptor de Petición: Asegura que el token lleve el formato correcto
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  
  if (token) {
    // IMPORTANTE: Laravel necesita que el header empiece con "Bearer "
    // Si tu cookie no lo tiene, lo añadimos aquí.
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    config.headers.Authorization = authHeader;
  }
  
  return config;
});

// 2. Interceptor de Respuesta: Detecta si el servidor nos expulsó (Error 401)
axiosInstance.interceptors.response.use(
  (response) => response, // Si todo sale bien (200), no hacemos nada
  (error) => {
    // Si el backend responde con 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Sesión inválida: Redirigiendo al login...");
      
      // Borramos las cookies para que el frontend no intente usar un token muerto
      Cookies.remove('auth_token');
      Cookies.remove('jwt'); 
      
      // Redirigimos al usuario al login de forma forzada para limpiar el estado de React
      if (typeof window !== 'undefined') {
        window.location.href = '/login?session=expired';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
