'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllWarehouseArticles } from '@/hooks/mantenimiento/almacen/articulos/useGetAllWarehouseArticles';
import { useUpdateArticleQuantities } from '@/actions/mantenimiento/almacen/articulos/useUpdateArticleQuantities';
import { ArticleRow, type Article } from './_components/ArticleRow';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Loader2, Save, Package, Filter, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const GestionCantidadesPage = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // Estados para filtros
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [partNumberFilter, setPartNumberFilter] = useState<string>('');
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);

  // Obtener todos los batches con artículos
  const { data: batches, isLoading, isError } = useGetAllWarehouseArticles(selectedCompany?.slug, selectedStation!);

  // Obtener zonas únicas para el filtro
  const availableZones = useMemo(() => {
    if (!batches) return [];
    const zones: string[] = [];
    batches.forEach(batch => {
      batch.articles.forEach(article => {
        if (!zones.includes(article.zone)) {
          zones.push(article.zone);
        }
      });
    });
    return zones.sort();
  }, [batches]);

  // Filtrar batches según los filtros aplicados
  const filteredBatches = useMemo(() => {
    if (!batches) return [];
    
    return batches.map(batch => ({
      ...batch,
      articles: batch.articles.filter(article => {
        // Filtro por zona
        const zoneMatch = selectedZone === 'all' || article.zone === selectedZone;
        
        // Filtro por número de parte (búsqueda parcial, case insensitive)
        const partNumberMatch = partNumberFilter === '' || 
          article.part_number.toLowerCase().includes(partNumberFilter.toLowerCase());
        
        return zoneMatch && partNumberMatch;
      })
    })).filter(batch => batch.articles.length > 0); // Solo mostrar batches que tienen artículos después del filtro
  }, [batches, selectedZone, partNumberFilter]);

  const { updateQuantities } = useUpdateArticleQuantities();

  // Initialize quantities when articles are loaded
  useEffect(() => {
    if (batches) {
      const initialQuantities: Record<number, number> = {};
      batches.forEach(batch => {
        batch.articles.forEach(article => {
          initialQuantities[article.id] = 0; // Inicializar en 0 ya que no hay quantity en la nueva estructura
        });
      });
      setQuantities(initialQuantities);
    }
  }, [batches]);

  const handleQuantityChange = useCallback((articleId: number, newQuantity: string) => {
    const numQuantity = parseFloat(newQuantity) || 0;
    setQuantities(prev => ({
      ...prev,
      [articleId]: numQuantity
    }));
    setHasChanges(true);
  }, []);

    const handleSave = () => {
    // Obtener solo artículos modificados usando la función reutilizable
    const modifiedEntries = getModifiedArticles();
         
    // Validar que hay cambios
    if (modifiedEntries.length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }

    const requestPayload = {
      quantities: modifiedEntries.map(([articleId, quantity]) => ({
        article_id: parseInt(articleId),
        new_quantity: quantity
      })),
      company: selectedCompany!.slug,
      location_id: selectedStation!
    };

    // Enviar al backend
    updateQuantities.mutate(requestPayload);
  };

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setSelectedZone('all');
    setPartNumberFilter('');
  }, []);

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => 
    selectedZone !== 'all' || partNumberFilter !== '', 
    [selectedZone, partNumberFilter]
  );

  // Función para obtener artículos modificados (reutilizable)
  const getModifiedArticles = useCallback(() => {
    return Object.entries(quantities).filter(([, quantity]) => quantity > 0);
  }, [quantities]);

  // Número de artículos modificados
  const modifiedCount = useMemo(() => getModifiedArticles().length, [getModifiedArticles]);

  // Contadores de artículos optimizados
  const articleCounts = useMemo(() => {
    const totalArticles = batches?.reduce((count, batch) => count + batch.articles.length, 0) || 0;
    const filteredArticles = filteredBatches.reduce((count, batch) => count + batch.articles.length, 0);
    return { totalArticles, filteredArticles };
  }, [batches, filteredBatches]);

  // if (isLoading) {
  //   return (
  //     <ContentLayout title='Gestión de Cantidades'>
  //       <div className='flex w-full h-full justify-center items-center'>
  //         <Loader2 className='size-24 animate-spin mt-48' />
  //       </div>
  //     </ContentLayout>
  //   );
  // }

  // if (isError) {
  //   return (
  //     <ContentLayout title='Gestión de Cantidades'>
  //       <div className='text-center py-8'>
  //         <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar los artículos...</p>
  //       </div>
  //     </ContentLayout>
  //   );
  // }

  return (
    <ContentLayout title='Gestión de Cantidades'>
      <div className='flex flex-col gap-4'>
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Almacén</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Inventario</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Gestión de Cantidades</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Filtros */}
        <Card className='mb-4 overflow-hidden'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Filter className='h-5 w-5' />
                Filtros
                {hasActiveFilters && !filtersExpanded && (
                  <div className='flex items-center gap-1 ml-2 transition-all duration-300 ease-in-out'>
                    {selectedZone !== 'all' && (
                      <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs animate-in fade-in-50 slide-in-from-left-2'>
                        {selectedZone}
                      </span>
                    )}
                    {partNumberFilter && (
                      <span className='bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs animate-in fade-in-50 slide-in-from-left-2'>
                        {partNumberFilter}
                      </span>
                    )}
                  </div>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className='flex items-center gap-1 hover:bg-muted/50 transition-all duration-200'
              >
                <span className='transition-all duration-200'>
                  {filtersExpanded ? 'Contraer' : 'Expandir'}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
                  filtersExpanded ? 'rotate-180' : 'rotate-0'
                }`} />
              </Button>
            </div>
            {!filtersExpanded && (
              <div className='text-sm text-muted-foreground mt-2 animate-in fade-in-50 slide-in-from-top-2 duration-300'>
                Mostrando <span className='font-medium text-foreground'>{articleCounts.filteredArticles}</span> de <span className='font-medium text-foreground'>{articleCounts.totalArticles}</span> artículos
                {hasActiveFilters && (
                  <span className='ml-2 text-blue-600'>
                    (filtros aplicados)
                  </span>
                )}
              </div>
            )}
          </CardHeader>
          
          {/* Contenido de filtros con animación personalizada */}
          <div className={`transition-all duration-500 ease-in-out ${
            filtersExpanded 
              ? 'max-h-96 opacity-100 transform translate-y-0' 
              : 'max-h-0 opacity-0 transform -translate-y-4'
          }`}>
            <CardContent className='space-y-3 pt-1'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              {/* Filtro por Zona */}
              <div className={`space-y-2 transition-all duration-300 ease-out ${
                filtersExpanded ? 'animate-in fade-in-50 slide-in-from-bottom-2' : ''
              }`} style={{ animationDelay: '100ms' }}>
                <label className='text-sm font-medium text-muted-foreground'>
                  Zona de Almacén
                </label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger className='transition-all duration-200 hover:border-primary/50'>
                    <SelectValue placeholder="Todas las zonas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las zonas</SelectItem>
                    {availableZones.map(zone => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Número de Parte */}
              <div className={`space-y-2 transition-all duration-300 ease-out ${
                filtersExpanded ? 'animate-in fade-in-50 slide-in-from-bottom-2' : ''
              }`} style={{ animationDelay: '200ms' }}>
                <label className='text-sm font-medium text-muted-foreground'>
                  Número de Parte
                </label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors duration-200' />
                  <Input
                    placeholder='Buscar por número de parte...'
                    value={partNumberFilter}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPartNumberFilter(e.target.value)}
                    className='pl-10 transition-all duration-200 hover:border-primary/50 focus:border-primary'
                  />
                </div>
              </div>

              {/* Botón Limpiar Filtros */}
              <div className={`space-y-2 transition-all duration-300 ease-out ${
                filtersExpanded ? 'animate-in fade-in-50 slide-in-from-bottom-2' : ''
              }`} style={{ animationDelay: '300ms' }}>
                <label className='text-sm font-medium text-muted-foreground'>
                  Acciones
                </label>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className='w-full flex items-center gap-2 transition-all duration-200 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <X className='h-4 w-4 transition-transform duration-200 group-hover:rotate-90' />
                  Limpiar Filtros
                </Button>
              </div>
            </div>

            {/* Resumen de filtros */}
            <div className={`flex items-center justify-between pt-2 border-t transition-all duration-300 ease-out ${
              filtersExpanded ? 'animate-in fade-in-50 slide-in-from-bottom-2' : ''
            }`} style={{ animationDelay: '400ms' }}>
              <div className='text-sm text-muted-foreground'>
                Mostrando <span className='font-medium text-foreground transition-all duration-200'>{articleCounts.filteredArticles}</span> de <span className='font-medium text-foreground'>{articleCounts.totalArticles}</span> artículos
                {hasActiveFilters && (
                  <span className='ml-2 text-blue-600 animate-in fade-in-50 duration-300'>
                    (filtros aplicados)
                  </span>
                )}
              </div>
              {hasActiveFilters && (
                <div className='flex items-center gap-2 text-sm'>
                  {selectedZone !== 'all' && (
                    <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs transition-all duration-200 hover:bg-blue-200 animate-in fade-in-50 slide-in-from-right-2'>
                      Zona: {selectedZone}
                    </span>
                  )}
                  {partNumberFilter && (
                    <span className='bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs transition-all duration-200 hover:bg-green-200 animate-in fade-in-50 slide-in-from-right-2'>
                      Parte: {partNumberFilter}
                    </span>
                  )}
                </div>
              )}
            </div>
            </CardContent>
          </div>
        </Card>

        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold flex items-center gap-2'>
              <Package className='h-8 w-8' />
              Gestión de Cantidades
            </h1>
            <p className='text-sm text-muted-foreground mt-2'>
              Actualiza las cantidades de todos los artículos en el almacén
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className='flex items-center gap-2'
          >
            <Save className='h-4 w-4' />
            Guardar Cambios
            {hasChanges && modifiedCount > 0 && (
              <span className='ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
                {modifiedCount}
              </span>
            )}
          </Button>
        </div>

        {/* Articles by Batch */}
        {filteredBatches.map((batch) => (
          <Card key={batch.batch_id} className='mb-5'>
            <CardHeader className='pb-2 pt-2.5'>
              <CardTitle className='text-lg'>{batch.name}</CardTitle>
              <CardDescription className='text-sm'>
                {batch.articles.length} artículo{batch.articles.length !== 1 ? 's' : ''} en este batch • {batch.medition_unit}
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-1'>
              <div className='space-y-3'>
                {batch.articles.map((article) => (
                  <ArticleRow
                    key={article.id}
                    article={article}
                    quantity={quantities[article.id] || 0}
                    onQuantityChange={handleQuantityChange}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {filteredBatches && filteredBatches.length === 0 && (
          <Card>
            <CardContent className='text-center py-8'>
              <Package className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              {hasActiveFilters ? (
                <>
                  <h3 className='text-lg font-medium mb-2'>No se encontraron artículos</h3>
                  <p className='text-sm text-muted-foreground mb-4'>
                    No hay artículos que coincidan con los filtros aplicados.
                  </p>
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    Limpiar filtros
                  </Button>
                </>
              ) : (
                <>
                  <h3 className='text-lg font-medium mb-2'>No hay artículos en el almacén</h3>
                  <p className='text-sm text-muted-foreground'>
                    No se encontraron artículos para mostrar en el inventario.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ContentLayout>
  );
};

export default GestionCantidadesPage;
