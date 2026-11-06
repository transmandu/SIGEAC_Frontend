"use client";

import { useMemo, useState, useDeferredValue } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetQuotes } from "@/hooks/mantenimiento/compras/useGetQuotes";
import { useCompanyStore } from "@/stores/CompanyStore";
import { getColumns } from "./columns";
import { DataTable } from "@/app/[company]/compras/data-table";
import QuotesToolBar from "./_components/QuotesToolBar";
import { QuoteDraftsDialog } from "@/components/dialogs/mantenimiento/compras/QuoteDraftsDialog";
import { QuoteDraftEditorProvider } from "@/components/dialogs/mantenimiento/compras/QuoteDraftEditorProvider";
import GroupedQuotesTable from "./_components/GroupedQuotesTable";
import { isAeronauticalQuoteScope } from "@/lib/purchases/quote-scope";
import QuoteSplitView, {
  useQuotePreview,
  useQuotePreviewSync,
  useQuotePreviewSelectedId,
  useQuoteRowMark,
} from "@/components/side-panels/QuoteSplitView";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import {
  PurchasesHeading,
  PurchasesToolbar,
} from "@/app/[company]/compras/_components/PurchasesPageParts";

const QuotesOrdersPage = () => {
  return (
    <QuoteSplitView>
      {/* Provee el editor que abre el diálogo de borradores. */}
      <QuoteDraftEditorProvider>
        <QuotesOrdersPageContent />
      </QuoteDraftEditorProvider>
    </QuoteSplitView>
  );
};

const QuotesOrdersPageContent = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const timeZone = useCompanyTimezone();
  const onPreview = useQuotePreview();
  const selectedPreviewId = useQuotePreviewSelectedId();
  const rowMark = useQuoteRowMark();

  const {
    data: quotes,
    isLoading,
    isError,
  } = useGetQuotes(selectedCompany?.slug ?? null, selectedStation ?? null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [groupBy, setGroupBy] = useState<string>("NONE");

  const deferredSearch = useDeferredValue(search);

  const filteredQuotes = useMemo(() => {
    if (!quotes) return [];

    // Compras generales no se gestiona en este módulo: las cotizaciones
    // GENERAL no aplican aquí.
    let filtered = quotes.filter((quote: any) =>
      isAeronauticalQuoteScope(quote),
    );

    if (status !== "ALL") {
      filtered = filtered.filter((quote: any) => quote.status === status);
    }

    if (!deferredSearch.trim()) {
      return filtered;
    }

    const q = deferredSearch.toLowerCase();

    return filtered.filter((quote: any) => {
      return (
        quote.quote_number?.toLowerCase?.().includes(q) ||
        quote.requisition_order?.order_number?.toLowerCase?.().includes(q) ||
        quote.created_by?.username?.toLowerCase?.().includes(q) ||
        quote.quote_date?.toLowerCase?.().includes(q) ||
        quote.vendor?.name?.toLowerCase?.().includes(q) ||
        quote.requisition_order?.justification?.toLowerCase?.().includes(q)
      );
    });
  }, [quotes, deferredSearch, status]);

  // El panel lateral sigue a la tabla: si el documento cambia, el panel también.
  useQuotePreviewSync(filteredQuotes);

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

  return (
    <ContentLayout title="Cotizaciones de Compra">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <PurchasesHeading
          heading="Cotizaciones de Compra"
          description="Visualice y gestione las cotizaciones generadas dentro del sistema de compras."
        />

        <PurchasesToolbar>
          <QuotesToolBar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
          />

          <div className="flex shrink-0 items-center gap-3">
            {/* Un borrador no es una cotización y no sale en la tabla: esta es
                la puerta para retomarlo. */}
            <QuoteDraftsDialog />

            <span className="text-xs text-muted-foreground tabular-nums">
              {filteredQuotes.length}{" "}
              {filteredQuotes.length === 1 ? "cotización" : "cotizaciones"}
            </span>
          </div>
        </PurchasesToolbar>

        {groupBy !== "NONE" ? (
          <GroupedQuotesTable
            isLoading={isLoading}
            isError={isError}
            data={filteredQuotes}
            groupBy={groupBy as any}
            renderTable={(rows) => (
              <DataTable
                error={isError}
                columns={columns}
                getRowMark={rowMark}
                data={rows}
                loading={isLoading}
                persistKey="cotizaciones"
              />
            )}
          />
        ) : (
          <DataTable
            error={isError}
            columns={columns}
            getRowMark={rowMark}
            data={filteredQuotes}
            loading={isLoading}
            persistKey="cotizaciones"
          />
        )}
      </div>
    </ContentLayout>
  );
};

export default QuotesOrdersPage;
