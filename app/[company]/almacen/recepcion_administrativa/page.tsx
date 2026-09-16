"use client"

import { ContentLayout } from "@/components/layout/ContentLayout"
import ReceptionRegisterArticleForm from "./_components/ReceptionRegisterArticleForm"
import { PageHeader } from "@/components/layout/PageHeader";

const AdministrativeReceptionPage = () => {
  return (
    <ContentLayout title='Recepción Administrativa Manual'>
      <PageHeader className="mb-6" />

      <div className="space-y-5">
        {/* El subtítulo dice qué la separa de "Recepción de Compras": el
            menú solo tiene sitio para el nombre abreviado, y es aquí donde
            se resuelve la duda de si uno está en la pantalla correcta. */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Recepción Administrativa Manual
          </h1>
          <p className="text-sm text-muted-foreground">
            Registro de un artículo que llegó sin una orden de compra que lo
            respalde. Lo que viene de una compra o de otra sede se recibe en
            Recepción de Compras.
          </p>
        </div>

        <ReceptionRegisterArticleForm isEditing={false} />
      </div>
    </ContentLayout>
  )
}

export default AdministrativeReceptionPage
