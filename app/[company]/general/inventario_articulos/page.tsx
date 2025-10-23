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
import { getColumnsForArticleType, flattenArticles, IArticleSimple } from './columns';
import { DataTable } from './data-table';
import { useGetWarehouseArticlesByCategory } from '@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory';

type ArticleType = 'COMPONENTE' | 'CONSUMIBLE' | 'HERRAMIENTA';

const ARTICLE_TABS = [
  { value: 'COMPONENTE' as ArticleType, icon: Box, label: 'Componentes' },
  { value: 'CONSUMIBLE' as ArticleType, icon: Package, label: 'Consumibles' },
  { value: 'HERRAMIENTA' as ArticleType, icon: Wrench, label: 'Herramientas' },
];

/**
 * Página principal de Inventario General
 * Responsabilidades:
 * - Gestión de tabs (Componentes, Consumibles, Herramientas)
 * - Fetching de datos por categoría
 * - Composición del layout principal
 */
const InventarioArticulosPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [activeTab, setActiveTab] = useState<ArticleType>('COMPONENTE');
  const [partNumberSearch, setPartNumberSearch] = useState('');

  // ============================================
  // DATA FETCHING
  // ============================================
  const { data: articlesData, isLoading } = useGetWarehouseArticlesByCategory(
    1, 
    1000, 
    activeTab,
    true
  );

  // ============================================
  // COMPUTED VALUES
  // ============================================
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

  // ============================================
  // RENDER
  // ============================================
  return (
    <ContentLayout title='Inventario'>
      <div className='flex flex-col gap-y-4'>
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
          <h1 className='text-4xl font-bold'>Inventario General</h1>
          <p className='text-sm text-muted-foreground italic'>
            Visualiza todos los artículos del inventario organizados por tipo
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

        {/* Tabs */}
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

export default InventarioArticulosPage;
