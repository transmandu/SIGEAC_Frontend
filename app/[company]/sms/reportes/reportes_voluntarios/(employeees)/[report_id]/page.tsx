"use client";
import CreateDangerIdentificationDialog from "@/components/dialogs/aerolinea/sms/CreateDangerIdentificationDialog";
import CreateVoluntaryReportDialog from "@/components/dialogs/aerolinea/sms/CreateVoluntaryReportDialog";
import DeleteVoluntaryReportDialog from "@/components/dialogs/aerolinea/sms/DeleteVoluntaryReportDialog";
import PreviewVoluntaryReportPdfDialog from "@/components/dialogs/aerolinea/sms/PreviewVoluntaryReportPdfDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  return (
    <ContentLayout title="Detalles del Reporte Voluntario">
      {/* LOADING */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

      {/* CONTENIDO */}
      {voluntaryReport && (
        <div className="flex flex-col items-center border border-gray-300 rounded-lg p-8 gap-6 shadow-md dark:border-gray-700">
          {/* Encabezado */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <FileText className="w-10 h-10 text-blue-600" />
              <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
                Reporte Voluntario de Peligro
              </h1>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                {voluntaryReport.report_number
                  ? `RVP-${voluntaryReport.report_number}`
                  : "Sin número"}
              </span>
              <Badge
                className={
                  voluntaryReport.status === "CERRADO"
                    ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700"
                    : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                }
              >
                {voluntaryReport.status}
              </Badge>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex w-full flex-wrap items-stretch justify-center gap-3 sm:items-center">
            {voluntaryReport.status === "ABIERTO" && (
              <>
                {!voluntaryReport.danger_identification_id ? (
                  <CreateDangerIdentificationDialog
                    title="Crear Identificación de Peligro"
                    id={voluntaryReport.id}
                    reportType="RVP"
                  />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full sm:w-auto"
                  >
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

          <div className="w-full space-y-6">
            {/* Bloque 1: Fechas + Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
              {/* Fecha del reporte */}
              <div className="flex flex-col border border-gray-300 dark:border-gray-600 p-6 rounded-lg space-y-4 justify-around">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    Fecha del Reporte:
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {dateFormat(voluntaryReport.report_date || "", "PPP")}
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    Fecha de Identificación:
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {dateFormat(
                      voluntaryReport.identification_date || "",
                      "PPP",
                    )}
                  </p>
                </div>
              </div>

              {/* Ubicación */}
              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    Ubicación del Peligro
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Área
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {voluntaryReport.danger_area || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Base
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {voluntaryReport.danger_location || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Localización exacta
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {voluntaryReport.airport_location || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Bloque 2: Descripción + Consecuencias */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  Descripción
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {voluntaryReport.description || "N/A"}
                </p>
              </div>

              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  Posibles Consecuencias
                </h3>
                {voluntaryReport.possible_consequences ? (
                  <ul className="space-y-3">
                    {voluntaryReport.possible_consequences.split(",").map(
                      (consequence, index) =>
                        consequence.trim() && (
                          <li key={index} className="flex items-start gap-3">
                            <ChevronRight className="w-5 h-5 mt-1 flex-shrink-0 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {consequence.trim()}
                            </span>
                          </li>
                        ),
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">N/A</p>
                )}
              </div>
            </div>

            {/* Bloque 3: Información del Reportero */}
            <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                Información del Reportero
              </h3>
              {!voluntaryReport.reporter_phone &&
              !voluntaryReport.reporter_email &&
              !voluntaryReport.reporter_name &&
              !voluntaryReport.reporter_last_name ? (
                <p className="text-gray-600 dark:text-gray-400">
                  Reportado por: <span className="font-medium">Anónimo</span>
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <User className="w-4 h-4" /> Nombre
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {voluntaryReport.reporter_name || "N/A"}{" "}
                      {voluntaryReport.reporter_last_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {voluntaryReport.reporter_email || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Teléfono
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {voluntaryReport.reporter_phone || "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 4: Adjuntos */}
            {(voluntaryReport.imageUrl || voluntaryReport.documentUrl) && (
              <div className="space-y-4">
                {voluntaryReport.imageUrl && (
                  <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">
                      Imagen Adjunta
                    </h3>
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
                  </div>
                )}

                {voluntaryReport.documentUrl && (
                  <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg text-center">
                    <h3 className="text-xl font-semibold mb-4">
                      Documento Adjunto
                    </h3>
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
            )}
          </div>
        </div>
      )}

      {/* ERROR */}
      {isError && (
        <div className="border border-red-300 dark:border-red-700 rounded-lg p-8 mt-4 flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-red-600 dark:text-red-400 font-medium text-center">
            Ha ocurrido un error al cargar el reporte voluntario.
          </p>
        </div>
      )}
    </ContentLayout>
  );
};

export default ShowVoluntaryReport;
