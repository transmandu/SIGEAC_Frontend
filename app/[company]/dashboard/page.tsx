"use client";

import dynamic from "next/dynamic";
import LoadingPage from "@/components/misc/LoadingPage";
import { useAuth } from "@/contexts/AuthContext";
import { useRouteSelection } from "@/hooks/helpers/use-route-selection";

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
  const { currentCompany, currentStation } = useRouteSelection();
  const { user, loading } = useAuth();

  if (loading) return <LoadingPage />;

  if (!user) {
    return <DefaultDashboard companySlug={currentCompany?.slug || ""} />;
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
          companySlug={currentCompany?.slug || ""}
          location_id={currentStation || ""}
          user={user}
          roleNames={roleNames}
        />
      );

    case "WAREHOUSE":
      return (
        <WarehouseDashboard
          companySlug={currentCompany?.slug || ""}
          location_id={currentStation || ""}
          user={user}
          roleNames={roleNames}
        />
      );

    case "SMS":
      return (
        <SMSDashboard
          companySlug={currentCompany?.slug || ""}
          location_id={currentStation || ""}
          user={user}
          roleNames={roleNames}
        />
      );

    case "ADMINISTRATION":
      return (
        <AdministrationDashboard
          companySlug={currentCompany?.slug || ""}
          location_id={currentStation || ""}
          user={user}
          roleNames={roleNames}
        />
      );

    case "DEFAULT":
    default:
      return <DefaultDashboard companySlug={currentCompany?.slug || ""} />;
  }
}
