"use client";

import axiosInstance, {
  isAuthEndpoint,
  isStaleSessionResponse,
} from "@/lib/axios";
import { createCookie, deleteCookie, hasAuthCookie } from "@/lib/cookie";
import { resetEcho } from "@/lib/echo";
import { setPostLoginRedirect } from "@/lib/postLoginRedirect";
import { useIsClient } from "@/hooks/useIsClient";
import { useCompanyStore } from "@/stores/CompanyStore";
import { User } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";
import LogoutOverlay from "@/components/misc/LogoutOverlay";
import { describeApiError } from "@/lib/api-error";

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

const noSubscription = () => () => {};

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
  // La cookie se lee solo en el navegador; el login y el logout la cambian
  // explícitamente, y eso manda sobre lo que se leyó al montar.
  const cookieToken = useSyncExternalStore(
    noSubscription,
    hasAuthCookie,
    () => false,
  );
  const [tokenOverride, setHasToken] = useState<boolean | null>(null);
  const hasToken = tokenOverride ?? cookieToken;
  const tokenChecked = useIsClient();

  const { data: cachedUser = null, isLoading: userLoading } =
    useQuery<User | null>({
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

  // El usuario en caché sin cookie no es una sesión: el proxy ya no deja pasar
  // a ninguna ruta protegida. Tratarlo como sesión viva dejaba al login con un
  // usuario que nadie podía usar y a AuthRedirect empujando hacia un rebote.
  const user = hasToken ? cachedUser : null;

  // Sin cookie no hay consulta que esperar: la sesión se resuelve como ausente.
  const loading = !tokenChecked || (hasToken && userLoading);

  const isAuthenticated = useMemo(() => !!user, [user]);

  /* =========================================================
   * LOGOUT
   * ========================================================= */
  // Una caída de sesión dispara decenas de 401 simultáneos, uno por query. Solo
  // el primero cierra la sesión; el resto repetía replace(), toast y overlay, y
  // los tardíos volvían a tapar un login que ya estaba pintado.
  const sessionEndedRef = useRef(false);

  const logout = useCallback(async () => {
    if (sessionEndedRef.current) return;

    sessionEndedRef.current = true;

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

      // El usuario se anula ANTES de navegar. removeQueries() vacía la caché,
      // pero la query queda deshabilitada (hasToken=false) y sigue entregando su
      // último dato: AuthRedirect veía sesión viva al aterrizar en /login y
      // rebotaba a /inicio, en bucle con el 401 que originó este logout.
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, null);
      queryClient.removeQueries();

      router.replace("/login");

      toast.info("Sesión finalizada", {
        position: "bottom-center",
      });
    } catch (err) {
      // El overlay NO se apaga aquí: sigue tapando hasta que /login esté
      // pintado. Si el logout falla a medias, el timeout de abajo lo levanta.
      // El candado se suelta para que el siguiente 401 pueda reintentar.
      sessionEndedRef.current = false;
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

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response?.status !== 401 ||
          isAuthEndpoint(error.config?.url) ||
          isStaleSessionResponse(error.config?.headers)
        ) {
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
      },
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
        credentials,
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
      sessionEndedRef.current = false;

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

      // Lo que no es "credenciales inválidas" ya no se reduce a un genérico: sin
      // internet, servidor caído o falla del sistema cada uno dice lo suyo.
      const described = describeApiError(err);

      const message = isExpectedAuthError
        ? rawMessage || "Credenciales inválidas"
        : described.reference
          ? `${described.description} (Código: ${described.reference})`
          : described.description;

      setError(message);

      // eslint-disable-next-line no-restricted-syntax -- el login ya clasificó el error con describeApiError y lo muestra en la parte inferior, sin botón Reportar (aún no hay sesión).
      toast.error(
        isExpectedAuthError ? "Error de autenticación" : described.title,
        {
          description: message,
          position: "bottom-center",
        },
      );
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
    ],
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
