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

  // Mock data para mostrar la vista completa
  const mockArticles = [
    {
      id: 1,
      article_type: "consumable",
      status: "disponible",
      serial: "ABC123",
      description: "Aceite Hidráulico Skydrol LD-4",
      zone: "A-01",
      brand: "Eastman",
      condition: "Nuevo",
      manufacturer: "Eastman Chemical",
      weight: 5.5,
      cost: 150.00,
      batches_id: 101,
      vendor_id: "V001",
      part_number: "SKY-LD4-5L",
      alternative_part_number: ["SKY-LD4", "SKYDROL-LD4"],
      unit_secondary: "Litros",
      image: "",
      quantity: 25,
      category: "Fluidos Hidráulicos",
      batch_name: "Fluidos Hidráulicos"
    },
    {
      id: 2,
      article_type: "component",
      status: "disponible",
      serial: "DEF456",
      description: "Filtro de Aceite Hidráulico",
      zone: "B-02",
      brand: "Parker",
      condition: "Nuevo",
      manufacturer: "Parker Hannifin",
      weight: 0.8,
      cost: 85.00,
      batches_id: 102,
      vendor_id: "V002",
      part_number: "PH-FLT-001",
      alternative_part_number: ["FLT-001", "PARKER-FLT"],
      unit_secondary: "Unidades",
      image: "",
      quantity: 12,
      category: "Filtros",
      batch_name: "Filtros"
    },
    {
      id: 3,
      article_type: "tool",
      status: "disponible",
      serial: "GHI789",
      description: "Llave de Torque Digital 1/2\"",
      zone: "C-03",
      brand: "Snap-on",
      condition: "Usado - Bueno",
      manufacturer: "Snap-on Tools",
      weight: 2.3,
      cost: 450.00,
      batches_id: 103,
      vendor_id: "V003",
      part_number: "SO-TQ-500",
      alternative_part_number: ["TQ-500", "SNAPON-TQ"],
      unit_secondary: "Unidades",
      image: "",
      quantity: 3,
      category: "Herramientas",
      batch_name: "Herramientas"
    },
    {
      id: 4,
      article_type: "consumable",
      status: "disponible",
      serial: "JKL012",
      description: "Grasa para Rodamientos Aeroshell 33",
      zone: "A-02",
      brand: "Shell",
      condition: "Nuevo",
      manufacturer: "Shell Aviation",
      weight: 1.2,
      cost: 75.00,
      batches_id: 104,
      vendor_id: "V004",
      part_number: "SH-AS33-1KG",
      alternative_part_number: ["AS33", "AEROSHELL-33"],
      unit_secondary: "Kilogramos",
      image: "",
      quantity: 18,
      category: "Lubricantes",
      batch_name: "Lubricantes"
    },
    {
      id: 5,
      article_type: "component",
      status: "disponible",
      serial: "MNO345",
      description: "Sello O-Ring Viton 2-010",
      zone: "D-01",
      brand: "Parker",
      condition: "Nuevo",
      manufacturer: "Parker Hannifin",
      weight: 0.01,
      cost: 12.50,
      batches_id: 105,
      vendor_id: "V005",
      part_number: "PH-OR-2010",
      alternative_part_number: ["OR-2010", "VITON-2010"],
      unit_secondary: "Unidades",
      image: "",
      quantity: 150,
      category: "Sellos y Empaques",
      batch_name: "Sellos y Empaques"
    },
    {
      id: 6,
      article_type: "consumable",
      status: "disponible",
      serial: "PQR678",
      description: "Combustible Jet A-1",
      zone: "F-01",
      brand: "ExxonMobil",
      condition: "Nuevo",
      manufacturer: "ExxonMobil",
      weight: 1000,
      cost: 2500.00,
      batches_id: 106,
      vendor_id: "V006",
      part_number: "EM-JETA1-1000L",
      alternative_part_number: ["JETA1", "JETFUEL-A1"],
      unit_secondary: "Litros",
      image: "",
      quantity: 5000,
      category: "Combustibles",
      batch_name: "Combustibles"
    },
    {
      id: 7,
      article_type: "tool",
      status: "disponible",
      serial: "STU901",
      description: "Multímetro Digital Fluke 87V",
      zone: "E-01",
      brand: "Fluke",
      condition: "Nuevo",
      manufacturer: "Fluke Corporation",
      weight: 0.7,
      cost: 380.00,
      batches_id: 107,
      vendor_id: "V007",
      part_number: "FL-87V",
      alternative_part_number: ["87V", "FLUKE-87V"],
      unit_secondary: "Unidades",
      image: "",
      quantity: 2,
      category: "Instrumentos de Medición",
      batch_name: "Instrumentos de Medición"
    },
    {
      id: 8,
      article_type: "component",
      status: "disponible",
      serial: "VWX234",
      description: "Rodamiento de Bolas SKF 6205",
      zone: "B-03",
      brand: "SKF",
      condition: "Nuevo",
      manufacturer: "SKF Group",
      weight: 0.15,
      cost: 45.00,
      batches_id: 108,
      vendor_id: "V008",
      part_number: "SKF-6205",
      alternative_part_number: ["6205", "SKF-6205-2RS"],
      unit_secondary: "Unidades",
      image: "",
      quantity: 24,
      category: "Rodamientos",
      batch_name: "Rodamientos"
    }
  ];

  // Usar mock data en lugar del hook real
  const { data: articles, isLoading, isError } = {
    data: mockArticles,
    isLoading: false,
    isError: false
  };

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
