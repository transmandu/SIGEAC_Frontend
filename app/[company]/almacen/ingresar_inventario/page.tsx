"use client"

import { ContentLayout } from "@/components/layout/ContentLayout"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCompanyStore } from "@/stores/CompanyStore"
import DirectRegisterArticleForm from "./_components/DirectRegisterArticleForm"
import { PageHeader } from "@/components/layout/PageHeader";

const AgregarPage = () => {
  const { selectedCompany } = useCompanyStore();

  return (
    <ContentLayout title='Ingreso de Inv.'>
      <PageHeader className="mb-6" />
      <DirectRegisterArticleForm isEditing={false} />
    </ContentLayout>
  )
}

export default AgregarPage
