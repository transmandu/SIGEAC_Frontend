"use client"

import { CreateBatchDialog } from "@/components/dialogs/mantenimiento/almacen/CreateBatchDialog"
import { ContentLayout } from "@/components/layout/ContentLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles"
import { useGetWarehouseArticlesByCategory } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory"
import { useInventoryExport } from "@/hooks/mantenimiento/almacen/reportes/useGetWarehouseReports"
import { useCompanyStore } from "@/stores/CompanyStore"
import { useAuth } from "@/contexts/AuthContext"
import { TooltipArrow } from "@radix-ui/react-tooltip"
import type { SortingState } from "@tanstack/react-table"
import { parseISO } from "date-fns"
import { Loader2, Package2, PaintBucket, Puzzle, Wrench, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { FaFilePdf } from "react-icons/fa"
import { RiFileExcel2Fill } from "react-icons/ri"

import {
  flattenArticles,
  getColumnsByCategory,
  groupByPartNumber,
  groupSequentially,
  IArticleSimple,
} from "./_tables/warehouse-columns"
import { DataTable } from "./_tables/warehouse-data-table"
import { buildGeneralColumns, getUnitOptions } from "./_tables/general-columns"
import { PartNumberGroupDialog } from "./_components/PartNumberGroupDialog"
import { parseToolStatusFilter } from "@/lib/warehouse/statuses"
import { PageHeader } from "@/components/layout/PageHeader";

type Category = "all" | "COMPONENT" | "PART" | "CONSUMABLE" | "TOOL"
type InventoryTab = "aeronautic" | "general"

/** Debe coincidir con ARTICLE_SORT_COLUMNS del backend. */
const SERVER_SORTABLE = new Set([
  "part_number",
  "serial",
  "batch_name",
  "status",
  "zone",
  "condition",
])

/** Estas columnas hacen que el backend pagine por grupo, no por artículo. */
const GROUPING_SORT = new Set(["part_number", "batch_name"])

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()

const InventarioArticulosPage = () => {
  const { selectedCompany } = useCompanyStore()
  const { user } = useAuth()
  const isEngineering = (user?.roles?.map((role) => role.name) ?? []).some((role) =>
    ["ENGINEERING", "SUPERUSER"].includes(role),
  )
  const [activeTab, setActiveTab] = useState<InventoryTab>("aeronautic")
  const [activeCategory, setActiveCategory] = useState<Category>("all")
  const { exporting, exportPdf, exportExcel } = useInventoryExport()

  const [componentCondition, setComponentCondition] = useState<
    | "all"
    | "SERVICIABLE"
    | "REMOVIDO - NO SERVICIABLE"
    | "REMOVIDO - CUSTODIA"
    | "REMOVIDO - DESCARGADA"
    | "REPARADO"
    | "USADO"
    | "NUEVO"
  >("all")

  const [consumableFilter, setConsumableFilter] = useState<"all" | "QUIMICOS">("all")
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)

  // Filtros de columna que resuelve el backend sobre el inventario completo.
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})

  const [partNumberSearch, setPartNumberSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [generalSearch, setGeneralSearch] = useState("")
  const [debouncedGeneralSearch, setDebouncedGeneralSearch] = useState("")

  const [sorting, setSorting] = useState<SortingState>([])

  // Dialog (grupo PN)
  const [groupOpen, setGroupOpen] = useState(false)
  const [groupPn, setGroupPn] = useState("")
  const [groupRows, setGroupRows] = useState<IArticleSimple[]>([])
  const [apiPage, setApiPage] = useState(1)

  // Debounce search input and reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(partNumberSearch)
      setApiPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [partNumberSearch])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedGeneralSearch(generalSearch), 400)
    return () => clearTimeout(timer)
  }, [generalSearch])

  const handleStatusFilterChange = (value: string | undefined) => {
    setStatusFilter(value)
    setApiPage(1)
  }

  const handleColumnFiltersChange = (filters: Record<string, string>) => {
    setColumnFilters(filters)
    setApiPage(1)
  }

  // El selector de Estado mezcla `articles.status` con los subestados de
  // calibración; el backend los recibe por parámetros distintos.
  const toolStatusFilter = parseToolStatusFilter(statusFilter) ?? undefined
  const articleStatusFilter = toolStatusFilter ? undefined : statusFilter

  const serverColumnFilters = useMemo(
    () => ({
      condition: columnFilters.condition,
      zone: columnFilters.zone,
      tool_status: toolStatusFilter,
      part_number_col: columnFilters.part_number,
      serial_col: columnFilters.serial,
      description_col: columnFilters.batch_name,
    }),
    [
      columnFilters.condition,
      columnFilters.zone,
      columnFilters.part_number,
      columnFilters.serial,
      columnFilters.batch_name,
      toolStatusFilter,
    ],
  )

  const handleSortingChange = (next: SortingState) => {
    setSorting(next)
    setApiPage(1)
  }

  // Columnas que el backend sabe ordenar sobre el inventario completo.
  const activeSort = useMemo(() => {
    const first = sorting[0]
    if (!first || !SERVER_SORTABLE.has(first.id)) return undefined
    return { id: first.id, desc: first.desc }
  }, [sorting])

  // Al agrupar, per_page cuenta grupos y cada uno puede traer varios artículos.
  const perPage = !activeSort ? 15 : GROUPING_SORT.has(activeSort.id) ? 25 : 50

  // Paginated fetch — always used; sends part_number to backend when searching
  const {
    data: pagedArticles,
    isLoading: isLoadingArticles,
    isFetching: isFetchingArticles,
  } = useGetWarehouseArticlesByCategory(
    apiPage,
    perPage,
    activeCategory,
    true,
    articleStatusFilter,
    debouncedSearch.trim() || undefined,
    activeCategory === "CONSUMABLE" && consumableFilter === "QUIMICOS",
    activeSort,
    serverColumnFilters,
  )

  const articles = pagedArticles

  const { data: articlesGeneral, isLoading: isLoadingArticlesGeneral } = useGetGeneralArticles()

  // Preparar parámetros de exportación (solo válido cuando no es 'all')
  const common = useMemo(() => {
    if (activeCategory === "all") return null
    return {
      category: activeCategory as "COMPONENT" | "PART" | "CONSUMABLE" | "TOOL",
      search: debouncedSearch.trim(),
      filters: {
        ...(activeCategory === "COMPONENT" ? { condition: componentCondition } : {}),
        ...(activeCategory === "CONSUMABLE" ? { group: consumableFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      filenamePrefix: "inventario",
    }
  }, [activeCategory, debouncedSearch, componentCondition, consumableFilter, statusFilter])

  // Reset subfiltros y página al cambiar categoría
  useEffect(() => {
    if (activeCategory !== "COMPONENT") setComponentCondition("all")
    if (activeCategory !== "CONSUMABLE") setConsumableFilter("all")
    setStatusFilter(undefined)
    setColumnFilters({})
    setApiPage(1)
  }, [activeCategory])

  // Columns memo
  const cols = useMemo(
    () => getColumnsByCategory(activeCategory, statusFilter, handleStatusFilterChange, isEngineering),
    [activeCategory, statusFilter, isEngineering],
  )

  // Datos + filtros memo
  const currentData = useMemo<IArticleSimple[]>(() => {
    const getExpiryDate = (article: IArticleSimple): Date | null => {
      const caducateDate = article.component?.expiration_date || article.consumable?.expiration_date
      if (!caducateDate) return null

      const date =
        caducateDate instanceof Date
          ? caducateDate
          : typeof caducateDate === "string"
            ? parseISO(caducateDate)
            : null

      return date && !isNaN(date.getTime()) ? date : null
    }

    const list = flattenArticles(articles) ?? []

    let filtered = list

    if (activeCategory !== "all") {
      if ((activeCategory === "COMPONENT" || activeCategory === "PART") && componentCondition !== "all") {
        filtered = filtered.filter((a) => a.condition === componentCondition)
      }
    }

    // Con orden del servidor se respeta tal cual: reordenar aquí lo desharía.
    // Ordenando por PN o descripción el backend ya vino agrupado, así que solo
    // se reconstruyen los grupos sobre las filas consecutivas.
    if (activeSort) {
      if (activeSort.id === "part_number") {
        return groupSequentially(filtered, (a) => a.part_number)
      }
      if (activeSort.id === "batch_name") {
        return groupSequentially(filtered, (a) => a.batch_id)
      }
      return filtered
    }

    // Orden por vencimiento cuando aplica
    if (
      activeCategory === "COMPONENT" ||
      activeCategory === "PART" ||
      activeCategory === "CONSUMABLE" ||
      activeCategory === "all"
    ) {
      filtered = filtered.sort((a, b) => {
        const dateA = getExpiryDate(a)
        const dateB = getExpiryDate(b)
        if (!dateA && !dateB) return 0
        if (!dateA) return 1
        if (!dateB) return -1
        return dateA.getTime() - dateB.getTime()
      })
    }

    // ✅ Agrupar por PN en: all / component / part
    const shouldGroup = activeCategory === "all" || activeCategory === "COMPONENT" || activeCategory === "PART"
    return shouldGroup ? groupByPartNumber(filtered) : filtered
  }, [articles, activeCategory, componentCondition, activeSort])

  const currentGeneralData = useMemo(() => {
    const list = articlesGeneral ?? []
    const term = normalize(debouncedGeneralSearch)
    if (!term) return list

    return list.filter((article) =>
      [article.description, article.variant_type, article.brand_model].some(
        (field) => field && normalize(field).includes(term),
      ),
    )
  }, [articlesGeneral, debouncedGeneralSearch])

  const generalCols = useMemo(
    () => buildGeneralColumns(getUnitOptions(articlesGeneral)),
    [articlesGeneral],
  )

  const serverPagination = pagedArticles?.pagination
    ? {
        currentPage: pagedArticles.pagination.current_page,
        lastPage: pagedArticles.pagination.last_page,
        total: pagedArticles.pagination.total,
        from: pagedArticles.pagination.from ?? 0,
        to: pagedArticles.pagination.to ?? 0,
        onPageChange: setApiPage,
        unitLabel:
          activeSort && GROUPING_SORT.has(activeSort.id)
            ? activeSort.id === "part_number"
              ? "nro. de parte"
              : "descripcion(es)"
            : undefined,
      }
    : undefined

  // Condición y ubicación se resuelven en el servidor; el estado ya viaja por
  // su propio parámetro desde StatusColumnHeader.
  const tableServerFilters = {
    columnIds: ["condition", "zone", "part_number", "serial", "batch_name"],
    onFiltersChange: handleColumnFiltersChange,
  }

  // Un input en pantalla, un estado por pestaña: cambiar de tab no arrastra el texto.
  const search =
    activeTab === "aeronautic"
      ? {
          value: partNumberSearch,
          onChange: setPartNumberSearch,
          debounced: debouncedSearch,
          isLoading: isLoadingArticles,
          resultCount: pagedArticles?.pagination?.total ?? currentData.length,
          placeholder: "Buscar por Nro. de Parte (Ej: 65-50587-4, ALT-123...)",
        }
      : {
          value: generalSearch,
          onChange: setGeneralSearch,
          debounced: debouncedGeneralSearch,
          isLoading: isLoadingArticlesGeneral,
          resultCount: currentGeneralData.length,
          placeholder: "Buscar por descripción, presentación o marca/modelo (Ej: TORNILLO, 3/4, TRUPER...)",
        }

  return (
    <ContentLayout title="Gestión de Inventario">
      <TooltipProvider>
        <div className="flex flex-col gap-y-4">
          {/* Breadcrumbs */}
          <PageHeader />

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Gestión de Inventario</h1>
            <p className="text-sm text-muted-foreground italic">
              Visualiza todos los artículos del inventario organizados por tipo
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative max-w-xl mx-auto">
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
            {search.debounced && (
              <p className="text-xs text-muted-foreground text-center">
                Filtrando por: <span className="font-medium text-foreground">{search.debounced}</span> •{" "}
                {search.isLoading ? "buscando..." : `${search.resultCount} resultado(s)`}
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
              <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as Category)}>
                <TabsList className="flex justify-center space-x-3" aria-label="Categorías">
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
                        {!common ? "Selecciona una categoría específica" : "Descargar PDF"} <TooltipArrow />
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
                        {!common ? "Selecciona una categoría específica" : "Descargar Excel"} <TooltipArrow />
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TabsList>

                {/* ALL */}
                <TabsContent value="all">
                  {isLoadingArticles && !pagedArticles ? (
                    <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                      <Loader2 className="size-24 animate-spin" />
                    </div>
                  ) : (
                    <DataTable
                      columns={cols}
                      data={currentData}
                      serverPagination={serverPagination}
                      serverSorting={{ sorting, onSortingChange: handleSortingChange }}
                      serverColumnFilters={tableServerFilters}
                      isFetching={isFetchingArticles}
                      onRowClick={(row: any) => {
                        if (!row?.__isGroup || !row?.subRows?.length) return
                        setGroupPn(row.part_number)
                        setGroupRows(row.subRows)
                        setGroupOpen(true)
                      }}
                      rowClassName={(row: any) => (row?.__isGroup ? "cursor-pointer hover:bg-muted/30" : "")}
                    />
                  )}
                </TabsContent>

                {/* COMPONENT */}
                <TabsContent value="COMPONENT">
                  <Tabs
                    value={componentCondition}
                    onValueChange={(v) => setComponentCondition(v as typeof componentCondition)}
                    className="mb-4"
                  >
                    <TabsList className="flex justify-center mb-4 space-x-3" aria-label="Condición de componente">
                      <TabsTrigger value="all">Todos</TabsTrigger>
                      <TabsTrigger value="SERVICIABLE">Serviciables</TabsTrigger>
                      <TabsTrigger value="REPARADO">Reparados</TabsTrigger>
                      <TabsTrigger value="REMOVIDO - NO SERVICIABLE">Removidos - No Serviciables</TabsTrigger>
                      <TabsTrigger value="REMOVIDO - CUSTODIA">Removidos - En custodia</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {isLoadingArticles && !pagedArticles ? (
                    <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                      <Loader2 className="size-24 animate-spin" />
                    </div>
                  ) : (
                    <DataTable
                      columns={cols}
                      data={currentData}
                      serverPagination={serverPagination}
                      serverSorting={{ sorting, onSortingChange: handleSortingChange }}
                      serverColumnFilters={tableServerFilters}
                      isFetching={isFetchingArticles}
                      onRowClick={(row: any) => {
                        if (!row?.__isGroup || !row?.subRows?.length) return
                        setGroupPn(row.part_number)
                        setGroupRows(row.subRows)
                        setGroupOpen(true)
                      }}
                      rowClassName={(row: any) => (row?.__isGroup ? "cursor-pointer hover:bg-muted/30" : "")}
                    />
                  )}
                </TabsContent>

                {/* CONSUMABLE */}
                <TabsContent value="CONSUMABLE">
                  <Tabs
                    value={consumableFilter}
                    onValueChange={(v) => setConsumableFilter(v as typeof consumableFilter)}
                    className="mb-4"
                  >
                    <TabsList className="flex justify-center mb-4 space-x-3" aria-label="Filtro de consumibles">
                      <TabsTrigger value="all">Todos</TabsTrigger>
                      <TabsTrigger value="QUIMICOS">Mercancia Peligrosa</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {isLoadingArticles && !pagedArticles ? (
                    <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                      <Loader2 className="size-24 animate-spin" />
                    </div>
                  ) : (
                    <DataTable columns={cols} data={currentData} serverPagination={serverPagination}
                      serverSorting={{ sorting, onSortingChange: handleSortingChange }}
                      serverColumnFilters={tableServerFilters}
                      isFetching={isFetchingArticles} />
                  )}
                </TabsContent>

                {/* TOOL */}
                <TabsContent value="TOOL">
                  {isLoadingArticles && !pagedArticles ? (
                    <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                      <Loader2 className="size-24 animate-spin" />
                    </div>
                  ) : (
                    <DataTable columns={cols} data={currentData} serverPagination={serverPagination}
                      serverSorting={{ sorting, onSortingChange: handleSortingChange }}
                      serverColumnFilters={tableServerFilters}
                      isFetching={isFetchingArticles} />
                  )}
                </TabsContent>

                {/* PART */}
                <TabsContent value="PART">
                  {isLoadingArticles && !pagedArticles ? (
                    <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                      <Loader2 className="size-24 animate-spin" />
                    </div>
                  ) : (
                    <DataTable
                      columns={cols}
                      data={currentData}
                      serverPagination={serverPagination}
                      serverSorting={{ sorting, onSortingChange: handleSortingChange }}
                      serverColumnFilters={tableServerFilters}
                      isFetching={isFetchingArticles}
                      onRowClick={(row: any) => {
                        if (!row?.__isGroup || !row?.subRows?.length) return
                        setGroupPn(row.part_number)
                        setGroupRows(row.subRows)
                        setGroupOpen(true)
                      }}
                      rowClassName={(row: any) => (row?.__isGroup ? "cursor-pointer hover:bg-muted/30" : "")}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="general">
              {isLoadingArticlesGeneral ? (
                <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                  <Loader2 className="size-24 animate-spin" />
                </div>
              ) : (
                <DataTable columns={generalCols} data={currentGeneralData} />
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
      </TooltipProvider>
    </ContentLayout>
  )
}

export default InventarioArticulosPage
