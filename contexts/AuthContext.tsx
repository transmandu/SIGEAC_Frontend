'use client';

import { default as axiosInstance } from '@/lib/axios';
import { createCookie } from '@/lib/cookie';
import { createSession, deleteSession } from '@/lib/session';
import { useCompanyStore } from '@/stores/CompanyStore';
import { User } from '@/types';
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AxiosError } from "axios";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  loginMutation: UseMutationResult<
    User,
    Error,
    { login: string; password: string },
    unknown
  >;
  logout: () => Promise<void>;
}

interface ApiErrorResponse {
  message: string;
  error?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { reset } = useCompanyStore();

  const isAuthenticated = useMemo(() => !!user, [user]);

  // 1. LOGOUT (Optimizado)
  const logout = useCallback(async () => {
    try {
      setUser(null);
      setError(null);
      await deleteSession();
      await reset();
      queryClient.clear();
      router.push('/login');
      toast.info('Sesión finalizada', { position: 'bottom-center' });
    } catch (err) {
      console.error('Error durante logout:', err);
    }
  }, [router, queryClient, reset]);

  // 2. FETCH USER (Optimizado para RENDIMIENTO)
  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const { data } = await axiosInstance.get<User>('/user');
      
      // OPTIMIZACIÓN: Solo actualiza el estado si los datos realmente cambiaron
      setUser(prevUser => {
        if (JSON.stringify(prevUser) === JSON.stringify(data)) return prevUser;
        return data;
      });

      setError(null);
      return data;
    } catch (err) {
      setUser(null);
      return null;
    }
  }, []);

  // 3. SYNC SESSION (Fluida)
  const syncSession = useCallback(async () => {
    const hasToken = document.cookie.includes('auth_token');
    if (!hasToken) return;

    const data = await fetchUser();
    
    if (!data && hasToken) {
      logout();
    }
  }, [fetchUser, logout]);

  // 4. CICLO DE VIDA (Tiempos ajustados para evitar lentitud)
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      if (document.cookie.includes('auth_token')) {
        await fetchUser();
      }
      setIsLoading(false);
    };

    checkAuth();

    window.addEventListener('focus', syncSession);
    
    // Cambiado a 5 minutos (300,000 ms) para no afectar el rendimiento
    const interval = setInterval(syncSession, 300000); 

    return () => {
      window.removeEventListener('focus', syncSession);
      clearInterval(interval);
    };
  }, [fetchUser, syncSession]);

  // 5. INTERCEPTOR (Detección instantánea de 401)
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axiosInstance.interceptors.response.eject(interceptor);
  }, [logout]);

  // 6. LOGIN MUTATION
  const loginMutation = useMutation({
    mutationFn: async (credentials: { login: string; password: string }) => {
      const response = await axiosInstance.post<User>('/login', credentials, {
        headers: { 'Content-Type': 'application/json' },
      });

      const token = response.headers['authorization'];
      if (!token) throw new Error('No se recibió token de autenticación');

      createCookie("auth_token", token);
      await createSession(response.data.id);

      return response.data;
    },
    onSuccess: async (userData) => {
      // Después de login exitoso, hacemos fetch del usuario
      await fetchUser();
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/inicio');
      toast.success('¡Bienvenido!', { position: "bottom-center" });
    },
    onError: (err: Error) => {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Error al iniciar sesión';
      
      setError(errorMessage);
      toast.error('Error', { description: errorMessage, position: 'bottom-center' });
    },
  });

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    error,
    loginMutation,
    logout,
  }), [user, isAuthenticated, loading, error, loginMutation, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};
