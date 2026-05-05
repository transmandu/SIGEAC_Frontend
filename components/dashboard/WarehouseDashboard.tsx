"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Plane, Shield } from "lucide-react";
import { User } from "@/types";
import WarehouseDashboardContent from "@/components/dashboard/content/WarehouseDashboardContent";

interface WarehouseDashboardProps {
  companySlug: string;
  location_id: string;
  user: User;
  roleNames: string[];
}

export default function WarehouseDashboard(props: WarehouseDashboardProps) {
  const { companySlug } = props;

  return (
    <ContentLayout title={`Dashboard / ${companySlug || ""}`}>

      <header className="border-b bg-background/60 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4">

          <div className="flex items-center justify-between sm:hidden">

            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-md" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-600 shadow-sm">
                <Plane className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm backdrop-blur-md">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-medium tracking-wide">
                Seguro
              </span>
            </div>

          </div>

          <div className="hidden sm:flex items-center justify-between">

            <div className="flex items-center space-x-4">

              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-md" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-600 shadow-sm">
                  <Plane className="h-6 w-6" />
                </div>
              </div>

              <div className="leading-tight">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  Sistema de Gestión Aeronáutica Civil
                </h1>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Plataforma oficial de administración
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm backdrop-blur-md">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-medium tracking-wide">
                Sistema seguro
              </span>
            </div>

          </div>

          <div className="sm:hidden">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
              Sistema de Gestión Aeronáutica Civil
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Plataforma oficial de administración
            </p>
          </div>

        </div>
      </header>

      <WarehouseDashboardContent {...props} />
    </ContentLayout>
  );
}