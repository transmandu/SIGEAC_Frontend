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

// 1. Mejor tipado para el contexto
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
    } finally {
      setIsLoading(false);
    }
  };

  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    enabled: false // Deshabilitamos la ejecución automática
  });


  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const userData = await fetchUser();
        if (!userData) {
          await deleteCookie("auth_token");
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setError("Error al cargar usuario");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []); // Array de dependencias vacío para ejecutar solo al montar


  useEffect(() => {
    if (userQuery.data) {
      setUser(userQuery.data);
    }
    if (userQuery.error) {
      setError(userQuery.error.message);
    }
  }, [userQuery.data, userQuery.error]);


  const loginMutation = useMutation({
    mutationFn: async (credentials: { login: string; password: string }) => {
      const response = await axiosInstance.post<User>('/login', credentials, {
        headers: { 'Content-Type': 'application/json' },
      });

      const token = response.headers['authorization'];
      if (!token) throw new Error('No se recibió token de autenticación');

      createCookie("auth_token", token);
      await createSession(response.data.id); // Asumiendo que el user tiene id

      return response.data;
    },
    onSuccess: (userData) => {
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/inicio');
      toast.success('¡Inicio correcto!', {
        description: 'Redirigiendo...',
        position: "bottom-center"
      });
    },
    onError: (err) => {
      const errorMessage = err.message || 'Credenciales incorrectas';
      setError(errorMessage);
      toast.error('Error al iniciar sesión', {
        description: errorMessage,
        position: 'bottom-center'
      });
    },
  });

  const logout = async () => {
    try {
      // 1. Primero limpiar el estado local para evitar acceso
    setUser(null);
    setError(null);

    // 2. Eliminar sesión del servidor (esperar a que complete)
    await deleteSession();

    // 4. Resetear el store de compañía (esperar si es async)
    await reset();

    // 5. Limpiar cache de React Query
    queryClient.clear();

    // 6. Redirigir después de TODO está completo
    router.push('/login');

    // 7. Forzar recarga para limpiar cualquier estado residual
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

  // 9. Valor del contexto memoizado
  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    loading: loading || userQuery.isFetching,
    error,
    loginMutation,
    logout,
  }), [user, isAuthenticated, loading, error, loginMutation, userQuery.isFetching]);

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
