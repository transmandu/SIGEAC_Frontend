"use client";

import { useMemo, useState, useDeferredValue } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetPurchaseOrders } from "@/hooks/mantenimiento/compras/useGetPurchaseOrders";
import type { PurchaseOrder } from "@/types/purchase";
import { isGeneralPurchaseOrder } from "@/lib/purchases/purchase-order-scope";
import { DataTable } from "@/app/[company]/compras/data-table";
import { getColumns } from "./columns";
import PurchaseOrderToolBar from "./_components/PurchaseOrderToolBar";
import GroupedPurchaseOrderTable from "./_components/GroupedPurchaseOrderTable";
import PurchaseOrderSplitView, {
  usePurchaseOrderPreview,
  usePurchaseOrderPreviewSync,
  usePurchaseOrderPreviewSelectedId,
  usePurchaseOrderRowMark,
} from "@/components/side-panels/PurchaseOrderSplitView";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  PurchasesHeading,
  PurchasesToolbar,
} from "@/app/[company]/compras/_components/PurchasesPageParts";

const PurchaseOrdersPage = () => {
  return (
    <PurchaseOrderSplitView>
      <PurchaseOrdersPageContent />
    </PurchaseOrderSplitView>
  );
};

const PurchaseOrdersPageContent = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const onPreview = usePurchaseOrderPreview();
  const selectedPreviewId = usePurchaseOrderPreviewSelectedId();
  const rowMark = usePurchaseOrderRowMark();

  const {
    data: po,
    isLoading,
    isError,
  } = useGetPurchaseOrders(selectedCompany?.slug ?? "", selectedStation ?? "");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [groupBy, setGroupBy] = useState("NONE");

  const deferredSearch = useDeferredValue(search);

  const filteredPO = useMemo(() => {
    if (!po) return [];

    const q = deferredSearch.toLowerCase();

    return po.filter((item: PurchaseOrder) => {
      // Compras aeronáuticas no se gestionan en este módulo: las órdenes con
      // sufijo -A no aplican aquí.
      const isGeneralScope = isGeneralPurchaseOrder(item);

      const matchesStatus = status === "ALL" || item.status === status;

      const matchesSearch =
        !q ||
        item.order_number?.toLowerCase?.().includes(q) ||
        item.vendor?.name?.toLowerCase?.().includes(q);

      return isGeneralScope && matchesStatus && matchesSearch;
    });
  }, [po, deferredSearch, status]);

  // El panel lateral sigue a la tabla: si el documento cambia, el panel también.
  usePurchaseOrderPreviewSync(filteredPO);

  const columns = useMemo(
    () =>
      getColumns(
        selectedCompany ?? undefined,
        onPreview ?? undefined,
        selectedPreviewId,
      ),
    [selectedCompany, onPreview, selectedPreviewId],
  );

  return (
    <ContentLayout title="Órdenes de Compra Generales">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <PurchasesHeading
          heading="Órdenes de Compra Generales"
          description="Gestione y visualice las órdenes de compra generales generadas en el sistema de compras."
        />

        <PurchasesToolbar>
          <PurchaseOrderToolBar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
          />

          <span className="text-xs text-muted-foreground tabular-nums">
            {filteredPO.length} {filteredPO.length === 1 ? "orden" : "órdenes"}
          </span>
        </PurchasesToolbar>

        {groupBy === "quote" || groupBy === "retailer" ? (
          <GroupedPurchaseOrderTable
            isLoading={isLoading}
            isError={isError}
            data={filteredPO}
            groupBy={groupBy}
            renderTable={(rows) => (
              <DataTable
                error={isError}
                columns={columns}
                getRowMark={rowMark}
                data={rows}
                loading={isLoading}
                emptyText="No se encontraron resultados"
                overflowVisible
                persistKey="ordenes_compra_generales"
              />
            )}
          />
        ) : (
          <DataTable
            error={isError}
            columns={columns}
            getRowMark={rowMark}
            data={filteredPO}
            loading={isLoading}
            emptyText="No se encontraron resultados"
            persistKey="ordenes_compra_generales"
          />
        )}

        {/* ERROR */}
      </div>
    </ContentLayout>
  );
};

export default PurchaseOrdersPage;
