'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllWarehouseArticles } from '@/hooks/mantenimiento/almacen/articulos/useGetAllWarehouseArticles';
import { useUpdateArticleQuantities } from '@/actions/mantenimiento/almacen/articulos/useUpdateArticleQuantities';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Loader2, Save, Package } from 'lucide-react';
import React, { useState, useEffect } from 'react';
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

const GestionCantidadesPage = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: articles, isLoading, isError } = useGetAllWarehouseArticles(
    selectedCompany?.slug, 
    selectedStation!
  );

  const { updateQuantities } = useUpdateArticleQuantities();

  // Initialize quantities when articles are loaded
  useEffect(() => {
    if (articles) {
      const initialQuantities: Record<number, number> = {};
      articles.forEach(article => {
        initialQuantities[article.id] = article.quantity;
      });
      setQuantities(initialQuantities);
    }
  }, [articles]);

  const handleQuantityChange = (articleId: number, newQuantity: string) => {
    const numQuantity = parseFloat(newQuantity) || 0;
    setQuantities(prev => ({
      ...prev,
      [articleId]: numQuantity
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!selectedCompany?.slug) return;

    const quantitiesToUpdate = Object.entries(quantities)
      .filter(([articleId, quantity]) => {
        const originalArticle = articles?.find(a => a.id === parseInt(articleId));
        return originalArticle && originalArticle.quantity !== quantity;
      })
      .map(([articleId, quantity]) => ({
        article_id: parseInt(articleId),
        new_quantity: quantity
      }));

    if (quantitiesToUpdate.length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }

    updateQuantities.mutate({
      quantities: quantitiesToUpdate,
      company: selectedCompany.slug,
      location_id: selectedStation!
    }, {
      onSuccess: () => {
        setHasChanges(false);
      }
    });
  };

  const groupedArticles = articles?.reduce((acc, article) => {
    const category = article.category || 'Sin Categoría';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(article);
    return acc;
  }, {} as Record<string, typeof articles>) || {};

  if (isLoading) {
    return (
      <ContentLayout title='Gestión de Cantidades'>
        <div className='flex w-full h-full justify-center items-center'>
          <Loader2 className='size-24 animate-spin mt-48' />
        </div>
      </ContentLayout>
    );
  }

  if (isError) {
    return (
      <ContentLayout title='Gestión de Cantidades'>
        <div className='text-center py-8'>
          <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar los artículos...</p>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title='Gestión de Cantidades'>
      <div className='flex flex-col gap-6'>
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Almacén</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>
                    <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/inventario/gestion`}>Gestión</BreadcrumbLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/inventario/entregado`}>Entregados</BreadcrumbLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/inventario/gestion_cantidades`}>Gestión de Cantidades</BreadcrumbLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Gestión de Cantidades</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
            {hasChanges && (
              <span className='ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
                {Object.entries(quantities).filter(([articleId, quantity]) => {
                  const originalArticle = articles?.find(a => a.id === parseInt(articleId));
                  return originalArticle && originalArticle.quantity !== quantity;
                }).length}
              </span>
            )}
          </Button>
        </div>

        {/* Articles by Category */}
        {Object.entries(groupedArticles).map(([category, categoryArticles]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className='text-xl'>{category}</CardTitle>
              <CardDescription>
                {categoryArticles.length} artículo{categoryArticles.length !== 1 ? 's' : ''} en esta categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {categoryArticles.map((article) => (
                  <div 
                    key={article.id} 
                    className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors'
                  >
                    {/* Article Info */}
                    <div className='flex flex-col'>
                      <label className='text-sm font-medium text-muted-foreground mb-1'>
                        Artículo
                      </label>
                      <div className='p-3 bg-muted rounded-md'>
                        <div className='font-medium'>{article.description}</div>
                        <div className='text-sm text-muted-foreground'>
                          {article.part_number} • {article.brand}
                        </div>
                        <div className='text-xs text-muted-foreground mt-1'>
                          Serial: {article.serial} • Zona: {article.zone}
                        </div>
                      </div>
                    </div>

                    {/* Current Stock */}
                    <div className='flex flex-col'>
                      <label className='text-sm font-medium text-muted-foreground mb-1'>
                        Existencia Actual
                      </label>
                      <div className='p-3 bg-muted rounded-md text-center'>
                        <div className='text-2xl font-bold text-primary'>
                          {article.quantity}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {article.unit_secondary}
                        </div>
                      </div>
                    </div>

                    {/* New Quantity */}
                    <div className='flex flex-col'>
                      <label className='text-sm font-medium text-muted-foreground mb-1'>
                        Nueva Cantidad
                      </label>
                      <Input
                        type='number'
                        min='0'
                        step='0.01'
                        value={quantities[article.id] || ''}
                        onChange={(e) => handleQuantityChange(article.id, e.target.value)}
                        className={`text-center text-lg font-medium ${
                          quantities[article.id] !== article.quantity 
                            ? 'border-orange-500 bg-orange-50' 
                            : ''
                        }`}
                        placeholder='0'
                      />
                      <div className='text-xs text-muted-foreground text-center mt-1'>
                        {article.unit_secondary}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {articles && articles.length === 0 && (
          <Card>
            <CardContent className='text-center py-8'>
              <Package className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-medium mb-2'>No hay artículos en el almacén</h3>
              <p className='text-sm text-muted-foreground'>
                No se encontraron artículos para mostrar en el inventario.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ContentLayout>
  );
};

export default GestionCantidadesPage;
