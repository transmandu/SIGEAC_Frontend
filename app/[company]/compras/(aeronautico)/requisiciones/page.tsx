"use client";

import { useMemo, useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetPurchaseRequisitions } from "@/hooks/mantenimiento/compras/useGetPurchaseRequisitions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { QuoteDraftEditorProvider } from "@/components/dialogs/mantenimiento/compras/QuoteDraftEditorProvider";
import { getColumns } from "./columns";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { DataTable } from "@/app/[company]/compras/data-table";
import RequisitionToolBar from "./_components/RequisitionToolBar";
import { PurchasesRequisitionDialog } from "@/components/dialogs/mantenimiento/compras/PurchasesRequisitionDialog";
import RequisitionSubRow from "./_components/RequisitionSubRow";
import GroupedRequisitionTable from "./_components/GroupedRequisitionTable";
import RequisitionSplitView, {
  useRequisitionPreview,
  useRequisitionPreviewSync,
  useRequisitionPreviewSelectedId,
  useRequisitionRowMark,
} from "@/components/side-panels/RequisitionSplitView";
import { CursorPagination } from "@/components/tables/CursorPagination";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  PurchasesHeading,
  PurchasesToolbar,
} from "@/app/[company]/compras/_components/PurchasesPageParts";

const RequisitionsPage = () => {
  return (
    // El proveedor envuelve al panel lateral: sus acciones también abren el
    // editor de borradores.
    <QuoteDraftEditorProvider>
      <RequisitionSplitView>
        <RequisitionsPageContent />
      </RequisitionSplitView>
    </QuoteDraftEditorProvider>
  );
};

const RequisitionsPageContent = () => {
  const { selectedCompany } = useCompanyStore();
  const timeZone = useCompanyTimezone();
  const onPreview = useRequisitionPreview();
  const selectedPreviewId = useRequisitionPreviewSelectedId();
  const rowMark = useRequisitionRowMark();

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
  // El panel lateral sigue a la tabla: si el documento cambia, el panel también.
  useRequisitionPreviewSync(rows);

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

        <PurchasesHeading
          heading="Solicitudes de Compra"
          description="Visualice y gestione las requisiciones registradas dentro del sistema de compras y abastecimiento."
        />

        <PurchasesToolbar>
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
        </PurchasesToolbar>

        <div className="flex items-center gap-2">
          <PurchasesRequisitionDialog />
        </div>

        {groupBy === "requested_by" ? (
          <>
            <GroupedRequisitionTable
              isLoading={isLoading}
              isError={isError}
              data={rows}
              renderTable={(groupedRows) => (
                <DataTable
                  error={isError}
                  columns={columns}
                  data={groupedRows}
                  renderSubRow={(row) => (
                    <RequisitionSubRow
                      requisition={row.original}
                      selectedCompany={selectedCompany}
                    />
                  )}
                  canExpandRow={(row) => !!row.original.quotes?.length}
                  getRowMark={rowMark}
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
            error={isError}
            columns={columns}
            data={rows}
            renderSubRow={(row) => (
              <RequisitionSubRow
                requisition={row.original}
                selectedCompany={selectedCompany}
              />
            )}
            canExpandRow={(row) => !!row.original.quotes?.length}
            getRowMark={rowMark}
            loading={isLoading}
            cursorPagination={cursorPagination}
          />
        )}
      </div>
    </ContentLayout>
  );
};

export default RequisitionsPage;
