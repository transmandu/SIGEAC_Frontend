"use client"

import { ContentLayout } from "@/components/layout/ContentLayout"
import ReceptionRegisterArticleForm from "./_components/ReceptionRegisterArticleForm"
import { PageHeader } from "@/components/layout/PageHeader";

const AdministrativeReceptionPage = () => {
  return (
    <ContentLayout title='Recepción Administrativa'>
      <PageHeader className="mb-6" />

      <div className="space-y-5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Recepción Administrativa
        </h1>

        <ReceptionRegisterArticleForm isEditing={false} />
      </div>
    </ContentLayout>
  )
}

export default AdministrativeReceptionPage
