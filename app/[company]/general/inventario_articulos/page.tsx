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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Drill, Loader2, Package2, PaintBucket, Puzzle, Wrench, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  flattenArticles,
  getColumnsByCategory,
  IArticleSimple,
} from "./columns";
import { DataTable } from "./data-table";
import { useGetWarehouseArticlesByCategory } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory";

const InventarioArticulosPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [activeCategory, setActiveCategory] = useState<
    "COMPONENT" | "CONSUMABLE" | "TOOL" | "PART"
  >("COMPONENT");
  const [componentCondition, setComponentCondition] = useState<
    "all" | "SERVICIABLE" | "REMOVIDO - NO SERVICIABLE" | "REMOVIDO - CUSTODIA"
  >("all");
  const [consumableFilter, setConsumableFilter] = useState<"all" | "QUIMICOS">(
    "all"
  );
  const [partNumberSearch, setPartNumberSearch] = useState("");
  const cols = getColumnsByCategory(activeCategory);

  const { data: articles, isLoading: isLoadingArticles } =
    useGetWarehouseArticlesByCategory(1, 1000, activeCategory, true);

  useEffect(() => {
    if (activeCategory !== "COMPONENT") setComponentCondition("all");
    if (activeCategory !== "CONSUMABLE") setConsumableFilter("all");
  }, [activeCategory]);

  const getCurrentData = (): IArticleSimple[] => {
    const list = flattenArticles(articles) ?? [];

    // 1) Búsqueda por N/P
    const q = partNumberSearch.trim().toLowerCase();
    const bySearch = q
      ? list.filter((a) => a.part_number?.toLowerCase().includes(q))
      : list;

    // 2) Subfiltros por pestaña
    if (
      (activeCategory === "COMPONENT" || activeCategory === "PART") &&
      componentCondition &&
      componentCondition !== "all"
    ) {
      const cond = componentCondition.toUpperCase();

      return bySearch.filter((a) => {
        if (cond === "SERVICIABLE") {
          return a.condition === "SERVICIABLE";
        }
        if (cond === "REMOVIDO - NO SERVICIABLE") {
          return a.condition === "REMOVIDO - NO SERVICIABLE";
        }
        if (cond === "REMOVIDO - CUSTODIA") {
          return a.condition === "REMOVIDO - CUSTODIA";
        }
        return true; // fallback
      });
    }

    if (activeCategory === "CONSUMABLE" && consumableFilter === "QUIMICOS") {
      // Si agregaste is_hazardous al flatten, úsalo. Si no, ajusta al campo real.
      return bySearch.filter((a: any) => a.is_hazardous === true);
    }

    return bySearch;
  };

  const handleClearSearch = () => {
    setPartNumberSearch("");
  };

  return (
    <ContentLayout title="Inventario">
      <div className="flex flex-col gap-y-4">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Inventario General</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Inventario General</h1>
          <p className="text-sm text-muted-foreground italic">
            Visualiza todos los artículos del inventario organizados por tipo
          </p>
        </div>

        {/* Búsqueda General */}
        <div className="space-y-2">
          <div className="relative max-w-xl mx-auto">
            <Input
              placeholder="Búsqueda General - Nro. de Parte (Ej: 65-50587-4, TORNILLO, ALT-123...)"
              value={partNumberSearch}
              onChange={(e) => setPartNumberSearch(e.target.value)}
              className="pr-8 h-11"
            />
            {partNumberSearch && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {partNumberSearch && (
            <p className="text-xs text-muted-foreground text-center">
              Filtrando por:{" "}
              <span className="font-medium text-foreground">
                {partNumberSearch}
              </span>{" "}
              • {getCurrentData().length} resultado(s)
            </p>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v as typeof activeCategory)}
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

          {/* Tab Content */}
          <TabsContent value={activeCategory} className="mt-6">
            {(activeCategory === "COMPONENT" || activeCategory === "PART") && (
              <Tabs
                value={componentCondition}
                onValueChange={(v) =>
                  setComponentCondition(v as typeof componentCondition)
                }
                className="mb-4"
              >
                <TabsList
                  className="flex justify-center mb-4 space-x-3"
                  aria-label="Condición de componente"
                >
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="SERVICIABLE">Serviciables</TabsTrigger>
                  <TabsTrigger value="REMOVIDO - NO SERVICIABLE">
                    Removidos - No Serviciables
                  </TabsTrigger>
                  <TabsTrigger value="REMOVIDO - CUSTODIA">
                    Removidos - En custodia
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Sub-tabs CONSUMIBLE */}
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
            {isLoadingArticles ? (
              <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : (
              <DataTable columns={cols} data={getCurrentData()} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default InventarioArticulosPage;
