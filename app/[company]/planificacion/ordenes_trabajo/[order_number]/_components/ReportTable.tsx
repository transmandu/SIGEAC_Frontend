"use client"
import { useCreateReportPage } from "@/actions/mantenimiento/planificacion/ordenes_trabajo/hoja_reporte/action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import axiosInstance from "@/lib/axios"
import { useCompanyStore } from "@/stores/CompanyStore"
import { WorkOrder } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Printer } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { DataTable } from "../data-table"
import { columns } from "./report-columns"
import { AddReportItemDialog } from "./AddReportItemDialog"

// Esquema de validación con Zod
const createWorkOrderReport = z.object({
  work_order_id: z.string(),
})

const ReportTable = ({ work_order }: { work_order: WorkOrder }) => {
  const { selectedCompany } = useCompanyStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const {createReportPage} = useCreateReportPage()
  // Form hook
  const form = useForm<z.infer<typeof createWorkOrderReport>>({
    resolver: zodResolver(createWorkOrderReport),
    defaultValues: {
    }
  })

  form.setValue('work_order_id', work_order.id.toString())
    const handlePrint = async () => {
      try {
        const response = await axiosInstance.get(`/hangar74/work-order-pdf-report/${work_order.order_number}`, {
          responseType: 'blob', // Importante para manejar archivos binarios
        });

        // Crear URL del blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `REPORT_PAGE_WO-${work_order.order_number}.pdf`);
        document.body.appendChild(link);
        link.click();

        // Limpieza
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);

      } catch (error) {
        toast.error('Error al descargar el PDF', {
          description: 'Hubo un problema al generar el PDF de la inspección preliminar.'
        });
        console.error('Error al descargar el PDF:', error);
      }
    };
  const handleCreateReport = async (values: z.infer<typeof createWorkOrderReport>) => {
    await createReportPage.mutateAsync({
      data: {
        work_order_id: values.work_order_id,
        company: selectedCompany?.slug || '',
      }
    })
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-center w-full flex flex-col gap-4">Reportes de WO
          <>
            {
              work_order?.work_order_report_pages ? (
                <div className="flex flex-col items-center gap-4">
                  <Badge className="bg-green-500">
                    Imprimir Hoja de Reporte
                  </Badge>
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer/>
                  </Button>
                  {/*<AddReportItemDialog work_order_report_pages_id={work_order.work_order_report_pages.id.toString()} />*/}
                </div>
              ) : (
                <p className="text-sm text-muted italic">No hay reportes registrados...</p>
              )
            }
          </>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!work_order?.work_order_report_pages && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <h2 className="text-2xl font-semibold">Crear Reportes de WO</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Presione el botón para iniciar una nueva hoja de reportes.
                </p>
                <Button className="mt-4">
                  Crear Reporte
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Crear Reporte</DialogTitle>
              </DialogHeader>
              <p>
                ¿Desea crear una nueva hoja de reportes para esta orden de trabajo?
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={() => handleCreateReport(form.getValues())}>
                  Crear
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {
          work_order?.work_order_report_pages && (
            <div className="flex flex-col items-center justify-center">
              <div className="w-full">
                {/*<DataTable columns={columns} data={work_order.work_order_report_pages.reports} />*/}
              </div>
            </div>
          )
        }
      </CardContent>
    </Card >
  )
}

export default ReportTable
