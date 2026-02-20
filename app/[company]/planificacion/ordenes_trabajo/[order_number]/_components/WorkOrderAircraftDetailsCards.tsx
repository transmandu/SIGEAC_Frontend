"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import axiosInstance from "@/lib/axios"
import { cn } from "@/lib/utils"
import { WorkOrder } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  CalendarFold,
  Clock3,
  Eye,
  FileCheck2,
  MapPin,
  PencilLine,
  Printer,
  RefreshCw,
  User,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useCompanyStore } from "@/stores/CompanyStore"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter as DialogFooterUI,
  DialogHeader as DialogHeaderUI,
  DialogTitle as DialogTitleUI,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type HoursMode = "auto" | "manual"

const WorkOrderAircraftDetailsCards = ({ work_order }: { work_order: WorkOrder }) => {
  const { selectedCompany } = useCompanyStore()
  const companySlug = selectedCompany?.slug || "hangar74"

  const [printOpen, setPrintOpen] = useState(false)
  const [hoursMode, setHoursMode] = useState<HoursMode>("auto")
  const [manualHours, setManualHours] = useState<string>("")
  const [clientSignature, setClientSignature] = useState<string>("Freddy Guerrero")

  // NUEVO: páginas hoja de reporte
  const [reportPagesTotal, setReportPagesTotal] = useState<string>("2")
  const [reportPagesError, setReportPagesError] = useState<string | null>(null)

  const [isDownloading, setIsDownloading] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)

  useEffect(() => {
    if (hoursMode === "auto") setManualError(null)
  }, [hoursMode])

  const validateManualHours = () => {
    if (hoursMode !== "manual") return true

    // Permitir vacío: PDF debe salir vacío
    if (manualHours.trim() === "") {
      setManualError(null)
      return true
    }

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

  const validateReportPages = () => {
    const raw = reportPagesTotal.trim()
    if (raw === "") {
      setReportPagesError("Ingresa un número de páginas.")
      return false
    }

    const n = Number(raw)
    if (!Number.isInteger(n) || n < 1) {
      setReportPagesError("Debe ser un entero mayor o igual a 1.")
      return false
    }

    // límite de seguridad (ajusta si quieres)
    if (n > 50) {
      setReportPagesError("Máximo 50 páginas.")
      return false
    }

    setReportPagesError(null)
    return true
  }

  const handleDownloadPackage = async (params: Record<string, any>) => {
    try {
      setIsDownloading(true)

      const response = await axiosInstance.get(
        `/${companySlug}/work-orders/${work_order.order_number}/package`,
        {
          responseType: "blob",
          params,
        }
      )

      // Intentar nombre del backend, si existe
      const disposition = response.headers?.["content-disposition"] as string | undefined
      const match = disposition?.match(/filename="?([^"]+)"?/i)
      const fallbackName = `package_${work_order.order_number}.zip`
      const filename = match?.[1] || fallbackName

      const blob = new Blob([response.data], { type: "application/zip" })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()

      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo descargar el paquete. Por favor intente nuevamente.",
      })
      console.error("Error al descargar el paquete:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const onConfirmDownload = async () => {
    if (!validateManualHours()) return
    if (!validateReportPages()) return

    const params: Record<string, any> = {
      aircraft_hours_mode: hoursMode, // auto | manual
      client_signature: clientSignature?.trim() ?? "",
      report_pages_total: Number(reportPagesTotal.trim()),
      // isExplotador: work_order.isExplotador, // <- si luego quieres forzarlo desde UI
    }

    // Manual: permitir vacío => no enviamos aircraft_hours
    if (hoursMode === "manual") {
      if (manualHours.trim() !== "") {
        const normalized = manualHours.replace(",", ".")
        const n = Number(normalized)
        if (Number.isFinite(n) && n >= 0) {
          params.aircraft_hours = n
        }
      }
    }

    await handleDownloadPackage(params)
    setPrintOpen(false)
  }

  return (
    <div className="flex gap-4 justify-center w-full">
      {/* Detalles de Orden de Trabajo */}
      <Card className="w-1/2">
        <CardHeader className="flex justify-center text-center">
          <CardTitle>WO - {work_order!.order_number}</CardTitle>
          <CardDescription>{work_order?.description}</CardDescription>
        </CardHeader>

        <CardContent>
          {work_order && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600 flex gap-1 items-center">
                  Fecha de Orden <CalendarFold className="size-4" />
                </p>
                <p className="font-medium">{format(work_order.date, "PPP", { locale: es })}</p>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600 flex gap-1 items-center">
                  Elaborado Por <PencilLine className="size-4" />
                </p>
                <p className="font-medium">{work_order.elaborated_by}</p>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600 flex gap-1 items-center">
                  Revisado Por <Eye className="size-4" />
                </p>
                <p className="font-medium">{work_order.reviewed_by}</p>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600 flex gap-1 items-center">
                  Aprobado Por <FileCheck2 className="size-4" />
                </p>
                <p className="font-medium">{work_order.approved_by}</p>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-medium">{work_order.aircraft.client.name}</p>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600">Número de Tareas</p>
                <p className="font-medium">{work_order.work_order_tasks.length} tarea(s)</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col justify-between space-y-10">
          <Badge
            className={cn(
              "scale-125 cursor-pointer hover:scale-150 transition-all ease-in",
              work_order.status === "ABIERTO"
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            )}
          >
            {work_order?.status}
          </Badge>

          {/* Dialog de descarga */}
          <Dialog open={printOpen} onOpenChange={setPrintOpen}>
            <DialogTrigger asChild>
              <Button disabled={isDownloading} className="gap-2">
                {isDownloading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Printer className="size-4" />
                )}
                Descargar paquete (ZIP)
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeaderUI>
                <DialogTitleUI>Opciones de descarga</DialogTitleUI>
                <DialogDescription>
                </DialogDescription>
              </DialogHeaderUI>

              <div className="space-y-4">
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
                </div>

                {hoursMode === "manual" && (
                  <div className="space-y-2">
                    <Label htmlFor="manual-hours">Horas a mostrar</Label>
                    <Input
                      id="manual-hours"
                      inputMode="decimal"
                      value={manualHours}
                      onChange={(e) => setManualHours(e.target.value)}
                      onBlur={validateManualHours}
                      placeholder="Déjalo vacío para imprimir sin horas"
                    />
                    {manualError && <p className="text-sm text-destructive">{manualError}</p>}
                    <p className="text-xs text-muted-foreground">
                      Tip: puedes escribir decimales con coma o punto.
                    </p>
                  </div>
                )}

                {/* Firma */}
                <div className="space-y-2">
                  <hr className="my-2" />
                  <Label className="text-sm">
                    Firma del Cliente{" "}
                    <span className="text-xs text-muted-foreground">
                      (Dejar vacío para no incluir firma)
                    </span>
                  </Label>
                  <Input
                    value={clientSignature}
                    onChange={(e) => setClientSignature(e.target.value)}
                  />
                </div>

                {/* NUEVO: páginas de hoja de reporte */}
                <div className="space-y-2">
                  <Label className="text-sm">Páginas de Hoja de Reporte</Label>
                  <Input
                    inputMode="numeric"
                    value={reportPagesTotal}
                    onChange={(e) => setReportPagesTotal(e.target.value)}
                    onBlur={validateReportPages}
                    placeholder="Ej: 2"
                    defaultValue={2}
                  />
                  {reportPagesError && <p className="text-sm text-destructive">{reportPagesError}</p>}
                  <p className="text-xs text-muted-foreground">
                    Define cuántas páginas se generan en la hoja de reporte.
                  </p>
                </div>
              </div>

              <DialogFooterUI className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPrintOpen(false)}
                  disabled={isDownloading}
                >
                  Cancelar
                </Button>
                <Button onClick={onConfirmDownload} disabled={isDownloading}>
                  {isDownloading ? "Descargando..." : "Confirmar y descargar"}
                </Button>
              </DialogFooterUI>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      {/* Detalles de Aeronave */}
      <Card className="w-1/3">
        <CardHeader className="text-center">
          <CardTitle>Aeronave - {work_order?.aircraft.acronym}</CardTitle>
          <CardDescription>{work_order?.aircraft.comments}</CardDescription>
        </CardHeader>

        <CardContent>
          {work_order && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col justify-center text-center">
                <p className="text-sm text-gray-600 flex justify-center items-center gap-1">
                  Horas de Vuelo <Clock3 className="size-4" />
                </p>
                <p className="font-medium">{work_order.aircraft.flight_hours}</p>
              </div>

              <div className="flex flex-col justify-center text-center">
                <p className="text-sm text-gray-600 flex justify-center items-center gap-1">
                  Ciclos de Vuelo <RefreshCw className="size-4" />
                </p>
                <p className="font-medium">{work_order.aircraft.flight_cycles}</p>
              </div>

              <div className="flex flex-col justify-center text-center">
                <p className="text-sm text-gray-600 flex justify-center items-center gap-1">
                  Cliente <User className="size-4" />
                </p>
                <p className="font-medium">{work_order.aircraft.client.name}</p>
              </div>

              <div className="flex flex-col justify-center text-center">
                <p className="text-sm text-gray-600 flex justify-center items-center gap-1">
                  Ubicación <MapPin className="size-4" />
                </p>
                <p className="font-medium">Puerto Ordaz</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link href={`/${companySlug}/planificacion/aeronaves`}>
            <Button>Ver Aeronave</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default WorkOrderAircraftDetailsCards
