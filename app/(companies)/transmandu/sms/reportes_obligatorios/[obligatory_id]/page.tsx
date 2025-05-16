"use client";
import CreateDangerIdentificationDialog from "@/components/dialogs/CreateDangerIdentificationDialog";
import CreateObligatoryDialog from "@/components/dialogs/CreateObligatoryDialog";
import DeleteVoluntaryReprotDialog from "@/components/dialogs/DeleteVoluntaryReportDialog";
import PreviewObligatoryReportPdfDialog from "@/components/dialogs/PreviewObligatoryReportPdfDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
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
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

function hourFormat(date: Date) {
  const timeString = date.toString();
  const parsedTime = parse(timeString, "HH:mm:ss", new Date());
  const incident_time = format(parsedTime, "HH:mm");
  return incident_time;
}

const ShowObligatoryReport = () => {
  const { obligatory_id } = useParams<{ obligatory_id: string }>();

  const {
    data: obligatoryReport,
    isLoading,
    isError,
  } = useGetObligatoryReportById(obligatory_id);

  return (
    <ContentLayout title="Reportes Obligatorios">
      <div className=" flex justify-evenly">
        {/* Mostrar el boton para crear identificacion, si el reporte existe, si el status esta  bierto 
        y si aun no tiene una idedntificacion de peligro */}

        {obligatoryReport &&
        obligatoryReport.status === "ABIERTO" &&
        !obligatoryReport.danger_identification_id ? (
          <div className="flex items-center py-4">
            <CreateDangerIdentificationDialog
              title="Crear Identificacion de Peligro"
              id={obligatoryReport?.id}
              reportType="ROS"
            />
          </div>
        ) : (
          obligatoryReport &&
          obligatoryReport.status === "ABIERTO" &&
          obligatoryReport.danger_identification_id !== null && (
            <div className="flex items-center py-4">
              <Button
                variant="outline"
                size="sm"
                className=" hidden h-8 lg:flex"
              >
                <Link
                  href={`/transmandu/sms/peligros_identificados/${obligatoryReport.danger_identification_id}`}
                >
                  Ver Identificacion de Peligro
                </Link>
              </Button>
            </div>
          )
        )}
        {/* Mostrar el boton para editar el reporte, si el reporte existe y si el status esta  abierto */}

        {obligatoryReport && obligatoryReport.status === "ABIERTO" && (
          <div className="flex items-center py-4">
            <CreateObligatoryDialog
              initialData={obligatoryReport}
              isEditing={true}
              title="Editar"
            />
          </div>
        )}

        {obligatoryReport && obligatoryReport.status === "ABIERTO" && (
          <div className="flex items-center py-4">
            <DeleteVoluntaryReprotDialog id={obligatoryReport.id} />
          </div>
        )}

        {obligatoryReport && obligatoryReport.status === "CERRADO" ? (
          <div className="flex items-center py-4">
            <PreviewObligatoryReportPdfDialog
              title="Descargar PDF"
              obligatoryReport={obligatoryReport}
            />
          </div>
        ) : (
          obligatoryReport &&
          obligatoryReport.status === "ABIERTO" && (
            <div className="flex items-center py-4">
              <PreviewObligatoryReportPdfDialog
                title="Descargar PDF"
                obligatoryReport={obligatoryReport}
              />
            </div>
          )
        )}
      </div>

      <div className="flex flex-col justify-center items-center border border-gray-300 rounded-lg p-6 gap-y-4 shadow-md ">
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">
          Detalles del Reporte Obligatorio
        </h1>
        {isLoading && (
          <div className="flex w-full h-64 justify-center items-center">
            <Loader2 className="size-24 animate-spin text-blue-500" />
          </div>
        )}
        {obligatoryReport && (
          <div className="w-full space-y-4">
            <div className="flex justify-between bg-gray-100 p-4 rounded-lg">
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Codigo: </span> ROS-
                {obligatoryReport.report_number}
              </p>
              <p className="text-lg font-medium text-gray-700">
                <span className="font-semibold">Fecha del Reporte: </span>
                {format(obligatoryReport.report_date, "PPP", {
                  locale: es,
                })}
              </p>
            </div>
            <div className="flex-col bg-gray-100 p-4 rounded-lg ">
              <p className="text-lg text-gray-700">
                <span className="font-semibold">
                  Lugar Donde Ocurrio el Suceso:{" "}
                </span>
                {obligatoryReport.incident_location}
              </p>
              <p className="text-lg font-medium text-gray-700">
                <span className="font-semibold">Fecha del Incidente: </span>
                {format(obligatoryReport.incident_date, "PPP", {
                  locale: es,
                })}
              </p>
              <p className="text-lg font-medium text-gray-700">
                <span className="font-semibold">Hora del Suceso : </span>
                {hourFormat(obligatoryReport.incident_time)}
              </p>
            </div>

            {obligatoryReport.other_incidents && (
              <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-700">
                  <span className="font-semibold">Otros Incidentes : </span>
                  {obligatoryReport.other_incidents}
                </p>
              </div>
            )}

            {obligatoryReport.incidents && (
              <div className="flex flex-col bg-gray-100 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-700 mb-2">
                  <span className="font-semibold">Lista de Incidentes:</span>
                </p>
                {(() => {
                  try {
                    const incidentsArray = JSON.parse(
                      obligatoryReport.incidents
                    ) as string[];
                    return incidentsArray.map(
                      (incident: string, index: number) => (
                        <p key={index} className="text-gray-600 mb-1">
                          - {incident}
                        </p>
                      )
                    );
                  } catch (error) {
                    console.error("Error parsing incidents:", error);
                    return <p>Error al mostrar incidentes</p>;
                  }
                })()}
              </div>
            )}

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-xl font-semibold text-center text-gray-800 mb-2">
                Descripcion
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">
                  Descripcion del Incidente:{" "}
                </span>
                {obligatoryReport.description}
              </p>
            </div>

            <div className="flex justify-center items-stretch gap-4 ">
              <div className=" bg-gray-100 p-4 rounded-lg flex-1">
                <p className="text-xl font-semibold text-center text-gray-800 mb-2">
                  Datos de Aereonave
                </p>

                <p className="text-lg text-gray-700">
                  <span className="font-semibold">
                    Matricula de Aereonave:{" "}
                  </span>
                  {obligatoryReport.aircraft_acronym}
                </p>
                <p className="text-lg font-medium text-gray-700">
                  <span className="font-semibold">
                    Modelo de la Aereonave:{" "}
                  </span>
                  {obligatoryReport.aircraft_model}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg flex-1">
                <p className="text-xl font-semibold text-center text-gray-800 mb-2">
                  Datos de Vuelo
                </p>
                <p className="text-lg font-medium text-gray-700">
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Numero de Vuelo: </span>{" "}
                    {obligatoryReport.flight_number}
                  </p>
                  <span className="font-semibold">Hora de Vuelo : </span>
                  {hourFormat(obligatoryReport.flight_time)}
                </p>

                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Origen del Vuelo: </span>{" "}
                  {obligatoryReport.flight_origin}
                </p>
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Destino del Vuelo:</span>{" "}
                  {obligatoryReport.flight_destiny}
                </p>
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Destino Alterno:</span>{" "}
                  {obligatoryReport.flight_alt_destiny}
                </p>
              </div>
            </div>

            <div className="flex justify-center items-stretch gap-4">
              {obligatoryReport.pilot && (
                <div className="bg-gray-100 p-4 rounded-lg flex-1">
                  <p className="text-xl font-semibold text-center text-gray-800 mb-2">
                    Datos del Piloto
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">DNI: </span>{" "}
                    {obligatoryReport.pilot.dni}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Número de Licencia: </span>{" "}
                    {obligatoryReport.pilot.license_number}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Nombre:</span>{" "}
                    {obligatoryReport.pilot.first_name}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Apellido:</span>{" "}
                    {obligatoryReport.pilot.last_name}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Correo Electronico:</span>{" "}
                    {obligatoryReport.pilot.email}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Telefono:</span>{" "}
                    {obligatoryReport.pilot.phone}
                  </p>
                </div>
              )}

              {obligatoryReport.copilot && (
                <div className="bg-gray-100 p-4 rounded-lg flex-1">
                  <p className="text-xl font-semibold text-center text-gray-800 mb-2">
                    Datos del copiloto
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">DNI: </span>{" "}
                    {obligatoryReport.copilot.dni}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Número de Licencia: </span>{" "}
                    {obligatoryReport.copilot.license_number}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Nombre:</span>{" "}
                    {obligatoryReport.copilot.first_name}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Apellido:</span>{" "}
                    {obligatoryReport.copilot.last_name}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Correo Electronico:</span>{" "}
                    {obligatoryReport.copilot.email}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Telefono:</span>{" "}
                    {obligatoryReport.copilot.phone}
                  </p>
                </div>
              )}
            </div>
            {obligatoryReport.document && (
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex justify-center">
                    <Button variant="outline" className="w-1/3 mx-auto">
                      Ver Documento Adjunto
                    </Button>
                  </div>
                </DialogTrigger>

                <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Visualizador de Documento</DialogTitle>
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
                          download="reporte-voluntario.pdf"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
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

                      <p className="text-sm text-muted-foreground">
                        Documento adjunto
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {obligatoryReport?.image && (
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer flex justify-center">

                    <CardContent className="flex flex-col gap-2 p-0">
                      <div className="relative group">
                        <img
                          src={
                            obligatoryReport.image.startsWith("data:image")
                              ? obligatoryReport.image
                              : `data:image/jpeg;base64,${obligatoryReport.image}`
                          }
                          alt="Vista previa de imagen"
                          className="w-64 h-48 object-cover rounded-md border-2 border-gray-300 shadow-sm group-hover:border-blue-400 transition-all"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-black/50 text-white px-3 py-1 rounded-md">
                            Ver imagen completa
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </DialogTrigger>

                <DialogContent className="max-w-4xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>Imagen del Reporte</DialogTitle>
                  </DialogHeader>

                  <div className="flex justify-center items-center h-full">
                    <img
                      src={
                        obligatoryReport.image.startsWith("data:image")
                          ? obligatoryReport.image
                          : `data:image/jpeg;base64,${obligatoryReport.image}`
                      }
                      alt="Imagen completa"
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
                      download="imagen-reporte.jpg"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Descargar Imagen
                    </a>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
        {isError && (
          <p className="text-sm text-red-500 mt-4">
            Ha ocurrido un error al cargar el reporte obligatorio...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default ShowObligatoryReport;
