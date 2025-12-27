'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCompanyStore } from '@/stores/CompanyStore'
import { ArrowLeft, Loader2, Package, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSearchBatchesWithArticles } from '@/hooks/mantenimiento/almacen/renglones/useSearchBatchesWithArticles'
import { WarehouseArticle } from '@/types/warehouse'
import { useMemo, useState } from 'react'
import ArticleDropdownActions from '@/components/dropdowns/mantenimiento/almacen/ArticleDropdownActions'
import { format, parseISO } from 'date-fns'

interface ArticleDetailPageProps {
  params: {
    company: string
    part_number: string
  }
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const router = useRouter()
  const { selectedCompany, selectedStation } = useCompanyStore()
  const [searchTerm, setSearchTerm] = useState('')
  const decodedPartNumber = decodeURIComponent(params.part_number)

  // Fetch data - buscar específicamente este part_number
  const { data: searchResults, isLoading } = useSearchBatchesWithArticles(
    selectedCompany?.slug,
    selectedStation?.toString() ?? undefined,
    decodedPartNumber
  )

  // Transformar el resultado de búsqueda - combinar TODOS los batches encontrados
  const group = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return null
    
    // Obtener información del primer batch para los datos generales
    const firstBatch = searchResults[0]
    
    // Combinar TODOS los artículos de TODOS los batches
    const allArticles = searchResults.flatMap(batchData => 
      batchData.articles.map(article => ({
        id: article.id,
        part_number: article.part_number,
        alternative_part_number: article.alternative_part_number || [],
        serial: article.serial || '',
        lot_number: (article as any).lot_number || '', // Puede existir aunque no esté en el tipo
        cost: article.cost ?? undefined,
        description: article.description || '',
        batch_name: batchData.batch.name, // Agregar nombre del batch
        batch_category: batchData.batch.category, // Agregar categoría del batch
        zone: article.zone,
        status: article.status,
        condition: article.condition && typeof article.condition === 'object' ? {
          id: (article.condition as any).id || 0,
          name: (article.condition as any).name || article.condition,
          description: (article.condition as any).description || '',
          registered_by: (article.condition as any).registered_by || '',
          updated_by: (article.condition as any).updated_by || ''
        } : article.condition ? {
          id: 0,
          name: article.condition as string,
          description: '',
          registered_by: '',
          updated_by: ''
        } : undefined,
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
          needs_calibration: (article.tool as any).needs_calibration === '1' || false,
          status: (article.tool as any).status || article.status,
          calibration_date: (article.tool as any).calibration_date,
          next_calibration_date: (article.tool as any).next_calibration,
          next_calibration: (article.tool as any).next_calibration
        } : undefined,
        component: article.component ? {
          shell_time: {
            caducate_date: article.component.shell_time?.caducate_date || null,
            fabrication_date: article.component.shell_time?.fabrication_date || null
          }
        } : undefined,
        consumable: article.consumable ? {
          shell_time: {
            caducate_date: (article.consumable as any).caducate_date || null,
            fabrication_date: (article.consumable as any).fabrication_date || null
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
    )
    
    // Obtener las categorías únicas de todos los batches
    const categories = Array.from(new Set(searchResults.map(b => b.batch.category))).join(' / ')
    
    return {
      part_number: decodedPartNumber,
      name: firstBatch.batch.name,
      category: categories, // Mostrar todas las categorías
      unit: firstBatch.batch.medition_unit ? {
        id: 0,
        value: firstBatch.batch.medition_unit,
        label: firstBatch.batch.medition_unit,
        registered_by: '',
        updated_by: '',
        created_at: new Date(),
        updated_at: new Date()
      } : null,
      articles: allArticles
    }
  }, [searchResults, decodedPartNumber])

  // Filtrar artículos por búsqueda
  const filteredArticles = useMemo(() => {
    if (!group) return []
    if (!searchTerm) return group.articles

    const searchLower = searchTerm.toLowerCase()
    return group.articles.filter(article => 
      article.serial?.toLowerCase().includes(searchLower) ||
      article.lot_number?.toLowerCase().includes(searchLower) ||
      article.zone?.toLowerCase().includes(searchLower) ||
      article.description?.toLowerCase().includes(searchLower) ||
      (article.condition && typeof article.condition === 'object' && article.condition.name?.toLowerCase().includes(searchLower))
    )
  }, [group, searchTerm])

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!group) return null

    const totalQuantity = group.articles.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0)
    const byStatus = group.articles.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const byZone = group.articles.reduce((acc, a) => {
      const zone = a.zone || 'Sin zona'
      acc[zone] = (acc[zone] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const withDocs = group.articles.filter(a => a.has_documentation).length
    
    // Detectar si hay múltiples categorías
    const hasMultipleCategories = group.category.includes('/')

    return {
      totalQuantity,
      byStatus,
      byZone,
      withDocs,
      totalArticles: group.articles.length,
      hasMultipleCategories
    }
  }, [group])

  const handleBack = () => {
    router.push(`/${selectedCompany?.slug}/almacen/inventario_articulos`)
  }

  const handleClearSearch = () => setSearchTerm('')

  if (isLoading) {
    return (
      <ContentLayout title="Cargando...">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="size-12 animate-spin text-primary" />
        </div>
      </ContentLayout>
    )
  }

  if (!group) {
    return (
      <ContentLayout title="No encontrado">
        <div className="text-center py-12">
          <Package className="size-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-semibold mb-2">Artículo no encontrado</h2>
          <p className="text-muted-foreground mb-6">
            No se encontró el número de parte: <strong>{decodedPartNumber}</strong>
          </p>
          <Button onClick={handleBack} variant="default">
            <ArrowLeft className="size-4 mr-2" />
            Volver al inventario
          </Button>
        </div>
      </ContentLayout>
    )
  }

  return (
    <ContentLayout title={`Artículos - ${decodedPartNumber}`}>
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
              <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/inventario_articulos`}>
                Gestión de Inventario
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{decodedPartNumber}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="size-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center gap-3">
              <Package className="size-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">{group.part_number}</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Artículos</p>
              <p className="text-2xl font-bold">{stats.totalArticles}</p>
            </div>
            
            {/* Mostrar Cantidad Total siempre */}
            <div className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Cantidad Total</p>
              <p className="text-2xl font-bold">
                {stats.totalQuantity} {group.unit?.value || 'u'}
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Con Documentación</p>
              <p className="text-2xl font-bold">
                {stats.withDocs}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {stats.totalArticles}
                </span>
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Estados</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <Badge key={status} variant="secondary" className="text-xs">
                    {status}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Búsqueda */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por serial, lote, zona, descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-8"
          />
          {searchTerm && (
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

        {/* Tabla de artículos */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr className="text-sm font-medium">
                  <th className="px-4 py-3 text-left">Serial/Lote</th>
                  <th className="px-4 py-3 text-center">Tipo</th>
                  <th className="px-4 py-3 text-left">Renglón</th>
                  <th className="px-4 py-3 text-left">Zona</th>
                  <th className="px-4 py-3 text-left">Condición</th>
                  <th className="px-4 py-3 text-center">Cantidad</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-left">Descripción</th>
                  <th className="px-4 py-3 text-center">Fecha Caducidad</th>
                  <th className="px-4 py-3 text-center">Documentación</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                      {searchTerm ? 'No se encontraron artículos con ese criterio' : 'No hay artículos'}
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => {
                    // Determinar el tipo de artículo basado en la categoría del batch
                    const getArticleType = () => {
                      if (article.batch_category) {
                        return article.batch_category.toUpperCase()
                      }
                      if (article.tool) return 'HERRAMIENTA'
                      if (article.consumable || article.article_type?.toLowerCase() === 'consumable') return 'CONSUMIBLE'
                      if (article.component || article.article_type?.toLowerCase() === 'component') return 'COMPONENTE'
                      return 'N/A'
                    }
                    
                    const articleType = getArticleType()
                    
                    const articleForActions = {
                      id: article.id,
                      part_number: article.part_number,
                      alternative_part_number: article.alternative_part_number,
                      serial: article.serial,
                      lot_number: article.lot_number,
                      description: article.description,
                      zone: article.zone,
                      quantity: article.quantity,
                      status: article.status,
                      condition: article.condition,
                      unit: article.unit,
                      has_documentation: article.has_documentation,
                      certificates: article.certificates,
                      batch_name: group.name,
                      batch_id: 0,
                      article_type: group.category.toLowerCase(),
                    }

                    return (
                      <tr 
                        key={article.id} 
                        className="border-t hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium">
                              {article.serial || 'N/A'}
                            </p>
                            {article.lot_number && (
                              <p className="text-xs text-muted-foreground">
                                Lote: {article.lot_number}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge 
                            variant={
                              articleType === 'COMPONENTE' ? 'default' :
                              articleType === 'CONSUMIBLE' ? 'secondary' :
                              articleType === 'HERRAMIENTA' ? 'outline' :
                              'outline'
                            }
                            className="text-xs font-medium"
                          >
                            {articleType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="max-w-[200px]">
                            <p className="font-medium text-xs truncate" title={article.batch_name}>
                              {article.batch_name}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                            {article.zone}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="secondary" className="text-xs">
                            {article.condition?.name || 'N/A'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="font-medium">
                            {article.quantity}
                          </span>
                          {article.unit?.value && (
                            <span className="text-xs text-muted-foreground ml-1">
                              {article.unit.value}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <Badge 
                            variant={
                              article.status === 'stored' ? 'default' :
                              article.status === 'checking' ? 'outline' :
                              article.status === 'dispatched' ? 'secondary' :
                              'outline'
                            }
                            className="text-xs"
                          >
                            {article.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {article.description || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {article.caducate_date ? (
                            <span className="text-xs">
                              {format(parseISO(article.caducate_date), 'dd/MM/yyyy')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {article.has_documentation ? (
                            <Badge variant="default" className="text-xs bg-green-500">
                              Sí
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ArticleDropdownActions id={article.id} />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer con información */}
        <div className="text-sm text-muted-foreground text-center">
          {searchTerm ? (
            <p>Mostrando {filteredArticles.length} de {group.articles.length} artículos</p>
          ) : (
            <p>Total: {group.articles.length} artículos</p>
          )}
        </div>
      </div>
    </ContentLayout>
  )
}
