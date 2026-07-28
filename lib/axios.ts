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

// El manejo del 401 (limpiar sesión y expulsar al login) vive en un único
// interceptor registrado por AuthContext, que es quien puede además resetear el
// estado de React y navegar.
export const isAuthEndpoint = (url?: string) =>
    !!url && (url.includes('/login') || url.includes('/register'));

export default axiosInstance;
