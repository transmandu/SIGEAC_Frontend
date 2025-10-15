'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCompanyStore } from '@/stores/CompanyStore';
import { Loader2, Package, Wrench, Box, X } from 'lucide-react';
import { useState } from 'react';
import { getColumnsForArticleType, IArticleSimple } from './columns';
import { DataTable } from './data-table';
import { useGetWarehouseArticlesByCategory } from '@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory';

type ArticleType = 'COMPONENTE' | 'CONSUMIBLE' | 'HERRAMIENTA';

const ARTICLE_TABS = [
  { value: 'COMPONENTE' as ArticleType, icon: Box, label: 'Componentes' },
  { value: 'CONSUMIBLE' as ArticleType, icon: Package, label: 'Consumibles' },
  { value: 'HERRAMIENTA' as ArticleType, icon: Wrench, label: 'Herramientas' },
];

const InventarioArticulosAlmacenPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [activeTab, setActiveTab] = useState<ArticleType>('COMPONENTE');
  const [partNumberSearch, setPartNumberSearch] = useState('');

  const { data: articlesData, isLoading } = useGetWarehouseArticlesByCategory(
    1, 
    1000, 
    activeTab,
    true
  );

  // Aplanar los artículos de todos los batches
  const flattenArticles = (data: typeof articlesData): IArticleSimple[] => {
    if (!data?.batches) return [];
    
    return data.batches
      .flatMap(batch => 
        batch.articles.map(article => ({
          id: article.id,
          part_number: article.part_number,
          alternative_part_number: article.alternative_part_number,
          serial: article.serial,
          description: article.description,
          zone: article.zone,
          // Si quantity es 0 o null/undefined, mostrar 1 (para componentes y herramientas)
          quantity: (article.quantity === 0 || article.quantity === null || article.quantity === undefined) ? 1 : article.quantity,
          status: article.status,
          article_type: article.article_type,
          batch_name: batch.name,
          batch_id: batch.batch_id,
        }))
      );
  };

  const getCurrentData = (): IArticleSimple[] => {
    const articles = flattenArticles(articlesData);

    // Filtrar por part number si hay búsqueda
    if (partNumberSearch.trim()) {
      return articles.filter(article => 
        article.part_number.toLowerCase().includes(partNumberSearch.toLowerCase())
      );
    }
    
    return articles;
  };

  const handleClearSearch = () => {
    setPartNumberSearch('');
  };


  return (
    <ContentLayout title='Gestión de Inventario'>
      <div className='flex flex-col gap-y-4'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Almacén</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Gestión de Inventario</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="text-center space-y-2">
          <h1 className='text-4xl font-bold'>Gestión de Inventario</h1>
          <p className='text-sm text-muted-foreground italic'>
            Administra y visualiza todos los artículos del almacén organizados por tipo
          </p>
        </div>

        {/* Búsqueda General */}
        <div className="space-y-2">
          <div className="relative max-w-2xl mx-auto">
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
              Filtrando por: <span className="font-medium text-foreground">{partNumberSearch}</span>
              {' '}• {getCurrentData().length} resultado(s)
            </p>
          )}
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as ArticleType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 h-auto">
            {ARTICLE_TABS.map(({ value, icon: Icon, label }) => (
              <TabsTrigger 
                key={value}
                value={value} 
                className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-5 w-5" />
                <span className="font-semibold">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          {ARTICLE_TABS.map(({ value }) => (
            <TabsContent key={value} value={value} className="mt-6">
              {isLoading ? (
                <div className='flex w-full h-full justify-center items-center min-h-[300px]'>
                  <Loader2 className='size-24 animate-spin' />
                </div>
              ) : (
                <DataTable columns={getColumnsForArticleType(activeTab)} data={getCurrentData()} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ContentLayout>
  )
}

export default InventarioArticulosAlmacenPage;
