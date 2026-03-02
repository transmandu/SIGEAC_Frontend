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
      <header className="shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Sistema de Gestión Aeronáutica Civil
              </h1>
              <p className="text-sm">Plataforma oficial de administración</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Sistema Seguro</span>
          </div>
        </div>
      </header>

      <WarehouseDashboardContent {...props} />
    </ContentLayout>
  );
}