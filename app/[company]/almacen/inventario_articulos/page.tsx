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
import { Loader2, Package2, PaintBucket, Wrench, X, Layers, Hash } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { RiFileExcel2Fill } from 'react-icons/ri';
import { DataTable } from './data-table';
import { getGroupColumns } from './columns';
import { useGetArticlesByPartNumber, GroupedArticle, GroupBy } from '@/hooks/mantenimiento/almacen/renglones/useGetArticlesByPartNumber';
import { useSearchBatchesWithArticles } from '@/hooks/mantenimiento/almacen/renglones/useSearchBatchesWithArticles';
import { useInventoryExport } from '@/hooks/mantenimiento/almacen/reportes/useGetWarehouseReports';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import ArticleDropdownActions from '@/components/dropdowns/mantenimiento/almacen/ArticleDropdownActions';
import CertificatesPopover from '@/components/popovers/CertificatesPopover';
import { format, parseISO } from 'date-fns';

type Category = 'all' | 'COMPONENTE' | 'CONSUMIBLE' | 'HERRAMIENTA';

// Helper para parsear fechas
const parseDateLocal = (dateString: string): Date => {
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return parseISO(dateString);
};

// Helper para badge de estado
const getStatusBadge = (status: string | null | undefined) => {
  if (!status) return <Badge variant="outline">N/A</Badge>;
  
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "warning" }> = {
    stored: { label: "En Stock", variant: "default" },
    checking: { label: "En Revisión", variant: "warning" },
    dispatched: { label: "Despachado", variant: "secondary" },
  };
  
  const c = config[status.toLowerCase()] || { label: status, variant: "outline" };
  return <Badge variant={c.variant}>{c.label}</Badge>;
};

