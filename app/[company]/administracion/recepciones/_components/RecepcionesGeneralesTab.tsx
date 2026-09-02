"use client";

import { DownloadReportDialog } from "@/app/[company]/general/recepcion_articulos/_components/DownloadReportDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetGeneralArticleIntakes } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticleIntakes";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant, instantToCalendarDay } from "@/lib/date";
import { cn, formatQuantity } from "@/lib/utils";
import {
  intakeStatusLabelEs,
  intakeStatusLabelEsUpper,
} from "@/lib/warehouse/statuses";
import type { GeneralArticleIntake } from "@/types/purchase";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ListRestart, Loader2, PackageSearch, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ColumnFilter, type SortDirection } from "./ColumnFilter";
import { formatPeriodRange, PeriodFilter, type Period } from "./PeriodFilter";
import { ReceptionStats } from "./ReceptionStats";
import { PAGE_SIZES, TablePagination } from "@/components/misc/TablePagination";

const toApiDate = (date?: Date) =>
  date ? format(date, "yyyy-MM-dd") : undefined;

/** Las compras generales se hacen a un comercio (retailer), no a un vendor. */
const retailerOf = (intake: GeneralArticleIntake) => intake.retailer?.name ?? null;

export const RecepcionesGeneralesTab = () => {
  const timeZone = useCompanyTimezone();
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<Period>({ label: "Todo el histórico" });
  const [retailerFilter, setRetailerFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [descriptionFilter, setDescriptionFilter] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<{
    key: "description" | "retailer" | "status";
    direction: SortDirection;
  } | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  const {
    data: intakes,
    isLoading,
    isFetching,
    isError,
  } = useGetGeneralArticleIntakes(undefined, {
    from: toApiDate(period.from),
    to: toApiDate(period.to),
  });

  const rows = useMemo(() => intakes ?? [], [intakes]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter((intake) => {
      const matchesSearch =
        !term ||
        [intake.description, intake.brand_model, retailerOf(intake)].some(
          (field) => field?.toLowerCase().includes(term),
        );

      const retailer = retailerOf(intake);
      const matchesRetailer =
        retailerFilter.length === 0 ||
        (retailer && retailerFilter.includes(retailer));

      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(intake.status);

      const matchesDescription =
        descriptionFilter.length === 0 ||
        (intake.description && descriptionFilter.includes(intake.description));

      return (
        matchesSearch && matchesRetailer && matchesStatus && matchesDescription
      );
    });
  }, [rows, search, retailerFilter, statusFilter, descriptionFilter]);

  const sorted = useMemo(() => {
    if (!sortColumn?.direction) return filtered;

    const factor = sortColumn.direction === "asc" ? 1 : -1;
    const valueOf = (intake: GeneralArticleIntake) =>
      sortColumn.key === "retailer"
        ? (retailerOf(intake) ?? "")
        : sortColumn.key === "status"
          ? intakeStatusLabelEs(intake.status)
          : (intake.description ?? "");

    return [...filtered].sort(
      (a, b) => factor * valueOf(a).localeCompare(valueOf(b), "es", { numeric: true }),
    );
  }, [filtered, sortColumn]);

  const sortFor = (key: "description" | "retailer" | "status") =>
    sortColumn?.key === key ? sortColumn.direction : null;

  const changeSort = (
    key: "description" | "retailer" | "status",
    direction: SortDirection,
  ) => setSortColumn(direction ? { key, direction } : null);

  // Filtrar u ordenar cambia qué fila cae en cada página: volver al inicio.
  useEffect(() => {
    setPage(0);
  }, [search, retailerFilter, statusFilter, descriptionFilter, sortColumn, period]);

  const paginated = useMemo(
    () => sorted.slice(page * pageSize, page * pageSize + pageSize),
    [sorted, page, pageSize],
  );

  const statistics = useMemo(() => {
    const byMonth: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byArticle: Record<string, number> = {};
    const byRetailer: Record<string, number> = {};

    for (const intake of rows) {
      if (intake.arrived_at) {
        // Se agrupa por el mes de la compañía, no el del navegador.
        const key = instantToCalendarDay(intake.arrived_at, timeZone)?.slice(0, 7);
        if (key) {
          byMonth[key] = (byMonth[key] ?? 0) + 1;
        }
      }

      byStatus[intake.status] = (byStatus[intake.status] ?? 0) + 1;

      const label = intake.description ?? "N/A";
      byArticle[label] = (byArticle[label] ?? 0) + 1;

      const retailer = retailerOf(intake);
      if (retailer) {
        byRetailer[retailer] = (byRetailer[retailer] ?? 0) + 1;
      }
    }

    const topOf = (source: Record<string, number>) =>
      Object.fromEntries(
        Object.entries(source)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3),
      );

    return {
      total: rows.length,
      byMonth: Object.fromEntries(Object.entries(byMonth).sort()),
      byStatus,
      topArticles: topOf(byArticle),
      topRetailers: topOf(byRetailer),
    };
  }, [rows, timeZone]);

  const hasPeriod = !!period.from || !!period.to;
  const hasFilters =
    !!search ||
    retailerFilter.length > 0 ||
    statusFilter.length > 0 ||
    descriptionFilter.length > 0 ||
    hasPeriod ||
    !!sortColumn;

  const resetFilters = () => {
    setSearch("");
    setRetailerFilter([]);
    setStatusFilter([]);
    setDescriptionFilter([]);
    setSortColumn(null);
    setPeriod({ label: "Todo el histórico" });
  };

  if (isLoading) {
    return (
      <div className="grid place-content-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-24 text-center text-sm italic text-muted-foreground">
        Ha ocurrido un error al cargar las entradas...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ReceptionStats
        total={statistics.total}
        byMonth={statistics.byMonth}
        topArticles={statistics.topArticles}
        topSuppliers={statistics.topRetailers}
        supplierLabel="Comercios"
        byStatus={statistics.byStatus}
        periodLabel={formatPeriodRange(period)}
      />

      <div className="flex flex-wrap items-center gap-2">
        <PeriodFilter value={period} onChange={setPeriod} />

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por artículo, marca o comercio..."
            className="h-9 pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-xs"
            onClick={resetFilters}
          >
            <ListRestart className="size-3.5" />
            Reiniciar
          </Button>
        )}

        <div className="ml-auto flex items-center gap-3">
          {isFetching && (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          )}
          <span className="text-xs tabular-nums text-muted-foreground">
            {sorted.length} de {rows.length}
          </span>
          <DownloadReportDialog
            endpoint="{location_id}/general-article-intakes-pdf"
            requiresLocation
            title="Descargar historial de entradas"
            description="Genere el reporte de artículos generales recibidos en el rango de fechas."
            dateRangeLabel="Fecha de llegada"
            fileNamePrefix="entradas_generales"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <ColumnFilter
                  title="Artículo"
                  options={rows
                    .map((intake) => intake.description)
                    .filter((value): value is string => !!value)}
                  selected={descriptionFilter}
                  onChange={setDescriptionFilter}
                  sort={sortFor("description")}
                  onSortChange={(direction) =>
                    changeSort("description", direction)
                  }
                  align="start"
                />
              </TableHead>
              <TableHead className="text-center">Cantidad</TableHead>
              <TableHead className="text-center">Llegada</TableHead>
              <TableHead className="text-center">Orden</TableHead>
              <TableHead className="text-center">
                <ColumnFilter
                  title="Comercio"
                  options={rows
                    .map(retailerOf)
                    .filter((name): name is string => !!name)}
                  selected={retailerFilter}
                  onChange={setRetailerFilter}
                  sort={sortFor("retailer")}
                  onSortChange={(direction) => changeSort("retailer", direction)}
                />
              </TableHead>
              <TableHead className="text-center">
                <ColumnFilter
                  title="Estado"
                  options={rows.map((intake) => intake.status)}
                  selected={statusFilter}
                  onChange={setStatusFilter}
                  formatOption={intakeStatusLabelEs}
                  sort={sortFor("status")}
                  onSortChange={(direction) => changeSort("status", direction)}
                  align="end"
                />
              </TableHead>
              <TableHead className="text-center">Registrado por</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="grid size-12 place-content-center rounded-full bg-muted">
                      <PackageSearch className="size-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        {hasFilters
                          ? "Sin coincidencias"
                          : "Aún no hay entradas"}
                      </p>
                      <p className="text-xs">
                        {hasFilters
                          ? "Pruebe con otros filtros o amplíe el período."
                          : "Los artículos generales recibidos aparecerán aquí."}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((intake) => (
                <TableRow key={intake.id}>
                  <TableCell className="font-medium">
                    {intake.description ?? "N/A"}
                    {intake.brand_model && (
                      <span className="block text-xs font-normal text-muted-foreground">
                        {intake.brand_model}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {formatQuantity(intake.quantity)}{" "}
                    <span className="text-xs text-muted-foreground">
                      {intake.unit?.label ?? ""}
                    </span>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {formatInstant(intake.arrived_at, timeZone, "date", "—")}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    {intake.purchase_order?.order_number ?? "—"}
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    {retailerOf(intake) ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        intake.status === "CONFIRMED" &&
                          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400",
                        intake.status === "REJECTED" &&
                          "border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-400",
                      )}
                    >
                      {intakeStatusLabelEsUpper(intake.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs uppercase text-muted-foreground">
                    {intake.registered_by ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {sorted.length > 0 && (
          <TablePagination
            page={page}
            pageSize={pageSize}
            totalRows={sorted.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
          />
        )}
      </div>
    </div>
  );
};
