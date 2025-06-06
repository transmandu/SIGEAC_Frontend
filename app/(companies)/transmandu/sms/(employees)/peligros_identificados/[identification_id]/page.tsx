"use client";
import CreateAnalysesDialog from "@/components/dialogs/CreateAnalysesDialog";
import CreateDangerIdentificationDialog from "@/components/dialogs/CreateDangerIdentificationDialog";
import DeleteDangerIdentificationDialog from "@/components/dialogs/DeleteDangerIdentificationDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { Button } from "@/components/ui/button";
import { useGetDangerIdentificationById } from "@/hooks/sms/useGetDangerIdentificationById";
import { Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const ShowDangerIdentification = () => {
  const { identification_id } = useParams<{ identification_id: string }>();

  const {
    data: dangerIdentification,
    isLoading,
    isError,
  } = useGetDangerIdentificationById(identification_id);

  // Manejo seguro de propiedades opcionales
  const status =
    dangerIdentification?.voluntary_report?.status ??
    dangerIdentification?.obligatory_report?.status ??
    "unknown";

  console.log("this is t he status", status);
  const id =
    dangerIdentification?.voluntary_report?.id ??
    dangerIdentification?.obligatory_report?.id ??
    "";
  console.log("AND THIS IS T HE ID", status);
  const reportType = dangerIdentification?.voluntary_report
    ? "RVP"
    : dangerIdentification?.obligatory_report
    ? "ROS"
    : "N/A";

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Identificacion de Peligro">
      <>
        <div className=" flex justify-evenly">
          {dangerIdentification && status === "ABIERTO" && (
            <div className="flex items-center py-4">
              <CreateDangerIdentificationDialog
                title="Editar Identificacion"
                id={id}
                isEditing={true}
                initialData={dangerIdentification}
                reportType={reportType}
              />
            </div>
          )}

          {dangerIdentification && status === "ABIERTO" && (
            <div className="flex items-center py-4">
             
              <DeleteDangerIdentificationDialog id={dangerIdentification.id} />
            </div>
          )}

          {dangerIdentification &&
          !dangerIdentification.analysis &&
          status === "ABIERTO" ? (
            <div className="flex items-center py-4">
              <CreateAnalysesDialog
                buttonTitle="Crear Analisis"
                name="identification"
                id={dangerIdentification.id}
              />
            </div>
          ) : (
            dangerIdentification &&
            dangerIdentification.analysis &&
            status === "ABIERTO" && (
              <div className="flex items-center py-4">
                <CreateAnalysesDialog
                  buttonTitle="Editar Analisis"
                  name="identification"
                  id={dangerIdentification.id}
                  isEditing={true}
                  initialData={dangerIdentification.analysis}
                />
              </div>
            )
          )}
        </div>

        <div className="flex flex-col justify-center items-center border border-gray-300 rounded-lg p-6 gap-y-4 shadow-md">
          <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">
            Detalles de Identificacion de Peligro
          </h1>
          {isLoading && (
            <div className="flex w-full h-64 justify-center items-center">
              <Loader2 className="size-24 animate-spin text-blue-500" />
            </div>
          )}
          {dangerIdentification && (
            <div className="w-full max-w-2xl space-y-4">
              <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-700">
                  <span className="font-semibold">Peligro</span>
                  {""}
                  {dangerIdentification.danger}
                </p>
              </div>
              <div className="flex bg-gray-100 justify-between items-center p-4 rounded-lg">
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Área de Peligro:</span>
                  {dangerIdentification.danger_area}
                </p>
              </div>
              <div className="flex bg-gray-100 justify-between items-center p-4 rounded-lg">
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Tipo de Peligro:</span>
                  {dangerIdentification.danger_type}
                </p>
              </div>
              {dangerIdentification.information_source && (
                <div className="flex bg-gray-100 justify-between items-center p-4 rounded-lg">
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Nombre de la Fuente:</span>
                    {dangerIdentification.information_source.name}
                  </p>
                  <p className="text-lg font-medium text-gray-700">
                    <span className="font-semibold">Tipo de Fuente:</span>
                    {dangerIdentification.information_source.type}
                  </p>
                </div>
              )}
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">
                    Descripción del Reporte:
                  </span>
                  {dangerIdentification.description}
                </p>
              </div>

              {dangerIdentification.possible_consequences && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-lg font-medium text-gray-700">
                    <span className="font-semibold">
                      Lista de Posibles Consecuencias:
                    </span>
                    <br />
                    {dangerIdentification.possible_consequences
                      .split(",")
                      .map((consequence, index) => (
                        <span
                          key={index}
                          className=" justify-center items-center block"
                        >
                          {index + 1}) {consequence.trim()}
                        </span>
                      ))}
                  </p>
                </div>
              )}

              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Analisis Causa Raiz:</span>
                  {dangerIdentification.root_cause_analysis}
                </p>
              </div>
            </div>
          )}
          {isError && (
            <div className="flex flex-col justify-center items-center border border-red-200 rounded-lg p-6 gap-y-4 shadow-md bg-red-50">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 text-red-500" />
                <h1 className="text-2xl font-semibold text-center text-red-600">
                  Error al cargar la identificación
                </h1>
                <p className="text-lg text-red-700 text-center">
                  No se pudieron cargar los datos de la identificación de
                  peligro
                </p>
                <div className="flex gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Reintentar
                  </Button>
                  <Link href="/transmandu/sms/peligros_identificados">
                    <Button variant="outline" className="hover:bg-gray-100">
                      Volver a la lista
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    </ContentLayout>
  );
};

export default ShowDangerIdentification;
