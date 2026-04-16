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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  CalendarCheck,
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
      <div className="flex flex-wrap gap-3 justify-center mb-10">
        {voluntaryReport.status === "ABIERTO" && (
          <>
            {!voluntaryReport.danger_identification_id ? (
              <CreateDangerIdentificationDialog
                title="Crear Identificación de Peligro"
                id={voluntaryReport.id}
                reportType="RVP"
              />
            ) : (
              <Button variant="outline" size="sm" asChild>
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

  // ==========================================================
  // CARDS
  // ==========================================================

  const renderBasicInfo = () => {
    // 1. Tipamos el parámetro para evitar el error ts(7006)
    const formatFriendlyDate = (dateString: string | null | undefined) => {
      if (!dateString) return null;
      // Evitamos problemas de zona horaria picando la cadena directamente
      const soloFecha = dateString.split(' ')[0]; // Extrae "2026-04-10"
      const [year, month, day] = soloFecha.split('-');
      return `${day}-${month}-${year}`;
    };

    // 2. Usamos una referencia con 'any' para evitar que TS se queje de las propiedades faltantes
    const reportData = voluntaryReport as any;

    return (
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Información General
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Número de Reporte */}
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Número de Reporte</p>
              <p className="font-semibold">
                {reportData?.report_number
                  ? `RVP-${reportData.report_number}`
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Fecha del Reporte */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Fecha del Reporte</p>
              <p className="font-medium">
                {/* Ajustado para usar el valor de reportData */}
                {reportData?.report_date 
                  ? format(new Date(reportData.report_date.replace(/-/g, '/')), "PPP", { locale: es })
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Estado</span>
            </div>
            <Badge
              variant={
                reportData?.status === "CERRADO" ? "default" : "secondary"
              }
              className={
                reportData?.status === "CERRADO"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {reportData?.status || "PENDIENTE"}
            </Badge>
          </div>

          {/* Fecha de Cierre: Solo aparece si el estado es CERRADO y la fecha existe */}
          {reportData?.status === "CERRADO" && reportData?.close_date && (
            <div className="flex items-center gap-3 pt-3 mt-2 border-t border-dashed">
              <CalendarCheck className="w-5 h-5 flex-shrink-0 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de Cierre</p>
                <p className="font-semibold text-green-700">
                  {formatFriendlyDate(reportData.close_date)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderLocationInfo = () => (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Ubicación del Peligro
        </h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-1">Área</p>
          <p className="font-medium">{voluntaryReport?.danger_area || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Base</p>
          <p className="font-medium">
            {voluntaryReport?.danger_location || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Localización exacta</p>
          <p className="font-medium">
            {voluntaryReport?.airport_location || "N/A"}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderIdentificationDate = () => (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Fecha de Identificación
        </h3>
      </CardHeader>
      <CardContent>
        <p className="font-medium">
          {dateFormat(voluntaryReport?.identification_date || "", "PPP")}
        </p>
      </CardContent>
    </Card>
  );

  const renderDescription = () => (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Descripción
        </h3>
      </CardHeader>
      <CardContent>
        <p className="leading-relaxed ">
          {voluntaryReport?.description || "N/A"}
        </p>
      </CardContent>
    </Card>
  );

  const renderConsequences = () => (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
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
                    <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span className="">{consequence.trim()}</span>
                  </li>
                ),
            )}
          </ul>
        ) : (
          <p className="">N/A</p>
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
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Información del Reportero
          </h3>
        </CardHeader>
        <CardContent>
          {isAnonymous ? (
            <p>
              Reportado por: <span className="font-medium">Anónimo</span>
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" /> Nombre
                </p>
                <p className="font-medium">
                  {voluntaryReport.reporter_name || "N/A"}{" "}
                  {voluntaryReport.reporter_last_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4" /> Email
                </p>
                <p className="font-medium">
                  {voluntaryReport.reporter_email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4" /> Teléfono
                </p>
                <p className="font-medium">
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
    <div className="space-y-4">
      {voluntaryReport?.imageUrl &&(
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <h3 className="text-lg font-semibold">Imagen Adjunta</h3>
            <Button
              variant="outline"
              size="sm"
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
                    className="w-full h-full object-contain rounded-md border group-hover:border-gray-400 transition-all"
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
                <DialogHeader>
                  <DialogTitle>Imagen del Reporte</DialogTitle>
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
        <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-4">Documento Adjunto</h3>
          <a
            href={`${voluntaryReport.documentUrl}`}
            download={`RVP-${voluntaryReport.report_number}.pdf`}
            className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <File className="w-5 h-5 mr-2" />
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
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

      {/* CONTENT */}
      {voluntaryReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {renderBasicInfo()}
            {renderLocationInfo()}
            {renderIdentificationDate()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderDescription()}
            {renderConsequences()}
          </div>

          {renderReporterInfo()}
          {renderAttachments()}
        </div>
      )}

      {/* ERROR */}
      {isError && (
        <Card className="border-red-200 mt-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>Ha ocurrido un error al cargar el reporte voluntario...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </ContentLayout>
  );
};

export default ShowVoluntaryReport;
