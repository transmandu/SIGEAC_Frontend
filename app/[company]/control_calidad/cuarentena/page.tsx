"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import LoadingPage from "@/components/misc/LoadingPage";
import { useQuarantineLegalDays } from "@/hooks/general/useCompanySettings";
import { useGetQuarantineArticles } from "@/hooks/mantenimiento/control_calidad/useGetQuarantineArticles";
import { formatQuarantineDate, quarantineRisk } from "@/lib/warehouse/quarantine";
import type { QuarantineStatusFilter } from "@/types/quarantine";
import { PackageSearch, ShieldAlert, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { getColumns } from "./columns";
import { DataTable } from "./data-table";

const QuarantineControlPage = () => {
  const [status, setStatus] = useState<QuarantineStatusFilter>("UNRESOLVED");

  const legalDays = useQuarantineLegalDays();

  const { data: records, isLoading } = useGetQuarantineArticles(status);
  // Las métricas describen todo el ciclo, no solo lo que el filtro deja ver.
  const { data: allRecords } = useGetQuarantineArticles("ALL");

  const metrics = useMemo(() => {
    const list = allRecords ?? [];

    const open = list.filter((record) => record.status === "OPEN");
    const pending = list.filter((record) => record.status === "PENDING_REINSPECTION");

    // El más próximo a vencer entre los que siguen esperando corrección: es el
    // que puede obligar a reclamarle a compras.
    const closestToExpire = [...open]
      .map((record) => ({
        record,
        risk: quarantineRisk(record.quarantine_entry_date, legalDays, record.days_in_quarantine),
      }))
      .filter((entry) => entry.risk.remaining !== null)
      .sort((a, b) => (a.risk.remaining ?? 0) - (b.risk.remaining ?? 0))[0];

    return {
      openCount: open.length,
      pendingCount: pending.length,
      closestToExpire,
    };
  }, [allRecords, legalDays]);

  const columns = useMemo(() => getColumns(legalDays), [legalDays]);

  if (isLoading) return <LoadingPage />;

  const visibleCount = records?.length ?? 0;

  return (
    <ContentLayout title="Inventario">
      <div className="flex flex-col gap-4">
        <PageHeader />

        <div className="rounded-2xl border bg-card p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl border bg-background p-2">
                <ShieldAlert className="h-5 w-5" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold md:text-3xl">Control de Cuarentena</h1>
                </div>

                <p className="text-sm text-muted-foreground">
                  Artículos retenidos por control de calidad. La re-inspección se habilita
                  cuando Compras corrige el hallazgo y lo declara.
                </p>
              </div>
            </div>

            <div className="w-full md:w-64">
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as QuarantineStatusFilter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNRESOLVED">En el ciclo (sin resolver)</SelectItem>
                  <SelectItem value="PENDING_REINSPECTION">Listos para re-inspección</SelectItem>
                  <SelectItem value="OPEN">Esperando a compras</SelectItem>
                  <SelectItem value="RESOLVED">Resueltos</SelectItem>
                  <SelectItem value="ALL">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Esperando a compras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.openCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Retenidos, sin corrección declarada
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Listos para re-inspección
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.pendingCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Compras ya corrigió; puede re-inspeccionarse
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Más próximo a vencer revisión
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!metrics.closestToExpire ? (
                <p className="text-sm text-muted-foreground">
                  No hay artículos esperando corrección.
                </p>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <PackageSearch className="mt-0.5 h-5 w-5" />
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-semibold">
                          {metrics.closestToExpire.record.article?.part_number ?? "Sin parte"}
                        </span>
                        <span className="text-muted-foreground">
                          {" · "}
                          {metrics.closestToExpire.record.article?.batch?.name ?? "Sin descripción"}
                        </span>
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Ingreso:{" "}
                        {formatQuarantineDate(
                          metrics.closestToExpire.record.quarantine_entry_date,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">
                      {(metrics.closestToExpire.risk.remaining ?? 0) >= 0 ? (
                        <>
                          Vence en{" "}
                          <span className="font-semibold tabular-nums">
                            {metrics.closestToExpire.risk.remaining}
                          </span>{" "}
                          días
                        </>
                      ) : (
                        <>
                          Vencido por{" "}
                          <span className="font-semibold tabular-nums">
                            {Math.abs(metrics.closestToExpire.risk.remaining ?? 0)}
                          </span>{" "}
                          días
                        </>
                      )}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Artículos en el ciclo de cuarentena</CardTitle>
              <Badge variant="secondary" className="rounded-full">
                {visibleCount}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Busca por PN, descripción, lote, serial o ubicación.
            </p>
          </CardHeader>

          <CardContent>
            <DataTable columns={columns} data={records ?? []} />
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
};

export default QuarantineControlPage;
