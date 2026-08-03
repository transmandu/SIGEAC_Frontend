"use client"

import { ContentLayout } from "@/components/layout/ContentLayout"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCompanyStore } from "@/stores/CompanyStore"
import ReceptionRegisterArticleForm from "./_components/ReceptionRegisterArticleForm"
import { PageHeader } from "@/components/layout/PageHeader";

const AdministrativeReceptionPage = () => {
  const { selectedCompany } = useCompanyStore();

  return (
    <ContentLayout title='Recepción Administrativa'>
      <PageHeader />
      <ReceptionRegisterArticleForm isEditing={false} />
    </ContentLayout>
  )
}

export default AdministrativeReceptionPage
