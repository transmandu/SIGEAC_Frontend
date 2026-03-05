"use client";

import dynamic from "next/dynamic";
import LoadingPage from "@/components/misc/LoadingPage";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";

const WarehouseDashboard = dynamic(
  () => import("@/components/dashboard/WarehouseDashboard")
);

const SMSDashboard = dynamic(
  () => import("@/components/dashboard/SMSDashboard")
);

const AdministrationDashboard = dynamic(
  () => import("@/components/dashboard/AdministrationDashboard")
);

const SuperUserDashboard = dynamic(
  () => import("@/components/dashboard/SuperUserDashboard")
);

const DefaultDashboard = dynamic(
  () => import("@/components/dashboard/DefaultDashboard")
);

export default function DashboardPage() {
  const { selectedCompany, selectedStation: location_id } = useCompanyStore();
  const { user, loading } = useAuth();

  if (loading) return <LoadingPage />;

  if (!user) {
    return <DefaultDashboard companySlug={selectedCompany?.slug || ""} />;
  }

  const roleNames = user.roles?.map((r) => r.name) || [];

  const hasRole = (names: string[]) =>
    names.some((r) => roleNames.includes(r));

  const getDashboardType = () => {
    if (hasRole(["SUPERUSER"])) {
      return "SUPERUSER";
    }

    if (hasRole(["JEFE_ALMACEN", "ANALISTA_ALMACEN"])) {
      return "WAREHOUSE";
    }

    if (hasRole(["JEFE_SMS", "ANALISTA_SMS"])) {
      return "SMS";
    }

    if (
      hasRole([
        "ANALISTA_ADMINISTRACION",
        "RRHH_ADMINISTRACION",
        "JEFE_ADMINISTRACION",
        "CONTADOR_ADMINISTRACION",
      ])
    ) {
      return "ADMINISTRATION";
    }

    return "DEFAULT";
  };

  switch (getDashboardType()) {
    case "SUPERUSER":
      return (
        <SuperUserDashboard
          companySlug={selectedCompany?.slug || ""}
          location_id={location_id || ""}
          user={user}
          roleNames={roleNames}
        />
      );

    case "WAREHOUSE":
      return (
        <WarehouseDashboard
          companySlug={selectedCompany?.slug || ""}
          location_id={location_id || ""}
          user={user}
          roleNames={roleNames}
        />
      );

    case "SMS":
      return (
        <SMSDashboard
          companySlug={selectedCompany?.slug || ""}
          location_id={location_id || ""}
          user={user}
          roleNames={roleNames}
        />
      );

    case "ADMINISTRATION":
      return (
        <AdministrationDashboard
          companySlug={selectedCompany?.slug || ""}
          location_id={location_id || ""}
          user={user}
          roleNames={roleNames}
        />
      );

    case "DEFAULT":
    default:
      return <DefaultDashboard companySlug={selectedCompany?.slug || ""} />;
  }
}