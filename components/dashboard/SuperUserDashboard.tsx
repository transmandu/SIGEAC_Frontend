// components/dashboard/SuperUserDashboard.tsx
"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Shield, LayoutDashboard } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/types";

// Importar solo los contenidos de los dashboards
import WarehouseDashboardContent from "@/components/dashboard/content/WarehouseDashboardContent";
import AdministrationDashboardContent from "@/components/dashboard/content/AdministrationDashboardContent";
import SMSDashboardContent from "@/components/dashboard/content/SMSDashboardContent";

interface SuperUserDashboardProps {
  companySlug: string;
  location_id: string;
  user: User;
  roleNames: string[];
}

type DashboardType = "WAREHOUSE" | "ADMINISTRATION" | "SMS" | null;

export default function SuperUserDashboard({
  companySlug,
  location_id,
  user,
  roleNames,
}: SuperUserDashboardProps) {
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardType>(
    null
  );

  const renderDashboardContent = () => {
    switch (selectedDashboard) {
      case "WAREHOUSE":
        return (
          <WarehouseDashboardContent
            companySlug={companySlug}
            location_id={location_id}
            user={user}
            roleNames={roleNames}
          />
        );

      case "ADMINISTRATION":
        return (
          <AdministrationDashboardContent
            companySlug={companySlug}
            location_id={location_id}
            user={user}
            roleNames={roleNames}
          />
        );

      case "SMS":
        return (
          <SMSDashboardContent
            companySlug={companySlug}
            location_id={location_id}
            user={user}
            roleNames={roleNames}
          />
        );

      default:
        return null;
    }
  };

  return (
    <ContentLayout title={`SuperUser Dashboard / ${companySlug || ""}`}>
      {/* Header propio del SuperUser */}
      <header className="shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SuperUser Panel</h1>
              <p className="text-sm text-muted-foreground">
                Acceso global a todos los dashboards del sistema
              </p>
            </div>
          </div>

          {/* Selector de Dashboard */}
          <div className="w-[240px]">
            <Select
              onValueChange={(value) =>
                setSelectedDashboard(value as DashboardType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Dashboard" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WAREHOUSE">Almacén</SelectItem>
                <SelectItem value="ADMINISTRATION">Administración</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Contenido dinámico */}
      <main className="mt-6">
        {!selectedDashboard ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
            <LayoutDashboard className="w-10 h-10 mb-4 opacity-50" />
            <p className="text-sm">Seleccione un dashboard para comenzar.</p>
          </div>
        ) : (
          renderDashboardContent()
        )}
      </main>
    </ContentLayout>
  );
}