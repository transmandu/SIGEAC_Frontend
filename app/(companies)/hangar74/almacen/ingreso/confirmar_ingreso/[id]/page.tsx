'use client'

import RegisterArticleForm from "@/components/forms/mantenimiento/almacen/RegisterArticleForm"
import { ContentLayout } from "@/components/layout/ContentLayout"
import LoadingPage from "@/components/misc/LoadingPage"
import { useGetArticleById } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleById"
import { useCompanyStore } from "@/stores/CompanyStore"
import { redirect, useParams } from "next/navigation"

const ConfirmIncomingPage = () => {
  const params = useParams<{ id: string }>()
  const { selectedStation } = useCompanyStore()
  const { data, isLoading, isError } = useGetArticleById(params.id, selectedStation)
  if (isLoading) {
    return <LoadingPage />
  }
  if (isError) {
    redirect("/hangar74/dashboard")
  }
  return (
    <ContentLayout title='Confirmar Ingreso'>
      {data?.batches?.category}
      <RegisterArticleForm isEditing initialData={data} category={data?.batches?.category} />
    </ContentLayout>
  )
}

export default ConfirmIncomingPage
