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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import axiosInstance from "@/lib/axios"
import { useCompanyStore } from "@/stores/CompanyStore"
import { WorkOrder } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Printer } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

type HoursMode = "auto" | "manual"

// Esquema de validación con Zod
const createWorkOrderReport = z.object({
  work_order_id: z.string(),
})

const ReportTable = ({ work_order }: { work_order: WorkOrder }) => {
  const { selectedCompany } = useCompanyStore()
  const companySlug = selectedCompany?.slug || "hangar74"

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Dialog de impresión
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Páginas
  const [printPages, setPrintPages] = useState<string>("2")
  const [pagesError, setPagesError] = useState<string | null>(null)

  // Horas (igual que WO)
  const [hoursMode, setHoursMode] = useState<HoursMode>("auto")
  const [manualHours, setManualHours] = useState<string>("") // ✅ vacío por defecto
  const [manualError, setManualError] = useState<string | null>(null)

  const { createReportPage } = useCreateReportPage()

  const form = useForm<z.infer<typeof createWorkOrderReport>>({
    resolver: zodResolver(createWorkOrderReport),
    defaultValues: {},
  })

  useEffect(() => {
    form.setValue("work_order_id", work_order.id.toString())
  }, [form, work_order.id])

  const validatePages = () => {
    const raw = printPages.trim()
    if (raw === "") {
      setPagesError("Indica la cantidad de páginas (mínimo 2).")
      return false
    }

    const n = Number(raw)
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      setPagesError("Ingresa un número entero válido.")
      return false
    }
    if (n < 2) {
      setPagesError("El mínimo es 2 páginas.")
      return false
    }

    setPagesError(null)
    return true
  }

  const validateManualHours = () => {
    if (hoursMode !== "manual") return true

    // ✅ Permitir vacío: PDF debe salir vacío
    if (manualHours.trim() === "") {
      setManualError(null)
      return true
    }

    // Acepta coma o punto
    const normalized = manualHours.replace(",", ".")
    const n = Number(normalized)

    if (!Number.isFinite(n)) {
      setManualError("Ingresa un número válido.")
      return false
    }
    if (n < 0) {
      setManualError("Las horas no pueden ser negativas.")
      return false
    }

    setManualError(null)
    return true
  }

  const handlePrint = async () => {
    if (!validatePages()) return
    if (!validateManualHours()) return

    const safePages = Number(printPages)

    // Params: pages siempre, hours según selección
    const params: Record<string, any> = {
      pages: safePages,
      aircraft_hours_mode: hoursMode, // auto | manual
    }

    // ✅ Solo enviar aircraft_hours si realmente hay un valor
    if (hoursMode === "manual" && manualHours.trim() !== "") {
      params.aircraft_hours = Number(manualHours.replace(",", "."))
    }

    try {
      setIsDownloading(true)

      const response = await axiosInstance.get(
        `/${companySlug}/work-order-pdf-report/${work_order.order_number}`,
        {
          responseType: "blob",
          params,
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

      setIsPrintDialogOpen(false)
    } catch (error) {
      toast.error("Error al descargar el PDF", {
        description: "Hubo un problema al generar el PDF de la hoja de reporte.",
      })
      console.error("Error al descargar el PDF:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCreateReport = async (values: z.infer<typeof createWorkOrderReport>) => {
    await createReportPage.mutateAsync({
      data: {
        work_order_id: values.work_order_id,
        company: selectedCompany?.slug || "",
      },
    })
    setIsDialogOpen(false)
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

                {/* ✅ Dialog avanzado: páginas + horas auto/manual */}
                <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2" disabled={isDownloading}>
                      {isDownloading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Printer className="size-4" />
                      )}
                      Imprimir
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                      <DialogTitle>Imprimir hoja de reporte</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5">
                      {/* Páginas */}
                      <div className="space-y-2">
                        <Label htmlFor="pages">Cantidad de páginas</Label>
                        <Input
                          id="pages"
                          inputMode="numeric"
                          value={printPages}
                          onChange={(e) => {
                            setPrintPages(e.target.value)
                            setPagesError(null)
                          }}
                          onBlur={validatePages}
                          placeholder="2"
                        />
                        {pagesError && <p className="text-sm text-destructive">{pagesError}</p>}
                        <p className="text-xs text-muted-foreground">
                          Mínimo 2 páginas. Las páginas extra se generan como “continuación”.
                        </p>
                      </div>

                      {/* Horas */}
                      <div className="space-y-2">
                        <Label>Horas de aeronave</Label>
                        <RadioGroup
                          value={hoursMode}
                          onValueChange={(v) => {
                            setHoursMode(v as HoursMode)
                            setManualError(null)
                          }}
                          className="grid gap-2"
                        >
                          <div className="flex items-center gap-2 rounded-md border p-3">
                            <RadioGroupItem value="auto" id="hours-auto" />
                            <Label htmlFor="hours-auto" className="cursor-pointer">
                              Automáticas (del sistema)
                            </Label>
                          </div>

                          <div className="flex items-center gap-2 rounded-md border p-3">
                            <RadioGroupItem value="manual" id="hours-manual" />
                            <Label htmlFor="hours-manual" className="cursor-pointer">
                              Manuales (definir valor)
                            </Label>
                          </div>
                        </RadioGroup>

                        {hoursMode === "manual" && (
                          <div className="space-y-2 pt-2">
                            <Label htmlFor="manual-hours">Horas a mostrar</Label>
                            <Input
                              id="manual-hours"
                              inputMode="decimal"
                              value={manualHours}
                              onChange={(e) => {
                                setManualHours(e.target.value)
                                setManualError(null)
                              }}
                              onBlur={validateManualHours}
                              placeholder="Déjalo vacío para imprimir sin horas"
                            />
                            {manualError && <p className="text-sm text-destructive">{manualError}</p>}
                            <p className="text-xs text-muted-foreground">
                              Tip: puedes escribir decimales con coma o punto.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsPrintDialogOpen(false)}
                        disabled={isDownloading}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handlePrint} disabled={isDownloading}>
                        {isDownloading ? "Descargando..." : "Descargar PDF"}
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
                <Button onClick={() => handleCreateReport(form.getValues())}>Crear</Button>
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
