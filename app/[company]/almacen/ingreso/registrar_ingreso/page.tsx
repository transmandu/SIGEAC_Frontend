"use client"

import RegisterArticleForm from "@/components/forms/mantenimiento/almacen/RegisterArticleForm"
import { ContentLayout } from "@/components/layout/ContentLayout"
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCompanyStore } from "@/stores/CompanyStore"

const AgregarPage = () => {
  const { selectedCompany } = useCompanyStore();

  return (
    <ContentLayout title='Registro de Articulo'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Carga Administrativa</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1">
                <BreadcrumbEllipsis className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>
                  <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/ingreso/registrar_ingreso`}>Ingreso de Articulo</BreadcrumbLink>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/ingreso/en_transito`}>Articulos de Transito</BreadcrumbLink>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/ingreso/en_recepcion`}>Articulos en Recepcion</BreadcrumbLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ingreso de Articulo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <RegisterArticleForm isEditing={false} />
    </ContentLayout>
  )
}

export default AgregarPage
