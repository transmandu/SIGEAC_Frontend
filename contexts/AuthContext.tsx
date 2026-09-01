"use client";

import axiosInstance, { isAuthEndpoint } from "@/lib/axios";
import { createCookie, deleteCookie, hasAuthCookie } from "@/lib/cookie";
import { resetEcho } from "@/lib/echo";
import { setPostLoginRedirect } from "@/lib/postLoginRedirect";
import { useCompanyStore } from "@/stores/CompanyStore";
import { User } from "@/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";
import LogoutOverlay from "@/components/misc/LogoutOverlay";

/* ---------------- TYPES ---------------- */

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  loggingOut: boolean;
  error: string | null;
  loginMutation: any;
  logout: () => Promise<void>;
  clearLoggingOut: () => void;
}

interface ApiErrorResponse {
  message: string;
}

interface LoginResponse {
  message: string;
  userId: number;
  company: string | null;
  user: User;
}

/* ---------------- CONTEXT ---------------- */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AUTH_USER_QUERY_KEY = ["auth", "user"] as const;

/* ---------------- PROVIDER ---------------- */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { reset } = useCompanyStore();

  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // La cookie sólo dice si vale la pena preguntar por el usuario; la respuesta
  // de /user sigue siendo la única fuente de verdad de la sesión.
  const [hasToken, setHasToken] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    setHasToken(hasAuthCookie());
    setTokenChecked(true);
  }, []);

  const {
    data: user = null,
    isLoading: userLoading,
  } = useQuery<User | null>({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: async () => {
      const { data } = await axiosInstance.get<User>("/user");
      return data;
    },
    enabled: tokenChecked && hasToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Sin cookie no hay consulta que esperar: la sesión se resuelve como ausente.
  const loading = !tokenChecked || (hasToken && userLoading);

  const isAuthenticated = useMemo(() => !!user, [user]);

  /* =========================================================
   * LOGOUT
   * ========================================================= */
  const logout = useCallback(async () => {
    setLoggingOut(true);

    try {
      setError(null);
      setHasToken(false);

      resetEcho();

      deleteCookie("auth_token");

      // reset() solo limpia el estado en memoria de ESTA pestaña. La compañía
      // vive en localStorage (zustand persist), así que sin borrar la clave la
      // siguiente cuenta heredaba la empresa y la estación de la anterior.
      reset();
      useCompanyStore.persist.clearStorage();

      // El historial empresa→estación es del usuario que se va: dejarlo hacía
      // que la siguiente cuenta heredara la estación de la anterior en cuanto
      // coincidieran en una empresa.
      localStorage.removeItem("company-station-history");

      // Un destino pendiente de la sesión que termina no es de la siguiente.
      setPostLoginRedirect(null);

      queryClient.removeQueries();

      router.replace("/login");

      toast.info("Sesión finalizada", {
        position: "bottom-center",
      });
    } catch (err) {
      // El overlay NO se apaga aquí: sigue tapando hasta que /login esté
      // pintado. Si el logout falla a medias, el timeout de abajo lo levanta.
      console.error("Logout error:", err);
    }
  }, [router, queryClient, reset]);

  // Solo la red de seguridad: si la navegación se atasca, el overlay no puede
  // quedarse tapando la pantalla para siempre.
  useEffect(() => {
    if (!loggingOut) return;

    const timeout = window.setTimeout(() => setLoggingOut(false), 8000);

    return () => window.clearTimeout(timeout);
  }, [loggingOut]);

  // Quien lo apaga es la página de login al terminar de montarse. `pathname`
  // cambia en cuanto Next EMPIEZA la transición, así que apagarlo ahí destapaba
  // la pantalla antes de que el login estuviera pintado.
  const clearLoggingOut = useCallback(() => {
    setLoggingOut(false);
  }, []);

  /* =========================================================
   * INTERCEPTOR
   * ========================================================= */
  // `user` se lee por ref y no como dependencia: incluirlo re-registraba el
  // interceptor en cada cambio de sesión.
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status !== 401 || isAuthEndpoint(error.config?.url)) {
          return Promise.reject(error);
        }

        if (userRef.current) {
          logout();
        } else {
          // 401 antes de que la sesión llegue a memoria (token expirado al
          // recargar): no hay estado que limpiar ni de dónde expulsar, pero la
          // cookie muerta debe irse para que el middleware mande al login.
          deleteCookie("auth_token");
          setHasToken(false);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  /* =========================================================
   * LOGIN MUTATION
   * ========================================================= */
  const loginMutation = useMutation({
    mutationFn: async (credentials: { login: string; password: string }) => {
      const response = await axiosInstance.post<LoginResponse>(
        "/login",
        credentials
      );

      const token = response.headers["authorization"];

      if (!token) {
        throw new Error("Credenciales inválidas");
      }

      createCookie("auth_token", token);

      return response.data.user;
    },

    onSuccess: (userData) => {
      if (!userData) return;

      // El login ya devuelve el payload completo, así que se siembra la caché
      // en lugar de volver a pedir /user, que es la llamada más cara del flujo.
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, userData);
      setHasToken(true);

      setError(null);

      const greetingName = userData.first_name?.trim() || userData.username;

      toast.success(`¡Bienvenido, ${greetingName}!`, {
        position: "bottom-center",
      });

      // Navega AuthRedirect, el único que sabe si la compañía persistida es de
      // esta sesión. Hacerlo también aquí ponía dos replace() con destinos
      // distintos en el mismo tick.
    },

    onError: (err: Error) => {
      const axiosError = err as AxiosError<ApiErrorResponse>;

      const status = axiosError.response?.status;
      const rawMessage = axiosError.response?.data?.message;

      // Credenciales inválidas u otros errores de validación controlados por el backend
      const isExpectedAuthError = status === 401 || status === 422;

      const message = isExpectedAuthError
        ? rawMessage || "Credenciales inválidas"
        : "Ha ocurrido un problema. Por favor contacte al equipo de Desarrollo para resolverlo a la brevedad posible.";

      setError(message);

      toast.error("Error de autenticación", {
        description: message,
        position: "bottom-center",
      });
    },
  });

  /* =========================================================
   * CONTEXT VALUE
   * ========================================================= */
  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      loggingOut,
      error,
      loginMutation,
      logout,
      clearLoggingOut,
    }),
    [
      user,
      isAuthenticated,
      loading,
      loggingOut,
      error,
      loginMutation,
      logout,
      clearLoggingOut,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {loggingOut && <LogoutOverlay />}
    </AuthContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};