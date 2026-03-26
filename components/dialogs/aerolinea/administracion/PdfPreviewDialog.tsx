"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Eye, Printer, Loader2, FileDown } from "lucide-react"
import axiosInstance from "@/lib/axios"

type HoursMode = "auto" | "manual"

interface PdfPreviewDialogProps {
  /** Nombre del archivo al descargar, sin extensión. Ej: "WO_2024-001" */
  fileName: string
  /** Endpoint GET que devuelve el PDF como blob */
  endpoint: string
  /** Params fijos que siempre se envían */
  fixedParams?: Record<string, any>
  /** Texto del botón trigger */
  triggerLabel?: string
  /** Ícono del botón trigger */
  triggerIcon?: React.ReactNode
  /** Variante del botón trigger */
  triggerVariant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link"
  /**
   * Cuando es false, oculta el panel de configuración (horas, firma, etc.)
   * y carga el PDF automáticamente al abrir el dialog.
   * Útil para documentos adjuntos que no necesitan parámetros.
   * @default true
   */
  showConfig?: boolean
}

export function PdfPreviewDialog({
  fileName,
  endpoint,
  fixedParams = {},
  triggerLabel = "Descargar paquete (PDF)",
  triggerIcon,
  triggerVariant = "default",
  showConfig = true,
}: PdfPreviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [hoursMode, setHoursMode] = useState<HoursMode>("auto")
  const [manualHours, setManualHours] = useState("")
  const [clientSignature, setClientSignature] = useState("Freddy Guerrero")
  const [reportPagesTotal, setReportPagesTotal] = useState("2")

  const [isDownloading, setIsDownloading] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const lastParamsRef = useRef<string>("")

  useEffect(() => {
    return () => { if (previewUrl) window.URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  const buildParams = () => {
    const params: Record<string, any> = {
      ...fixedParams,
      aircraft_hours_mode: hoursMode,
      client_signature: clientSignature?.trim() ?? "",
      report_pages_total: Number(reportPagesTotal.trim()),
    }
    if (hoursMode === "manual" && manualHours.trim() !== "") {
      params.aircraft_hours = Number(manualHours.replace(",", "."))
    }
    return params
  }

  const handleAction = async (mode: "download" | "preview") => {
    const isDownload = mode === "download"
    const params = buildParams()
    const currentParamsJson = JSON.stringify(params)

    if (previewUrl && previewBlob && currentParamsJson === lastParamsRef.current) {
      if (isDownload) {
        const url = window.URL.createObjectURL(previewBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${fileName}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setOpen(false)
      }
      return
    }

    isDownload ? setIsDownloading(true) : setIsPreviewing(true)

    try {
      const response = await axiosInstance.get(endpoint, { responseType: "blob", params })
      const blob = new Blob([response.data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)

      if (isDownload) {
        const link = document.createElement("a")
        link.href = url
        link.download = `${fileName}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setOpen(false)
      } else {
        lastParamsRef.current = currentParamsJson
        if (previewUrl) window.URL.revokeObjectURL(previewUrl)
        setPreviewUrl(url)
        setPreviewBlob(blob)
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo generar el PDF." })
    } finally {
      setIsDownloading(false)
      setIsPreviewing(false)
    }
  }

  const resetPreview = () => {
    setPreviewUrl(null)
    setPreviewBlob(null)
    lastParamsRef.current = ""
  }

  // Cuando showConfig=false, cargar el PDF automáticamente al abrir
  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      resetPreview()
    } else if (!showConfig) {
      handleAction("preview")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className="gap-2 px-8">
          {triggerIcon ?? <Printer className="size-4" />}
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "transition-all duration-300 ease-in-out p-6 overflow-y-auto [&>button]:right-2 [&>button]:top-2 bg-background text-foreground border-border",
          // Sin config: siempre modo visor amplio. Con config: depende de si hay preview.
          !showConfig ? "max-w-[98vw] w-[98vw] h-[96vh]" :
          previewUrl ? "max-w-[98vw] w-[98vw] h-[96vh]" : "max-w-md"
        )}
      >
        {/* MODO SIN CONFIGURACIÓN: solo visor + botón descarga */}
        {!showConfig ? (
          <div className="flex flex-col h-full gap-4">
            <div className="flex items-center justify-between shrink-0">
              <h2 className="font-bold text-xl tracking-tight text-foreground">{fileName}</h2>
              <Button
                onClick={() => handleAction("download")}
                disabled={isDownloading || isPreviewing}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {isDownloading ? <Loader2 className="animate-spin size-4" /> : <FileDown className="size-4" />}
                Descargar
              </Button>
            </div>
            <div className="relative border border-border rounded-xl bg-muted/30 overflow-hidden shadow-2xl w-full flex-1">
              {isPreviewing && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <Loader2 className="animate-spin size-8 text-primary" />
                </div>
              )}
              {previewUrl && (
                <iframe src={`${previewUrl}#view=FitH&navpanes=0`} className="w-full h-full border-none" title="Preview" />
              )}
            </div>
          </div>
        ) : (
          /* MODO CON CONFIGURACIÓN: panel lateral + visor */
          <div className={cn("flex gap-6 h-full", previewUrl ? "flex-col lg:flex-row" : "flex-col")}>

            {/* PANEL DE CONTROL */}
            <div className={cn("flex flex-col gap-5 transition-all", previewUrl ? "w-full lg:w-[320px] lg:border-r border-border lg:pr-6" : "w-full")}>
              <h2 className="font-bold text-2xl tracking-tight text-foreground">
                {previewUrl ? "Ajustes" : "Configuración"}
              </h2>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-primary tracking-widest">Horas de aeronave</Label>
                <RadioGroup value={hoursMode} onValueChange={(v) => setHoursMode(v as HoursMode)} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 border border-input p-3 rounded-lg hover:bg-accent cursor-pointer transition-all">
                    <RadioGroupItem value="auto" id="pdf-auto" />
                    <Label htmlFor="pdf-auto" className="text-sm cursor-pointer font-medium">Automáticas (del sistema)</Label>
                  </div>
                  <div className="flex items-center gap-2 border border-input p-3 rounded-lg hover:bg-accent cursor-pointer transition-all">
                    <RadioGroupItem value="manual" id="pdf-manual" />
                    <Label htmlFor="pdf-manual" className="text-sm cursor-pointer font-medium">Manuales (definir valor)</Label>
                  </div>
                </RadioGroup>
              </div>

              {hoursMode === "manual" && (
                <Input className="h-10 text-sm bg-background border-input" placeholder="0.00" value={manualHours} onChange={(e) => setManualHours(e.target.value)} />
              )}

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-primary tracking-widest">Firma del Cliente</Label>
                <Input className="h-10 text-sm bg-background border-input" value={clientSignature} onChange={(e) => setClientSignature(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-primary tracking-widest">Páginas Hoja Reporte</Label>
                <Input className="h-10 text-sm bg-background border-input" type="number" value={reportPagesTotal} onChange={(e) => setReportPagesTotal(e.target.value)} />
              </div>

              <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-border">
                {!previewUrl && (
                  <Button variant="outline" onClick={() => handleAction("preview")} disabled={isPreviewing}
                    className="h-11 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all font-semibold">
                    {isPreviewing ? <Loader2 className="animate-spin size-4 mr-2" /> : <Eye className="size-4 mr-2" />}
                    Ver Vista Previa
                  </Button>
                )}
                <Button onClick={() => handleAction("download")} disabled={isDownloading}
                  className="h-11 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-bold transition-all active:scale-[0.98]">
                  {isDownloading ? <Loader2 className="animate-spin size-4 mr-2" /> : <Printer className="size-4 mr-2" />}
                  {previewUrl ? "Descargar PDF Final" : "Generar y Descargar"}
                </Button>
                {previewUrl && (
                  <Button variant="outline" onClick={resetPreview}
                    className="h-11 border-input text-muted-foreground hover:bg-accent hover:text-foreground transition-all font-semibold">
                    Cerrar Vista Previa
                  </Button>
                )}
              </div>
            </div>

            {/* VISOR PDF */}
            {previewUrl && (
              <div className="relative border border-border rounded-xl bg-muted/30 overflow-hidden shadow-2xl w-full h-[60vh] lg:h-full">
                <iframe src={`${previewUrl}#view=FitH&navpanes=0`} className="w-full h-full border-none" title="Preview" />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
