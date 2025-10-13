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
import { useCompanyStore } from '@/stores/CompanyStore';
import { Loader2, Package, Wrench, Box } from 'lucide-react';
import { useState } from 'react';
import { columns, flattenArticles } from './columns';
import { DataTable } from './data-table';
import { useGetWarehouseConsumableArticles } from '@/hooks/mantenimiento/almacen/articulos/useGetWarehouseConsumableArticles';

type ArticleType = 'COMPONENTE' | 'CONSUMIBLE' | 'HERRAMIENTA';

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

  // ============================================
  // DATA FETCHING
  // ============================================
  const { data: componentesData, isLoading: isLoadingComponentes } = useGetWarehouseConsumableArticles(
    1, 
    1000, 
    'COMPONENTE',
    activeTab === 'COMPONENTE'
  );

  const { data: consumiblesData, isLoading: isLoadingConsumibles } = useGetWarehouseConsumableArticles(
    1, 
    1000, 
    'CONSUMIBLE',
    activeTab === 'CONSUMIBLE'
  );

  const { data: herramientasData, isLoading: isLoadingHerramientas } = useGetWarehouseConsumableArticles(
    1, 
    1000, 
    'HERRAMIENTA',
    activeTab === 'HERRAMIENTA'
  );

  // ============================================
  // COMPUTED VALUES
  // ============================================
  const isLoading = 
    (activeTab === 'COMPONENTE' && isLoadingComponentes) ||
    (activeTab === 'CONSUMIBLE' && isLoadingConsumibles) ||
    (activeTab === 'HERRAMIENTA' && isLoadingHerramientas);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'COMPONENTE':
        return flattenArticles(componentesData);
      case 'CONSUMIBLE':
        return flattenArticles(consumiblesData);
      case 'HERRAMIENTA':
        return flattenArticles(herramientasData);
      default:
        return [];
    }
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

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as ArticleType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger 
              value="COMPONENTE" 
              className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Box className="h-5 w-5" />
              <span className="font-semibold">Componentes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="CONSUMIBLE" 
              className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Package className="h-5 w-5" />
              <span className="font-semibold">Consumibles</span>
            </TabsTrigger>
            <TabsTrigger 
              value="HERRAMIENTA" 
              className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Wrench className="h-5 w-5" />
              <span className="font-semibold">Herramientas</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="COMPONENTE" className="mt-6">
            {isLoading ? (
              <div className='flex w-full h-full justify-center items-center min-h-[300px]'>
                <Loader2 className='size-24 animate-spin' />
              </div>
            ) : (
              <DataTable columns={columns} data={getCurrentData()} />
            )}
          </TabsContent>

          <TabsContent value="CONSUMIBLE" className="mt-6">
            {isLoading ? (
              <div className='flex w-full h-full justify-center items-center min-h-[300px]'>
                <Loader2 className='size-24 animate-spin' />
              </div>
            ) : (
              <DataTable columns={columns} data={getCurrentData()} />
            )}
          </TabsContent>

          <TabsContent value="HERRAMIENTA" className="mt-6">
            {isLoading ? (
              <div className='flex w-full h-full justify-center items-center min-h-[300px]'>
                <Loader2 className='size-24 animate-spin' />
              </div>
            ) : (
              <DataTable columns={columns} data={getCurrentData()} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  )
}

export default InventarioArticulosPage;
