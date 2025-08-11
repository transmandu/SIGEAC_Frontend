"use client"

import { ContentLayout } from '@/components/layout/ContentLayout'
import DateFilter from '@/components/misc/DateFilter'
import GeneralSalesReportPdf from '@/components/pdf/compras/GeneralSalesReport'
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGetGeneralReport } from '@/hooks/mantenimiento/compras/useGetGeneralReport'
import { useCompanyStore } from '@/stores/CompanyStore'
import { PDFDownloadLink } from '@react-pdf/renderer'


const GeneralReportPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: report, isError, isLoading } = useGetGeneralReport()
  return (
    <ContentLayout title="Reporte General">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Compras</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Reportes</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1">
                <BreadcrumbEllipsis className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>
                  <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/compras/reportes/general`}>Reporte General</BreadcrumbLink>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/compras/reportes/aeronaves`}>Reporte de Aeronaves</BreadcrumbLink>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/compras/reportes/proveedores`}>Reportes de Proveedores</BreadcrumbLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Reporte General</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <DateFilter />
      {
        report && (
          <>
            <PDFDownloadLink
              fileName={`reporte_test`}
              document={
                <GeneralSalesReportPdf reports={report} />
              }
            >
              <Button className='bg-red-700' disabled={isError || isLoading}>Descargar PDF</Button>
            </PDFDownloadLink>
          </>
        )
      }
    </ContentLayout>
  )
}

export default GeneralReportPage
