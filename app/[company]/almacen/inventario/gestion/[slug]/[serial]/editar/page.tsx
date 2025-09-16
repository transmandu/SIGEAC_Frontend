'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import RegisterArticleForm from '@/components/forms/mantenimiento/almacen/RegisterArticleForm'
import { useGetArticleById } from '@/hooks/mantenimiento/almacen/articulos/useGetArticleById'
import { useCompanyStore } from '@/stores/CompanyStore'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const EditArticlePage = () => {
  const params = useParams()
  const router = useRouter()
  const { selectedCompany } = useCompanyStore()
  
  const serial = params.serial as string
  
  const { data, isLoading: isPending, isError } = useGetArticleById(serial, selectedCompany?.slug)

  const handleGoBack = () => {
    router.back()
  }

  if (isPending) {
    return (
      <ContentLayout title='Editar Artículo'>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Cargando datos del artículo...</p>
          </div>
        </div>
      </ContentLayout>
    )
  }

  if (isError || !data) {
    return (
      <ContentLayout title='Editar Artículo'>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-destructive mb-2">Error al cargar el artículo</h2>
            <p className="text-muted-foreground mb-4">
              No se pudo cargar la información del artículo. Verifique que el artículo existe.
            </p>
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </ContentLayout>
    )
  }

  return (
    <ContentLayout title='Editar Artículo'>
      <div className="space-y-6">
        {/* Header con botón de volver */}
        <div className="flex items-center gap-4">
          <Button onClick={handleGoBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Artículo</h1>
            <p className="text-muted-foreground">
              {data.part_number} - {data.serial}
            </p>
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="bg-card rounded-lg border p-6">
          <RegisterArticleForm 
            isEditing={true}
            initialData={data}
          />
        </div>
      </div>
    </ContentLayout>
  )
}

export default EditArticlePage