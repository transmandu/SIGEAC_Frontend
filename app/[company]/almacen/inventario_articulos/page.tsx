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
import { useCompanyStore } from '@/stores/CompanyStore';
import { TooltipArrow } from '@radix-ui/react-tooltip';
import { Loader2, Package2, PaintBucket, Wrench, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { RiFileExcel2Fill } from 'react-icons/ri';
import { toast } from 'sonner';
import { flattenArticles, getColumnsByCategory, IArticleSimple, allCategoriesCols } from './columns';
import { DataTable } from './data-table';
import { useGetWarehouseArticlesByCategory } from '@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory';
import { useInventoryExport } from '@/hooks/mantenimiento/almacen/reportes/useGetWarehouseReports';

const EXPORT_PDF_ENDPOINT = '/api/inventory/export/pdf';
const EXPORT_XLSX_ENDPOINT = '/api/inventory/export/excel';

type Category = 'all' | 'COMPONENTE' | 'CONSUMIBLE' | 'HERRAMIENTA';

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

  // Fetch - Obtener datos de todas las categorías
  const { data: componentArticles, isLoading: isLoadingComponents } = useGetWarehouseArticlesByCategory(
    1,
    1000,
    'COMPONENTE',
    activeCategory === 'all' || activeCategory === 'COMPONENTE',
  );

  const { data: consumableArticles, isLoading: isLoadingConsumables } = useGetWarehouseArticlesByCategory(
    1,
    1000,
    'CONSUMIBLE',
    activeCategory === 'all' || activeCategory === 'CONSUMIBLE',
  );

  const { data: toolArticles, isLoading: isLoadingTools } = useGetWarehouseArticlesByCategory(
    1,
    1000,
    'HERRAMIENTA',
    activeCategory === 'all' || activeCategory === 'HERRAMIENTA',
  );

  const isLoadingArticles = isLoadingComponents || isLoadingConsumables || isLoadingTools;

  // Combinar los datos según la categoría activa
  const articles = activeCategory === 'all' 
    ? {
        batches: [
          ...(componentArticles?.batches || []),
          ...(consumableArticles?.batches || []),
          ...(toolArticles?.batches || []),
        ],
        pagination: {
          current_page: 1,
          total: (componentArticles?.batches.length || 0) + 
                 (consumableArticles?.batches.length || 0) + 
                 (toolArticles?.batches.length || 0),
          per_page: 1000,
          last_page: 1,
          from: 1,
          to: (componentArticles?.batches.length || 0) + 
               (consumableArticles?.batches.length || 0) + 
               (toolArticles?.batches.length || 0),
        }
      }
    : activeCategory === 'COMPONENTE' 
      ? componentArticles
      : activeCategory === 'CONSUMIBLE'
        ? consumableArticles
        : toolArticles;

  // Preparar parámetros de exportación (solo válido cuando no es 'all')
  const common = activeCategory !== 'all' ? {
    category: activeCategory as 'COMPONENTE' | 'CONSUMIBLE' | 'HERRAMIENTA',
    search: partNumberSearch,
    filters:
      activeCategory === 'COMPONENTE'
        ? { condition: componentCondition }
        : activeCategory === 'CONSUMIBLE'
          ? { group: consumableFilter }
          : {},
    filenamePrefix: 'inventario',
  } : null;

  // Reset subfiltros al cambiar categoría
  useEffect(() => {
    if (activeCategory !== 'COMPONENTE') setComponentCondition('all');
    if (activeCategory !== 'CONSUMIBLE') setConsumableFilter('all');
  }, [activeCategory]);

  // Columns memo
  const cols = useMemo(() => {
    // Para "Todos", usar columnas que incluyen campos de calibración
    if (activeCategory === 'all') {
      return allCategoriesCols; // Columnas base + fecha de calibración + próxima calibración
    }
    return getColumnsByCategory(activeCategory);
  }, [activeCategory]);

  // Datos + filtros memo
  const currentData = useMemo<IArticleSimple[]>(() => {
    // Función para obtener la fecha de vencimiento de un artículo
    const getExpiryDate = (article: IArticleSimple): Date | null => {
      const caducateDate = article.component?.caducate_date || article.consumable?.caducate_date;
      if (!caducateDate) return null;
      
      const date = caducateDate instanceof Date 
        ? caducateDate 
        : typeof caducateDate === 'string' 
          ? new Date(caducateDate)
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

    // Solo aplicar filtros específicos cuando no estamos en "Todos"
    if (activeCategory !== 'all') {
      if (activeCategory === 'COMPONENTE' && componentCondition !== 'all') {
        filtered = filtered.filter((a) => a.condition === componentCondition);
      }

      if (activeCategory === 'CONSUMIBLE' && consumableFilter === 'QUIMICOS') {
        filtered = filtered.filter((a: any) => a.is_hazardous === true);
      }
    }

    // Ordenar por fecha de vencimiento más próxima (solo para componentes y consumibles)
    if (activeCategory === 'COMPONENTE' || activeCategory === 'CONSUMIBLE' || activeCategory === 'all') {
      return filtered.sort((a, b) => {
        const dateA = getExpiryDate(a);
        const dateB = getExpiryDate(b);
        
        // Los que no tienen fecha van al final
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        // Ordenar por fecha más próxima primero
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
          <Tabs
            value={activeCategory}
            onValueChange={(v) => setActiveCategory(v as Category)}
          >
            <TabsList
              className="flex justify-center mb-4 space-x-3"
              aria-label="Categorías"
            >
              <TabsTrigger className="flex gap-2" value="all">
                <Package2 className="size-5" /> Todos
              </TabsTrigger>
              <TabsTrigger className="flex gap-2" value="COMPONENTE">
                <Package2 className="size-5" /> Componente
              </TabsTrigger>
              <TabsTrigger className="flex gap-2" value="CONSUMIBLE">
                <PaintBucket className="size-5" /> Consumibles
              </TabsTrigger>
              <TabsTrigger className="flex gap-2" value="HERRAMIENTA">
                <Wrench className="size-5" /> Herramientas
              </TabsTrigger>

              <CreateBatchDialog />

              <div className="flex gap-4 items-center">
                {/* PDF */}
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        if (common) exportPdf(common);
                      }}
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
                      onClick={() => {
                        if (common) exportExcel(common);
                      }}
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
            <TabsContent value="all" className="mt-6">
              {isLoadingArticles ? (
                <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                  <Loader2 className="size-24 animate-spin" />
                </div>
              ) : (
                <DataTable columns={cols} data={currentData} />
              )}
            </TabsContent>

            <TabsContent value="COMPONENTE" className="mt-6">
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
                  <TabsTrigger value="REPARADO">Reparados</TabsTrigger>
                  <TabsTrigger value="REMOVIDO - NO SERVICIABLE">
                    Removidos - No Serviciables
                  </TabsTrigger>
                  <TabsTrigger value="REMOVIDO - CUSTODIA">
                    Removidos - En custodia
                  </TabsTrigger>
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

            <TabsContent value="CONSUMIBLE" className="mt-6">
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

              {isLoadingArticles ? (
                <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                  <Loader2 className="size-24 animate-spin" />
                </div>
              ) : (
                <DataTable columns={cols} data={currentData} />
              )}
            </TabsContent>

            <TabsContent value="HERRAMIENTA" className="mt-6">
              {isLoadingArticles ? (
                <div className="flex w-full h-full justify-center items-center min-h-[300px]">
                  <Loader2 className="size-24 animate-spin" />
                </div>
              ) : (
                <DataTable columns={cols} data={currentData} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </ContentLayout>
  );
};

export default InventarioArticulosPage;
