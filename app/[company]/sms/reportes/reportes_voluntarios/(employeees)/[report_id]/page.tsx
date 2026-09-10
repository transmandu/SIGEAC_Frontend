"use client";
import CreateDangerIdentificationDialog from "@/components/dialogs/aerolinea/sms/CreateDangerIdentificationDialog";
import CreateVoluntaryReportDialog from "@/components/dialogs/aerolinea/sms/CreateVoluntaryReportDialog";
import DeleteVoluntaryReportDialog from "@/components/dialogs/aerolinea/sms/DeleteVoluntaryReportDialog";
import PreviewVoluntaryReportPdfDialog from "@/components/dialogs/aerolinea/sms/PreviewVoluntaryReportPdfDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetVoluntaryReportById } from "@/hooks/sms/useGetVoluntaryReportById";
import { dateFormat } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  ChevronRight,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  File,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import ImageZoom from "@/components/ui/ImageZoom";
import Link from "next/link";
import { useParams } from "next/navigation";

const ShowVoluntaryReport = () => {
  const { report_id } = useParams<{ report_id: string }>();
  const { selectedCompany } = useCompanyStore();

  const {
    data: voluntaryReport,
    isLoading,
    isError,
  } = useGetVoluntaryReportById({
    id: report_id,
    company: selectedCompany?.slug,
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================
  const handleDownloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      // Fallback: open in a new tab if fetch fails due to CORS
      window.open(url, "_blank");
    }
  };

  // ==========================================================
  // ACTIONS
  // ==========================================================
  const renderActionButtons = () => {
    if (!voluntaryReport) return null;

    return (
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5"
        data-tour="voluntario-detalle-acciones"
      >
        {voluntaryReport.status === "ABIERTO" && (
          <>
            {!voluntaryReport.danger_identification_id ? (
              <CreateDangerIdentificationDialog
                title="Crear Identificación de Peligro"
                id={voluntaryReport.id}
                reportType="RVP"
              />
            ) : (
              <Button variant="outline" size="sm" className="h-9 w-full" asChild>
                <Link
                  href={`/${selectedCompany?.slug}/sms/gestion_reportes/peligros_identificados/${voluntaryReport.danger_identification_id}`}
                >
                  Ver Identificación de Peligro
                </Link>
              </Button>
            )}

            <CreateVoluntaryReportDialog
              initialData={voluntaryReport}
              isEditing={true}
              title="Editar Reporte"
            />

            <DeleteVoluntaryReportDialog
              company={selectedCompany!.slug}
              id={voluntaryReport.id.toString()}
            />
          </>
        )}

        <PreviewVoluntaryReportPdfDialog
          title="Descargar PDF"
          voluntaryReport={voluntaryReport}
        />
      </div>
    );
  };

  const sectionLabel = "text-xs font-medium uppercase tracking-wide text-muted-foreground";
  const fieldValue = "text-sm";

  // ==========================================================
  // CARDS
  // ==========================================================

  const renderBasicInfo = () => {
    // 1. Tipamos el parámetro para evitar el error ts(7006)
    const formatFriendlyDate = (dateString: string | null | undefined) => {
      if (!dateString) return null;
      // Evitamos problemas de zona horaria picando la cadena directamente
      const soloFecha = dateString.split(" ")[0]; // Extrae "2026-04-10"
      const [year, month, day] = soloFecha.split("-");
      return `${day}-${month}-${year}`;
    };

    // 2. Usamos una referencia con 'any' para evitar que TS se queje de las propiedades faltantes
    const reportData = voluntaryReport as any;

    return (
      <Card
        className="shadow-none border-border/60"
        data-tour="voluntario-detalle-info"
      >
        <CardHeader className="pb-3">
          <h3 className={`font-semibold flex items-center gap-2 ${fieldValue}`}>
            <FileText className="w-4 h-4 text-muted-foreground" />
            Información General
          </h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className={sectionLabel}>Número de Reporte</p>
            <p className={`${fieldValue} font-mono tracking-wide`}>
              {reportData?.report_number
                ? `RVP-${reportData.report_number}`
                : "N/A"}
            </p>
          </div>

          <div>
            <p className={sectionLabel}>Fecha del Reporte</p>
            <p className={fieldValue}>
              {reportData?.report_date
                ? format(
                    new Date(reportData.report_date.replace(/-/g, "/")),
                    "PPP",
                    { locale: es },
                  )
                : "N/A"}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className={sectionLabel}>Estado</span>
            <Badge
              className={`text-xs font-semibold ${
                reportData?.status === "CERRADO"
                  ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800"
                  : reportData?.status === "PROCESO" || reportData?.status === "PENDIENTE"
                    ? "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
                    : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800"
              }`}
            >
              {reportData?.status || "PENDIENTE"}
            </Badge>
          </div>

          {reportData?.status === "CERRADO" && reportData?.close_date && (
            <div className="pt-3 mt-2 border-t border-border/60">
              <p className={sectionLabel}>Fecha de Cierre</p>
              <p className={`${fieldValue} text-green-700 dark:text-green-400`}>
                {formatFriendlyDate(reportData.close_date)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderLocationInfo = () => (
    <Card
      className="shadow-none border-border/60"
      data-tour="voluntario-detalle-ubicacion"
    >
      <CardHeader className="pb-3">
        <h3 className={`font-semibold flex items-center gap-2 ${fieldValue}`}>
          <MapPin className="w-4 h-4 text-muted-foreground" />
          Ubicación del Peligro
        </h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className={sectionLabel}>Área</p>
          <p className={fieldValue}>{voluntaryReport?.danger_area || "N/A"}</p>
        </div>
        <div>
          <p className={sectionLabel}>Base</p>
          <p className={fieldValue}>
            {voluntaryReport?.danger_location || "N/A"}
          </p>
        </div>
        <div>
          <p className={sectionLabel}>Localización exacta</p>
          <p className={fieldValue}>
            {voluntaryReport?.airport_location || "N/A"}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderIdentificationDate = () => (
    <Card
      className="shadow-none border-border/60"
      data-tour="voluntario-detalle-fecha"
    >
      <CardHeader className="pb-3">
        <h3 className={`font-semibold flex items-center gap-2 ${fieldValue}`}>
          <Calendar className="w-4 h-4 text-muted-foreground" />
          Fecha de Identificación
        </h3>
      </CardHeader>
      <CardContent>
        <p className={fieldValue}>
          {dateFormat(voluntaryReport?.identification_date || "", "PPP")}
        </p>
      </CardContent>
    </Card>
  );

  const renderDescription = () => (
    <Card className="shadow-none border-border/60">
      <CardHeader className="pb-3">
        <h3 className={`font-semibold flex items-center gap-2 ${fieldValue}`}>
          <FileText className="w-4 h-4 text-muted-foreground" />
          Descripción
        </h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">
          {voluntaryReport?.description || "N/A"}
        </p>
      </CardContent>
    </Card>
  );

  const renderConsequences = () => (
    <Card className="shadow-none border-border/60">
      <CardHeader className="pb-3">
        <h3 className={`font-semibold flex items-center gap-2 ${fieldValue}`}>
          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          Posibles Consecuencias
        </h3>
      </CardHeader>
      <CardContent>
        {voluntaryReport?.possible_consequences ? (
          <ul className="space-y-2">
            {voluntaryReport.possible_consequences.split(",").map(
              (consequence, index) =>
                consequence.trim() && (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <span className="text-sm">{consequence.trim()}</span>
                  </li>
                ),
            )}
          </ul>
        ) : (
          <p className="text-sm">N/A</p>
        )}
      </CardContent>
    </Card>
  );

  const renderReporterInfo = () => {
    const isAnonymous =
      !voluntaryReport?.reporter_phone &&
      !voluntaryReport?.reporter_email &&
      !voluntaryReport?.reporter_name &&
      !voluntaryReport?.reporter_last_name;

    return (
      <Card
        className="shadow-none border-border/60"
        data-tour="voluntario-detalle-reportante"
      >
        <CardHeader className="pb-3">
          <h3 className={`font-semibold flex items-center gap-2 ${fieldValue}`}>
            <User className="w-4 h-4 text-muted-foreground" />
            Información del Reportero
          </h3>
        </CardHeader>
        <CardContent>
          {isAnonymous ? (
            <p className="text-sm">
              Reportado por: <span className="font-medium">Anónimo</span>
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className={`${sectionLabel} flex items-center gap-1.5 mb-1`}>
                  <User className="w-3.5 h-3.5" /> Nombre
                </p>
                <p className={fieldValue}>
                  {voluntaryReport.reporter_name || "N/A"}{" "}
                  {voluntaryReport.reporter_last_name}
                </p>
              </div>
              <div>
                <p className={`${sectionLabel} flex items-center gap-1.5 mb-1`}>
                  <Mail className="w-3.5 h-3.5" /> Email
                </p>
                <p className={`${fieldValue} font-mono`}>
                  {voluntaryReport.reporter_email || "N/A"}
                </p>
              </div>
              <div>
                <p className={`${sectionLabel} flex items-center gap-1.5 mb-1`}>
                  <Phone className="w-3.5 h-3.5" /> Teléfono
                </p>
                <p className={`${fieldValue} font-mono`}>
                  {voluntaryReport.reporter_phone || "N/A"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderAttachments = () => (
    <div className="space-y-4" data-tour="voluntario-detalle-archivos">
      {voluntaryReport?.imageUrl && (
        <Card className="shadow-none border-border/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <h3 className={`font-semibold flex items-center gap-2 ${fieldValue}`}>
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              Imagen Adjunta
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => {
                if (!voluntaryReport?.imageUrl) return;
                handleDownloadImage(
                  voluntaryReport.imageUrl,
                  `Imagen-RVP-${voluntaryReport.report_number || "adjunta"}.jpg`,
                );
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Imagen
            </Button>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative group w-full max-w-sm h-64 mx-auto cursor-pointer">
                  <Image
                    src={voluntaryReport.imageUrl}
                    alt="Imagen del reporte"
                    fill
                    crossOrigin="use-credentials"
                    className="w-full h-full object-contain rounded-md border border-border/60 group-hover:border-border transition-all"
                    onError={(e) => {
                      console.error("Error cargando imagen:", e);
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity rounded-md">
                    <span className="text-white bg-black/70 px-3 py-2 rounded-md text-sm">
                      Ver imagen
                    </span>
                  </div>
                </div>
              </DialogTrigger>

              <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw]">
                <DialogHeader className="pb-2 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-500 shrink-0">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold leading-tight">
                        Imagen del Reporte
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {voluntaryReport.report_number
                          ? `RVP-${voluntaryReport.report_number}`
                          : "Reporte voluntario"}
                      </p>
                    </div>
                  </div>
                </DialogHeader>
                <div
                  className="relative h-[60vh] flex justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ImageZoom
                    src={voluntaryReport.imageUrl}
                    alt="Imagen completa del reporte"
                    width="auto"
                    height="100%"
                    initialZoom={2}
                    maxZoom={3}
                    className="max-w-full max-h-full"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {voluntaryReport?.documentUrl && (
        <div className="border border-border/60 p-5 rounded-lg text-center">
          <h3 className="text-xs font-semibold uppercase tracking-wide mb-4">
            Documento Adjunto
          </h3>
          <a
            href={`${voluntaryReport.documentUrl}`}
            download={`RVP-${voluntaryReport.report_number}.pdf`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            <File className="w-4 h-4 mr-2" />
            Descargar Documento Adjunto
          </a>
        </div>
      )}
    </div>
  );

  // ==========================================================
  // MAIN RETURN
  // ==========================================================

  return (
    <ContentLayout title="Detalles del Reporte Voluntario">
      {renderActionButtons()}

      {/* LOADING */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* CONTENT */}
      {voluntaryReport && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {renderBasicInfo()}
            {renderLocationInfo()}
            {renderIdentificationDate()}
          </div>

          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            data-tour="voluntario-detalle-descripcion"
          >
            {renderDescription()}
            {renderConsequences()}
          </div>

          {renderReporterInfo()}
          {renderAttachments()}
        </div>
      )}

      {/* ERROR */}
      {isError && (
        <Card className="shadow-none border border-red-200 dark:border-red-800 mt-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">
                Ha ocurrido un error al cargar el reporte voluntario...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </ContentLayout>
  );
};

export default ShowVoluntaryReport;