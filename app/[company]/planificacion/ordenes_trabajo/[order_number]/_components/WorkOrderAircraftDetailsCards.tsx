"use client"
import {useState, useEffect,useRef} from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { WorkOrder } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Lock } from "lucide-react"
import Link from "next/link"
import { useCompanyStore } from "@/stores/CompanyStore"
import { useCloseWorkOrder, useUpdateWorkOrder } from "@/actions/mantenimiento/planificacion/ordenes_trabajo/actions";
import { PdfPreviewDialog } from "@/components/dialogs/aerolinea/administracion/PdfPreviewDialog"
import { Input } from "@/components/ui/input"
import { Loader2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import axiosInstance from "@/lib/axios"
import { toast } from "sonner"

  type HoursMode = "auto" | "manual";
  const WorkOrderAircraftDetailsCards = ({ work_order }: { work_order: WorkOrder }) => {
  const { selectedCompany } = useCompanyStore()
  const companySlug = selectedCompany?.slug || "hangar74"

  const [printOpen, setPrintOpen] = useState(false)
  const [hoursMode, setHoursMode] = useState<HoursMode>("auto")
  const [manualHours, setManualHours] = useState<string>("")
  const [clientSignature, setClientSignature] = useState<string>("Freddy Guerrero")
  const [reportPagesTotal, setReportPagesTotal] = useState<string>("2")
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const {closeWorkOrder } = useCloseWorkOrder();
  const { updateWorkOrder } = useUpdateWorkOrder();
  const [isUploading, setIsUploading] = useState(false);
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
            link.remove()
            window.URL.revokeObjectURL(url);
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
        link.remove()
        window.URL.revokeObjectURL(url);
        setPrintOpen(false);
      } else {
        lastParamsRef.current = currentParamsJson;
        if (previewUrl) window.URL.revokeObjectURL(previewUrl);
        setPreviewUrl(url);
        setPreviewBlob(blob);
      }
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo generar el PDF.",
      });
    } finally {
      setIsDownloading(false);
      setIsPreviewing(false);
    }
  };

  const handleAutoUpload = async (file: File) => {
    if (!selectedCompany) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo excede los 10MB permitidos.");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF.");
      return;
    }

    setIsUploading(true);
    try {
      await updateWorkOrder.mutateAsync({
        id: work_order.id,
        company: companySlug,
        data: {
          document: file,
          // Enviamos datos básicos para asegurar consistencia
          description: work_order.description,
          elaborated_by: work_order.elaborated_by,
          reviewed_by: work_order.reviewed_by,
          approved_by: work_order.approved_by,
          date: work_order.date,
        },
      });
    } catch (error) {
      console.error("[WorkOrderAircraftDetailsCards] Error en auto-upload:", error);
    } finally {
      setIsUploading(false);
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

         <PdfPreviewDialog
            fileName={`WO_${work_order.order_number}`}
            endpoint={`/${companySlug}/work-orders/${work_order.order_number}/package`}
          /> 

          <div className="w-full max-w-xs space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Upload className="size-3" />
              {work_order.document ? "Actualizar Documento" : "Cargar Documento"}
            </div>
            <div className="relative">
              <Input
                type="file"
                accept="application/pdf"
                disabled={work_order.status === "CERRADO" || isUploading}
                className={cn(
                  "h-9 text-xs cursor-pointer bg-muted/50 hover:bg-muted transition-colors",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAutoUpload(file);
                }}
              />
              {isUploading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>

          <div className = "flex flex-wrap gap-4 justify-center">
            {work_order.document && (
                <PdfPreviewDialog
                  showConfig={false}
                  fileName={`DOC_WO_${work_order.order_number}`}
                  endpoint={`/${companySlug}/work-orders/document`}
                  fixedParams={{ path: work_order.document }}
                  triggerLabel="Ver Documento"
                  triggerVariant="outline"
                />
            )}
            {work_order.document && work_order.status !== "CERRADO" && (
            <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2 hover:bg-red-500">
                  <Lock className="size-4 " />
                  Cerrar Orden de Trabajo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cerrar esta orden de trabajo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción cerrará permanentemente la orden <strong>{work_order.order_number}</strong>. 
                    Una vez cerrada no podrá ser modificada.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={closeWorkOrder.isPending}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={closeWorkOrder.isPending}
                    onClick={async () => {
                      await closeWorkOrder.mutateAsync({
                        id: work_order.id,
                        company: companySlug,
                      });
                      setCloseDialogOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                   Si
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          </div>
          

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