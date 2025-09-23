"use client";
import CreateAnalysesDialog from "@/components/dialogs/aerolinea/sms/CreateAnalysesDialog";
import CreateDangerIdentificationDialog from "@/components/dialogs/aerolinea/sms/CreateDangerIdentificationDialog";
import DeleteDangerIdentificationDialog from "@/components/dialogs/aerolinea/sms/DeleteDangerIdentificationDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetDangerIdentificationById } from "@/hooks/sms/useGetDangerIdentificationById";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  FileText,
  Info,
  Layers,
  List,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const ShowDangerIdentification = () => {
  const { identification_id } = useParams<{ identification_id: string }>();
  const { selectedCompany } = useCompanyStore();
  const {
    data: dangerIdentification,
    isLoading,
    isError,
  } = useGetDangerIdentificationById({
    company: selectedCompany?.slug,
    id: identification_id,
  });

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
      <div className="flex justify-evenly flex-wrap gap-4 mb-6">
        {dangerIdentification && status === "ABIERTO" && (
          <>
            <div className="flex items-center">
              <CreateDangerIdentificationDialog
                title="Editar Identificación"
                id={id}
                isEditing={true}
                initialData={dangerIdentification}
                reportType={reportType}
              />
            </div>
            <div className="flex items-center">
              <DeleteDangerIdentificationDialog
                id={dangerIdentification.id}
                company={selectedCompany!.slug}
              />
            </div>
          </>
        )}

        {dangerIdentification &&
          !dangerIdentification.analysis &&
          status === "ABIERTO" && (
            <div className="flex items-center">
              <CreateAnalysesDialog
                buttonTitle="Crear Análisis"
                name="identification"
                id={dangerIdentification.id}
              />
            </div>
          )}

        {dangerIdentification?.analysis && status === "ABIERTO" && (
          <div className="flex items-center">
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
      <div className="flex flex-col justify-center items-center border border-gray-300 rounded-lg p-8 gap-6 shadow-md dark:border-gray-700">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-10 h-10 text-yellow-600" />
          <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
            Detalles de Identificación de Peligro
          </h1>
        </div>

        {dangerIdentification && (
          <div className="w-full space-y-6">
            {/* Información básica del peligro - Ahora con 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    <span className="font-bold">Peligro:</span>{" "}
                    {dangerIdentification.danger}
                  </p>
                </div>
              </div>

              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg">
                <div className="flex items-center gap-3">
                  <Layers className="w-6 h-6 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    <span className="font-bold">Área de Peligro:</span>{" "}
                    {dangerIdentification.danger_area}
                  </p>
                </div>
              </div>

              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    <span className="font-bold">Tipo de Peligro:</span>{" "}
                    {dangerIdentification.danger_type}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Fuente de información */}
              {dangerIdentification.information_source && (
                <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg w-full">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                    <Info className="w-6 h-6" />
                    Fuente de Información
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        Nombre:
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {dangerIdentification.information_source.name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        Método de identificación:
                      </p>
                      <Badge
                        className={`justify-center items-center text-center font-bold text-sm px-3 py-1 ${
                          dangerIdentification.information_source.type ===
                          "PROACTIVO"
                            ? "bg-green-200 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700"
                            : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                        }`}
                      >
                        {dangerIdentification.information_source.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Descripción */}
              <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg w-full">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  Descripción
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {dangerIdentification.description || "N/A"}
                </p>
              </div>
            </div>

            <div className=" flex gap-2">
              {/* Consecuencias */}
              {dangerIdentification.possible_consequences && (
                <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg w-full">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                    <List className="w-6 h-6" />
                    Posibles Consecuencias
                  </h3>
                  <ul className="space-y-3">
                    {dangerIdentification.possible_consequences
                      .split(",")
                      .map((consequence, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <ChevronRight className="w-5 h-5 mt-1 flex-shrink-0 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {consequence.trim()}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Defensas actuales */}
              {dangerIdentification.current_defenses && (
                <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg w-full">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                    <Shield className="w-6 h-6" />
                    Defensas Actuales
                  </h3>
                  <ul className="space-y-3">
                    {dangerIdentification.current_defenses
                      .split(",")
                      .map((defense, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <ChevronRight className="w-5 h-5 mt-1 flex-shrink-0 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {defense.trim()}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Análisis de causa raíz */}
            <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6" />
                Análisis de Causa Raíz
              </h3>
              <ul className="space-y-3">
                {dangerIdentification.root_cause_analysis
                  .split(",")
                  .map((analysis, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 mt-1 flex-shrink-0 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {analysis.trim()}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {isError && (
          <div className="border border-red-300 dark:border-red-700 rounded-lg p-8 w-full flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-14 w-14 text-red-500" />
              <h1 className="text-2xl font-bold text-center text-red-600 dark:text-red-400">
                Error al cargar la identificación
              </h1>
              <p className="text-lg text-red-700 dark:text-red-300 text-center">
                No se pudieron cargar los datos de la identificación de peligro
              </p>
              <div className="flex gap-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-red-300 text-red-700 hover:bg-red-100 dark:hover:bg-red-800/30 h-10 px-4"
                >
                  Reintentar
                </Button>
                <Link href="/transmandu/sms/peligros_identificados">
                  <Button
                    variant="outline"
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 h-10 px-4"
                  >
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
