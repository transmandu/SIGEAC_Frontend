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
import { useGetReceptionHistory } from "@/hooks/mantenimiento/almacen/articulos/useGetReceptionHistory";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ListRestart, Loader2, PackageSearch, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ColumnFilter, type SortDirection } from "./ColumnFilter";
import { formatPeriodRange, PeriodFilter, type Period } from "./PeriodFilter";
import { ReceptionStats } from "./ReceptionStats";

const toApiDate = (date?: Date) =>
  date ? format(date, "yyyy-MM-dd") : undefined;

export const RecepcionesAeronauticasTab = () => {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<Period>({ label: "Todo el histórico" });
  const [vendorFilter, setVendorFilter] = useState<string[]>([]);
  const [partFilter, setPartFilter] = useState<string[]>([]);
  const [descriptionFilter, setDescriptionFilter] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<{
    key: "part_number" | "description" | "vendor";
    direction: SortDirection;
  } | null>(null);

  const { data, isLoading, isFetching, isError } = useGetReceptionHistory({
    from: toApiDate(period.from),
    to: toApiDate(period.to),
  });

  const articles = useMemo(() => data?.articles ?? [], [data?.articles]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesSearch =
        !term ||
        [
          article.part_number,
          article.description,
          article.vendor,
          article.order_number,
        ].some((field) => field?.toLowerCase().includes(term));

      const matchesVendor =
        vendorFilter.length === 0 ||
        (article.vendor && vendorFilter.includes(article.vendor));

      const matchesPart =
        partFilter.length === 0 ||
        (article.part_number && partFilter.includes(article.part_number));

      const matchesDescription =
        descriptionFilter.length === 0 ||
        (article.description && descriptionFilter.includes(article.description));

      return matchesSearch && matchesVendor && matchesPart && matchesDescription;
    });
  }, [articles, search, vendorFilter, partFilter, descriptionFilter]);

  const sorted = useMemo(() => {
    if (!sortColumn?.direction) return filtered;

    const factor = sortColumn.direction === "asc" ? 1 : -1;

    return [...filtered].sort(
      (a, b) =>
        factor *
        (a[sortColumn.key] ?? "").localeCompare(
          b[sortColumn.key] ?? "",
          "es",
          { numeric: true },
        ),
    );
  }, [filtered, sortColumn]);

  const breakdown = useMemo(() => {
    const distinct = (values: (string | null)[]) =>
      new Set(values.filter(Boolean)).size;

    return [
      {
        label: "Órdenes de compra",
        value: distinct(articles.map((article) => article.order_number)),
      },
      {
        label: "Proveedores",
        value: distinct(articles.map((article) => article.vendor)),
      },
      {
        label: "Artículos distintos",
        value: distinct(articles.map((article) => article.description)),
      },
    ];
  }, [articles]);

  const sortFor = (key: "part_number" | "description" | "vendor") =>
    sortColumn?.key === key ? sortColumn.direction : null;

  const changeSort = (
    key: "part_number" | "description" | "vendor",
    direction: SortDirection,
  ) => setSortColumn(direction ? { key, direction } : null);

  const hasPeriod = !!period.from || !!period.to;
  const hasFilters =
    !!search ||
    vendorFilter.length > 0 ||
    partFilter.length > 0 ||
    descriptionFilter.length > 0 ||
    hasPeriod ||
    !!sortColumn;

  const resetFilters = () => {
    setSearch("");
    setVendorFilter([]);
    setPartFilter([]);
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
        Ha ocurrido un error al cargar el historial...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ReceptionStats
        total={data?.statistics.total ?? 0}
        byMonth={data?.statistics.by_month ?? {}}
        topArticles={data?.statistics.top_articles ?? {}}
        topSuppliers={data?.statistics.top_vendors ?? {}}
        supplierLabel="Proveedores"
        periodLabel={formatPeriodRange(period)}
        breakdown={breakdown}
      />

      <div className="flex flex-wrap items-center gap-2">
        <PeriodFilter value={period} onChange={setPeriod} />

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por parte, descripción u orden..."
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
            {sorted.length} de {articles.length}
          </span>
          <DownloadReportDialog
            endpoint="articles-reception-pdf"
            title="Descargar historial de recepciones"
            description="Genere el reporte de artículos aeronáuticos recibidos en el rango de fechas."
            dateRangeLabel="Fecha de recepción"
            fileNamePrefix="articulos_en_recepcion"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-center">
                <ColumnFilter
                  title="Nro. de Parte"
                  options={articles
                    .map((article) => article.part_number)
                    .filter((value): value is string => !!value)}
                  selected={partFilter}
                  onChange={setPartFilter}
                  sort={sortFor("part_number")}
                  onSortChange={(direction) =>
                    changeSort("part_number", direction)
                  }
                  align="start"
                />
              </TableHead>
              <TableHead>
                <ColumnFilter
                  title="Descripción"
                  options={articles
                    .map((article) => article.description)
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
              <TableHead className="text-center">Recepción</TableHead>
              <TableHead className="text-center">Orden</TableHead>
              <TableHead className="text-center">
                <ColumnFilter
                  title="Proveedor"
                  options={articles
                    .map((article) => article.vendor)
                    .filter((vendor): vendor is string => !!vendor)}
                  selected={vendorFilter}
                  onChange={setVendorFilter}
                  sort={sortFor("vendor")}
                  onSortChange={(direction) => changeSort("vendor", direction)}
                  align="end"
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="grid size-12 place-content-center rounded-full bg-muted">
                      <PackageSearch className="size-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        {hasFilters
                          ? "Sin coincidencias"
                          : "Aún no hay recepciones"}
                      </p>
                      <p className="text-xs">
                        {hasFilters
                          ? "Pruebe con otros filtros o amplíe el período."
                          : "Los artículos aeronáuticos recibidos aparecerán aquí."}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="text-center font-mono text-xs font-medium">
                    {article.part_number ?? "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {article.description ?? "N/A"}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {article.quantity}{" "}
                    <span className="text-xs text-muted-foreground">
                      {article.unit}
                    </span>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {format(new Date(article.reception_date), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    {article.order_number ?? "—"}
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    {article.vendor ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
