"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Shield, ShieldAlert } from "lucide-react";
import { User } from "@/types";
import SMSDashboardContent from "@/components/dashboard/content/SMSDashboardContent";

interface SMSDashboardProps {
  companySlug: string;
  location_id: string;
  user: User;
  roleNames: string[];
}

export default function SMSDashboard(props: SMSDashboardProps) {
  const { companySlug } = props;

  return (
    <ContentLayout title={`Dashboard / ${companySlug || ""}`}>
      {/* Header */}
      <header className="border-b bg-background/60 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">

          {/* ================= ICON + TITLE ================= */}
          <div className="flex items-center space-x-4">

            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-md" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-600 shadow-sm">
                <ShieldAlert className="h-6 w-6" />
              </div>
            </div>

            <div className="leading-tight">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Dashboard de SMS
              </h1>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Safety Management System (Gestión de seguridad operacional)
              </p>
            </div>

          </div>

          {/* ================= STATUS BADGE ================= */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm backdrop-blur-md">
            <Shield className="h-4 w-4" />
            <span className="text-xs font-medium tracking-wide">
              Sistema seguro
            </span>
          </div>

        </div>
      </header>

      <SMSDashboardContent {...props} />
    </ContentLayout>
  );
}