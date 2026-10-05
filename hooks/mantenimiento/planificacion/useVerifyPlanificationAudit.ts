import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { AuditIntegrity } from "@/types/planification/audit";
import { useMutation } from "@tanstack/react-query";

/** Mutación y no consulta: recalcula toda la cadena, solo cuando se pide. */
export const useVerifyPlanificationAudit = () => {
  const { selectedCompany } = useCompanyStore();

  return useMutation<AuditIntegrity, Error>({
    mutationFn: async () => {
      const { data } = await axiosInstance.get(
        `/${selectedCompany?.slug}/planification-audit-logs/integrity`,
      );

      return data;
    },
  });
};
