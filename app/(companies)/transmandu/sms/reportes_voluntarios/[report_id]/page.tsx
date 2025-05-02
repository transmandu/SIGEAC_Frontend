"use client";
import CreateDangerIdentificationDialog from "@/components/dialogs/CreateDangerIdentificationDialog";
import CreateVoluntaryReportDialog from "@/components/dialogs/CreateVoluntaryReportDialog";
import DeleteVoluntaryReprotDialog from "@/components/dialogs/DeleteVoluntaryReportDialog";
import PreviewVoluntaryReportPdfDialog from "@/components/dialogs/PreviewVoluntaryReportPdfDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { useGetVoluntaryReportById } from "@/hooks/sms/useGetVoluntaryReportById";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const ShowVoluntaryReport = () => {
  const { report_id } = useParams<{ report_id: string }>();
  const {
    data: voluntaryReport,
    isLoading,
    isError,
  } = useGetVoluntaryReportById(report_id);

  return (
    <ContentLayout title="Reportes Voluntarios">
      <div className=" flex justify-evenly">
        {/* Mostrar el boton para crear identificacion, si el reporte existe, si el status esta  bierto 
        y si aun no tiene una idedntificacion de peligro */}

        {voluntaryReport &&
        voluntaryReport.status === "ABIERTO" &&
        !voluntaryReport.danger_identification_id ? (
          <div className="flex items-center py-4">
            <CreateDangerIdentificationDialog
              title="Crear Identificacion de Peligro"
              id={voluntaryReport?.id}
              reportType="RVP"
            />
          </div>
        ) : (
          voluntaryReport &&
          voluntaryReport.status === "ABIERTO" &&
          voluntaryReport.danger_identification_id !== null && (
            <div className="flex items-center py-4">
              <Button
                variant="outline"
                size="sm"
                className=" hidden h-8 lg:flex"
              >
                <Link
                  href={`/transmandu/sms/peligros_identificados/${voluntaryReport.danger_identification_id}`}
                >
                  Ver Identificacion de Peligro
                </Link>
              </Button>
            </div>
          )
        )}
        {/* Mostrar el boton para editar el reporte, si el reporte existe y si el status esta  abierto */}

        {voluntaryReport && voluntaryReport.status === "ABIERTO" && (
          <div className="flex items-center py-4">
            <CreateVoluntaryReportDialog
              initialData={voluntaryReport}
              isEditing={true}
              title="Editar"
            />
          </div>
        )}

        {voluntaryReport && voluntaryReport.status === "ABIERTO" && (
          <div className="flex items-center py-4">
            <DeleteVoluntaryReprotDialog id={voluntaryReport.id} />
          </div>
        )}

        {voluntaryReport && voluntaryReport.status === "CERRADO" ? (
          <div className="flex items-center py-4">
            <PreviewVoluntaryReportPdfDialog
              title="Descargar PDF"
              voluntaryReport={voluntaryReport}
            />
          </div>
        ) : (
          voluntaryReport &&
          voluntaryReport.status === "ABIERTO" && (
            <div className="flex items-center py-4">
              <PreviewVoluntaryReportPdfDialog
                title="Descargar PDF"
                voluntaryReport={voluntaryReport}
              />
            </div>
          )
        )}
      </div>

      <div className="flex flex-col justify-center items-center border border-gray-300 rounded-lg p-6 gap-y-4 shadow-md">
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">
          Detalles del Reporte
        </h1>
        {isLoading && (
          <div className="flex w-full h-64 justify-center items-center">
            <Loader2 className="size-24 animate-spin text-blue-500" />
          </div>
        )}
        {voluntaryReport && (
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
              <p className="text-lg font-medium text-gray-700">
                <span className="font-semibold">Número del Reporte:</span> RVP-
                {voluntaryReport.report_number}
              </p>

              <div className="flex justify-center">
                <p className="text-lg font-medium text-gray-700">
                  <span className="font-semibold">Estado: </span>
                  {"                 "}
                </p>
                <Badge
                  className={`justify-center items-center text-center font-bold font-sans ${
                    voluntaryReport.status === "CERRADO"
                      ? "bg-green-400"
                      : "bg-red-400"
                  }`}
                >
                  {voluntaryReport.status}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
              <p className="text-lg font-medium text-gray-700">
                <span className="font-semibold">Fecha del Reporte: </span>
                {format(voluntaryReport.report_date, "PPP", {
                  locale: es,
                })}
              </p>
            </div>

            <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
              <p className="text-lg font-medium text-gray-700">
                <span className="font-semibold">Fecha de Identificacion: </span>
                {format(voluntaryReport.identification_date, "PPP", {
                  locale: es,
                })}
              </p>
            </div>
            <div className=" bg-gray-100  p-4 rounded-lg">
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Área de Peligro:</span>{" "}
                {voluntaryReport.danger_area}
              </p>
              <p className="text-lg font-medium text-gray-700">
                <span className="font-semibold">Base:</span>{" "}
                {voluntaryReport.danger_location}
              </p>
              <p className="text-lg font-medium text-gray-700">
                <span className="font-semibold">Localización del Peligro:</span>{" "}
                {voluntaryReport.airport_location}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Descripción del Reporte:</span>{" "}
                {voluntaryReport.description}
              </p>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Posibles Consecuencias:</span>{" "}
                {voluntaryReport.possible_consequences}
              </p>
            </div>
            {!voluntaryReport.reporter_phone &&
            !voluntaryReport.reporter_email &&
            !voluntaryReport.reporter_name &&
            !voluntaryReport.reporter_last_name ? (
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-lg text-gray-700">
                  Reportado por: <span className="font-semibold">Anónimo</span>
                </p>
              </div>
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-xl font-semibold text-center text-gray-800 mb-2">
                  Reportado Por:
                </p>
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Nombre:</span>{" "}
                  {voluntaryReport.reporter_name}
                </p>
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Apellido:</span>{" "}
                  {voluntaryReport.reporter_last_name}
                </p>
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Teléfono:</span>{" "}
                  {voluntaryReport.reporter_phone}
                </p>
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Email:</span>{" "}
                  {voluntaryReport.reporter_email}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center items-center gap-2">
          <CardContent className="flex flex-col gap-8">
            {voluntaryReport?.image && (
              <div className="flex flex-col items-center gap-2">
                <div className="max-w-md overflow-hidden">
                  <img
                    src={
                      voluntaryReport.image.startsWith("data:image")
                        ? voluntaryReport.image
                        : `data:image/jpeg;base64,${voluntaryReport?.image}`
                    }
                    alt="Imagen asociada al reporte"
                    className="w-[300px] h-[300px]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      console.log("error");
                      console.log(voluntaryReport);
                    }}
                  />
                </div>

                <p className="text-sm text-muted-foreground">Imagen adjunta</p>
              </div>
            )}
          </CardContent>

          <CardContent className="flex flex-col gap-8">
            {voluntaryReport?.document && (
              <div className="flex flex-col items-center gap-2">
                <iframe
                  src={
                    voluntaryReport.document.startsWith("data:application/pdf")
                      ? voluntaryReport.document
                      : `data:application/pdf;base64,${voluntaryReport.document}`
                  }
                  width="100%"
                  height="80%"
                  className="border rounded-md"
                  title="Documento PDF"
                />
                <p className="text-sm text-muted-foreground">
                  Documento adjunto
                </p>
              </div>
            )}
          </CardContent>
        </div>

        <Button className="">Imagen</Button>

        {isError && (
          <p className="text-sm text-red-500 mt-4">
            Ha ocurrido un error al cargar el reporte voluntario...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default ShowVoluntaryReport;
