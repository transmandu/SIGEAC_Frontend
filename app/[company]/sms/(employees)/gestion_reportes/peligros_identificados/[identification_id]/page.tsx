"use client";
import CreateAnalysesDialog from "@/components/dialogs/CreateAnalysesDialog";
import CreateDangerIdentificationDialog from "@/components/dialogs/CreateDangerIdentificationDialog";
import DeleteDangerIdentificationDialog from "@/components/dialogs/DeleteDangerIdentificationDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetDangerIdentificationById } from "@/hooks/sms/useGetDangerIdentificationById";
import { AlertCircle, AlertTriangle, ChevronRight, FileText, Info, Layers, List } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const ShowDangerIdentification = () => {
  const { identification_id } = useParams<{ identification_id: string }>();

  const {
    data: dangerIdentification,
    isLoading,
    isError,
  } = useGetDangerIdentificationById(identification_id);

  const status =
    dangerIdentification?.voluntary_report?.status ??
    dangerIdentification?.obligatory_report?.status ??
    "unknown";

  const id =
    dangerIdentification?.voluntary_report?.id ??
    dangerIdentification?.obligatory_report?.id ??
    "";

  const reportType = dangerIdentification?.voluntary_report
    ? "RVP"
    : dangerIdentification?.obligatory_report
    ? "ROS"
    : "N/A";

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Identificación de Peligro">
      {/* Botones de acción */}
      <div className="flex justify-evenly flex-wrap gap-2">
        {dangerIdentification && status === "ABIERTO" && (
          <>
            <div className="flex items-center py-2">
              <CreateDangerIdentificationDialog
                title="Editar Identificación"
                id={id}
                isEditing={true}
                initialData={dangerIdentification}
                reportType={reportType}
              />
            </div>
            <div className="flex items-center py-2">
              <DeleteDangerIdentificationDialog id={dangerIdentification.id} />
            </div>
          </>
        )}

        {dangerIdentification && !dangerIdentification.analysis && status === "ABIERTO" && (
          <div className="flex items-center py-2">
            <CreateAnalysesDialog
              buttonTitle="Crear Análisis"
              name="identification"
              id={dangerIdentification.id}
            />
          </div>
        )}

        {dangerIdentification?.analysis && status === "ABIERTO" && (
          <div className="flex items-center py-2">
            <CreateAnalysesDialog
              buttonTitle="Editar Análisis"
              name="identification"
              id={dangerIdentification.id}
              isEditing={true}
              initialData={dangerIdentification.analysis}
            />
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col justify-center items-center border border-gray-300 rounded-lg p-6 gap-y-4 shadow-md dark:border-gray-700">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
          <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
            Detalles de Identificación de Peligro
          </h1>
        </div>

        {dangerIdentification && (
          <div className="w-full max-w-2xl space-y-4">
            {/* Información básica del peligro - Ahora con 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                  <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Peligro:</span> {dangerIdentification.danger}
                  </p>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                  <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Área de Peligro:</span> {dangerIdentification.danger_area}
                  </p>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                  <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Tipo de Peligro:</span> {dangerIdentification.danger_type}
                  </p>
                </div>
              </div>
            </div>

            {/* Fuente de información */}
            {dangerIdentification.information_source && (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Fuente de Información
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Nombre:</p>
                    <p>{dangerIdentification.information_source.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Método de identificación:</p>
                    <Badge
                      className={`justify-center items-center text-center font-bold font-sans ${
                        dangerIdentification.information_source.type === "PROACTIVO"
                          ? "bg-green-400"
                          : "bg-red-400"
                      }`}
                    >
                      {dangerIdentification.information_source.type}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Descripción */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Descripción
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {dangerIdentification.description || "N/A"}
              </p>
            </div>

            {/* Consecuencias */}
            {dangerIdentification.possible_consequences && (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <List className="w-5 h-5" />
                  Posibles Consecuencias
                </h3>
                <ul className="space-y-2">
                  {dangerIdentification.possible_consequences
                    .split(",")
                    .map((consequence, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0 text-gray-500" />
                        <span>{consequence.trim()}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Análisis de causa raíz */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Análisis de Causa Raíz
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {dangerIdentification.root_cause_analysis || "N/A"}
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex flex-col justify-center items-center border border-red-200 rounded-lg p-6 gap-y-4 shadow-md bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <h1 className="text-2xl font-semibold text-center text-red-600 dark:text-red-400">
                Error al cargar la identificación
              </h1>
              <p className="text-lg text-red-700 dark:text-red-300 text-center">
                No se pudieron cargar los datos de la identificación de peligro
              </p>
              <div className="flex gap-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-red-300 text-red-700 hover:bg-red-100 dark:hover:bg-red-800/30"
                >
                  Reintentar
                </Button>
                <Link href="/transmandu/sms/peligros_identificados">
                  <Button variant="outline" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    Volver a la lista
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default ShowDangerIdentification;