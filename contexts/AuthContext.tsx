'use client';

import { AxiosError } from "axios";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import axiosInstance from '@/lib/axios';
import { createCookie } from '@/lib/cookie';
import { createSession, deleteSession } from '@/lib/session';
import { useCompanyStore } from '@/stores/CompanyStore';
import { User } from '@/types';

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
  const isLoggingOutRef = useRef(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { reset } = useCompanyStore();

  const isAuthenticated = useMemo(() => !!user, [user]);

  const logout = useCallback(async () => {
    if (isLoggingOutRef.current) {
      return;
    }

    isLoggingOutRef.current = true;

    try {
      setUser(null);
      setError(null);

      if (typeof window !== 'undefined') {
        document.cookie = 'auth_token=; Max-Age=0; path=/';
      }

      await deleteSession();
      reset();
      queryClient.clear();
      router.replace('/login');
      toast.info('SesiÃ³n finalizada', { position: 'bottom-center' });
    } catch (err) {
      console.error('Error durante logout:', err);
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [queryClient, reset, router]);

  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const { data } = await axiosInstance.get<User>('/user');

      setUser((prevUser) => {
        if (prevUser?.id === data.id) {
          return { ...prevUser, ...data };
        }

        return data;
      });

      setError(null);
      return data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const syncSession = useCallback(async () => {
    const hasToken = document.cookie.includes('auth_token');
    if (!hasToken) {
      return;
    }

    const data = await fetchUser();
    const isSuperUser = data?.roles?.some((role) => role.name === 'SUPERUSER');

    if (isSuperUser) {
      return;
    }

    if (!data && hasToken) {
      await logout();
    }
  }, [fetchUser, logout]);

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

    const interval = setInterval(() => {
      void syncSession();
    }, 300000);

    return () => {
      window.removeEventListener('focus', syncSession);
      clearInterval(interval);
    };
  }, [fetchUser, syncSession]);

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (axiosError) => {
        if (axiosError.response?.status === 401) {
          await logout();
        }

        return Promise.reject(axiosError);
      }
    );

    return () => axiosInstance.interceptors.response.eject(interceptor);
  }, [logout]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { login: string; password: string }) => {
      const response = await axiosInstance.post<User>('/login', credentials, {
        headers: { 'Content-Type': 'application/json' },
      });

      const token = response.headers.authorization;
      if (!token) {
        throw new Error('No se recibiÃ³ token de autenticaciÃ³n');
      }

      createCookie('auth_token', token);
      await createSession(response.data.id);

      return response.data;
    },
    onSuccess: async () => {
      await fetchUser();
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.replace('/inicio');
      toast.success('Â¡Bienvenido!', { position: "bottom-center" });
    },
    onError: (err: Error) => {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || 'Error al iniciar sesiÃ³n';

      setError(errorMessage);
      toast.error('Error', {
        description: errorMessage,
        position: 'bottom-center',
      });
    },
  });

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      error,
      loginMutation,
      logout,
    }),
    [error, isAuthenticated, loading, loginMutation, logout, user]
  );

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
