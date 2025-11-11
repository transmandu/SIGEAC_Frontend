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
import { flattenArticles, getColumnsByCategory, IArticleSimple } from './columns';
import { DataTable } from './data-table';
import { useGetWarehouseArticlesByCategory } from '@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory';
import { useInventoryExport } from '@/hooks/mantenimiento/almacen/reportes/useGetWarehouseReports';
type Category = 'COMPONENTE' | 'CONSUMIBLE' | 'HERRAMIENTA';

const InventarioArticulosPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [activeCategory, setActiveCategory] = useState<Category>('COMPONENTE');
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

  // Fetch
  const { data: articles, isLoading: isLoadingArticles } = useGetWarehouseArticlesByCategory(
    1,
    1000,
    activeCategory,
    true,
    "checking"
  );

  const common = {
    category: activeCategory,
    search: partNumberSearch,
    filters:
      activeCategory === 'COMPONENTE'
        ? { condition: componentCondition }
        : activeCategory === 'CONSUMIBLE'
          ? { group: consumableFilter }
          : {},
    filenamePrefix: 'inventario',
  };

  // Reset subfiltros al cambiar categoría
  useEffect(() => {
    if (activeCategory !== 'COMPONENTE') setComponentCondition('all');
    if (activeCategory !== 'CONSUMIBLE') setConsumableFilter('all');
  }, [activeCategory]);

  // Columns memo
  const cols = useMemo(() => getColumnsByCategory(activeCategory), [activeCategory]);

  // Datos + filtros memo
  const currentData = useMemo<IArticleSimple[]>(() => {
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

    if (activeCategory === 'COMPONENTE' && componentCondition !== 'all') {
      return bySearch.filter((a) => a.condition === componentCondition);
    }

    if (activeCategory === 'CONSUMIBLE' && consumableFilter === 'QUIMICOS') {
      return bySearch.filter((a: any) => a.is_hazardous === true);
    }

    return bySearch;
  }, [articles, partNumberSearch, activeCategory, componentCondition, consumableFilter]);

  const handleClearSearch = () => setPartNumberSearch('');

  return (
    <ContentLayout title="Inventario">
      <TooltipProvider>
        <div className="flex flex-col gap-y-4">
          {/* Breadcrumbs */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Inventario General</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Inventario Registrado</h1>
            <p className="text-sm text-muted-foreground italic">
              Visualiza los articulos registrados para su verificación y posterior registro a almacén.
            </p>
          </div>

          {/* Tabs principales */}
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as Category)}>
            <TabsList className="flex justify-center mb-4 space-x-3" aria-label="Categorías">
              <TabsTrigger className="flex gap-2" value="COMPONENTE">
                <Package2 className="size-5" /> Componente
              </TabsTrigger>
              <TabsTrigger className="flex gap-2" value="CONSUMIBLE">
                <PaintBucket className="size-5" /> Consumibles
              </TabsTrigger>
              <TabsTrigger className="flex gap-2" value="HERRAMIENTA">
                <Wrench className="size-5" /> Herramientas
              </TabsTrigger>
            </TabsList>

            {/* Sub-tabs por categoría */}
            <TabsContent value={activeCategory} className="mt-6">
              {activeCategory === 'COMPONENTE' && (
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
              )}

              {activeCategory === 'CONSUMIBLE' && (
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
              )}

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
