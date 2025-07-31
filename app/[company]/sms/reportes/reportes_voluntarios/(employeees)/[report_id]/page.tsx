"use client";
import CreateDangerIdentificationDialog from "@/components/dialogs/CreateDangerIdentificationDialog";
import CreateVoluntaryReportDialog from "@/components/dialogs/CreateVoluntaryReportDialog";
import DeleteVoluntaryReportDialog from "@/components/dialogs/DeleteVoluntaryReportDialog";
import DeleteVoluntaryReprotDialog from "@/components/dialogs/DeleteVoluntaryReportDialog";
import PreviewVoluntaryReportPdfDialog from "@/components/dialogs/PreviewVoluntaryReportPdfDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetVoluntaryReportById } from "@/hooks/sms/useGetVoluntaryReportById";
import { useCompanyStore } from "@/stores/CompanyStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  File,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

const ShowVoluntaryReport = () => {
  const { report_id } = useParams<{ report_id: string }>();
  const { selectedCompany } = useCompanyStore();

  const value = {
    id: report_id,
    company: selectedCompany?.slug,
  };

  const {
    data: voluntaryReport,
    isLoading,
    isError,
  } = useGetVoluntaryReportById(value);

  return (
    <ContentLayout title="Reportes Voluntarios">
      {/* Botones de acción (sin iconos como solicitaste) */}
      <div className="flex justify-evenly flex-wrap gap-2">
        {voluntaryReport?.status === "ABIERTO" &&
          !voluntaryReport.danger_identification_id && (
            <div className="flex items-center py-2">
              <CreateDangerIdentificationDialog
                title="Crear Identificación de Peligro"
                id={voluntaryReport.id}
                reportType="RVP"
              />
            </div>
          )}

        {voluntaryReport?.status === "ABIERTO" &&
          voluntaryReport.danger_identification_id && (
            <div className="flex items-center py-2">
              <Button variant="outline" size="sm" className="h-8">
                <Link
                  href={`/transmandu/sms/gestion_reportes/peligros_identificados/${voluntaryReport.danger_identification_id}`}
                >
                  Ver Identificación de Peligro
                </Link>
              </Button>
            </div>
          )}

        {voluntaryReport?.status === "ABIERTO" && (
          <>
            <div className="flex items-center py-2">
              <CreateVoluntaryReportDialog
                initialData={voluntaryReport}
                isEditing={true}
                title="Editar"
              />
            </div>
            <div className="flex items-center py-2">
              <DeleteVoluntaryReportDialog
                company={selectedCompany!.slug}
                id={voluntaryReport.id.toString()}
              />
            </div>
          </>
        )}

        {voluntaryReport && (
          <div className="flex items-center py-2">
            <PreviewVoluntaryReportPdfDialog
              title="Descargar PDF"
              voluntaryReport={voluntaryReport}
            />
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col justify-center items-center border border-gray-300 rounded-lg p-6 gap-y-4 shadow-md dark:border-gray-700">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
            Detalles del Reporte Voluntario
          </h1>
        </div>

        {isLoading && (
          <div className="flex w-full h-64 justify-center items-center">
            <Loader2 className="size-24 animate-spin text-blue-500" />
          </div>
        )}

        {voluntaryReport && (
          <div className="w-full max-w-2xl space-y-4">
            {/* Encabezado con información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {voluntaryReport.report_number ? (
                      <>RVP-{voluntaryReport.report_number}</>
                    ) : (
                      <>N/A</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <p className="text-gray-700 dark:text-gray-300">
                    {format(voluntaryReport.report_date, "PPP", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Estado:
                  </span>
                </div>
                <Badge
                  className={`font-bold ${
                    voluntaryReport.status === "CERRADO"
                      ? "bg-green-400"
                      : voluntaryReport.status === "ABIERTO"
                        ? "bg-red-400"
                        : "bg-gray-500"
                  }`}
                >
                  {voluntaryReport.status}
                </Badge>
              </div>
            </div>

            {/* Información de localización */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Ubicación del Peligro
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Área:
                  </p>
                  <p>{voluntaryReport.danger_area || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Base:
                  </p>
                  <p>{voluntaryReport.danger_location || "N/A"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Localización exacta:
                  </p>
                  <p>{voluntaryReport.airport_location || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Fecha de identificación */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">
                    Fecha de Identificación:
                  </span>{" "}
                  {format(voluntaryReport.identification_date, "PPP", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>

            {/* Descripción y consecuencias */}
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Descripción
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {voluntaryReport.description || "N/A"}
                </p>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Posibles Consecuencias
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {voluntaryReport.possible_consequences || "N/A"}
                </p>
              </div>
            </div>

            {/* Información del reportero */}
            {!voluntaryReport.reporter_phone &&
            !voluntaryReport.reporter_email &&
            !voluntaryReport.reporter_name &&
            !voluntaryReport.reporter_last_name ? (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-gray-700 dark:text-gray-300">
                  Reportado por: <span className="font-semibold">Anónimo</span>
                </p>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-center flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Reportero
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <User className="w-4 h-4" /> Nombre:
                    </p>
                    <p>
                      {voluntaryReport.reporter_name || "N/A"}{" "}
                      {voluntaryReport.reporter_last_name}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email:
                    </p>
                    <p>{voluntaryReport.reporter_email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Teléfono:
                    </p>
                    <p>{voluntaryReport.reporter_phone || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Archivos adjuntos */}
        <div className="w-full max-w-2xl space-y-4">
          {voluntaryReport?.image && (
            <Dialog>
              <DialogTrigger asChild>
                <div className="cursor-pointer">
                  <CardContent className="flex flex-col items-center p-0">
                    <div className="relative group w-64 h-64">
                      <Image
                        src={
                          voluntaryReport.image.startsWith("data:image")
                            ? voluntaryReport.image
                            : `data:image/jpeg;base64,${voluntaryReport.image}`
                        }
                        alt="Vista previa de imagen"
                        fill
                        className="object-contain rounded-md border-2 border-gray-300 shadow-sm group-hover:border-blue-400 transition-all"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-md">
                        <span className="bg-black/70 text-white px-3 py-1 rounded-md flex items-center gap-1">
                          <ImageIcon className="w-4 h-4" />
                          Ver imagen
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      Imagen adjunta
                    </p>
                  </CardContent>
                </div>
              </DialogTrigger>

              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Imagen del Reporte
                  </DialogTitle>
                </DialogHeader>

                <div className="relative flex justify-center items-center h-[70vh]">
                  <Image
                    src={
                      voluntaryReport.image.startsWith("data:image")
                        ? voluntaryReport.image
                        : `data:image/jpeg;base64,${voluntaryReport.image}`
                    }
                    alt="Imagen completa"
                    fill
                    className="object-contain border-4 border-gray-100 shadow-lg rounded-lg"
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <a
                    href={
                      voluntaryReport.image.startsWith("data:image")
                        ? voluntaryReport.image
                        : `data:image/jpeg;base64,${voluntaryReport.image}`
                    }
                    download="reporte-voluntario.jpg"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Descargar Imagen
                  </a>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {voluntaryReport?.document && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <File className="w-4 h-4" />
                  Ver Documento Adjunto
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <File className="w-5 h-5" />
                    Documento Adjunto
                  </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                  <div className="flex flex-col items-center gap-4 w-full h-full">
                    <div className="w-full flex justify-end">
                      <a
                        href={
                          voluntaryReport.document.startsWith(
                            "data:application/pdf"
                          )
                            ? voluntaryReport.document
                            : `data:application/pdf;base64,${voluntaryReport.document}`
                        }
                        download="reporte-voluntario.pdf"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Descargar PDF
                      </a>
                    </div>

                    <iframe
                      src={
                        voluntaryReport.document.startsWith(
                          "data:application/pdf"
                        )
                          ? voluntaryReport.document
                          : `data:application/pdf;base64,${voluntaryReport.document}`
                      }
                      width="100%"
                      height="100%"
                      className="border rounded-md flex-1"
                      title="Documento PDF"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isError && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-red-300">
              Ha ocurrido un error al cargar el reporte voluntario...
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default ShowVoluntaryReport;
