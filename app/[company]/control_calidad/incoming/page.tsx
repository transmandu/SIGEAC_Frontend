"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { columns } from "./columns";
import { QueueDataTable } from "@/app/[company]/control_calidad/_components/QueueDataTable";
import { QueuePanel } from "@/app/[company]/control_calidad/_components/QueuePanel";
import { useInspectionQueue } from "@/hooks/mantenimiento/almacen/inventario/useArticleQueues";
import { useState } from "react";
import { IncomingArticle } from "./IncomingTypes";
import { GenerateReceptionFormButton } from "./_components/GenerateReceptionFormButton";
import { IssuedFormatsDialog } from "./_components/IssuedFormatsDialog";
import { form_columns } from "./form_columns";
import { PageHeader } from "@/components/layout/PageHeader";

// Referencia fija para las colas aún sin datos: un `[]` nuevo en cada render
// cambia la identidad de `data` y re-dispara lo que depende de ella.
const NO_ARTICLES: IncomingArticle[] = [];

const IncomingControlPage = () => {
  const [selectedForForm, setSelectedForForm] = useState<IncomingArticle[]>([]);

  const incomingQueue = useInspectionQueue("INCOMING");
  const waitingForFormQueue = useInspectionQueue("WAITING_FOR_FORMAT");
  // Corregidos por compras y a la espera de que el inspector los re-inspeccione:
  // es trabajo pendiente de calidad, así que vive en su propio tablero y no solo
  // en la vista de cuarentena.
  const reinspectionQueue = useInspectionQueue("PENDING_REINSPECTION");

  const incomingArticles = incomingQueue.data ?? NO_ARTICLES;
  const waitingForFormArticles = waitingForFormQueue.data ?? NO_ARTICLES;
  const pendingReinspectionArticles = reinspectionQueue.data ?? NO_ARTICLES;

  const incomingCount = incomingArticles.length;
  const waitingForFormCount = waitingForFormArticles.length;
  const reinspectionCount = pendingReinspectionArticles.length;

  return (
    <ContentLayout title="Control de Incoming">
      <div className="flex flex-col gap-y-3">
        <PageHeader className="mb-3" />

        <div className="text-center space-y-1">
          <h1 className="text-4xl font-bold">Control de Incoming</h1>
          <p className="text-sm text-muted-foreground italic">
            Aquí puede observar los artículos en flujo de Incoming.
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

            <TabsTrigger value="reinspection" className="gap-2">
              Re-inspección
              <Badge variant={reinspectionCount > 0 ? "default" : "secondary"}>
                {reinspectionCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming">
            <QueuePanel
              isLoading={incomingQueue.isLoading}
              isError={incomingQueue.isError}
              onRetry={() => incomingQueue.refetch()}
            >
              <QueueDataTable
                columns={columns}
                data={incomingArticles}
              />
            </QueuePanel>
          </TabsContent>

          <TabsContent value="reinspection">
            <QueuePanel
              isLoading={reinspectionQueue.isLoading}
              isError={reinspectionQueue.isError}
              onRetry={() => reinspectionQueue.refetch()}
            >
              <QueueDataTable
                columns={columns}
                data={pendingReinspectionArticles}
              />
            </QueuePanel>
          </TabsContent>

          <TabsContent value="waitingForm">
            <QueuePanel
              isLoading={waitingForFormQueue.isLoading}
              isError={waitingForFormQueue.isError}
              onRetry={() => waitingForFormQueue.refetch()}
            >
              <QueueDataTable
                columns={form_columns}
                data={waitingForFormArticles}
                getRowId={(row) => String(row.id)}
                onSelectionChange={setSelectedForForm}
                toolbar={
                  <div className="flex items-center gap-2">
                    <GenerateReceptionFormButton selected={selectedForForm} />
                    <IssuedFormatsDialog />
                  </div>
                }
              />
            </QueuePanel>
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default IncomingControlPage;
