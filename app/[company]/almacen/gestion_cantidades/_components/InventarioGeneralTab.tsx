"use client"

import { useUpdateGeneralArticleQuantity } from "@/actions/mantenimiento/almacen/inventario/articulos_generales/actions"
import LoadingPage from "@/components/misc/LoadingPage"
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles"
import { Package } from "lucide-react"
import { GeneralInventoryTable } from "./GeneralInventoryTable"
import { useGeneralInventoryEdits } from "./hooks/useGeneralInventoryEdits"

export const InventarioGeneralTab = () => {
  const { data, isLoading, isError } = useGetGeneralArticles()
  const articles = data ?? []
  const {
    state: { editedQuantities, baseQuantities, hasChanges },
    actions: { setQuantity },
    utils: { modified, modifiedCount },
  } = useGeneralInventoryEdits(articles)

  const { updateGeneralArticleQuantity } = useUpdateGeneralArticleQuantity()

  const handleSave = async () => {
    await updateGeneralArticleQuantity.mutateAsync({ updates: modified })
  }

  if (isLoading) return <LoadingPage />

  if (isError) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No se pudieron cargar los artículos.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 text-center md:text-left">
        <h2 className="text-2xl font-semibold flex items-center justify-center md:justify-start gap-2">
          <Package className="h-6 w-6" />
          Cantidades de artículos generales
        </h2>
        <p className="text-sm text-muted-foreground">
          Inventario general sin batches. Edita y guarda cambios en lote.
        </p>
      </div>

      <GeneralInventoryTable
        articles={articles}
        baseQuantities={baseQuantities}
        editedQuantities={editedQuantities}
        onQuantityChange={setQuantity}
        onSave={handleSave}
        isSaving={updateGeneralArticleQuantity.isPending}
        hasChanges={hasChanges}
        modifiedCount={modifiedCount}
      />
    </div>
  )
}
