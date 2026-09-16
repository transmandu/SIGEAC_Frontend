"use client";

import { buildColumns } from "@/app/[company]/almacen/solicitudes/salida_taller/columns";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { WorkshopDispatchTimelineDialog } from "@/components/dialogs/mantenimiento/almacen/WorkshopDispatchTimelineDialog";
import { useGetWorkshopDispatches } from "@/hooks/mantenimiento/almacen/salida_taller/useGetWorkshopDispatches";
import { useMemo, useState } from "react";
import { DataTable } from "./data-table";

const WorkshopDispatchPage = () => {
  const {
    data: dispatches,
    isLoading,
    isFetching,
    isError,
    refetch,
    search,
    setSearch,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    pageIndex,
    pageSize,
    setPageSize,
  } = useGetWorkshopDispatches();
  const [timelineId, setTimelineId] = useState<number | null>(null);

  const columns = useMemo(() => buildColumns((id) => setTimelineId(id)), []);

  return (
    <ContentLayout title="Salida a Taller">
      <div className="flex flex-col gap-y-2">
        <PageHeader className="mb-4" />
        {/* La tabla se monta siempre: la carga de datos se muestra dentro del
            cuerpo, para que el buscador y las acciones no se desmonten en cada
            fetch. */}
        <DataTable
          columns={columns}
          data={dispatches ?? []}
          search={search}
          onSearchChange={setSearch}
          isFetching={isFetching}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </div>

      {timelineId !== null && (
        <WorkshopDispatchTimelineDialog
          dispatchId={timelineId}
          open={timelineId !== null}
          onOpenChange={(open) => {
            if (!open) setTimelineId(null);
          }}
        />
      )}
    </ContentLayout>
  );
};

export default WorkshopDispatchPage;
