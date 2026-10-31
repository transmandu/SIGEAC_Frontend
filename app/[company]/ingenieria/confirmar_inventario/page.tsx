"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALL_CONDITIONS, ConditionTabs } from "@/components/misc/ConditionTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/helpers/useDebounce";
import {
  useCheckingArticles,
  type CheckingScope,
} from "@/hooks/mantenimiento/almacen/inventario/useCheckingArticles";
import type { InventoryCategory } from "@/hooks/mantenimiento/almacen/inventario/useWarehouseInventoryArticles";
import {
  Drill,
  Loader2,
  Package2,
  PaintBucket,
  Puzzle,
  ShieldOff,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { canApprove, getColumnsByCategory } from "./columns";
import { DataTable } from "./data-table";
import { PageHeader } from "@/components/layout/PageHeader";
import { ApproveArticlesDialog } from "./_components/ApproveArticlesDialog";

const ALL = ALL_CONDITIONS;

const ENGINEERING_ROLES = ["SUPERUSER", "ENGINEERING", "JEFE_MANTENIMIENTO"];

const InventarioArticulosPage = () => {
  const { user, loading } = useAuth();
  const canView = (user?.roles ?? []).some((role) =>
    ENGINEERING_ROLES.includes(role.name),
  );

  const [activeCategory, setActiveCategory] =
    useState<InventoryCategory>("all");
  const [condition, setCondition] = useState<string>(ALL);
  const [consumableFilter, setConsumableFilter] = useState<"all" | "QUIMICOS">(
    "all",
  );
  const [onlyRequested, setOnlyRequested] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);

  const [selectedArticleIds, setSelectedArticleIds] = useState<number[]>([]);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [massApproveOpen, setMassApproveOpen] = useState(false);

  const checking = useCheckingArticles(
    {
      scope: "all",
      onlyRequested,
      category: activeCategory,
      search: debouncedSearch || undefined,
      condition:
        (activeCategory === "COMPONENT" || activeCategory === "PART") &&
        condition !== ALL
          ? condition
          : undefined,
      is_hazardous:
        activeCategory === "CONSUMABLE" && consumableFilter === "QUIMICOS",
    },
    canView,
  );

  // La selección es de lo que está a la vista: cambiar de categoría, de
  // página o de filtros la vacía, igual que una aceptación ya hecha.
  const selectionResetKey = [
    onlyRequested,
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

  // Eliminar una fila desde su menú no pasa por la tabla: sin este filtro el
  // contador y la aprobación masiva arrastrarían el id de un artículo ya
  // borrado.
  const approvableIds = useMemo(() => {
    const approvable = new Set(
      checking.rows.filter(canApprove).map((row) => row.id),
    );
    return selectedArticleIds.filter((id) => approvable.has(id));
  }, [selectedArticleIds, checking.rows]);

  // Si todo lo marcado viene de la misma fuente el diálogo habla de esa; si
  // mezcla chequeo y recepción, usa el texto neutro.
  const approveScope = useMemo<CheckingScope>(() => {
    const picked = new Set(approvableIds);
    const sources = new Set(
      checking.rows
        .filter((row) => picked.has(row.id))
        .map((row) =>
          row.status?.toUpperCase() === "CHECKING" ? "checking" : "reception",
        ),
    );
    return sources.size === 1
      ? (sources.values().next().value as CheckingScope)
      : "all";
  }, [approvableIds, checking.rows]);

  const cols = useMemo(
    () => getColumnsByCategory(activeCategory),
    [activeCategory],
  );

  if (loading) {
    return (
      <ContentLayout title="Inventario Registrado">
        <div className="flex min-h-75 items-center justify-center">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        </div>
      </ContentLayout>
    );
  }

  if (!canView) {
    return (
      <ContentLayout title="Inventario Registrado">
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
          <ShieldOff className="size-10" />
          <p className="text-sm font-medium">
            No tienes permiso para ver esta sección.
          </p>
          <p className="text-xs">Se requiere el rol de Ingeniería.</p>
        </div>
      </ContentLayout>
    );
  }

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
              Verifica la información de los artículos registrados o que almacén
              pidió chequear: edítalos, apruébalos o elimínalos si no tienen
              arreglo.
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
            className="relative"
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

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute right-3 top-0 flex h-10 items-center gap-2">
                  <Checkbox
                    id="only-requested"
                    checked={onlyRequested}
                    onCheckedChange={(value) =>
                      setOnlyRequested(value === true)
                    }
                  />
                  <Label
                    htmlFor="only-requested"
                    className="cursor-pointer text-xs font-normal text-muted-foreground"
                  >
                    Solo solicitados
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-xs">
                Marcado: solo lo que está en chequeo o que almacén pidió
                chequear. Desmarcado: también todo lo que está en recepción,
                para revisarlo por iniciativa propia.
              </TooltipContent>
            </Tooltip>

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
                      onClick={() => setMassApproveOpen(true)}
                      disabled={approvableIds.length === 0}
                      className="min-w-55"
                    >
                      {`Aprobar seleccionados (${approvableIds.length})`}
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

          <ApproveArticlesDialog
            open={massApproveOpen}
            onOpenChange={setMassApproveOpen}
            ids={approvableIds}
            scope={approveScope}
            onApproved={() => setAcceptedCount((prev) => prev + 1)}
          />
        </div>
      </TooltipProvider>
    </ContentLayout>
  );
};

export default InventarioArticulosPage;
