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
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles";
import {
  Drill,
  Loader2,
  Package2,
  PaintBucket,
  Puzzle,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
  flattenArticles,
  getColumnsByCategory,
  IArticleSimple,
} from "./columns";
import { DataTable } from "./data-table";
import { useGetWarehouseArticlesByCategory } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory";
import { columns as GeneralColums } from "../../almacen/inventario_articulos/_tables/general-columns";

const InventarioArticulosPage = () => {
  const { selectedCompany } = useCompanyStore();

  const [activeMainTab, setActiveMainTab] = useState("aeronautic");

  const [activeCategory, setActiveCategory] = useState<
    "COMPONENT" | "CONSUMABLE" | "TOOL" | "PART" | "all"
  >("all");

  const [componentCondition, setComponentCondition] = useState<
    "all" | "SERVICIABLE" | "REMOVIDO - NO SERVICIABLE" | "REMOVIDO - CUSTODIA"
  >("all");

  const [consumableFilter, setConsumableFilter] = useState<"all" | "QUIMICOS">(
    "all",
  );
  const [partNumberSearch, setPartNumberSearch] = useState("");

  const { data: articles, isLoading: isLoadingArticles } =
    useGetWarehouseArticlesByCategory(1, 1000, activeCategory as any, true);

  const { data: articlesGeneral, isLoading: isLoadingArticlesGeneral } =
    useGetGeneralArticles();

  // Logica del placeholder dinámico
  const dynamicPlaceholder = useMemo(() => {
    if (activeMainTab === "aeronautic") {
      return "Búsqueda Aeronáutica - Nro. de Parte (Ej: 65-50587-4, TORNILLO, ALT-123...)";
    }
    return "Búsqueda General - Buscar por Descripcion";
  }, [activeMainTab]);

  // 1. Columnas Aeronáuticas filtradas
  const aeroColsWithoutActions = useMemo(() => {
    const rawCols = getColumnsByCategory(activeCategory as any);
    // Filtramos cualquier columna que tenga el id 'actions', 'acciones' o que su header sea 'Acciones'
    return rawCols.filter(
      (col) =>
        col.id !== "actions" &&
        col.id !== "acciones" &&
        (typeof col.header === "string"
          ? col.header.toLowerCase() !== "acciones"
          : true),
    );
  }, [activeCategory]);

  // 2. Columnas Generales filtradas
  const generalColsWithoutActions = useMemo(() => {
    return GeneralColums.filter(
      (col) =>
        col.id !== "actions" &&
        col.id !== "acciones" &&
        (typeof col.header === "string"
          ? col.header.toLowerCase() !== "acciones"
          : true),
    );
  }, []);

  useEffect(() => {
    if (activeCategory !== "COMPONENT") setComponentCondition("all");
    if (activeCategory !== "CONSUMABLE") setConsumableFilter("all");
  }, [activeCategory]);

  const getCurrentAeronauticData = (): IArticleSimple[] => {
    const list = flattenArticles(articles) ?? [];
    const q = partNumberSearch.trim().toLowerCase();

    let filtered = q
      ? list.filter((a) => a.part_number?.toLowerCase().includes(q))
      : list;

    if (
      (activeCategory === "COMPONENT" || activeCategory === "PART") &&
      componentCondition !== "all"
    ) {
      filtered = filtered.filter((a) => a.condition === componentCondition);
    }

    if (activeCategory === "CONSUMABLE" && consumableFilter === "QUIMICOS") {
      filtered = filtered.filter((a: any) => a.is_hazardous === true);
    }

    return filtered;
  };

  const getCurrentGeneralData = () => {
    if (!articlesGeneral) return [];
    const q = partNumberSearch.trim().toLowerCase();
    return q
      ? articlesGeneral.filter(
          (a: any) =>
            a.part_number?.toLowerCase().includes(q) ||
            a.description?.toLowerCase().includes(q),
        )
      : articlesGeneral;
  };

  const handleClearSearch = () => setPartNumberSearch("");

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
            Visualiza todos los artículos organizados por tipo y sección
          </p>
        </div>

        {/* Búsqueda */}
        <div className="relative max-w-xl mx-auto w-full">
          <Input
            placeholder={dynamicPlaceholder}
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
              onValueChange={(v) => setActiveCategory(v as any)}
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
                  <PaintBucket className="size-5" /> Consumiblaes
                </TabsTrigger>
                <TabsTrigger className="flex gap-2" value="TOOL">
                  <Drill className="size-5" /> Herramientas
                </TabsTrigger>
              </TabsList>

              {(activeCategory === "COMPONENT" ||
                activeCategory === "PART") && (
                <div className="flex justify-center mb-4">
                  <Tabs
                    value={componentCondition}
                    onValueChange={(v) => setComponentCondition(v as any)}
                  >
                    <TabsList>
                      <TabsTrigger value="all">Todos</TabsTrigger>
                      <TabsTrigger value="SERVICIABLE">
                        Serviciables
                      </TabsTrigger>
                      <TabsTrigger value="REMOVIDO - NO SERVICIABLE">
                        No Serviciables
                      </TabsTrigger>
                      <TabsTrigger value="REMOVIDO - CUSTODIA">
                        En custodia
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {isLoadingArticles ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="size-12 animate-spin text-primary" />
                </div>
              ) : (
                <DataTable
                  columns={aeroColsWithoutActions}
                  data={getCurrentAeronauticData()}
                />
              )}
            </Tabs>
          </TabsContent>
          {/* Sub-tabs por categoría */}
          <TabsContent value="general">
            {isLoadingArticlesGeneral ? (
              <div className="flex justify-center py-20">
                <Loader2 className="size-12 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable
                columns={generalColsWithoutActions}
                data={getCurrentGeneralData()}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default InventarioArticulosPage;
