"use client";

import { useMemo, useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetPurchaseRequisitions } from "@/hooks/mantenimiento/compras/useGetPurchaseRequisitions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { getColumns } from "./columns";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { DataTable } from "@/app/[company]/compras/data-table";
import RequisitionToolBar from "./_components/RequisitionToolBar";
import { PurchasesRequisitionDialog } from "@/components/dialogs/mantenimiento/compras/PurchasesRequisitionDialog";
import RequisitionSubRow from "./_components/RequisitionSubRow";
import GroupedRequisitionTable from "./_components/GroupedRequisitionTable";
import RequisitionSplitView, {
  useRequisitionPreview,
  useRequisitionPreviewSelectedId,
} from "@/components/side-panels/RequisitionSplitView";
import { CursorPagination } from "@/components/tables/CursorPagination";
import { PageHeader } from "@/components/layout/PageHeader";

const RequisitionsPage = () => {
  return (
    <RequisitionSplitView>
      <RequisitionsPageContent />
    </RequisitionSplitView>
  );
};

const RequisitionsPageContent = () => {
  const { selectedCompany } = useCompanyStore();
  const timeZone = useCompanyTimezone();
  const onPreview = useRequisitionPreview();
  const selectedPreviewId = useRequisitionPreviewSelectedId();

  /**
   * Búsqueda, filtros y paginación corren en el servidor: con paginación por
   * cursor el cliente solo tiene la página actual, así que filtrar en memoria
   * —como se hacía antes— mostraría resultados de esa página y no del conjunto.
   */
  const {
    data: requisitions,
    total,
    isLoading,
    isError,
    isTransitioning,
    search,
    setSearch,
    filters,
    setFilter,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    pageIndex,
    pageSize,
    setPageSize,
  } = useGetPurchaseRequisitions("AERONAUTICAL");

  // La agrupación sí es de presentación: reordena las filas que ya están en
  // pantalla, no consulta otras.
  const [groupBy, setGroupBy] = useState("NONE");

  const rows = useMemo(() => requisitions ?? [], [requisitions]);

  // Memoizadas: antes se reconstruian en cada render, y dos veces por
  // pantalla (la vista agrupada y la plana llamaban a getColumns aparte).
  const columns = useMemo(
    () =>
      getColumns(
        selectedCompany ?? undefined,
        onPreview ?? undefined,
        selectedPreviewId,
        timeZone,
      ),
    [selectedCompany, onPreview, selectedPreviewId, timeZone],
  );

  const cursorPagination = useMemo(
    () => ({
      onNextPage: nextPage,
      onPrevPage: prevPage,
      hasNextPage,
      hasPrevPage,
      pageIndex,
      pageSize,
      onPageSizeChange: setPageSize,
      isTransitioning,
    }),
    [
      nextPage,
      prevPage,
      hasNextPage,
      hasPrevPage,
      pageIndex,
      pageSize,
      setPageSize,
      isTransitioning,
    ],
  );

  return (
    <ContentLayout title="Solicitudes de Compra">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                Solicitudes de Compra
              </h1>

              <p className="text-sm text-muted-foreground">
                Visualiza y gestiona las requisiciones registradas dentro del
                sistema de compras y abastecimiento.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl border bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
          <RequisitionToolBar
            search={search}
            setSearch={setSearch}
            status={filters.status}
            setStatus={(value) => setFilter("status", value)}
            priority={filters.priority}
            setPriority={(value) => setFilter("priority", value)}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
          />

          {/* El total es el del conjunto filtrado, no el de la página: lo
              cuenta el servidor y viaja junto a las filas. */}
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {total} {total === 1 ? "requisición" : "requisiciones"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <PurchasesRequisitionDialog />
        </div>

        {groupBy === "requested_by" ? (
          <>
            <GroupedRequisitionTable
              data={rows}
              renderTable={(groupedRows) => (
                <DataTable
                  columns={columns}
                  data={groupedRows}
                  renderSubRow={(row) => (
                    <RequisitionSubRow
                      requisition={row.original}
                      selectedCompany={selectedCompany}
                    />
                  )}
                  canExpandRow={(row) => !!row.original.quotes?.length}
                  loading={isLoading}
                  overflowVisible
                  // Agrupar parte en bloques la página ya recibida: cada bloque
                  // es una tabla, así que el paginador va una sola vez fuera y
                  // no uno por grupo.
                  disablePagination
                />
              )}
            />

            <CursorPagination {...cursorPagination} />
          </>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            renderSubRow={(row) => (
              <RequisitionSubRow
                requisition={row.original}
                selectedCompany={selectedCompany}
              />
            )}
            canExpandRow={(row) => !!row.original.quotes?.length}
            loading={isLoading}
            cursorPagination={cursorPagination}
          />
        )}

        {isError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-500">
              Ha ocurrido un error al cargar las solicitudes de compra.
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default RequisitionsPage;
