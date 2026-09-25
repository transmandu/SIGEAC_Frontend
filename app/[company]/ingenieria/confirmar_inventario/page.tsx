"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALL_CONDITIONS, ConditionTabs } from "@/components/misc/ConditionTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDebounce } from "@/hooks/helpers/useDebounce";
import { useCheckingArticles } from "@/hooks/mantenimiento/almacen/inventario/useCheckingArticles";
import type { InventoryCategory } from "@/hooks/mantenimiento/almacen/inventario/useWarehouseInventoryArticles";
import { Drill, Loader2, Package2, PaintBucket, Puzzle, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getColumnsByCategory } from "./columns";
import { DataTable } from "./data-table";
import { useUpdateArticleStatus } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { PageHeader } from "@/components/layout/PageHeader";

const ALL = ALL_CONDITIONS;

const InventarioArticulosPage = () => {
  const [activeCategory, setActiveCategory] =
    useState<InventoryCategory>("COMPONENT");
  const [condition, setCondition] = useState<string>(ALL);
  const [consumableFilter, setConsumableFilter] = useState<"all" | "QUIMICOS">(
    "all",
  );
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);

  const [selectedArticleIds, setSelectedArticleIds] = useState<number[]>([]);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const { updateArticleStatus } = useUpdateArticleStatus();

  const checking = useCheckingArticles({
    category: activeCategory,
    search: debouncedSearch || undefined,
    condition:
      (activeCategory === "COMPONENT" || activeCategory === "PART") &&
      condition !== ALL
        ? condition
        : undefined,
    is_hazardous:
      activeCategory === "CONSUMABLE" && consumableFilter === "QUIMICOS",
  });

  // La selección es de lo que está a la vista: cambiar de categoría, de
  // página o de filtros la vacía, igual que una aceptación ya hecha.
  const selectionResetKey = [
    activeCategory,
    condition,
    consumableFilter,
    debouncedSearch,
    checking.pagination.pageIndex,
    acceptedCount,
  ].join("|");

  const [lastResetKey, setLastResetKey] = useState(selectionResetKey);
  if (selectionResetKey !== lastResetKey) {
    setLastResetKey(selectionResetKey);
    setSelectedArticleIds([]);
  }

  const handleCategoryChange = (next: InventoryCategory) => {
    setActiveCategory(next);
    setCondition(ALL);
    setConsumableFilter("all");
  };

  const cols = useMemo(
    () => getColumnsByCategory(activeCategory),
    [activeCategory],
  );

  const handleMassAccept = async () => {
    if (selectedArticleIds.length === 0) return;

    await updateArticleStatus.mutateAsync({
      ids: selectedArticleIds,
      status: "STORED",
    });

    setAcceptedCount((prev) => prev + 1);
  };

  return (
    <ContentLayout title="Inventario Registrado">
      <TooltipProvider>
        <div className="flex flex-col gap-y-4">
          {/* Breadcrumbs */}
          <PageHeader className="mb-2" />

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Inventario Registrado</h1>
            <p className="text-sm text-muted-foreground italic">
              Visualiza los articulos registrados para su verificación y
              posterior registro a almacén.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <Input
              placeholder="Buscar por Nro. de Parte, serial, lote o descripción"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-8 h-11"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Tabs principales */}
          <Tabs
            value={activeCategory}
            onValueChange={(v) => handleCategoryChange(v as InventoryCategory)}
          >
            <TabsList
              className="flex justify-center mb-4 space-x-3"
              aria-label="Categorías"
            >
              <TabsTrigger className="flex gap-2" value="all">
                <Package2 className="size-5" /> Todos
              </TabsTrigger>
              <TabsTrigger className="flex gap-2" value="COMPONENT">
                <Package2 className="size-5" /> Componente
              </TabsTrigger>
              <TabsTrigger className="flex gap-2" value="PART">
                <Puzzle className="size-5" /> Partes
              </TabsTrigger>
              <TabsTrigger className="flex gap-2" value="CONSUMABLE">
                <PaintBucket className="size-5" /> Consumibles
              </TabsTrigger>
              <TabsTrigger className="flex gap-2" value="TOOL">
                <Drill className="size-5" /> Herramientas
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory} className="mt-6">
              {(activeCategory === "COMPONENT" ||
                activeCategory === "PART") && (
                <div className="flex justify-center mb-4">
                  <ConditionTabs
                    value={condition}
                    onValueChange={setCondition}
                  />
                </div>
              )}

              {activeCategory === "CONSUMABLE" && (
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
              )}

              {checking.isLoading ? (
                <div className="flex w-full h-full justify-center items-center min-h-75">
                  <Loader2 className="size-24 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      onClick={handleMassAccept}
                      disabled={
                        selectedArticleIds.length === 0 ||
                        updateArticleStatus.isPending
                      }
                      className="min-w-55"
                    >
                      {updateArticleStatus.isPending ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          Procesando...
                        </span>
                      ) : (
                        `Aceptar seleccionados (${selectedArticleIds.length})`
                      )}
                    </Button>
                  </div>

                  <DataTable
                    columns={cols}
                    data={checking.rows}
                    onSelectionChange={setSelectedArticleIds}
                    selectionResetKey={selectionResetKey}
                    isFetching={checking.isFetching}
                    pagination={{
                      ...checking.pagination,
                      summary:
                        checking.total !== undefined
                          ? `${checking.total.toLocaleString("es-VE")} artículo(s) en revisión`
                          : undefined,
                    }}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </ContentLayout>
  );
};

export default InventarioArticulosPage;
