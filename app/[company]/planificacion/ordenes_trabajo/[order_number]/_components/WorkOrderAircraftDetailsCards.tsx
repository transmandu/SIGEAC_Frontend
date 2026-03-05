"use client"

import { useEffect, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import axiosInstance from "@/lib/axios"
import { cn } from "@/lib/utils"
import { WorkOrder } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Eye, Printer, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCompanyStore } from "@/stores/CompanyStore"

import {
  Dialog, DialogContent, DialogTrigger,
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
  const [reportPagesTotal, setReportPagesTotal] = useState<string>("2")
  
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)

  const lastParamsRef = useRef<string>("");

  useEffect(() => {
    return () => { if (previewUrl) window.URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleAction = async (mode: 'download' | 'preview') => {
    const isDownload = mode === 'download';
    const params: Record<string, any> = {
      aircraft_hours_mode: hoursMode,
      client_signature: clientSignature?.trim() ?? "",
      report_pages_total: Number(reportPagesTotal.trim()),
    }

    if (hoursMode === "manual" && manualHours.trim() !== "") {
      params.aircraft_hours = Number(manualHours.replace(",", "."));
    }

    const currentParamsJson = JSON.stringify(params);

    if (previewUrl && previewBlob && currentParamsJson === lastParamsRef.current) {
        if (isDownload) {
            const url = window.URL.createObjectURL(previewBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `WO_${work_order.order_number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setPrintOpen(false);
            return;
        } else if (mode === 'preview') return;
    }

    isDownload ? setIsDownloading(true) : setIsPreviewing(true);

    try {
      const response = await axiosInstance.get(
        `/${companySlug}/work-orders/${work_order.order_number}/package`,
        { responseType: "blob", params }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      if (isDownload) {
        const link = document.createElement("a");
        link.href = url;
        link.download = `WO_${work_order.order_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setPrintOpen(false);
      } else {
        lastParamsRef.current = currentParamsJson;
        if (previewUrl) window.URL.revokeObjectURL(previewUrl);
        setPreviewUrl(url);
        setPreviewBlob(blob);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo generar el PDF." });
    } finally {
      setIsDownloading(false);
      setIsPreviewing(false);
    }
  };

  return (
    <div className="flex gap-4 justify-center w-full">
      <Card className="w-1/2 border-border bg-card text-card-foreground">
        <CardHeader className="text-center">
          <CardTitle>WO - {work_order.order_number}</CardTitle>
          <CardDescription>{work_order.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center text-sm">
            <div><p className="text-muted-foreground italic text-xs uppercase tracking-tight">Fecha de Orden</p><p className="font-medium">{format(work_order.date, "PPP", { locale: es })}</p></div>
            <div><p className="text-muted-foreground italic text-xs uppercase tracking-tight">Cliente</p><p className="font-medium">{work_order.aircraft.client.name}</p></div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-6">
          <Badge className={work_order.status === "ABIERTO" ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 text-white"}>{work_order.status}</Badge>

          <Dialog open={printOpen} onOpenChange={(val) => { 
            setPrintOpen(val); 
            if(!val) { setPreviewUrl(null); setPreviewBlob(null); lastParamsRef.current = ""; } 
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 px-8"><Printer className="size-4" /> Descargar paquete (PDF)</Button>
            </DialogTrigger>

            <DialogContent
              className={cn(
                "transition-all duration-300 ease-in-out p-6 overflow-y-auto [&>button]:right-2 [&>button]:top-2 bg-background text-foreground border-border",
                previewUrl ? "max-w-[98vw] w-[98vw] h-[96vh]" : "max-w-md"
              )}
            >
              <div
                className={cn(
                  "flex gap-6 h-full",
                  previewUrl ? "flex-col lg:flex-row" : "flex-col"
                )}
              >
                
                {/* PANEL DE CONTROL */}
                <div
                  className={cn(
                    "flex flex-col gap-5 transition-all",
                    previewUrl
                      ? "w-full lg:w-[320px] lg:border-r border-border lg:pr-6"
                      : "w-full"
                  )}
                >
                  <h2 className="font-bold text-2xl tracking-tight text-foreground">
                    {previewUrl ? "Ajustes" : "Configuración"}
                  </h2>
                  
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-primary tracking-widest">Horas de aeronave</Label>
                    <RadioGroup value={hoursMode} onValueChange={(v) => setHoursMode(v as HoursMode)} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 border border-input p-3 rounded-lg hover:bg-accent cursor-pointer transition-all">
                        <RadioGroupItem value="auto" id="auto" />
                        <Label htmlFor="auto" className="text-sm cursor-pointer font-medium">
                          Automáticas (del sistema)
                        </Label>
                      </div>
                      <div className="flex items-center gap-2 border border-input p-3 rounded-lg hover:bg-accent cursor-pointer transition-all">
                        <RadioGroupItem value="manual" id="manual" />
                        <Label htmlFor="manual" className="text-sm cursor-pointer font-medium">
                          Manuales (definir valor)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {hoursMode === "manual" && (
                    <Input
                      className="h-10 text-sm bg-background border-input"
                      placeholder="0.00"
                      value={manualHours}
                      onChange={(e) => setManualHours(e.target.value)}
                    />
                  )}
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-primary tracking-widest">Firma del Cliente</Label>
                    <Input
                      className="h-10 text-sm bg-background border-input"
                      value={clientSignature}
                      onChange={(e) => setClientSignature(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-primary tracking-widest">Páginas Hoja Reporte</Label>
                    <Input
                      className="h-10 text-sm bg-background border-input"
                      type="number"
                      value={reportPagesTotal}
                      onChange={(e) => setReportPagesTotal(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-border">
                    {!previewUrl && (
                      <Button
                        variant="outline"
                        onClick={() => handleAction('preview')}
                        disabled={isPreviewing}
                        className="h-11 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all font-semibold"
                      >
                        {isPreviewing ? <Loader2 className="animate-spin size-4 mr-2" /> : <Eye className="size-4 mr-2" />}
                        Ver Vista Previa
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleAction('download')}
                      disabled={isDownloading}
                      className="h-11 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-bold transition-all active:scale-[0.98]"
                    >
                      {isDownloading ? <Loader2 className="animate-spin size-4 mr-2" /> : <Printer className="size-4 mr-2" />}
                      {previewUrl ? "Descargar PDF Final" : "Generar y Descargar"}
                    </Button>

                    {previewUrl && (
                      <Button
                        variant="outline"
                        className="h-11 border-input text-muted-foreground hover:bg-accent hover:text-foreground transition-all font-semibold"
                        onClick={() => { setPreviewUrl(null); setPreviewBlob(null); lastParamsRef.current = ""; }}
                      >
                        Cerrar Vista Previa
                      </Button>
                    )}
                  </div>
                </div>

                {/* VISOR PDF */}
                {previewUrl && (
                  <div
                    className="
                      relative
                      border
                      border-border
                      rounded-xl
                      bg-muted/30
                      overflow-hidden
                      shadow-2xl
                      w-full
                      h-[60vh]
                      lg:h-full
                    "
                  >
                    <iframe
                      src={`${previewUrl}#view=FitH&navpanes=0`}
                      className="w-full h-full border-none"
                      title="Preview"
                    />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card className="w-1/3 text-center border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-primary">{work_order.aircraft.acronym}</CardTitle>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href={`/${companySlug}/planificacion/aeronaves`}>
            <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-colors">
              Ver Aeronave
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default WorkOrderAircraftDetailsCards