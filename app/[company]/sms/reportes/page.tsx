"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoluntaryReportsPage } from "./voluntary-page";
import { ObligatoryReportsPage } from "./obligatory-page";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useExportPeligroReportes } from "@/hooks/sms/useExportPeligroReportes";

export default function ReportsPage() {
    const { selectedCompany } = useCompanyStore();
    const { exportPeligroReportes } = useExportPeligroReportes();

    const title = "Gestión de Reportes";
    const handleExport = () => {
      if (!selectedCompany?.slug) {
        return;
      }
      exportPeligroReportes(selectedCompany.slug);
    };

    return (
        <ContentLayout title={title}>
          <PageHeader className="mb-6" />

            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={handleExport}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                aria-label="Exportar reporte a Excel"
              >
                <svg className="inline-block mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 21h5v-5a3 3 0 00-5.356-1.857L14 11.08a7 7 0 00-4.946-9H2a7 7 0 00-4.946 9L7.355 7H4.5A4.5 4.5 0 019 12.5v5z" />
                </svg>
                Exportar Excel
              </button>
            </div>

            <Tabs defaultValue="voluntarios" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="voluntarios" className="flex items-center gap-2">
                        Reportes Voluntarios
                    </TabsTrigger>
                    <TabsTrigger value="obligatorios" className="flex items-center gap-2">
                        Reportes Obligatorios
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="voluntarios" className="space-y-4">
                    <VoluntaryReportsPage showHeader={false} />
                </TabsContent>

                <TabsContent value="obligatorios" className="space-y-4">
                    <ObligatoryReportsPage showHeader={false} />
                </TabsContent>
            </Tabs>
        </ContentLayout>
    );
}
