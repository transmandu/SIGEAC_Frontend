import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useGetMaintenanceProviders } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceProviders";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMemo } from "react";
import type { AuditLookups } from "./labels";

/** Aeronave y proveedor por nombre en vez de id; las mismas listas que ya usan los formularios. */
export const useAuditLookups = (): AuditLookups => {
  const { selectedCompany } = useCompanyStore();
  const { data: aircrafts } = useGetMaintenanceAircrafts(selectedCompany?.slug);
  const { data: providers } = useGetMaintenanceProviders(selectedCompany?.slug);

  return useMemo(
    () => ({
      aircraft_id: Object.fromEntries(
        (aircrafts ?? []).map((a) => [String(a.id), a.acronym]),
      ),
      maintenance_provider_id: Object.fromEntries(
        (providers ?? []).map((p) => [String(p.id), p.name]),
      ),
    }),
    [aircrafts, providers],
  );
};
