"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCompanyStore } from "@/stores/CompanyStore";
import { columns } from "./columns";
import { DataTable } from "./data-table";

import LoadingPage from "@/components/misc/LoadingPage";
import { useGetArticlesByStatus } from "@/hooks/mantenimiento/almacen/articulos/useGetArticlesByStatus";
import { useState } from "react";
import { IncomingArticle } from "./IncomingTypes";
import { GenerateReceptionFormButton } from "./_components/GenerateReceptionFormButton";
import { form_columns } from "./form_columns";
import { w_columns } from "./w-columns";
import { PageHeader } from "@/components/layout/PageHeader";


const IncomingControlPage = () => {

  const [selectedForForm, setSelectedForForm] = useState<IncomingArticle[]>([]);

  const { selectedCompany } = useCompanyStore();

  const {
    data: incomingArticles,
    isLoading: isIncomingLoading,
  } = useGetArticlesByStatus("INCOMING");

  const {
    data: waitingToLocateArticles,
    isLoading: isWaitingLoading,
  } = useGetArticlesByStatus("WAITING_TO_LOCATE");

  const {
    data: waitingForFormArticles,
    isLoading: isWaitingForFormLoading,
  } = useGetArticlesByStatus("WAITING_FOR_FORMAT");

  // Corregidos por compras y a la espera de que el inspector los re-inspeccione:
  // es trabajo pendiente de calidad, así que vive en su propio tablero y no solo
  // en la vista de cuarentena.
  const {
    data: pendingReinspectionArticles,
    isLoading: isReinspectionLoading,
  } = useGetArticlesByStatus("PENDING_REINSPECTION");

  const waitingForFormCount = waitingForFormArticles?.length ?? 0;
  const incomingCount = incomingArticles?.length ?? 0;
  const waitingCount = waitingToLocateArticles?.length ?? 0;
  const reinspectionCount = pendingReinspectionArticles?.length ?? 0;

  if (isIncomingLoading && isWaitingLoading) return <LoadingPage />;

  return (
    <ContentLayout title="Inventario">
      <div className="flex flex-col gap-y-3">
        <PageHeader />

        <div className="text-center space-y-1">
          <h1 className="text-4xl font-bold">Control de Incoming</h1>
          <p className="text-sm text-muted-foreground italic">
            Aquí puede observar los artículos en flujo de Incoming y los que están
            en espera por ubicación.
            <br />
            Filtre y/o busque si desea uno en específico.
          </p>
        </div>

        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="mx-auto w-full justify-center rounded-full p-5">
            <TabsTrigger value="incoming" className="gap-2">
              Incoming
              <Badge variant="secondary">{incomingCount}</Badge>
            </TabsTrigger>

            <TabsTrigger value="waitingForm" className="gap-2">
              Pendientes por formato
              <Badge variant="secondary">{waitingForFormCount}</Badge>
            </TabsTrigger>

            <TabsTrigger value="waiting" className="gap-2">
              En espera por ubicar
              <Badge variant="secondary">{waitingCount}</Badge>
            </TabsTrigger>

            <TabsTrigger value="reinspection" className="gap-2">
              Re-inspección
              <Badge variant={reinspectionCount > 0 ? "default" : "secondary"}>
                {reinspectionCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming">
            {isIncomingLoading ? (
              <LoadingPage />
            ) : (
              <DataTable groupBy="order_number" columns={columns} data={incomingArticles ?? []} />
            )}
          </TabsContent>

          <TabsContent value="waiting">
            {isWaitingLoading ? (
              <LoadingPage />
            ) : (
              <DataTable groupBy="order_number" columns={w_columns} data={waitingToLocateArticles ?? []} />
            )}
          </TabsContent>

          <TabsContent value="reinspection">
            {isReinspectionLoading ? (
              <LoadingPage />
            ) : (
              <DataTable
                groupBy="order_number"
                columns={columns}
                data={pendingReinspectionArticles ?? []}
              />
            )}
          </TabsContent>

          <TabsContent value="waitingForm">
            {isWaitingForFormLoading ? (
              <LoadingPage />
            ) : (
              <DataTable
                groupBy="order_number"
                columns={form_columns}
                data={waitingForFormArticles ?? []}
                getRowId={(row) => String((row as any).id)}
                onSelectionChange={setSelectedForForm}
                toolbar={
                  <GenerateReceptionFormButton
                    selected={selectedForForm}
                  />
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default IncomingControlPage;
