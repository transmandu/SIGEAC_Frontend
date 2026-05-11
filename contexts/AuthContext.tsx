"use client";

import axiosInstance from "@/lib/axios";
import { createCookie } from "@/lib/cookie";
import { createSession, deleteSession } from "@/lib/session";
import { useCompanyStore } from "@/stores/CompanyStore";
import { User } from "@/types";
import {
  useMutation,
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

/* ---------------- TYPES ---------------- */

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  loginMutation: any;
  logout: () => Promise<void>;
}

interface ApiErrorResponse {
  message: string;
}

/* ---------------- CONTEXT ---------------- */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------------- PROVIDER ---------------- */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { reset } = useCompanyStore();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializedRef = useRef(false);

  const isAuthenticated = useMemo(() => !!user, [user]);

  /* =========================================================
   * LOGOUT
   * ========================================================= */
  const logout = useCallback(async () => {
    try {
      setUser(null);
      setError(null);

      await deleteSession();
      reset();

      queryClient.removeQueries();

      router.push("/login");

      toast.info("Sesión finalizada", {
        position: "bottom-center",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, [router, queryClient, reset]);

  /* =========================================================
   * FETCH USER
   * ========================================================= */
  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const { data } = await axiosInstance.get<User>("/user");
      return data;
    } catch {
      return null;
    }
  }, []);

  /* =========================================================
   * APPLY USER
   * ========================================================= */
  const applyUser = useCallback((data: User | null) => {
    setUser(data);
    setError(null);
  }, []);

  /* =========================================================
   * INIT AUTH
   * ========================================================= */
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const init = async () => {
      setIsLoading(true);

      const hasToken = document.cookie.includes("auth_token");

      if (hasToken) {
        const data = await fetchUser();
        applyUser(data);
      }

      setIsLoading(false);
    };

    init();
  }, [fetchUser, applyUser]);

  /* =========================================================
   * INTERCEPTOR
   * ========================================================= */
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const url = error.config?.url;

        const isAuthRequest =
          url?.includes("/login") ||
          url?.includes("/register");

        const hasSession = !!user;

        if (
          error.response?.status === 401 &&
          hasSession &&
          !isAuthRequest
        ) {
          logout();
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [logout, user]);

  /* =========================================================
   * LOGIN MUTATION (FIX REAL DEL PROBLEMA)
   * ========================================================= */
  const loginMutation = useMutation({
    mutationFn: async (credentials: { login: string; password: string }) => {
      try {
        const response = await axiosInstance.post<User>(
          "/login",
          credentials
        );

        const token = response.headers["authorization"];

        // 🔴 FIX CRÍTICO: si no hay token => ERROR REAL
        if (!token) {
          throw new Error("Credenciales inválidas");
        }

        createCookie("auth_token", token);
        await createSession(response.data.id);

        return response.data;
      } catch (err) {
        throw err;
      }
    },

    onSuccess: async (userData) => {
      // 🔴 PROTECCIÓN: evita navegación falsa si data es inválida
      if (!userData) return;

      let finalUser = userData;

      try {
        const { data } = await axiosInstance.get("/user");
        if (data) finalUser = data;
      } catch {
        // no bloquear login por fetch opcional
      }

      applyUser(finalUser);

      setError(null);

      toast.success("¡Bienvenido!", {
        position: "bottom-center",
      });

      router.replace("/inicio");
    },

    onError: (err: Error) => {
      const axiosError = err as AxiosError<ApiErrorResponse>;

      const message =
        axiosError.response?.data?.message ||
        "Credenciales inválidas";

      // 🔴 FIX CLAVE: evita side-effects globales
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
      error,
      loginMutation,
      logout,
    }),
    [user, isAuthenticated, loading, error, loginMutation, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
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