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
      {/* Header */}
      <header className="shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Sistema de Administración
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestión administrativa y reportes estratégicos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Sistema Seguro</span>
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