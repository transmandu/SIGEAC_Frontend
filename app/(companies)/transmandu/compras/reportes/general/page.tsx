"use client"

import { ContentLayout } from '@/components/layout/ContentLayout'
import DateFilter from '@/components/misc/DateFilter'
import GeneralSalesReportPdf from '@/components/pdf/GeneralSalesReport'
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGetGeneralReport } from '@/hooks/compras/useGetGeneralReport'
import { PDFDownloadLink } from '@react-pdf/renderer'


const GeneralReportPage = () => {
  const { data: report, isError, isLoading } = useGetGeneralReport()
  return (
    <ContentLayout title="Reporte General">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/hangar74/dashboard">Inicio</BreadcrumbLink>
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
                  <BreadcrumbLink href="/hangar74/almacen/compras/reportes/general">Reporte General</BreadcrumbLink>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BreadcrumbLink href="/hangar74/almacen/compras/reportes/aeronaves">Reporte de Aeronaves</BreadcrumbLink>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BreadcrumbLink href="/hangar74/almacen/compras/reportes/proveedores">Reportes de Proveedores</BreadcrumbLink>
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
