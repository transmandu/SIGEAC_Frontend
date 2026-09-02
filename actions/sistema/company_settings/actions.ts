import axiosInstance from "@/lib/axios";
import type { CompanySettings } from "@/hooks/general/useCompanySettings";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type UpdateCompanySettingsPayload = {
  quarantine_legal_days?: number;
  timezone?: string;
};

export const useUpdateCompanySettings = () => {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  const mutation = useMutation<CompanySettings, Error, UpdateCompanySettingsPayload>({
    mutationKey: ["update-company-settings"],

    mutationFn: async (payload) => {
      if (!selectedCompany?.slug) {
        throw new Error("Company no seleccionada");
      }

      const { data } = await axiosInstance.patch(
        `/${selectedCompany.slug}/company-settings`,
        payload,
      );

      return data;
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      // El plazo cambia el vencimiento que muestran las vistas de cuarentena.
      queryClient.invalidateQueries({ queryKey: ["quarantine-articles"] });

      // La zona reescribe CUALQUIER fecha en pantalla, no solo un módulo: se
      // refresca todo para que no queden vistas cacheadas con la zona vieja.
      if (variables.timezone) {
        queryClient.invalidateQueries();
      }

      toast.success("¡Ajustes actualizados!", {
        description: "Los cambios ya aplican en todo el sistema.",
      });
    },

    onError: (error) => {
      const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      toast.error("Oops!", {
        description: message ?? "No se pudieron actualizar los ajustes...",
      });
    },
  });

  return { updateCompanySettings: mutation };
};
