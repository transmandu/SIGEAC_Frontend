"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { ShieldAlert, PackageSearch } from "lucide-react";

import { useCompanyStore } from "@/stores/CompanyStore";
import { columns } from "./columns";
import { DataTable } from "./data-table";

import LoadingPage from "@/components/misc/LoadingPage";
import { useGetArticlesByStatus } from "@/hooks/mantenimiento/almacen/articulos/useGetArticlesByStatus";
import { useMemo } from "react";

const LEGAL_LIMIT_DAYS = 40;

const parseYMD = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

const formatDateES = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  const dt = parseYMD(dateStr);
  return dt.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const daysBetween = (from: Date, to: Date) => {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

const QuarantineControlPage = () => {
  const { selectedCompany } = useCompanyStore();

  const {
    data: quarantineArticles,
    isLoading: isQuarantineLoading,
  } = useGetArticlesByStatus("QUARANTINE");

  const { data: incomingArticles } = useGetArticlesByStatus("INCOMING");

  // ✅ Hook SIEMPRE se ejecuta (aunque quarantineArticles sea undefined)
  const closestToExpire = useMemo(() => {
    const items = quarantineArticles ?? [];
    const now = new Date();

    const scored = items
      .map((a: any) => {
        const q = a?.quarantine?.[0];
        const entryStr: string | undefined = q?.quarantine_entry_date;
        if (!entryStr) return null;

        const entry = parseYMD(entryStr);
        const expire = new Date(entry);
        expire.setDate(expire.getDate() + LEGAL_LIMIT_DAYS);

        const remaining = daysBetween(now, expire);
        return { article: a, entryStr, expire, remaining };
      })
      .filter(Boolean) as Array<{
      article: any;
      entryStr: string;
      expire: Date;
      remaining: number;
    }>;

    if (scored.length === 0) return null;

    scored.sort((x, y) => x.remaining - y.remaining);
    return scored[0];
  }, [quarantineArticles]);

  // ✅ return condicional DESPUÉS de declarar hooks
  if (isQuarantineLoading) return <LoadingPage />;

  const quarantineCount = quarantineArticles?.length ?? 0;
  const incomingCount = incomingArticles?.length ?? 0;

  return (
    <ContentLayout title="Inventario">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>General</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Control de Cuarentena</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="rounded-2xl border bg-card p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl border bg-background p-2">
                <ShieldAlert className="h-5 w-5" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold md:text-3xl">
                    Control de Cuarentena
                  </h1>
                </div>

                <p className="text-sm text-muted-foreground">
                  Artículos retenidos por control de calidad. Usa la búsqueda y
                  filtros para ubicar un ítem y revisar su estado.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total en cuarentena
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{quarantineCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Ítems actualmente retenidos
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendiente de decisión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{incomingCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                en flujo de incoming (sin decisión final).
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
              {!closestToExpire ? (
                <p className="text-sm text-muted-foreground">
                  No hay artículos con fecha de ingreso registrada.
                </p>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <PackageSearch className="h-5 w-5 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-semibold">
                          {closestToExpire.article.part_number}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {closestToExpire.article.batch?.name ?? "Sin batch"}
                        </span>
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Ingreso: {formatDateES(closestToExpire.entryStr)}
                        {" · "}
                        Vence:{" "}
                        {closestToExpire.expire.toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    {closestToExpire.remaining >= 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Vence en{" "}
                        <span className="font-semibold tabular-nums">
                          {closestToExpire.remaining}
                        </span>{" "}
                        días
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Vencido por{" "}
                        <span className="font-semibold tabular-nums">
                          {Math.abs(closestToExpire.remaining)}
                        </span>{" "}
                        días
                      </p>
                    )}
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
              <CardTitle className="text-base">Artículos en cuarentena</CardTitle>
              <Badge variant="secondary" className="rounded-full">
                {quarantineCount}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Busca por PN, descripción, lote, serial o ubicación.
            </p>
          </CardHeader>

          <CardContent>
            <DataTable columns={columns} data={quarantineArticles ?? []} />
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
};

export default QuarantineControlPage;
