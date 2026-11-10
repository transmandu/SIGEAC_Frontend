"use client";

import { useMemo, useState } from "react";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import CreateErrorReportDialog from "@/components/dialogs/sistema/CreateErrorReportDialog";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import type { DateRangeFilterValue } from "@/components/tables/DataTableHeader";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { useDebounce } from "@/hooks/helpers/useDebounce";
import { useGetErrorReports } from "@/hooks/sistema/reportes/useGetErrorReports";
import { zonedDayToUtcIso } from "@/lib/date";
import type { ErrorReport, ErrorReportStatus } from "@/types";

import MyReportDetailDialog from "./_components/MyReportDetailDialog";
import { getColumns } from "./columns";

const DEFAULT_PAGE_SIZE = 15;

// `mine`: el SUPERUSER recibiría los de todos; eso es Soporte Técnico.
// Los filtros de columna y la búsqueda se resuelven en el servidor: la tabla
// solo ve una página, y filtrar esa página sería engañoso.
export default function MisReportesPage() {
  const timeZone = useCompanyTimezone();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailReport, setDetailReport] = useState<ErrorReport | null>(null);

  const debouncedSearch = useDebounce(search.trim(), 350);

  const filterValue = <T,>(id: string) =>
    columnFilters.find((filter) => filter.id === id)?.value as T | undefined;

  const dateRange = filterValue<DateRangeFilterValue>("reported_at");
  // El filtro del encabezado "Descripción" busca en el mismo campo que el
  // buscador de arriba: si se usan los dos, vale el de arriba.
  const descriptionFilter = useDebounce(
    (filterValue<string>("description") ?? "").trim(),
    350,
  );
  const sort = sorting[0];

  const { data, isLoading, isError, refetch } = useGetErrorReports(
    {
      page,
      per_page: perPage,
      status: filterValue<ErrorReportStatus>("status"),
      module: filterValue<string>("module"),
      search: debouncedSearch || descriptionFilter || undefined,
      sort_by: sort?.id,
      sort_dir: sort ? (sort.desc ? "desc" : "asc") : undefined,
      from: zonedDayToUtcIso(dateRange?.from, "start", timeZone),
      to: zonedDayToUtcIso(dateRange?.to, "end", timeZone),
      mine: true,
    },
    { keepPrevious: true },
  );

  const columns = useMemo(
    () => getColumns(setDetailReport, timeZone),
    [timeZone],
  );

  return (
    <SettingsListPage
      title="Mis Reportes"
      heading="Mis Reportes"
      description="Reporte un problema y siga el estado de su resolución."
      search={{
        value: search,
        onChange: (value) => {
          setSearch(value);
          setPage(1);
        },
        placeholder: "Buscar en la descripción...",
      }}
      count={{
        value: data?.pagination.total,
        singular: "reporte",
        plural: "reportes",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={data?.reports ?? []}
        loading={isLoading}
        error={isError}
        errorMessage="No se pudieron cargar sus reportes"
        onRetry={() => refetch()}
        filtered={!!debouncedSearch || columnFilters.length > 0}
        emptyMessage="Aún no ha reportado ningún problema."
        actions={
          <ActionTriggerButton onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Reportar un problema
          </ActionTriggerButton>
        }
        serverSorting={{
          value: sorting,
          onChange: (next) => {
            setSorting(next);
            setPage(1);
          },
        }}
        serverFilters={{
          value: columnFilters,
          onChange: (next) => {
            setColumnFilters(next);
            setPage(1);
          },
        }}
        serverPagination={{
          pageIndex: page - 1,
          pageSize: perPage,
          pageCount: data?.pagination.last_page ?? 0,
          onChange: (pageIndex, pageSize) => {
            setPage(pageIndex + 1);
            setPerPage(pageSize);
          },
        }}
      />

      <CreateErrorReportDialog open={createOpen} onOpenChange={setCreateOpen} />

      <MyReportDetailDialog
        report={detailReport}
        open={!!detailReport}
        onOpenChange={(open) => !open && setDetailReport(null)}
      />
    </SettingsListPage>
  );
}
