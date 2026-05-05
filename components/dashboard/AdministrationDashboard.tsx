"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Shield, Building2 } from "lucide-react";
import { User } from "@/types";

import AdministrationDashboardContent from "@/components/dashboard/content/AdministrationDashboardContent";

interface AdministrationDashboardProps {
  companySlug: string;
  location_id: string;
  user: User;
  roleNames: string[];
}

export default function AdministrationDashboard({
  companySlug,
  location_id,
  user,
  roleNames,
}: AdministrationDashboardProps) {
  return (
    <ContentLayout title={`Dashboard / ${companySlug || ""}`}>

      <header className="border-b bg-background/60 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4">

          {/* ================= MOBILE HEADER (WAREHOUSE STYLE) ================= */}
          <div className="flex items-center justify-between sm:hidden">

            {/* ICON */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 blur-md" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>
            </div>

            {/* BADGE */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm backdrop-blur-md">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-medium tracking-wide">
                Sistema seguro
              </span>
            </div>

          </div>

          {/* ================= DESKTOP HEADER (UNCHANGED) ================= */}
          <div className="hidden sm:flex items-center justify-between">

            {/* ICON + TITLE */}
            <div className="flex items-center space-x-4">

              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 blur-md" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 shadow-sm">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>

              <div className="leading-tight">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  Dashboard de Administración
                </h1>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Gestión administrativa y reportes estratégicos
                </p>
              </div>

            </div>

            {/* BADGE */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm backdrop-blur-md">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-medium tracking-wide">
                Sistema seguro
              </span>
            </div>

          </div>

          {/* ================= MOBILE TITLE (WAREHOUSE STYLE) ================= */}
          <div className="sm:hidden">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
              Dashboard de Administración
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Gestión administrativa y reportes estratégicos
            </p>
          </div>

        </div>
      </header>

      <AdministrationDashboardContent
        companySlug={companySlug}
        location_id={location_id}
        user={user}
        roleNames={roleNames}
      />

    </ContentLayout>
  );
}