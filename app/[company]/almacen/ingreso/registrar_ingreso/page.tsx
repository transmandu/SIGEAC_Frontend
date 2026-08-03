"use client"

import RegisterArticleForm from "@/components/forms/mantenimiento/almacen/RegisterArticleForm"
import { ContentLayout } from "@/components/layout/ContentLayout"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCompanyStore } from "@/stores/CompanyStore"
import { PageHeader } from "@/components/layout/PageHeader";

const AgregarPage = () => {
  const { selectedCompany } = useCompanyStore();

  return (
    <ContentLayout title='Registro de Articulo'>
      <PageHeader />
      <RegisterArticleForm isEditing={false} />
    </ContentLayout>
  )
}

export default AgregarPage
