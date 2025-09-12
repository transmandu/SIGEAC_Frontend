'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import EditArticleForm from '@/components/forms/mantenimiento/almacen/EditArticleForm'
import { useGetArticle } from '@/hooks/mantenimiento/almacen/articulos/useGetArticle'
import { useCompanyStore } from '@/stores/CompanyStore'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Article, Batch, Convertion } from '@/types'

interface EditingArticle extends Article {
  batches: Batch,
  tool?: {
    id: number,
    serial: string,
    isSpecial: boolean,
    article_id: number,
  }
  component?: {
    serial: string,
    hard_time: {
      hour_date: string,
      cycle_date: string,
      calendary_date: string,
    },
    shell_time: {
      caducate_date: string,
      fabrication_date: string,
    }
  },
  consumable?: {
    article_id: number,
    is_managed: boolean,
    convertions: Convertion[],
    quantity: number,
    shell_time: {
      caducate_date: Date,
      fabrication_date: string,
      consumable_id: string,
    }
  },
}

const EditArticlePage = () => {
  const params = useParams()
  const router = useRouter()
  const { selectedStation, selectedCompany } = useCompanyStore()
  const [articleData, setArticleData] = useState<EditingArticle | null>(null)
  
  const slug = params.slug as string
  const serial = params.serial as string
  
  const { mutate: getArticle, isPending, isError, data } = useGetArticle(
    selectedStation?.toString() || '',
    slug,
    serial,
    selectedCompany?.slug
  )

  useEffect(() => {
    if (selectedStation && selectedCompany && slug && serial) {
      getArticle()
    }
  }, [selectedStation, selectedCompany, slug, serial, getArticle])

  useEffect(() => {
    if (data?.article) {
      // Transformar los datos para que coincidan con la estructura esperada
      const transformedData: EditingArticle = {
        id: data.id,
        part_number: data.article.part_number,
        serial: data.article.serial,
        description: data.article.description,
        zone: data.article.zone,
        manufacturer: {
          id: 1, // Este valor debería venir del API
          name: data.article.brand,
          type: 'PART' as const,
          description: data.article.brand
        },
        condition: {
          id: 1, // Este valor debería venir del API
          name: data.article.condition,
          description: data.article.condition,
          registered_by: '1',
          updated_by: '1'
        },
        batches: {
          id: 1, // Este valor debería venir del API
          name: data.article.category_father,
          category: data.article.category_father.toLowerCase(),
          warehouse_name: 'Almacén Principal', // Este valor debería venir del API
          slug: data.article.category_father.toLowerCase().replace(/\s+/g, '-'),
          description: data.article.description,
          ata_code: '',
          brand: data.article.brand,
          is_hazarous: false,
          medition_unit: 'unit',
          min_quantity: 1,
          zone: data.article.zone,
          warehouse_id: Number(selectedStation) || 1
        },
        alternative_part_number: [],
        // Campos adicionales requeridos por Article
        article_type: data.article.category_father.toLowerCase(),
        status: data.article.status,
        weight: 0,
        cost: 0,
        batch_id: 1,
        vendor_id: '',
        image: data.article.image || '',
        quantity: 1,
        certifcate_8130: '',
        certifcate_fabricant: '',
        certifcate_vendor: '',
        // Agregar datos específicos según el tipo
        ...(data.shell_time && {
          consumable: {
            article_id: data.id,
            is_managed: true,
            convertions: [],
            quantity: 1,
            shell_time: {
              caducate_date: new Date(data.shell_time.caducate_date),
              fabrication_date: data.shell_time.fabrication_date,
              consumable_id: data.id.toString()
            }
          }
        }),
        ...(data.hard_time && {
          component: {
            serial: data.article.serial,
            hard_time: {
              hour_date: data.hard_time.hour_date.toString(),
              cycle_date: data.hard_time.cycle_date.toString(),
              calendary_date: data.hard_time.calendary_date
            },
            shell_time: {
              caducate_date: data.shell_time?.caducate_date || '',
              fabrication_date: data.shell_time?.fabrication_date || ''
            }
          }
        })
      }
      
      setArticleData(transformedData)
    }
  }, [data, selectedStation])

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

  if (isError || !articleData) {
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
              {articleData.part_number} - {articleData.serial}
            </p>
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="bg-card rounded-lg border p-6">
          <EditArticleForm 
            initialData={articleData}
          />
        </div>
      </div>
    </ContentLayout>
  )
}

export default EditArticlePage