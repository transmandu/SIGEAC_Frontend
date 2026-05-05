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
  const [selectedDashboard, setSelectedDashboard] =
    useState<DashboardType>(null);

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

      <header className="border-b bg-background/60 backdrop-blur-md shadow-sm">

        <div className="
          container mx-auto px-4
          py-4 sm:py-6
          flex flex-col sm:flex-row
          gap-4 sm:gap-0
          sm:items-center sm:justify-between
        ">

          <div className="
            flex items-center
            gap-3 sm:gap-4
          ">

            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-red-500/10 blur-md" />
              <div className="
                relative flex items-center justify-center
                h-10 w-10 sm:h-12 sm:w-12
                rounded-2xl border border-red-500/30
                bg-red-500/10 text-red-500 shadow-sm
              ">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="leading-tight">
              <h1 className="
                text-lg sm:text-2xl
                font-semibold tracking-tight
                text-slate-900 dark:text-slate-100
              ">
                SuperUser Dashboard
              </h1>

              <p className="
                text-xs sm:text-sm
                text-slate-500 dark:text-slate-400
              ">
                Acceso global a todos los módulos del sistema
              </p>
            </div>

          </div>

          <div className="
            w-full sm:w-[250px]
          ">

            <Select
              onValueChange={(value) =>
                setSelectedDashboard(value as DashboardType)
              }
            >

              <SelectTrigger className="
                h-10 px-3
                rounded-xl
                bg-gradient-to-br from-background/70 to-background/40
                backdrop-blur-md
                border border-slate-400/60 dark:border-slate-600/60
                shadow-sm
                hover:shadow-md hover:shadow-red-500/10
                hover:border-red-400/30
                transition-all
                focus:ring-2 focus:ring-red-500/15 focus:border-red-400/40
                text-slate-700 dark:text-slate-200
                text-sm
              ">
                <SelectValue placeholder="Seleccionar Dashboard" />
              </SelectTrigger>

              <SelectContent className="
                rounded-xl
                border border-slate-200/60 dark:border-slate-800/60
                bg-background/95 backdrop-blur-md
                shadow-xl
              ">
                <SelectItem value="WAREHOUSE">Almacén</SelectItem>
                <SelectItem value="ADMINISTRATION">Administración</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
              </SelectContent>

            </Select>

          </div>

        </div>
      </header>

      <main className="mt-4 sm:mt-6">

        {!selectedDashboard ? (
          <div className="
            flex flex-col items-center justify-center
            py-16 sm:py-24
            text-center text-muted-foreground
            px-4
          ">
            <LayoutDashboard className="
              w-8 h-8 sm:w-10 sm:h-10
              mb-3 sm:mb-4
              opacity-50
            " />
            <p className="text-xs sm:text-sm">
              Seleccione un dashboard para comenzar.
            </p>
          </div>
        ) : (
          renderDashboardContent()
        )}

      </main>

    </ContentLayout>
  );
}