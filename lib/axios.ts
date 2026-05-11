import axios from 'axios';
import Cookies from 'js-cookie';

const PUBLIC_ROUTES = ['/acceso_publico'];

const isPublicRoute = (pathname: string) =>
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
    headers: {
        "skip_zrok_interstitial": true,
    },
});

// 1. Interceptor de Petición: Asegura que el token lleve el formato correcto
axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get('auth_token');

        if (token) {
            // Laravel necesita que el header empiece con "Bearer "
            const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            config.headers.Authorization = authHeader;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. Interceptor de Respuesta: Detecta si el servidor nos expulsó (Error 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    const isAuthEndpoint =
      url?.includes('/login') ||
      url?.includes('/register');

    if (status === 401 && !isAuthEndpoint) {
      Cookies.remove('auth_token');
      Cookies.remove('jwt');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
