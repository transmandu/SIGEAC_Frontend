// app/[company]/dashboard/page.tsx
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
  const hasRole = (names: string[]) => names.some((r) => roleNames.includes(r));

  // Determinar el tipo de dashboard basado en los roles
  const getDashboardType = () => {
    if (hasRole(["SUPERUSER", "JEFE_ALMACEN", "ANALISTA_ALMACEN"])) {
      return "WAREHOUSE";
    }
    if (hasRole(["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"])) {
      return "SMS";
    }
    return "DEFAULT";
  };

  // Usar switch case para renderizar el dashboard correspondiente
  switch (getDashboardType()) {
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

    case "DEFAULT":
    default:
      return <DefaultDashboard companySlug={selectedCompany?.slug || ""} />;
  }
}
