'use client';

import { default as axiosInstance } from '@/lib/axios';
import { createCookie, deleteCookie } from '@/lib/cookie';
import { createSession, deleteSession } from '@/lib/session';
import { useCompanyStore } from '@/stores/CompanyStore';
import { User } from '@/types';
import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
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

  const fetchUser = async (): Promise<User | null> => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get<User>('/user');
      setUser(data);
      setError(null);
      return data;
    } catch (err) {
      setUser(null);
      setError(err as any || 'Error al cargar usuario');
      return null;
    }
  }, []);

  // 3. SYNC SESSION (Fluida) - Ignora SUPERUSER
  const syncSession = useCallback(async () => {
    const hasToken = document.cookie.includes('auth_token');
    if (!hasToken) return;

    const data = await fetchUser();

    // Si el usuario actual es SUPERUSER, no aplicar logout automático
    const isSuperUser = data?.roles?.some(
      (role) => role.name === 'SUPERUSER'
    );

    if (isSuperUser) return;

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
    }
  };

  // Eliminamos el useQuery anterior y lo reemplazamos por una función directa
  // que podemos llamar manualmente cuando necesitemos

  useEffect(() => {
    // Verificamos si hay token al cargar la aplicación
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        // Aquí puedes verificar si existe el cookie de auth_token
        // Si existe, hacemos el fetch del usuario
        const token = document.cookie.includes('auth_token');
        if (token) {
          await fetchUser();
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setError("Error al verificar autenticación");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

    window.addEventListener('focus', syncSession);

    const interval = setInterval(() => {
      syncSession();
    }, 300000); // 5 minutos

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
      await fetchUser();
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/inicio');
      toast.success('¡Inicio correcto!', {
        description: 'Redirigiendo...',
        position: "bottom-center"
      });
    },
    onError: (err: Error) => {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Error al iniciar sesión';

      setError(errorMessage);
      toast.error('Error al iniciar sesión', {
        description: errorMessage,
        position: 'bottom-center'
      });
    },
  });

  const logout = async () => {
    try {
      setUser(null);
      setError(null);
      await deleteSession();
      await reset();
      queryClient.clear();
      router.push('/login');
      router.refresh();
      toast.success('Sesión cerrada correctamente', {
        position: "bottom-center"
      });
    } catch (err) {
      console.error('Error durante logout:', err);
      toast.error('Error al cerrar sesión', {
        description: 'Inténtalo de nuevo más tarde',
        position: 'bottom-center'
      });
    }
  };

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    error,
    loginMutation,
    logout,
  }), [user, isAuthenticated, loading, error, loginMutation]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
