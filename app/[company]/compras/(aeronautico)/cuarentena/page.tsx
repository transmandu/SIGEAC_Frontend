"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import CopyPartNumberButton from "@/components/misc/CopyPartNumberButton";
import { useQuarantineLegalDays } from "@/hooks/general/useCompanySettings";
import { useGetQuarantineArticles } from "@/hooks/mantenimiento/control_calidad/useGetQuarantineArticles";
import { cn } from "@/lib/utils";
import { quarantineRisk } from "@/lib/warehouse/quarantine";
import type { QuarantineStatusFilter } from "@/types/quarantine";
import {
  AlertTriangle,
  PackageSearch,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { DataTable } from "@/app/[company]/compras/data-table";
import { getColumns } from "./columns";
import { QuarantineCycleHistory } from "./_components/QuarantineCycleHistory";
import QuarantineToolBar from "./_components/QuarantineToolBar";
import {
  PurchasesHeading,
  PurchasesToolbar,
} from "@/app/[company]/compras/_components/PurchasesPageParts";

function SummaryItem({
  icon: Icon,
  value,
  label,
  tone = "default",
  className,
}: {
  icon: typeof ShieldAlert;
  value: number;
  label: string;
  tone?: "default" | "danger" | "muted";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        tone === "danger"
          ? "text-red-600 dark:text-red-400"
          : "text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span
        className={
          tone === "danger"
            ? "font-semibold tabular-nums"
            : "font-semibold tabular-nums text-foreground"
        }
      >
        {value}
      </span>
      <span>{label}</span>
    </div>
  );
}

const QuarantinePurchasesPage = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<QuarantineStatusFilter>("UNRESOLVED");

  const deferredSearch = useDeferredValue(search);
  const legalDays = useQuarantineLegalDays();

  const {
    data: records,
    isLoading,
    isError,
  } = useGetQuarantineArticles(status);
  // Las métricas deben contar todo el ciclo, no solo lo que el filtro muestra.
  const { data: allRecords } = useGetQuarantineArticles("ALL");

  const filteredRecords = useMemo(() => {
    const list = records ?? [];

    if (!deferredSearch.trim()) return list;

    const q = deferredSearch.toLowerCase();

    return list.filter((record) => {
      const article = record.article;

      return (
        article?.part_number?.toLowerCase().includes(q) ||
        article?.serial?.toLowerCase().includes(q) ||
        article?.batch?.name?.toLowerCase().includes(q) ||
        record.reason?.toLowerCase().includes(q)
      );
    });
  }, [records, deferredSearch]);

  const metrics = useMemo(() => {
    const list = allRecords ?? [];

    const open = list.filter((record) => record.status === "OPEN");
    const pending = list.filter(
      (record) => record.status === "PENDING_REINSPECTION",
    );
    const overdue = open.filter((record) => record.is_overdue);

    // El más urgente entre los que esperan corrección: es lo que compras debe
    // atender primero, y con qué margen.
    const mostUrgent = [...open]
      .map((record) => ({
        record,
        risk: quarantineRisk(
          record.quarantine_entry_date,
          legalDays,
          record.days_in_quarantine,
        ),
      }))
      .filter((entry) => entry.risk.remaining !== null)
      .sort((a, b) => (a.risk.remaining ?? 0) - (b.risk.remaining ?? 0))[0];

    return {
      openCount: open.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
      mostUrgent,
    };
  }, [allRecords, legalDays]);

  const columns = useMemo(() => getColumns(legalDays), [legalDays]);

  return (
    <ContentLayout title="Cuarentena">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <PurchasesHeading
          heading="Cuarentena"
          description="Artículos retenidos por Control de Calidad que requieren corrección de Compras. Corrija el artículo o su documentación y envíelo a re-inspección."
        />

        {/* RESUMEN: una franja y no tarjetas, el dato pesa menos que la tabla */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm sm:flex sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2 dark:border-slate-700/60 dark:bg-slate-900/60">
          <SummaryItem
            icon={ShieldAlert}
            value={metrics.openCount}
            label="por corregir"
          />

          <SummaryItem
            icon={ShieldCheck}
            value={metrics.pendingCount}
            label="en re-inspección"
          />

          <SummaryItem
            icon={AlertTriangle}
            value={metrics.overdueCount}
            label={`con plazo vencido (más de ${legalDays} días)`}
            tone={metrics.overdueCount > 0 ? "danger" : "muted"}
            className="max-sm:col-span-2"
          />

          {metrics.mostUrgent && (
            <div className="flex min-w-0 flex-col gap-0.5 border-t border-slate-200/70 pt-2.5 text-muted-foreground max-sm:col-span-2 sm:ml-auto sm:flex-row sm:items-center sm:gap-1.5 sm:border-t-0 sm:pt-0 dark:border-slate-700/50">
              <span className="flex shrink-0 items-center gap-1.5">
                <PackageSearch className="size-3.5 shrink-0" />
                Más urgente:
              </span>
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="min-w-0 font-medium text-foreground wrap-anywhere sm:truncate">
                  {metrics.mostUrgent.record.article?.part_number ??
                    "Sin parte"}
                </span>
                <CopyPartNumberButton
                  value={metrics.mostUrgent.record.article?.part_number}
                />
              </span>
              <span
                className={cn(
                  "shrink-0",
                  (metrics.mostUrgent.risk.remaining ?? 0) < 0 &&
                    "text-red-600 dark:text-red-400",
                )}
              >
                {(metrics.mostUrgent.risk.remaining ?? 0) >= 0
                  ? `vence en ${metrics.mostUrgent.risk.remaining} ${metrics.mostUrgent.risk.remaining === 1 ? "día" : "días"}`
                  : `vencido hace ${Math.abs(metrics.mostUrgent.risk.remaining ?? 0)} días`}
              </span>
            </div>
          )}
        </div>

        {/* TOOLBAR */}
        <PurchasesToolbar>
          <QuarantineToolBar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
          />
        </PurchasesToolbar>

        <DataTable
          columns={columns}
          data={filteredRecords}
          loading={isLoading}
          error={isError}
          loadingText="Cargando artículos en cuarentena..."
          emptyText="No hay artículos en cuarentena para este filtro."
          persistKey="compras-cuarentena"
          // El historial se consulta aquí y no en el diálogo: ahí es contexto que
          // compite con la corrección, que es a lo que se entra.
          canExpandRow={(row) => (row.original.cycles?.length ?? 0) > 0}
          renderSubRow={(row) => (
            <div className="px-4 py-3">
              <QuarantineCycleHistory cycles={row.original.cycles ?? []} />
            </div>
          )}
        />
      </div>
    </ContentLayout>
  );
};

export default QuarantinePurchasesPage;
