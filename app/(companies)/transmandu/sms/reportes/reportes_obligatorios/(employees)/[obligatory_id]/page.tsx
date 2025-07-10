"use client";
import CreateDangerIdentificationDialog from "@/components/dialogs/CreateDangerIdentificationDialog";
import CreateObligatoryDialog from "@/components/dialogs/CreateObligatoryDialog";
import DeleteObligatoryReportDialog from "@/components/dialogs/DeleteObligatoryReportDialog";
import PreviewObligatoryReportPdfDialog from "@/components/dialogs/PreviewObligatoryReportPdfDialog";
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
import { useGetObligatoryReportById } from "@/hooks/sms/useGetObligatoryReportById";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  Clock,
  Download,
  File,
  FileText,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Plane,
  User,
  Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

const ShowObligatoryReport = () => {
  const { obligatory_id } = useParams<{ obligatory_id: string }>();

  const {
    data: obligatoryReport,
    isLoading,
    isError,
  } = useGetObligatoryReportById(obligatory_id);

  return (
    <ContentLayout title="Reportes Obligatorios">
      <div className="flex justify-evenly gap-2 flex-wrap">
        {/* Botón para crear identificación de peligro */}
        {obligatoryReport &&
        obligatoryReport.status === "ABIERTO" &&
        obligatoryReport.danger_identification === null ? (
          <div className="flex items-center py-4">
            <CreateDangerIdentificationDialog
              title={"Crear Identificación de Peligro"}
              id={obligatoryReport?.id}
              reportType="ROS"
            />
          </div>
        ) : (
          obligatoryReport &&
          obligatoryReport.status === "ABIERTO" &&
          obligatoryReport.danger_identification?.id && (
            <div className="flex items-center py-4">
              <Button
                variant="outline"
                size="sm"
                className="h-8 flex items-center gap-1"
                asChild
              >
                <Link
                  href={`/transmandu/sms/gestion_reportes/peligros_identificados/${obligatoryReport.danger_identification.id}`}
                >
                  <span className="hidden lg:inline">Ver Identificación</span>
                </Link>
              </Button>
            </div>
          )
        )}

        {/* Botón para editar reporte */}
        {obligatoryReport && obligatoryReport.status === "ABIERTO" && (
          <div className="flex items-center py-4">
            <CreateObligatoryDialog
              initialData={obligatoryReport}
              isEditing={true}
              title={"Editar"}
            />
          </div>
        )}

        {/* Botón para eliminar reporte */}
        {obligatoryReport && obligatoryReport.status === "ABIERTO" && (
          <div className="flex items-center py-4">
            <DeleteObligatoryReportDialog id={obligatoryReport.id} />
          </div>
        )}

        {/* Botón para descargar PDF */}
        {obligatoryReport && (
          <div className="flex items-center py-4">
            <PreviewObligatoryReportPdfDialog
              title={"Descargar PDF"}
              obligatoryReport={obligatoryReport}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center items-center border border-gray-300 rounded-lg p-6 gap-y-4 shadow-md dark:border-gray-700">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
            Detalles del Reporte Obligatorio
          </h1>
        </div>

        {isLoading && (
          <div className="flex w-full h-64 justify-center items-center">
            <Loader2 className="size-24 animate-spin text-blue-500" />
          </div>
        )}

        {obligatoryReport && (
          <div className="w-full space-y-4">
            {/* Encabezado con código y fecha */}
            {obligatoryReport.report_number && (
              <div className="flex flex-col md:flex-row justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded-lg gap-2">
                <p className="text-lg text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <File className="w-5 h-5" />
                  <span className="font-semibold">Código:</span> ROS-
                  {obligatoryReport.report_number}
                </p>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">Fecha del Reporte:</span>
                  {format(obligatoryReport.report_date, "PPP", {
                    locale: es,
                  })}
                </p>
              </div>
            )}

            {/* Información básica del incidente */}
            <div className="flex-col bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  className={`justify-center items-center text-center font-bold font-sans ${
                    obligatoryReport.status === "CERRADO"
                      ? "bg-green-400"
                      : obligatoryReport.status === "ABIERTO"
                        ? "bg-red-400"
                        : "bg-gray-500"
                  }`}
                >
                  {obligatoryReport.status}
                </Badge>
              </div>

              <p className="text-lg text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>
                  <span className="font-semibold">Lugar del Suceso: </span>
                  {obligatoryReport.incident_location}
                </span>
              </p>

              <div className="flex flex-col md:flex-row gap-4">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    <span className="font-semibold">Fecha: </span>
                    {format(obligatoryReport.incident_date, "PPP", {
                      locale: es,
                    })}
                  </span>
                </p>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>
                    <span className="font-semibold">Hora: </span>
                    {obligatoryReport.incident_time}
                  </span>
                </p>
              </div>
            </div>

            {/* Otros incidentes */}
            {obligatoryReport.other_incidents && (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                  <span>
                    <span className="font-semibold">Otros Incidentes: </span>
                    {obligatoryReport.other_incidents}
                  </span>
                </p>
              </div>
            )}

            {/* Lista de incidentes */}
            {obligatoryReport.incidents && (
              <div className="flex flex-col bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Lista de Incidentes:</span>
                </p>
                {(() => {
                  try {
                    const incidentsArray = JSON.parse(
                      obligatoryReport.incidents
                    ) as string[];
                    return (
                      <ul className="space-y-1">
                        {incidentsArray.map(
                          (incident: string, index: number) => (
                            <li
                              key={index}
                              className="text-gray-600 dark:text-gray-400 flex items-start gap-2"
                            >
                              <span className="text-gray-500 dark:text-gray-400">
                                •
                              </span>
                              <span>{incident}</span>
                            </li>
                          )
                        )}
                      </ul>
                    );
                  } catch (error) {
                    console.error("Error parsing incidents:", error);
                    return <p>Error al mostrar incidentes</p>;
                  }
                })()}
              </div>
            )}

            {/* Descripción */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-4 flex items-center justify-center gap-2">
                <FileText className="w-6 h-6" />
                Descripción
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {obligatoryReport.description}
              </p>
            </div>

            {/* Sección de Aeronave y Vuelo */}
            <div className="flex flex-col lg:flex-row justify-center items-stretch gap-4">
              {obligatoryReport.aircraft && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex-1">
                  <p className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-4 flex items-center justify-center gap-2">
                    <Plane className="w-6 h-6" />
                    Datos de Aeronave
                  </p>
                  <div className="space-y-2">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Matrícula: </span>
                      {obligatoryReport.aircraft.acronym}
                    </p>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Modelo: </span>
                      {obligatoryReport.aircraft.model}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex-1">
                <p className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-4 flex items-center justify-center gap-2">
                  <Plane className="w-6 h-6" />
                  Datos de Vuelo
                </p>
                <div className="space-y-2">
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Número de Vuelo: </span>
                    {obligatoryReport.flight_number}
                  </p>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Hora de Vuelo: </span>
                    {obligatoryReport.flight_time}
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Origen: </span>
                    {obligatoryReport.flight_origin}
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Destino: </span>
                    {obligatoryReport.flight_destiny}
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Destino Alterno: </span>
                    {obligatoryReport.flight_alt_destiny}
                  </p>
                </div>
              </div>
            </div>

            {/* Sección de Tripulación */}
            <div className="flex flex-col lg:flex-row justify-center items-stretch gap-4">
              {obligatoryReport.pilot && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex-1">
                  <p className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-4 flex items-center justify-center gap-2">
                    <User className="w-6 h-6" />
                    Datos del Piloto
                  </p>
                  <div className="space-y-2">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">DNI: </span>
                      {obligatoryReport.pilot.employee?.dni}
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Licencia: </span>
                      {obligatoryReport.pilot.license_number}
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Nombre: </span>
                      {obligatoryReport.pilot.employee?.first_name}{" "}
                      {obligatoryReport.pilot.employee?.last_name}
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Correo: </span>
                      {/* {obligatoryReport.pilot.}  */}
                      {/* necesito agregar email y phone */}
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Teléfono: </span>
                      {/* {obligatoryReport.pilot.phone} */}
                    </p>
                  </div>
                </div>
              )}

              {obligatoryReport.copilot && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex-1">
                  <p className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-4 flex items-center justify-center gap-2">
                    <Users className="w-6 h-6" />
                    Datos del Copiloto
                  </p>
                  <div className="space-y-2">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">DNI: </span>
                      {obligatoryReport.copilot.employee?.dni}
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Licencia: </span>
                      {obligatoryReport.copilot.license_number}
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Nombre: </span>
                      {obligatoryReport.copilot.employee?.first_name}{" "}
                      {obligatoryReport.copilot.employee?.last_name}
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Email: </span>
                      {/* {obligatoryReport.copilot.email} */}
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Teléfono: </span>
                      {/* {obligatoryReport.copilot.phone} */}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Imagen adjunta */}
            {obligatoryReport?.image && (
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer flex justify-center">
                    <CardContent className="flex flex-col gap-2 p-0">
                      <div className="relative group">
                        <div className="w-64 h-64">
                          <Image
                            src={
                              obligatoryReport.image.startsWith("data:image")
                                ? obligatoryReport.image
                                : `data:image/jpeg;base64,${obligatoryReport.image}`
                            }
                            alt="Vista previa de imagen"
                            fill
                            className="object-contain rounded-md border-2 border-gray-300 shadow-sm group-hover:border-blue-400 transition-all"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black/50 text-white px-3 py-1 rounded-md flex items-center gap-1">
                              <ImageIcon className="w-4 h-4" />
                              Ver imagen completa
                            </span>
                          </div>
                        </div>
                      </div>
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
                        obligatoryReport.image.startsWith("data:image")
                          ? obligatoryReport.image
                          : `data:image/jpeg;base64,${obligatoryReport.image}`
                      }
                      alt="Imagen completa"
                      fill
                      className="max-w-full max-h-[70vh] object-contain border-4 border-gray-100 shadow-lg rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end mt-4">
                    <a
                      href={
                        obligatoryReport.image.startsWith("data:image")
                          ? obligatoryReport.image
                          : `data:image/jpeg;base64,${obligatoryReport.image}`
                      }
                      download="imagen-reporte-obligatorio.jpg"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Imagen
                    </a>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Documento adjunto */}
            {obligatoryReport.document && (
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Ver Documento Adjunto
                    </Button>
                  </div>
                </DialogTrigger>

                <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Visualizador de Documento
                    </DialogTitle>
                  </DialogHeader>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex flex-col items-center gap-4 w-full h-full">
                      <div className="w-full flex justify-end">
                        <a
                          href={
                            obligatoryReport.document.startsWith(
                              "data:application/pdf"
                            )
                              ? obligatoryReport.document
                              : `data:application/pdf;base64,${obligatoryReport.document}`
                          }
                          download="reporte-obligatorio.pdf"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar PDF
                        </a>
                      </div>

                      <iframe
                        src={
                          obligatoryReport.document.startsWith(
                            "data:application/pdf"
                          )
                            ? obligatoryReport.document
                            : `data:application/pdf;base64,${obligatoryReport.document}`
                        }
                        width="100%"
                        height="100%"
                        className="border rounded-md flex-1"
                        title="Documento PDF"
                      />

                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Documento adjunto
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {isError && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-red-300">
              Ha ocurrido un error al cargar el reporte obligatorio...
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default ShowObligatoryReport;
