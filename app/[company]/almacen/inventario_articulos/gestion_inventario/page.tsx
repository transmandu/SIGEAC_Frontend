"use client";

import { CreateBatchDialog } from "@/components/dialogs/mantenimiento/almacen/CreateBatchDialog";
import { SearchAcrossLocationsDialog } from "@/components/dialogs/mantenimiento/almacen/SearchAcrossLocationsDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebounce } from "@/hooks/helpers/useDebounce";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import {
  useWarehouseInventoryArticles,
  type InventoryCategory,
} from "@/hooks/mantenimiento/almacen/inventario/useWarehouseInventoryArticles";
import { useWarehouseInventoryGeneralArticles } from "@/hooks/mantenimiento/almacen/inventario/useWarehouseInventoryGeneralArticles";
import { useInventoryExport } from "@/hooks/mantenimiento/almacen/reportes/useGetWarehouseReports";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetConditions } from "@/hooks/general/condiciones/useGetConditions";
import { ALL_CONDITIONS, ConditionTabs } from "@/components/misc/ConditionTabs";
import { conditionOptions } from "@/lib/warehouse/conditions";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { SortingState } from "@tanstack/react-table";
import {
  Loader2,
  MapPin,
  Package2,
  PaintBucket,
  Puzzle,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import { RiFileExcel2Fill } from "react-icons/ri";

import {
  flattenArticles,
  getColumnsByCategory,
  groupSequentially,
  IArticleSimple,
} from "@/app/[company]/almacen/inventario_articulos/_tables/warehouse-columns";
import { DataTable } from "@/app/[company]/almacen/inventario_articulos/_tables/warehouse-data-table";
import {
  buildGeneralColumns,
  getUnitOptions,
} from "@/app/[company]/almacen/inventario_articulos/_tables/general-columns";
import { PartNumberGroupDialog } from "@/app/[company]/almacen/inventario_articulos/_components/PartNumberGroupDialog";
import { parseToolStatusFilter } from "@/lib/warehouse/statuses";
import { PageHeader } from "@/components/layout/PageHeader";

type InventoryTab = "aeronautic" | "general";

/** Debe coincidir con los órdenes que acepta ArticleListingController. */
const SERVER_SORTABLE = new Set([
  "part_number",
  "serial",
  "batch_name",
  "status",
  "zone",
  "condition",
  "expiration_date",
]);

/** Debe coincidir con GeneralArticleListingRepository::WAREHOUSE_SORTS. */
const GENERAL_SERVER_SORTABLE = new Set([
  "description",
  "brand_model",
  "variant_type",
  "quantity",
]);

const formatCount = (value: number) => value.toLocaleString("es-VE");

const toServerSort = (sorting: SortingState, sortable: Set<string>) => {
  const first = sorting[0];
  if (!first || !sortable.has(first.id)) return {};
  return {
    sort_by: first.id,
    sort_dir: first.desc ? ("desc" as const) : ("asc" as const),
  };
};

const InventarioArticulosPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [activeTab, setActiveTab] = useState<InventoryTab>("aeronautic");
  const [searchAcrossOpen, setSearchAcrossOpen] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<InventoryCategory>("all");
  const { exporting, exportPdf, exportExcel } = useInventoryExport();

  const [consumableFilter, setConsumableFilter] = useState<"all" | "QUIMICOS">(
    "all",
  );
  const [conditionTab, setConditionTab] = useState<string>(ALL_CONDITIONS);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );

  // Filtros de columna: los resuelve el servidor sobre el inventario completo.
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {},
  );
  const [generalColumnFilters, setGeneralColumnFilters] = useState<
    Record<string, string>
  >({});

  const [partNumberSearch, setPartNumberSearch] = useState("");
  const debouncedSearch = useDebounce(partNumberSearch, 400);
  const [generalSearch, setGeneralSearch] = useState("");
  const debouncedGeneralSearch = useDebounce(generalSearch, 400);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [generalSorting, setGeneralSorting] = useState<SortingState>([]);

  // Dialog (grupo PN)
  const [groupOpen, setGroupOpen] = useState(false);
  const [groupPn, setGroupPn] = useState("");
  const [groupRows, setGroupRows] = useState<IArticleSimple[]>([]);

  // El selector de Estado mezcla `articles.status` con los subestados de
  // calibración; el backend los recibe por parámetros distintos.
  const toolStatusFilter = parseToolStatusFilter(statusFilter) ?? undefined;
  const articleStatusFilter = toolStatusFilter ? undefined : statusFilter;

  // La pestaña de condición (componentes y partes) manda sobre el filtro de la
  // columna: ambos filtran lo mismo.
  const conditionFilter =
    (activeCategory === "COMPONENT" || activeCategory === "PART") &&
    conditionTab !== ALL_CONDITIONS
      ? conditionTab
      : columnFilters.condition;

  // Búsqueda, filtros y orden viajan al servidor: con cursor el cliente solo
  // tiene la página actual y no puede filtrar ni ordenar el inventario. La
  // exportación usa estos mismos filtros, para que baje lo que se ve.
  const inventoryFilters = {
    search: debouncedSearch.trim() || undefined,
    status: articleStatusFilter,
    tool_status: toolStatusFilter,
    condition: conditionFilter,
    zone: columnFilters.zone,
    part_number_col: columnFilters.part_number,
    serial_col: columnFilters.serial,
    description_col: columnFilters.batch_name,
    is_hazardous:
      activeCategory === "CONSUMABLE" && consumableFilter === "QUIMICOS",
  };

  const aeronautical = useWarehouseInventoryArticles({
    category: activeCategory,
    ...inventoryFilters,
    ...toServerSort(sorting, SERVER_SORTABLE),
  });

  const general = useWarehouseInventoryGeneralArticles(
    {
      search: debouncedGeneralSearch.trim() || undefined,
      description_col: generalColumnFilters.description,
      brand_model_col: generalColumnFilters.brand_model,
      variant_type_col: generalColumnFilters.variant_type,
      unit: generalColumnFilters.unit,
      quantity: generalColumnFilters.quantity,
      ...toServerSort(generalSorting, GENERAL_SERVER_SORTABLE),
    },
    activeTab === "general",
  );

  // Las opciones del filtro de unidad salen del catálogo de unidades: con
  // cursor, las de la página cargada serían solo una parte.
  const { data: units } = useGetUnits(selectedCompany?.slug);

  // Las condiciones salen de la tabla de la compañía, no de una lista fija.
  const { data: conditions } = useGetConditions();
  const conditionFilterOptions = useMemo(
    () => conditionOptions(conditions),
    [conditions],
  );

  // La exportación exige una categoría concreta: "Todos" mezcla columnas.
  const common =
    activeCategory === "all"
      ? null
      : {
          category: activeCategory,
          filters: inventoryFilters,
          filenamePrefix: "inventario",
        };

  // Al cambiar de categoría se limpian sus subfiltros; el cursor vuelve solo
  // a la primera página porque cambian los filtros.
  const handleCategoryChange = (next: InventoryCategory) => {
    setActiveCategory(next);
    if (next !== "CONSUMABLE") setConsumableFilter("all");
    setConditionTab(ALL_CONDITIONS);
    setStatusFilter(undefined);
    setColumnFilters({});
  };

  const cols = useMemo(
    () =>
      getColumnsByCategory(activeCategory, {
        statusFilter,
        onStatusFilterChange: setStatusFilter,
        conditionOptions: conditionFilterOptions,
      }),
    [activeCategory, statusFilter, conditionFilterOptions],
  );

  // Cuando el servidor agrupa, los artículos de un grupo llegan contiguos y
  // completos: basta reunirlos en la fila desplegable.
  const currentData = useMemo<IArticleSimple[]>(() => {
    const list = flattenArticles(aeronautical.rows);
    // La base agrupa sin distinguir mayúsculas: la clave se compara igual.
    return aeronautical.groupedBy
      ? groupSequentially(list, (a) =>
          (a.group_key ?? String(a.id)).toUpperCase(),
        )
      : list;
  }, [aeronautical.rows, aeronautical.groupedBy]);

  const generalCols = useMemo(
    () => buildGeneralColumns(getUnitOptions(units)),
    [units],
  );

  const groupedUnit =
    aeronautical.groupedBy === "batch"
      ? "descripción(es)"
      : aeronautical.groupedBy === "part_number"
        ? "nro. de parte"
        : "artículo(s)";

  const serverPagination = {
    ...aeronautical.pagination,
    summary:
      aeronautical.total !== undefined
        ? `${formatCount(aeronautical.total)} ${groupedUnit}`
        : undefined,
  };

  const generalPagination = {
    ...general.pagination,
    summary:
      general.total !== undefined
        ? `${formatCount(general.total)} artículo(s)`
        : undefined,
  };

  // El estado viaja por su propio parámetro desde StatusColumnHeader.
  const tableServerFilters = {
    columnIds: ["condition", "zone", "part_number", "serial", "batch_name"],
    onFiltersChange: setColumnFilters,
  };

  const generalServerFilters = {
    columnIds: [
      "description",
      "brand_model",
      "variant_type",
      "unit",
      "quantity",
    ],
    onFiltersChange: setGeneralColumnFilters,
  };

  const isLoadingArticles = aeronautical.isLoading;
  const isFetchingArticles = aeronautical.isFetching;

  // Un input en pantalla, un estado por pestaña: cambiar de tab no arrastra el texto.
  const search =
    activeTab === "aeronautic"
      ? {
          value: partNumberSearch,
          onChange: setPartNumberSearch,
          debounced: debouncedSearch,
          isLoading: isLoadingArticles,
          resultCount: aeronautical.total ?? currentData.length,
          placeholder: "Buscar por Nro. de Parte (Ej: 65-50587-4, ALT-123...)",
        }
      : {
          value: generalSearch,
          onChange: setGeneralSearch,
          debounced: debouncedGeneralSearch,
          isLoading: general.isLoading,
          resultCount: general.total ?? general.rows.length,
          placeholder:
            "Buscar por descripción, presentación o marca/modelo (Ej: TORNILLO, 3/4, TRUPER...)",
        };

  const openGroup = (row: any) => {
    if (!row?.__isGroup || !row?.subRows?.length) return;
    setGroupPn(row.part_number);
    setGroupRows(row.subRows);
    setGroupOpen(true);
  };

  const aeronauticalTable = (withGroups: boolean) =>
    isLoadingArticles ? (
      <div className="flex w-full h-full justify-center items-center min-h-75">
        <Loader2 className="size-24 animate-spin" />
      </div>
    ) : (
      <DataTable
        columns={cols}
        data={currentData}
        serverPagination={serverPagination}
        serverSorting={{ sorting, onSortingChange: setSorting }}
        serverColumnFilters={tableServerFilters}
        isFetching={isFetchingArticles}
        onRowClick={withGroups ? openGroup : undefined}
        rowClassName={
          withGroups
            ? (row: any) =>
                row?.__isGroup ? "cursor-pointer hover:bg-muted/30" : ""
            : undefined
        }
      />
    );

  return (
    <ContentLayout title="Gestión de Inventario">
      <TooltipProvider>
        <div className="flex flex-col gap-y-4">
          {/* Breadcrumbs */}
          <PageHeader className="mb-2" />

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Gestión de Inventario</h1>
            <p className="text-sm text-muted-foreground italic">
              Visualiza todos los artículos del inventario organizados por tipo
            </p>
          </div>

          <div className="space-y-2">
            <div className="mx-auto flex max-w-xl items-center gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder={search.placeholder}
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                  className="pr-8 h-11"
                />
                {search.value && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => search.onChange("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* El buscador de arriba filtra ESTA sede; este consulta las
                  demás sin cambiar la estación en la que se trabaja.
                  Solo en aeronáutico: la consulta es por número de parte y un
                  artículo general no tiene, así que ahí no habría nada que
                  preguntar. */}
              {activeTab === "aeronautic" && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0 gap-2"
                  onClick={() => setSearchAcrossOpen(true)}
                >
                  <MapPin className="size-4" />
                  Consultar en sedes
                </Button>
              )}
            </div>
            {search.debounced && (
              <p className="text-xs text-muted-foreground text-center">
                Filtrando por:{" "}
                <span className="font-medium text-foreground">
                  {search.debounced}
                </span>{" "}
                •{" "}
                {search.isLoading
                  ? "buscando..."
                  : `${search.resultCount} resultado(s)`}
              </p>
            )}
          </div>

          {/* Tabs principales */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as InventoryTab)}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="aeronautic">Aeronáutico</TabsTrigger>
              <TabsTrigger value="general">General/Ferretería</TabsTrigger>
            </TabsList>

            <TabsContent value="aeronautic">
              <Tabs
                value={activeCategory}
                onValueChange={(v) =>
                  handleCategoryChange(v as InventoryCategory)
                }
              >
                <TabsList
                  className="flex justify-center space-x-3"
                  aria-label="Categorías"
                >
                  <TabsTrigger className="flex gap-2" value="all">
                    <Package2 className="size-5" /> Todos
                  </TabsTrigger>
                  <TabsTrigger className="flex gap-2" value="COMPONENT">
                    <Package2 className="size-5" /> Componente
                  </TabsTrigger>
                  <TabsTrigger className="flex gap-2" value="CONSUMABLE">
                    <PaintBucket className="size-5" /> Consumibles
                  </TabsTrigger>
                  <TabsTrigger className="flex gap-2" value="TOOL">
                    <Wrench className="size-5" /> Herramientas
                  </TabsTrigger>
                  <TabsTrigger className="flex gap-2" value="PART">
                    <Puzzle className="size-5" /> Partes
                  </TabsTrigger>

                  <CreateBatchDialog />

                  {/* Botones exportación */}
                  <div className="flex gap-4 items-center">
                    {/* PDF */}
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => common && exportPdf(common)}
                          disabled={exporting.pdf || !common}
                          className="disabled:opacity-50"
                          aria-label="Descargar PDF"
                        >
                          {exporting.pdf ? (
                            <Loader2 className="size-5 animate-spin" />
                          ) : (
                            <FaFilePdf className="size-5 text-red-500/80 hover:scale-125 transition-transform" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {!common
                          ? "Selecciona una categoría específica"
                          : "Descargar PDF"}{" "}
                        <TooltipArrow />
                      </TooltipContent>
                    </Tooltip>

                    {/* Excel */}
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => common && exportExcel(common)}
                          disabled={exporting.xlsx || !common}
                          className="disabled:opacity-50"
                          aria-label="Descargar Excel"
                        >
                          {exporting.xlsx ? (
                            <Loader2 className="size-5 animate-spin" />
                          ) : (
                            <RiFileExcel2Fill className="size-6 text-green-600/80 hover:scale-125 transition-transform" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {!common
                          ? "Selecciona una categoría específica"
                          : "Descargar Excel"}{" "}
                        <TooltipArrow />
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TabsList>

                <TabsContent value="all">{aeronauticalTable(true)}</TabsContent>

                <TabsContent value="COMPONENT">
                  <ConditionTabs
                    value={conditionTab}
                    onValueChange={setConditionTab}
                    className="mb-4"
                  />
                  {aeronauticalTable(true)}
                </TabsContent>

                <TabsContent value="CONSUMABLE">
                  <Tabs
                    value={consumableFilter}
                    onValueChange={(v) =>
                      setConsumableFilter(v as typeof consumableFilter)
                    }
                    className="mb-4"
                  >
                    <TabsList
                      className="flex justify-center mb-4 space-x-3"
                      aria-label="Filtro de consumibles"
                    >
                      <TabsTrigger value="all">Todos</TabsTrigger>
                      <TabsTrigger value="QUIMICOS">
                        Mercancia Peligrosa
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {aeronauticalTable(false)}
                </TabsContent>

                <TabsContent value="TOOL">
                  {aeronauticalTable(false)}
                </TabsContent>

                <TabsContent value="PART">
                  <ConditionTabs
                    value={conditionTab}
                    onValueChange={setConditionTab}
                    className="mb-4"
                  />
                  {aeronauticalTable(true)}
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="general">
              {general.isLoading ? (
                <div className="flex w-full h-full justify-center items-center min-h-75">
                  <Loader2 className="size-24 animate-spin" />
                </div>
              ) : (
                <DataTable
                  columns={generalCols}
                  data={general.rows}
                  serverPagination={generalPagination}
                  serverSorting={{
                    sorting: generalSorting,
                    onSortingChange: setGeneralSorting,
                  }}
                  serverColumnFilters={generalServerFilters}
                  isFetching={general.isFetching}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Dialog de grupos PN */}
        <PartNumberGroupDialog
          open={groupOpen}
          onOpenChange={setGroupOpen}
          partNumber={groupPn}
          rows={groupRows}
        />

        <SearchAcrossLocationsDialog
          open={searchAcrossOpen}
          onOpenChange={setSearchAcrossOpen}
        />
      </TooltipProvider>
    </ContentLayout>
  );
};

export default InventarioArticulosPage;
