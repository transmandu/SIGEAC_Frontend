"use client";
import CreateDangerIdentificationDialog from "@/components/dialogs/aerolinea/sms/CreateDangerIdentificationDialog";
import CreateVoluntaryReportDialog from "@/components/dialogs/aerolinea/sms/CreateVoluntaryReportDialog";
import DeleteVoluntaryReportDialog from "@/components/dialogs/aerolinea/sms/DeleteVoluntaryReportDialog";
import PreviewVoluntaryReportPdfDialog from "@/components/dialogs/aerolinea/sms/PreviewVoluntaryReportPdfDialog";
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
import { dateFormat } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  File,
  FileText,
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
  const {
    data: voluntaryReport,
    isLoading,
    isError,
  } = useGetVoluntaryReportById({
    id: report_id,
    company: selectedCompany?.slug,
  });

  return (
    <ContentLayout title="Reportes Voluntarios">
      {/* Botones de acción */}
      <div className="flex justify-evenly flex-wrap gap-4 mb-6">
        {voluntaryReport?.status === "ABIERTO" &&
          !voluntaryReport.danger_identification_id && (
            <div className="flex items-center">
              <CreateDangerIdentificationDialog
                title="Crear Identificación de Peligro"
                id={voluntaryReport.id}
                reportType="RVP"
              />
            </div>
          )}

        {voluntaryReport?.status === "ABIERTO" &&
          voluntaryReport.danger_identification_id && (
            <div className="flex items-center">
              <Button variant="outline" size="sm" className="h-10 px-4">
                <Link
                  href={`/${selectedCompany?.slug}/sms/gestion_reportes/peligros_identificados/${voluntaryReport.danger_identification_id}`}
                >
                  Ver Identificación de Peligro
                </Link>
              </Button>
            </div>
          )}

        {voluntaryReport?.status === "ABIERTO" && (
          <>
            <div className="flex items-center">
              <CreateVoluntaryReportDialog
                initialData={voluntaryReport}
                isEditing={true}
                title="Editar"
              />
            </div>
            <div className="flex items-center">
              <DeleteVoluntaryReportDialog
                company={selectedCompany!.slug}
                id={voluntaryReport.id.toString()}
              />
            </div>
          </>
        )}

        {voluntaryReport && (
          <div className="flex items-center">
            <PreviewVoluntaryReportPdfDialog
              title="Descargar PDF"
              voluntaryReport={voluntaryReport}
            />
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col justify-center items-center border border-gray-300 rounded-lg p-8 gap-6 shadow-md dark:border-gray-700">
        <div className="flex items-center gap-3">
          <FileText className="w-10 h-10 text-blue-600" />
          <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
            Detalles del Reporte Voluntario
          </h1>
        </div>

        {isLoading && (
          <div className="flex w-full h-64 justify-center items-center">
            <Loader2 className="size-24 animate-spin text-blue-500" />
          </div>
        )}

        {voluntaryReport && (
          <div className="w-full space-y-6">
            {/* Encabezado con información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    {voluntaryReport.report_number ? (
                      <>RVP-{voluntaryReport.report_number}</>
                    ) : (
                      <>N/A</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <p className="text-gray-700 dark:text-gray-300">
                    {dateFormat(voluntaryReport.report_date, "PPP")}
                  </p>
                </div>
              </div>

              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Estado:
                  </span>
                </div>
                <Badge
                  className={`font-bold text-sm px-3 py-1 ${
                    voluntaryReport.status === "CERRADO"
                      ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                      : voluntaryReport.status === "ABIERTO"
                        ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-500 dark:text-white dark:border-red-700"
                        : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                  }`}
                >
                  {voluntaryReport.status}
                </Badge>
              </div>
            </div>

            {/* Información de localización */}
            <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-3">
                <MapPin className="w-6 h-6" />
                Ubicación del Peligro
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Área:
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {voluntaryReport.danger_area || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Base:
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {voluntaryReport.danger_location || "N/A"}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Localización exacta:
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {voluntaryReport.airport_location || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Fecha de identificación */}
            <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">
                    Fecha de Identificación:
                  </span>{" "}
                  {dateFormat(voluntaryReport.identification_date, "PPP")}
                </p>
              </div>
            </div>

            {/* Descripción y consecuencias */}
            <div className="space-y-6">
              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  Descripción
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {voluntaryReport.description || "N/A"}
                </p>
              </div>

              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6" />
                  Posibles Consecuencias
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {voluntaryReport.possible_consequences || "N/A"}
                </p>
              </div>
            </div>

            {/* Información del reportero */}
            {!voluntaryReport.reporter_phone &&
            !voluntaryReport.reporter_email &&
            !voluntaryReport.reporter_name &&
            !voluntaryReport.reporter_last_name ? (
              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Reportado por: <span className="font-semibold">Anónimo</span>
                </p>
              </div>
            ) : (
              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-center flex items-center justify-center gap-3">
                  <User className="w-6 h-6" />
                  Información del Reportero
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <User className="w-4 h-4" /> Nombre:
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {voluntaryReport.reporter_name || "N/A"}{" "}
                      {voluntaryReport.reporter_last_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email:
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {voluntaryReport.reporter_email || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Teléfono:
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {voluntaryReport.reporter_phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Archivos adjuntos */}
        {voluntaryReport && (
          <div className="w-full space-y-6">
            {voluntaryReport.image && (
              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-center">
                  Imagen Adjunta
                </h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer">
                      <CardContent className="flex flex-col items-center p-0">
                        <div className="relative group w-72 h-72">
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
                            <span className="bg-black/70 text-white px-3 py-2 rounded-md flex items-center gap-2">
                              Ver imagen
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </DialogTrigger>

                  <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
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
              </div>
            )}

            {voluntaryReport.document && (
              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-4">
                  Documento Adjunto
                </h3>
                <a
                  href={
                    voluntaryReport.document.startsWith("data:application/pdf")
                      ? voluntaryReport.document
                      : `data:application/pdf;base64,${voluntaryReport.document}`
                  }
                  download="reporte-voluntario.pdf"
                  className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <File className="w-5 h-5 mr-2" />
                  Descargar Documento Adjunto
                </a>
              </div>
            )}
          </div>
        )}

        {isError && (
          <div className="border border-red-300 dark:border-red-700 rounded-lg p-6 flex items-center gap-4 w-full">
            <AlertCircle className="w-6 h-6 text-red-500" />
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
