"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALL_CONDITIONS, ConditionTabs } from "@/components/misc/ConditionTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/helpers/useDebounce";
import { useCompanyInventoryArticles } from "@/hooks/mantenimiento/almacen/inventario/useCompanyInventoryArticles";
import { useCompanyInventoryGeneralArticles } from "@/hooks/mantenimiento/almacen/inventario/useCompanyInventoryGeneralArticles";
import type { InventoryCategory } from "@/hooks/mantenimiento/almacen/inventario/useWarehouseInventoryArticles";
import {
  Drill,
  Loader2,
  MapPin,
  Package2,
  PaintBucket,
  Puzzle,
  X,
} from "lucide-react";
import { SearchAcrossLocationsDialog } from "@/components/dialogs/mantenimiento/almacen/SearchAcrossLocationsDialog";
import { useMemo, useState } from "react";
import { getColumnsByCategory } from "./columns";
import { DataTable } from "./data-table";
import { generalConsultaColumns } from "@/components/tables/GeneralArticleConsultaColumns";
import { PageHeader } from "@/components/layout/PageHeader";

const ALL = ALL_CONDITIONS;

const formatCount = (value: number) => value.toLocaleString("es-VE");

const InventarioArticulosPage = () => {
  const [activeMainTab, setActiveMainTab] = useState("aeronautic");
  const [searchAcrossOpen, setSearchAcrossOpen] = useState(false);

  const [activeCategory, setActiveCategory] =
    useState<InventoryCategory>("all");
  const [condition, setCondition] = useState<string>(ALL);
  const [consumableFilter, setConsumableFilter] = useState<"all" | "QUIMICOS">(
    "all",
  );

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);

  // Componentes y partes llegan resumidos por número de parte desde el
  // servidor; la condición y la mercancía peligrosa también se filtran allí,
  // porque en el navegador solo está la página actual.
  const aeronautical = useCompanyInventoryArticles({
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

  const general = useCompanyInventoryGeneralArticles(
    debouncedSearch || undefined,
    activeMainTab === "general",
  );

  const dynamicPlaceholder = useMemo(() => {
    if (activeMainTab === "aeronautic") {
      return "Búsqueda Aeronáutica - Nro. de Parte (Ej: 65-50587-4, TORNILLO, ALT-123...)";
    }
    return "Búsqueda General - Buscar por Descripcion";
  }, [activeMainTab]);

  const handleCategoryChange = (value: InventoryCategory) => {
    setActiveCategory(value);
    setCondition(ALL);
    setConsumableFilter("all");
  };

  const aeronauticalColumns = useMemo(
    () => getColumnsByCategory(activeCategory),
    [activeCategory],
  );

  const aeronauticalUnit =
    activeCategory === "COMPONENT" || activeCategory === "PART"
      ? "nro. de parte"
      : "artículo(s)";

  return (
    <ContentLayout title="Inventario General">
      <div className="flex flex-col gap-y-4">
        {/* Breadcrumbs */}
        <PageHeader className="mb-2" />

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Inventario General</h1>
          <p className="text-sm text-muted-foreground italic">
            Visualiza todos los artículos organizados por tipo y sección
          </p>
        </div>

        {/* Búsqueda */}
        <div className="mx-auto flex w-full max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder={dynamicPlaceholder}
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

          {/* El buscador de arriba filtra ESTA sede; este consulta las demás
              sin cambiar la estación en la que se trabaja.
              Solo en aeronáutico: la consulta es por número de parte y un
              artículo general no tiene, así que ahí no habría nada que
              preguntar. */}
          {activeMainTab === "aeronautic" && (
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

        {/* Tabs principales */}
        <Tabs
          value={activeMainTab}
          onValueChange={setActiveMainTab}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="aeronautic">Aeronáutico</TabsTrigger>
            <TabsTrigger value="general">General / Ferretería</TabsTrigger>
          </TabsList>

          <TabsContent value="aeronautic" className="space-y-6">
            <Tabs
              value={activeCategory}
              onValueChange={(v) =>
                handleCategoryChange(v as InventoryCategory)
              }
            >
              <TabsList className="flex justify-center mb-4 space-x-3">
                <TabsTrigger className="flex gap-2" value="all">
                  <Package2 className="size-5" /> Todos
                </TabsTrigger>
                <TabsTrigger className="flex gap-2" value="COMPONENT">
                  <Package2 className="size-5" /> Componentes
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
                <div className="flex justify-center mb-4">
                  <Tabs
                    value={consumableFilter}
                    onValueChange={(v) =>
                      setConsumableFilter(v as typeof consumableFilter)
                    }
                  >
                    <TabsList>
                      <TabsTrigger value="all">Todos</TabsTrigger>
                      <TabsTrigger value="QUIMICOS">
                        Mercancia Peligrosa
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {aeronautical.isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="size-12 animate-spin text-primary" />
                </div>
              ) : (
                <DataTable
                  columns={aeronauticalColumns}
                  data={aeronautical.rows}
                  isFetching={aeronautical.isFetching}
                  pagination={{
                    ...aeronautical.pagination,
                    summary:
                      aeronautical.total !== undefined
                        ? `${formatCount(aeronautical.total)} ${aeronauticalUnit}`
                        : undefined,
                  }}
                />
              )}
            </Tabs>
          </TabsContent>

          <TabsContent value="general">
            {general.isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="size-12 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable
                columns={generalConsultaColumns}
                data={general.rows}
                isFetching={general.isFetching}
                pagination={{
                  ...general.pagination,
                  summary:
                    general.total !== undefined
                      ? `${formatCount(general.total)} artículo(s)`
                      : undefined,
                }}
              />
            )}
          </TabsContent>
        </Tabs>

        <SearchAcrossLocationsDialog
          open={searchAcrossOpen}
          onOpenChange={setSearchAcrossOpen}
          variant="general"
        />
      </div>
    </ContentLayout>
  );
};

export default InventarioArticulosPage;
