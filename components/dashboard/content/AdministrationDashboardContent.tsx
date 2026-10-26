"use client";

import { useCompanyStore } from "@/stores/CompanyStore";

import AirlineAdministrationDashboardContent from "./administration/AirlineAdministrationDashboardContent";
import AeronauticalAdministrationDashboardContent from "./administration/AeronauticalAdministrationDashboardContent";
import type { AdministrationDashboardContentProps } from "./administration/types";

/**
 * El dashboard de administración es distinto según el tipo de empresa: cada
 * rama muestra solo las pestañas cuyos datos existen en ella. Aquí se elige la
 * rama una sola vez; las pestañas de cada una viven en su propio archivo.
 */
export default function AdministrationDashboardContent(
  props: AdministrationDashboardContentProps,
) {
  const { selectedCompany } = useCompanyStore();

  // Sin empresa cargada no se sabe qué rama es: no se monta ninguna.
  if (!selectedCompany) return null;

  return selectedCompany.isOMAC ? (
    <AeronauticalAdministrationDashboardContent {...props} />
  ) : (
    <AirlineAdministrationDashboardContent />
  );
}