const InventarioArticulosPage = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const { exporting, exportPdf, exportExcel } = useInventoryExport();
  const [currentPage, setCurrentPage] = useState(1);
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
  const [groupBy, setGroupBy] = useState<GroupBy>('part_number');

  // Determinar si estamos buscando
  const isSearching = partNumberSearch.trim().length > 0;

  // Fetch paginado - Para cuando NO hay búsqueda
  const { data: paginatedData, isLoading: isLoadingPaginated } = useGetArticlesByPartNumber(
    selectedCompany?.slug,
    selectedStation?.toString() ?? undefined,
    currentPage,
    groupBy
  );

  // Fetch de búsqueda - Para cuando SÍ hay búsqueda
  const { data: searchResults, isLoading: isLoadingSearch } = useSearchBatchesWithArticles(
    selectedCompany?.slug,
    selectedStation?.toString() ?? undefined,
    partNumberSearch.trim() || undefined
  );

  // Transformar resultados de búsqueda al formato GroupedArticle
  const transformedSearchResults = useMemo((): GroupedArticle[] => {
    if (!searchResults) return [];
    
    return searchResults.map(batchData => ({
      part_number: batchData.articles[0]?.part_number || '',
      name: batchData.batch.name,
      category: batchData.batch.category,
      unit: batchData.batch.medition_unit ? {
        id: 0,
        value: batchData.batch.medition_unit,
        label: batchData.batch.medition_unit,
        registered_by: '',
        updated_by: '',
        created_at: new Date(),
        updated_at: new Date()
      } : null,
      articles: batchData.articles.map(article => ({
        id: article.id,
        part_number: article.part_number,
        alternative_part_number: article.alternative_part_number || [],
        serial: article.serial || '',
        lot_number: '',
        cost: article.cost ?? undefined,
        description: article.description || '',
        zone: article.zone,
        status: article.status,
        condition: {
          id: 0,
          name: article.condition,
          description: '',
          registered_by: '',
          updated_by: ''
        },
        quantity: article.quantity,
        unit: article.unit_secondary ? {
          id: 0,
          value: article.unit_secondary,
          label: article.unit_secondary,
          registered_by: '',
          updated_by: '',
          created_at: new Date(),
          updated_at: new Date()
        } : undefined,
        has_documentation: article.certificates && article.certificates.length > 0 || false,
        certificates: article.certificates || [],
        article_type: article.article_type || batchData.batch.category.toLowerCase(),
        caducate_date: article.component?.shell_time?.caducate_date || article.consumable?.caducate_date || null,
        tool: article.tool ? {
          needs_calibration: false,
          status: article.status
        } : undefined,
        component: article.component ? {
          shell_time: {
            caducate_date: article.component.shell_time?.caducate_date || null,
            fabrication_date: article.component.shell_time?.fabrication_date || null
          }
        } : undefined,
        consumable: article.consumable ? {
          shell_time: {
            caducate_date: article.consumable.caducate_date || null,
            fabrication_date: article.consumable.fabrication_date || null
          },
          unit: article.unit_secondary ? {
            id: 0,
            value: article.unit_secondary,
            label: article.unit_secondary,
            registered_by: '',
            updated_by: '',
            created_at: new Date(),
            updated_at: new Date()
          } : undefined
        } : undefined
      }))
    }));
  }, [searchResults]);

  // Decidir qué datos mostrar
  const displayData = isSearching ? transformedSearchResults : (paginatedData?.data ?? []);
  const isLoadingArticles = isSearching ? isLoadingSearch : isLoadingPaginated;

  // Filtrar por categoría
  const filteredData = useMemo(() => {
    let data = displayData;
    
    // Filtrar por categoría
    if (activeCategory !== 'all') {
      data = data.filter(g => g.category === activeCategory);
    }
    
    // Filtrar artículos dentro de cada grupo según condiciones
    return data.map(group => {
      let articles = group.articles;

      // Filtro de condición para componentes
      if (group.category === 'COMPONENTE' && componentCondition && componentCondition !== 'all') {
        articles = articles.filter(a => a.condition?.name === componentCondition);
      }

      return {
        ...group,
        articles
      };
    }).filter(group => group.articles.length > 0);
  }, [displayData, activeCategory, componentCondition]);

  // Preparar parámetros de exportación
  const common = useMemo(() => {
    if (activeCategory === 'all') return null;
    return {
      category: activeCategory as 'COMPONENTE' | 'CONSUMIBLE' | 'HERRAMIENTA',
      search: partNumberSearch,
      filters:
        activeCategory === 'COMPONENTE'
          ? { condition: componentCondition }
          : activeCategory === 'CONSUMIBLE'
            ? { group: consumableFilter }
            : {},
      filenamePrefix: 'inventario',
    };
  }, [activeCategory, partNumberSearch, componentCondition, consumableFilter]);

  // Navegación a detalle
  const handleNavigateToDetail = useCallback((group: GroupedArticle) => {
    if (!selectedCompany?.slug) return;
    
    if (groupBy === 'batch_id' && group.batch_id) {
      // Navegar usando batch_id
      router.push(`/${selectedCompany.slug}/almacen/inventario_articulos/batch/${group.batch_id}`);
    } else if (groupBy === 'part_number' && group.part_number) {
      // Navegar usando part_number
      router.push(`/${selectedCompany.slug}/almacen/inventario_articulos/${encodeURIComponent(group.part_number)}`);
    }
  }, [groupBy, selectedCompany?.slug, router]);

  // Columnas para la tabla de grupos
  const groupColumns = useMemo(
    () => getGroupColumns(groupBy, handleNavigateToDetail),
    [groupBy, handleNavigateToDetail]
  );

  // Componente para renderizar el contenido expandido (sub-tabla de artículos)
  const renderSubComponent = useCallback(({ row }: { row: any }) => {
    const group = row.original as GroupedArticle;
    const articles = group.articles;

    if (!articles || articles.length === 0) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          No hay artículos en este grupo
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {groupBy === 'batch_id' && (
                  <TableHead className="text-center">Nro. Parte</TableHead>
                )}
                <TableHead className="text-center">Serial / Lote</TableHead>
                <TableHead className="text-center">Ubicación</TableHead>
                <TableHead className="text-center">Condición</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Descripción</TableHead>
                <TableHead className="text-center">Fecha Caducidad</TableHead>
                <TableHead className="text-center">Documentación</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => {
                const caducateDate = article.caducate_date;
                let dateDisplay = <span className="text-muted-foreground italic text-xs">N/A</span>;
                
                if (caducateDate) {
                  const date = parseDateLocal(caducateDate);
                  if (!isNaN(date.getTime())) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const dateClone = new Date(date);
                    dateClone.setHours(0, 0, 0, 0);
                    const daysUntilExpiry = Math.ceil(
                      (dateClone.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    
                    let variant: "default" | "secondary" | "destructive" = "default";
                    if (daysUntilExpiry < 0) variant = "destructive";
                    else if (daysUntilExpiry <= 30) variant = "secondary";
                    
                    dateDisplay = (
                      <Badge variant={variant} className="text-xs">
                        {format(date, "dd/MM/yyyy")}
                      </Badge>
                    );
                  }
                }

                return (
                  <TableRow key={article.id} className="hover:bg-muted/30">
                    {groupBy === 'batch_id' && (
                      <TableCell className="text-center font-semibold text-primary">
                        {article.part_number}
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      <div>
                        <div className="font-medium text-sm">
                          {article.serial || 'N/A'}
                        </div>
                        {article.lot_number && (
                          <div className="text-xs text-muted-foreground">
                            Lote: {article.lot_number}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {article.zone || 'Sin asignar'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        {article.condition?.name || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={article.quantity > 5 ? "default" : article.quantity > 0 ? "secondary" : "destructive"}
                        className="text-sm font-bold"
                      >
                        {article.quantity} {article.unit?.value || 'u'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(article.status)}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground max-w-[200px] truncate">
                      {article.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {dateDisplay}
                    </TableCell>
                    <TableCell className="text-center">
                      <CertificatesPopover
                        hasDocumentation={article.has_documentation ?? false}
                        certificates={article.certificates?.filter((cert): cert is string => cert !== null) ?? []}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {(article.status === "stored" || article.status === "checking") && (
                        <ArticleDropdownActions id={article.id} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }, [groupBy]);

  // Reset subfiltros al cambiar categoría y reset página al cambiar filtros
  useEffect(() => {
    if (activeCategory !== 'COMPONENTE') setComponentCondition('all');
    if (activeCategory !== 'CONSUMIBLE') setConsumableFilter('all');
    setCurrentPage(1);
  }, [activeCategory, componentCondition, consumableFilter, partNumberSearch, groupBy]);

  // Contenido de la tabla
  const TableContent = () => {
    if (isLoadingArticles) {
      return (
        <div className="flex w-full h-full justify-center items-center min-h-[300px]">
          <Loader2 className="size-24 animate-spin" />
        </div>
      );
    }

    if (filteredData.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Package2 className="size-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No se encontraron artículos</p>
          <p className="text-sm">Intenta cambiar los filtros o la búsqueda</p>
        </div>
      );
    }

    return (
      <DataTable
        columns={groupColumns}
        data={filteredData}
        renderSubComponent={renderSubComponent}
        getRowCanExpand={() => true}
        showPagination={false}
        initialPageSize={50}
      />
    );
  };

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

          {/* Búsqueda y Toggle de Agrupación */}
          <div className="space-y-4">
            {/* Campo de búsqueda */}
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
                    onClick={() => setPartNumberSearch('')}
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
                  </span>
                </p>
              )}
            </div>

            {/* Toggle de Agrupación */}
            <div className="flex justify-center gap-2">
              <Button
                variant={groupBy === 'part_number' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGroupBy('part_number')}
                className="gap-2"
              >
                <Hash className="size-4" />
                Por Número de Parte
              </Button>
              <Button
                variant={groupBy === 'batch_id' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGroupBy('batch_id')}
                className="gap-2"
              >
                <Layers className="size-4" />
                Por Renglón
              </Button>
            </div>
          </div>

          {/* Tabs principales */}
          <Tabs
            value={activeCategory}
            onValueChange={(v) => setActiveCategory(v as Category)}
          >
            <TabsList className="flex justify-center mb-4 space-x-3" aria-label="Categorías">
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

            {/* Contenido de tabs */}
            <TabsContent value="all" className="mt-6">
              <TableContent />
            </TabsContent>

            <TabsContent value="COMPONENTE" className="mt-6">
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
              <TableContent />
            </TabsContent>

            <TabsContent value="CONSUMIBLE" className="mt-6">
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
              <TableContent />
            </TabsContent>

            <TabsContent value="HERRAMIENTA" className="mt-6">
              <TableContent />
            </TabsContent>
          </Tabs>

          {/* Controles de paginación - Solo mostrar cuando NO hay búsqueda */}
          {!isSearching && paginatedData && paginatedData.total > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {paginatedData.from} a {paginatedData.to} de {paginatedData.total} grupos de artículos
              </p>
              
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!paginatedData.prev_page_url || isLoadingArticles}
                >
                  Anterior
                </Button>
                
                <span className="text-sm px-3">
                  Página {paginatedData.current_page} de {paginatedData.last_page}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!paginatedData.next_page_url || isLoadingArticles}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>
    </ContentLayout>
  );
};

export default InventarioArticulosPage;
