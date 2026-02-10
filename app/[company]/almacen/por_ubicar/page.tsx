"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCompanyStore } from "@/stores/CompanyStore";
import { DataTable } from "./data-table";

import LoadingPage from "@/components/misc/LoadingPage";
import { useGetArticlesByStatus } from "@/hooks/mantenimiento/almacen/articulos/useGetArticlesByStatus";
import { columns } from "./columns";



const IncomingControlPage = () => {
  const { selectedCompany } = useCompanyStore();

  const {
    data: waitingToLocateArticles,
    isLoading: isWaitingLoading,
  } = useGetArticlesByStatus("WAITING_TO_LOCATE");

  if (isWaitingLoading) return <LoadingPage />;

  return (
    <ContentLayout title="Inventario">
      <div className="flex flex-col gap-y-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>General</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Control de Ubicación</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
