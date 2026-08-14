"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCompanyStore } from "@/stores/CompanyStore";
import { DataTable } from "./data-table";

import LoadingPage from "@/components/misc/LoadingPage";
import { useGetArticlesByStatus } from "@/hooks/mantenimiento/almacen/articulos/useGetArticlesByStatus";
import { columns } from "./columns";
import { PageHeader } from "@/components/layout/PageHeader";



const IncomingControlPage = () => {
  const { selectedCompany } = useCompanyStore();

  const {
    data: waitingToLocateArticles,
    isLoading: isWaitingLoading,
  } = useGetArticlesByStatus("WAITING_TO_LOCATE");

  if (isWaitingLoading) return <LoadingPage />;

  return (
    <ContentLayout title="Control de Ubicación">
      <div className="flex flex-col gap-y-3">
        <PageHeader className="mb-3" />

        <div className="text-center space-y-1">
          <h1 className="text-4xl font-bold">Control de Ubicación</h1>
          <p className="text-sm text-muted-foreground italic">
            Aquí puede observar los artículos que están en espera por ubicar dentro del almacén.
            <br />
            Filtre y/o busque si desea uno en específico.
          </p>
        </div>

        {isWaitingLoading ? (
              <LoadingPage />
            ) : (
              <DataTable columns={columns} data={waitingToLocateArticles ?? []} />
        )}
      </div>
    </ContentLayout>
  );
};

export default IncomingControlPage;
