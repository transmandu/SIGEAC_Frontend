'use client';

import { CreateBatchDialog } from '@/components/dialogs/mantenimiento/almacen/CreateBatchDialog';
import { ContentLayout } from '@/components/layout/ContentLayout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useGetGeneralArticles } from '@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles';
import { useGetWarehouseArticlesByCategory } from '@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory';
import { useInventoryExport } from '@/hooks/mantenimiento/almacen/reportes/useGetWarehouseReports';
import { useCompanyStore } from '@/stores/CompanyStore';
import { TooltipArrow } from '@radix-ui/react-tooltip';
import { parseISO } from 'date-fns';
import { Loader2, Package2, PaintBucket, Puzzle, Wrench, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { RiFileExcel2Fill } from 'react-icons/ri';
import { allCategoriesCols, flattenArticles, getColumnsByCategory, IArticleSimple } from './_tables/warehouse-columns';
import { DataTable } from './_tables/warehouse-data-table';
import { columns as GeneralColums } from './_tables/general-columns';

type Category = 'all' | 'COMPONENT' | 'PART' |'CONSUMABLE' | 'TOOL';

const InventarioArticulosPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const { exporting, exportPdf, exportExcel } = useInventoryExport();
  const [componentCondition, setComponentCondition] = useState<
    | 'all'
    | 'SERVICIABLE'
    | 'REMOVIDO - NO SERVICIABLE'
    | 'REMOVIDO - CUSTODIA'
    | 'REMOVIDO - DESCARGADA'
    | 'REPARADO'
    | 'USADO'
    | 'NUEVO'
  >('all');

  const [consumableFilter, setConsumableFilter] = useState<'all' | 'QUIMICOS'>('all');
  const [partNumberSearch, setPartNumberSearch] = useState('');

  // Fetch - Una sola llamada que maneja todas las categorías
  const { data: articles, isLoading: isLoadingArticles } = useGetWarehouseArticlesByCategory(
    1,
    1000,
    activeCategory, // 'all', 'COMPONENTE', 'CONSUMIBLE', o 'HERRAMIENTA'
    true
  );

  const { data: articlesGeneral, isLoading: isLoadingArticlesGeneral } = useGetGeneralArticles();

  // Preparar parámetros de exportación (solo válido cuando no es 'all')
  const common = useMemo(() => {
    if (activeCategory === 'all') return null;
    return {
      category: activeCategory as 'COMPONENT' | 'PART' | 'CONSUMABLE' | 'TOOL',
      search: partNumberSearch,
      filters:
        activeCategory === 'COMPONENT'
          ? { condition: componentCondition }
          : activeCategory === 'CONSUMABLE'
            ? { group: consumableFilter }
            : {},
      filenamePrefix: 'inventario',
    };
  }, [activeCategory, partNumberSearch, componentCondition, consumableFilter]);

  // Reset subfiltros al cambiar categoría
  useEffect(() => {
    if (activeCategory !== 'COMPONENT') setComponentCondition('all');
    if (activeCategory !== 'CONSUMABLE') setConsumableFilter('all');
  }, [activeCategory]);

  // Columns memo
  const cols = useMemo(() => {
    if (activeCategory === 'all') return allCategoriesCols;
    return getColumnsByCategory(activeCategory);
  }, [activeCategory]);

  // Datos + filtros memo
  const currentData = useMemo<IArticleSimple[]>(() => {
    const getExpiryDate = (article: IArticleSimple): Date | null => {
      const caducateDate = article.component?.caducate_date || article.consumable?.caducate_date;
      if (!caducateDate) return null;
      const date = caducateDate instanceof Date
        ? caducateDate
        : typeof caducateDate === 'string'
          ? parseISO(caducateDate)
          : null;
      return date && !isNaN(date.getTime()) ? date : null;
    };

    const list = flattenArticles(articles) ?? [];

    const q = partNumberSearch.trim().toLowerCase();
    const bySearch = q
      ? list.filter(
          (a) =>
            a.part_number?.toLowerCase().includes(q) ||
            (Array.isArray(a.alternative_part_number) &&
              a.alternative_part_number.some((alt) => alt?.toLowerCase().includes(q))),
        )
      : list;

    let filtered = bySearch;

    if (activeCategory !== 'all') {
      if ((activeCategory === 'COMPONENT' || activeCategory === 'PART') && componentCondition !== 'all') {
        filtered = filtered.filter((a) => a.condition === componentCondition);
      }
      if (activeCategory === 'CONSUMABLE' && consumableFilter === 'QUIMICOS') {
        filtered = filtered.filter((a: any) => a.is_hazardous === true);
      }
    }

    if (activeCategory === 'COMPONENT' || activeCategory === 'PART' || activeCategory === 'CONSUMABLE' || activeCategory === 'all') {
      return filtered.sort((a, b) => {
        const dateA = getExpiryDate(a);
        const dateB = getExpiryDate(b);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.getTime() - dateB.getTime();
      });
    }

    return filtered;
  }, [articles, partNumberSearch, activeCategory, componentCondition, consumableFilter]);

  const handleClearSearch = () => setPartNumberSearch('');

  return (
    <ContentLayout title="Gestión de Inventario">
      <TooltipProvider>
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
                <BreadcrumbPage>Gestión de Inventario</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Gestión de Inventario</h1>
            <p className="text-sm text-muted-foreground italic">
              Visualiza todos los artículos del inventario organizados por tipo
            </p>
          </div>

          {/* Búsqueda */}
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
                • {currentData.length} resultado(s)
              </p>
            )}
          </div>

          {/* Tabs principales */}

          <Tabs defaultValue="aeronautic" className="w-full">
            <TabsList className='w-full'>
              <TabsTrigger value="aeronautic">Aeronáutico</TabsTrigger>
              <TabsTrigger value="general">General/Ferretería</TabsTrigger>
            </TabsList>
            <TabsContent value="aeronautic">
              <Tabs
                value={activeCategory}
                onValueChange={(v) => setActiveCategory(v as Category)}
              >
                <TabsList className="flex justify-center mb-4 space-x-3" aria-label="Categorías">
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
                        {!common ? 'Selecciona una categoría específica' : 'Descargar PDF'} <TooltipArrow />
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
                        {!common ? 'Selecciona una categoría específica' : 'Descargar Excel'} <TooltipArrow />
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TabsList>

                {/* Sub-tabs por categoría */}
                <TabsContent value="all">
                  {isLoadingArticles ? (
                    <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                      <Loader2 className="size-24 animate-spin" />
                    </div>
                  ) : (
                    <DataTable columns={cols} data={currentData} />
                  )}
                </TabsContent>

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

                  {isLoadingArticles ? (
                    <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                      <Loader2 className="size-24 animate-spin" />
                    </div>
                  ) : (
                    <DataTable columns={cols} data={currentData} />
                  )}
                </TabsContent>

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

                  {isLoadingArticles ? (
                    <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                      <Loader2 className="size-24 animate-spin" />
                    </div>
                  ) : (
                    <DataTable columns={cols} data={currentData} />
                  )}
                </TabsContent>

                <TabsContent value="TOOL">
                  {isLoadingArticles ? (
                    <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                      <Loader2 className="size-24 animate-spin" />
                    </div>
                  ) : (
                    <DataTable columns={cols} data={currentData} />
                  )}
                </TabsContent>
                <TabsContent value="PART">
                  {isLoadingArticles ? (
                    <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                      <Loader2 className="size-24 animate-spin" />
                    </div>
                  ) : (
                    <DataTable columns={cols} data={currentData} />
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
                articlesGeneral && <DataTable columns={GeneralColums} data={articlesGeneral} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </ContentLayout>
  );
};

export default InventarioArticulosPage;
