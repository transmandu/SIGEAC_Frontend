'use client'

import RegisterArticleForm from '@/components/forms/mantenimiento/almacen/RegisterArticleForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useGetArticleById } from '@/hooks/mantenimiento/almacen/articulos/useGetArticleById'
import { useCompanyStore } from '@/stores/CompanyStore'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

interface Props {
  articleId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Diálogo de edición parcial de un artículo en tránsito, para el personal de
 * compras: permite ir agregando/actualizando datos y documentación de forma
 * progresiva (pre-revisión) sin salir de la vista de tránsito. No exige
 * completitud: el pase final a recepción lo gobierna el botón de acciones.
 */
export function EditTransitArticleDialog({ articleId, open, onOpenChange }: Props) {
  const { selectedCompany } = useCompanyStore()
  const queryClient = useQueryClient()

  const { data, isLoading } = useGetArticleById(
    open ? String(articleId) : '',
    selectedCompany?.slug
  )

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['article', String(articleId)] })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar artículo en tránsito</DialogTitle>
          <DialogDescription>
            Agregue o actualice progresivamente los datos y la documentación del
            artículo a medida que la recibe. Puede guardar de forma parcial las
            veces que necesite.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <RegisterArticleForm
            key={data.id}
            isEditing
            initialData={data}
            category={data.batch?.category}
            onEditSuccess={handleEditSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
