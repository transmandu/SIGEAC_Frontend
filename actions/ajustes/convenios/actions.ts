import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";
import type { CompanyScope } from "@/hooks/ajustes/convenios/types";

// Al cambiar un convenio se refrescan también las personas habilitadas: los
// formularios de cada módulo solo ofrecen las de alcances abiertos.
const useRefreshLoans = () => {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["company-loans"] }),
      queryClient.invalidateQueries({ queryKey: ["company-loan-audience"] }),
      queryClient.invalidateQueries({ queryKey: ["company-loan-personnel"] }),
      queryClient.invalidateQueries({ queryKey: ["company-loan-history"] }),
      queryClient.invalidateQueries({ queryKey: ["external-employees"] }),
    ]);
  };
};

export const useCreateCompanyLoan = (companySlug?: string) => {
  const refresh = useRefreshLoans();

  return useMutation({
    mutationFn: async (payload: {
      borrowerCompanySlug: string;
      scopes: CompanyScope[];
    }) => {
      await axios.post(`/${companySlug}/company-loans`, {
        borrower_company_slug: payload.borrowerCompanySlug,
        scopes: payload.scopes,
      });
    },
    onSuccess: async () => {
      toast.success("Empresa habilitada correctamente.");
      await refresh();
    },
    onError: (error: unknown) =>
      notifyError(error, { action: "habilitar la empresa" }),
  });
};

/**
 * Un convenio nunca se borra: se suspende. Suspenderlo frena las operaciones
 * nuevas; lo anterior a la fecha de suspensión sigue pudiendo editarse.
 */
export const useSetCompanyLoanActive = (companySlug?: string) => {
  const refresh = useRefreshLoans();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await axios.patch(`/${companySlug}/company-loans/${id}/active`, {
        is_active: isActive,
      });
      return isActive;
    },
    onSuccess: async (isActive) => {
      toast.success(isActive ? "Convenio reanudado." : "Convenio suspendido.");
      await refresh();
    },
    onError: (error: unknown) =>
      notifyError(error, { action: "actualizar el convenio" }),
  });
};

/** El otorgante fija qué alcances quedan abiertos (el resto se cierra). */
export const useSetCompanyLoanScopes = (companySlug?: string) => {
  const refresh = useRefreshLoans();

  return useMutation({
    mutationFn: async ({
      id,
      scopes,
    }: {
      id: number;
      scopes: CompanyScope[];
    }) => {
      await axios.put(`/${companySlug}/company-loans/${id}/scopes`, { scopes });
    },
    onSuccess: async () => {
      toast.success("Alcances actualizados.");
      await refresh();
    },
    onError: (error: unknown) =>
      notifyError(error, { action: "actualizar los alcances" }),
  });
};

/** El receptor elige qué personas y departamentos suyos usan el alcance. */
export const useSetLoanAudience = (companySlug?: string) => {
  const refresh = useRefreshLoans();

  return useMutation({
    mutationFn: async ({
      id,
      scope,
      employees,
      departments,
      excluded,
      ends,
    }: {
      id: number;
      scope: CompanyScope;
      /** `valid_from` (`YYYY-MM-DD`): desde cuándo vale; puede ser anterior a hoy. */
      employees: { dni: string; valid_from?: string }[];
      departments: { id: number; valid_from?: string }[];
      excluded: { dni: string; valid_from?: string }[];
      /** Fecha de baja (`YYYY-MM-DD`) de lo ya guardado que se quita; por omisión, hoy. */
      ends?: {
        employees?: Record<string, string>;
        departments?: Record<string, string>;
        excluded?: Record<string, string>;
      };
    }) => {
      await axios.put(
        `/${companySlug}/company-loans/received/${id}/scopes/${scope}/audience`,
        { employees, departments, excluded_employees: excluded, ends },
      );
    },
    onSuccess: async () => {
      toast.success("Audiencia actualizada.");
      await refresh();
    },
    onError: (error: unknown) =>
      notifyError(error, { action: "guardar la audiencia" }),
  });
};
