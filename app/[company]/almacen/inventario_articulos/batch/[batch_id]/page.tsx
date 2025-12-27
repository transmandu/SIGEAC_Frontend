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
import { useGetArticlesByPartNumber } from '@/hooks/mantenimiento/almacen/renglones/useGetArticlesByPartNumber'
import { useMemo, useState, useEffect } from 'react'
import ArticleDropdownActions from '@/components/dropdowns/mantenimiento/almacen/ArticleDropdownActions'
import { format, parseISO } from 'date-fns'

interface BatchDetailPageProps {
  params: {
    company: string
    batch_id: string
  }
}

export default function BatchDetailPage({ params }: BatchDetailPageProps) {
  const router = useRouter()
  const { selectedCompany, selectedStation } = useCompanyStore()
  const [searchTerm, setSearchTerm] = useState('')
  const batchId = parseInt(params.batch_id)
  const [currentPage, setCurrentPage] = useState(1)

  // Usar el mismo endpoint que la página principal
  const { data: paginatedData, isLoading } = useGetArticlesByPartNumber(
    selectedCompany?.slug,
    selectedStation?.toString() ?? undefined,
    currentPage,
    'batch_id' // Agrupar por batch_id
  )

  // Buscar el batch específico en los resultados
  const group = useMemo(() => {
    if (!paginatedData?.data) return null
    
    const foundBatch = paginatedData.data.find(g => g.batch_id === batchId)
    
    if (!foundBatch) return null
    
    return {
      batch_id: foundBatch.batch_id,
      name: foundBatch.name,
      category: foundBatch.category,
      unit: foundBatch.unit,
      articles: foundBatch.articles.map(article => ({
        ...article,
        // Asegurar que condition tenga la estructura correcta
        condition: typeof article.condition === 'object' && article.condition !== null
          ? article.condition
          : {
              id: 0,
              name: typeof article.condition === 'string' ? article.condition : 'N/A',
              description: '',
              registered_by: '',
              updated_by: ''
            }
      }))
    }
  }, [paginatedData, batchId])

  // Si no se encontró en la página actual y hay más páginas, intentar la siguiente
  useEffect(() => {
    if (!isLoading && !group && paginatedData && currentPage < paginatedData.last_page) {
      setCurrentPage(prev => prev + 1)
    }
  }, [isLoading, group, paginatedData, currentPage])

  // Filtrar artículos por búsqueda
  const filteredArticles = useMemo(() => {
    if (!group) return []
    if (!searchTerm) return group.articles

    const searchLower = searchTerm.toLowerCase()
    return group.articles.filter(article => 
      article.part_number?.toLowerCase().includes(searchLower) ||
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

    const totalQuantity = group.articles.reduce((sum, a) => sum + (a.quantity || 0), 0)
    const byStatus = group.articles.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const withDocs = group.articles.filter(a => a.has_documentation).length

    return {
      totalQuantity,
      byStatus,
      withDocs,
      totalArticles: group.articles.length
    }
  }, [group])

  const handleBack = () => {
    router.push(`/${selectedCompany?.slug}/almacen/inventario_articulos`)
  }

  const handleClearSearch = () => setSearchTerm('')

  if (isLoading && !group) {
    return (
      <ContentLayout title="Cargando...">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="size-12 animate-spin text-primary" />
        </div>
      </ContentLayout>
    )
  }

  if (!group && !isLoading) {
    return (
      <ContentLayout title="No encontrado">
        <div className="text-center py-12">
          <Package className="size-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-semibold mb-2">Renglón no encontrado</h2>
          <p className="text-muted-foreground mb-6">
            No se encontró el renglón con ID: <strong>{batchId}</strong>
          </p>
          <Button onClick={handleBack} variant="default">
            <ArrowLeft className="size-4 mr-2" />
            Volver al inventario
          </Button>
        </div>
      </ContentLayout>
    )
  }

  if (!group) return null

  return (
    <ContentLayout title={`Renglón - ${group.name}`}>
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
              <BreadcrumbPage>{group.name}</BreadcrumbPage>
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
                <h1 className="text-3xl font-bold">{group.name}</h1>
              </div>
              <Badge variant="outline" className="text-sm">
                {group.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className={`grid ${group.category === 'CONSUMIBLE' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'} gap-4`}>
            <div className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Artículos</p>
              <p className="text-2xl font-bold">{stats.totalArticles}</p>
            </div>
            
            {/* Solo mostrar Cantidad Total para CONSUMIBLE */}
            {group.category === 'CONSUMIBLE' && (
              <div className="bg-card border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Cantidad Total</p>
                <p className="text-2xl font-bold">
                  {stats.totalQuantity} {group.unit?.value || ''}
                </p>
              </div>
            )}
            
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
            placeholder="Buscar por número de parte, serial, lote, zona, descripción..."
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
                  <th className="px-4 py-3 text-left">Nro. Parte</th>
                  <th className="px-4 py-3 text-left">Serial/Lote</th>
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
                    <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                      {searchTerm ? 'No se encontraron artículos con ese criterio' : 'No hay artículos'}
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => {
                    return (
                      <tr 
                        key={article.id} 
                        className="border-t hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-primary">
                          {article.part_number}
                        </td>
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
                          {(article.status === 'stored' || article.status === 'checking') && (
                            <ArticleDropdownActions id={article.id} />
                          )}
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