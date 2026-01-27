"use client"

import { useUpdateGeneralArticleQuantity } from "@/actions/mantenimiento/almacen/inventario/articulos_generales/actions"
import { ContentLayout } from "@/components/layout/ContentLayout"
import LoadingPage from "@/components/misc/LoadingPage"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Package } from "lucide-react"
import { GeneralInventoryTable } from "./_components/GeneralInventoryTable"
import { useGeneralInventoryEdits } from "./_components/hooks/useGeneralInventoryEdits"

export default function GestionInventarioGeneralPage() {
  const { selectedCompany } = useCompanyStore()
  const { data, isLoading, isError } = useGetGeneralArticles()
  const articles = data ?? []
  const {
    state: { editedQuantities, baseQuantities, hasChanges },
    actions: { setQuantity, reset },
    utils: { modified, modifiedCount },
  } = useGeneralInventoryEdits(articles)

  const { updateGeneralArticleQuantity } = useUpdateGeneralArticleQuantity()

  const handleSave = async () => {
    await updateGeneralArticleQuantity.mutateAsync({
      updates: modified,
    })
  }

  if (isLoading) return <LoadingPage />

  if (isError) {
    return (
      <ContentLayout title="Inventario General">
        <div className="py-10 text-center">
          <p className="text-sm text-muted-foreground">No se pudieron cargar los artículos.</p>
        </div>
      </ContentLayout>
    )
  }

  return (
    <ContentLayout title="Inventario General">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Almacén</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Inventario</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Inventario General</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-2xl font-semibold flex items-center justify-center md:justify-start gap-2">
            <Package className="h-6 w-6" />
            Gestión de cantidades
          </h1>
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
          isSaving={false}
          hasChanges={hasChanges}
          modifiedCount={modifiedCount}
        />
      </div>
    </ContentLayout>
  )
}
