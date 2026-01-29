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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axiosInstance from "@/lib/axios"
import { useCompanyStore } from "@/stores/CompanyStore"
import { WorkOrder } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Printer } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

// Esquema de validación con Zod
const createWorkOrderReport = z.object({
  work_order_id: z.string(),
})

const ReportTable = ({ work_order }: { work_order: WorkOrder }) => {
  const { selectedCompany } = useCompanyStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Dialog de impresión
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
  const [printPages, setPrintPages] = useState<number>(2)

  const { createReportPage } = useCreateReportPage()

  const form = useForm<z.infer<typeof createWorkOrderReport>>({
    resolver: zodResolver(createWorkOrderReport),
    defaultValues: {}
  })

  form.setValue('work_order_id', work_order.id.toString())

  const handlePrint = async (pages: number) => {
    try {
      const safePages = Math.max(2, Number.isFinite(pages) ? pages : 2)

      const response = await axiosInstance.get(
        `/hangar74/work-order-pdf-report/${work_order.order_number}`,
        {
          responseType: "blob",
          params: { pages: safePages }, // ✅ esto termina siendo ?pages=X
        }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `REPORT_PAGE_WO-${work_order.order_number}.pdf`)
      document.body.appendChild(link)
      link.click()

      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error("Error al descargar el PDF", {
        description: "Hubo un problema al generar el PDF de la inspección preliminar."
      })
      console.error("Error al descargar el PDF:", error)
    }
  }

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
        <CardTitle className="text-center w-full flex flex-col gap-4">
          Reportes de WO
          <>
            {work_order?.work_order_report_pages ? (
              <div className="flex flex-col items-center gap-4">
                <Badge className="bg-green-500">Imprimir Hoja de Reporte</Badge>

                {/* ✅ Dialog para pedir pages antes de imprimir */}
                <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Printer />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle>Imprimir hoja de reporte</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2">
                      <Label htmlFor="pages">Cantidad de páginas</Label>
                      <Input
                        id="pages"
                        type="number"
                        min={2}
                        value={printPages}
                        onChange={(e) => setPrintPages(parseInt(e.target.value || "2", 10))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Mínimo 2 páginas. Las páginas extra se generan como “continuación”.
                      </p>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={async () => {
                          await handlePrint(printPages)
                          setIsPrintDialogOpen(false)
                        }}
                      >
                        Descargar PDF
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/*<AddReportItemDialog work_order_report_pages_id={work_order.work_order_report_pages.id.toString()} />*/}
              </div>
            ) : (
              <p className="text-sm text-muted italic">No hay reportes registrados...</p>
            )}
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
                <Button className="mt-4">Crear Reporte</Button>
              </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Crear Reporte</DialogTitle>
              </DialogHeader>

              <p>¿Desea crear una nueva hoja de reportes para esta orden de trabajo?</p>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => handleCreateReport(form.getValues())}>
                  Crear
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {work_order?.work_order_report_pages && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-full">
              {/*<DataTable columns={columns} data={work_order.work_order_report_pages.reports} />*/}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ReportTable
