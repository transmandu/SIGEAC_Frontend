"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransitQueue } from "@/hooks/mantenimiento/almacen/inventario/useArticleQueues";
import type { TransitArticle } from "@/types/purchase/in-transit";

import { DataTable } from "../incoming/data-table";
import { columns } from "./columns";

/**
 * Lo que viene en camino y lo que ya llegó a recepción, para que Control de
 * Calidad sepa qué va a inspeccionar y por qué algo no llega a incoming. Es de
 * consulta: las acciones (pasar a incoming, avisar, editar) son de almacén.
 */
const TransitArticlesPage = () => {
  const { data: transitArticles, isLoading: isTransitLoading } =
    useTransitQueue("TRANSIT");
  const { data: receptionArticles, isLoading: isReceptionLoading } =
    useTransitQueue("RECEPTION");

  const transit = (transitArticles as TransitArticle[] | undefined) ?? [];
  const reception = (receptionArticles as TransitArticle[] | undefined) ?? [];

  // Los retenidos son lo que más interesa a calidad: se destacan en la pestaña.
  const heldCount = reception.filter(
    (article) => (article.incoming_readiness?.reasons ?? []).length > 0,
  ).length;

  if (isTransitLoading) return <LoadingPage />;

  return (
    <ContentLayout title="Tránsito de Artículos">
      <div className="flex flex-col gap-y-3">
        <PageHeader className="mb-3" />

        <div className="text-center space-y-1">
          <h1 className="text-4xl font-bold">Tránsito de Artículos</h1>
          <p className="text-sm text-muted-foreground italic">
            Aquí puede observar los artículos en tránsito y en recepción.
            <br />
            Es una vista de consulta: abra el detalle para ver la ficha completa.
          </p>
        </div>

        <Tabs defaultValue="transit" className="w-full">
          <TabsList className="mx-auto w-full justify-center rounded-full p-5">
            <TabsTrigger value="transit" className="gap-2">
              En tránsito
              <Badge variant="secondary">{transit.length}</Badge>
            </TabsTrigger>

            <TabsTrigger value="reception" className="gap-2">
              En recepción
              <Badge variant={heldCount > 0 ? "default" : "secondary"}>
                {reception.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transit">
            <DataTable
              groupBy="order_number"
              columns={columns}
              data={transit}
            />
          </TabsContent>

          <TabsContent value="reception">
            {isReceptionLoading ? (
              <LoadingPage />
            ) : (
              <DataTable
                groupBy="order_number"
                columns={columns}
                data={reception}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default TransitArticlesPage;
