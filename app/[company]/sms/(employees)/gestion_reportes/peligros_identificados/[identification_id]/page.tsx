"use client";
import CreateAnalysesDialog from "@/components/dialogs/aerolinea/sms/CreateAnalysesDialog";
import CreateDangerIdentificationDialog from "@/components/dialogs/aerolinea/sms/CreateDangerIdentificationDialog";
import DeleteDangerIdentificationDialog from "@/components/dialogs/aerolinea/sms/DeleteDangerIdentificationDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetDangerIdentificationById } from "@/hooks/sms/useGetDangerIdentificationById";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AlertCircle } from "lucide-react";
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
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden h-8 lg:flex"
                >
                  Editar Identificación
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader></DialogHeader>
                <CreateDangerIdentificationDialog
                  title="Editar Identificación"
                  id={id}
                  isEditing={true}
                  initialData={dangerIdentification}
                  reportType={reportType}
                />
              </DialogContent>
            </Dialog>

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
      <div
        className="flex flex-col items-center border border-border/60 rounded-lg p-6 gap-5"
        data-tour="peligros-detalle-header"
      >
        {dangerIdentification && (
          <div className="w-full space-y-5">
            {/* Información básica del peligro */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              data-tour="peligros-detalle-info-basica"
            >
              <div className="border border-border/60 p-4 rounded-lg">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 block mb-1">
                  Peligro
                </span>
                <p className="text-sm font-medium text-foreground">
                  {dangerIdentification.danger}
                </p>
              </div>

              <div className="border border-border/60 p-4 rounded-lg">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 block mb-1">
                  Área de Peligro
                </span>
                <p className="text-sm font-medium text-foreground">
                  {dangerIdentification.danger_area}
                </p>
              </div>

              <div className="border border-border/60 p-4 rounded-lg">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 block mb-1">
                  Tipo de Peligro
                </span>
                <p className="text-sm font-medium text-foreground">
                  {dangerIdentification.danger_type}
                </p>
              </div>
            </div>

            {/* Fuente de información + Descripción */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              data-tour="peligros-detalle-fuente-desc"
            >
              {dangerIdentification.information_source && (
                <div className="border border-border/60 p-4 rounded-lg">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 block mb-3">
                    Fuente de Información
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-muted-foreground">Nombre:</span>
                      <span className="text-sm text-foreground">
                        {dangerIdentification.information_source.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Método:</span>
                      <Badge
                        className={`text-xs font-medium px-2 py-0.5 ${
                          dangerIdentification.information_source.type === "PROACTIVO"
                            ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800"
                            : "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800"
                        }`}
                      >
                        {dangerIdentification.information_source.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <div className="border border-border/60 p-4 rounded-lg">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 block mb-2">
                  Descripción
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {dangerIdentification.description || "N/A"}
                </p>
              </div>
            </div>

            {/* Consecuencias + Defensas */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              data-tour="peligros-detalle-consecuencias-defensas"
            >
              {dangerIdentification.possible_consequences && (
                <div className="border border-border/60 p-4 rounded-lg">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 block mb-3">
                    Posibles Consecuencias
                  </span>
                  <ul className="space-y-2">
                    {dangerIdentification.possible_consequences
                      .split("~")
                      .map((consequence, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-muted-foreground border-b border-border/30 last:border-0 pb-2 last:pb-0"
                        >
                          <span className="font-mono text-xs text-muted-foreground/60 mt-0.5 select-none">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>{consequence.trim()}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {dangerIdentification.current_defenses && (
                <div className="border border-border/60 p-4 rounded-lg">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 block mb-3">
                    Defensas Actuales
                  </span>
                  <ul className="space-y-2">
                    {dangerIdentification.current_defenses
                      .split("~")
                      .map((defense, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-muted-foreground border-b border-border/30 last:border-0 pb-2 last:pb-0"
                        >
                          <span className="font-mono text-xs text-muted-foreground/60 mt-0.5 select-none">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>{defense.trim()}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Análisis de causa raíz — 5 Porqués */}
            <div
              className="border border-border/60 rounded-lg overflow-hidden"
              data-tour="peligros-detalle-causa-raiz"
            >
              <div className="px-4 py-3 border-b border-border/60 bg-muted/30">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  Análisis de Causa Raíz — 5 Porqués
                </span>
              </div>
              <div className="divide-y divide-border/30">
                {dangerIdentification.root_cause_analysis
                  .split("~")
                  .map((analysis, index, arr) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                    >
                      <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-muted/60 font-mono text-xs font-semibold text-muted-foreground select-none">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 block mb-0.5">
                          {index === 0 ? "¿Por qué sucedió?" : `¿Por qué #${index}?`}
                        </span>
                        <p className="text-sm text-foreground">
                          {analysis.trim()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {isError && (
          <div className="border border-border/60 rounded-lg p-8 w-full flex flex-col items-center gap-4">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Error al cargar la identificación
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              No se pudieron cargar los datos de la identificación de peligro
            </p>
            <div className="flex gap-3 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
              <Link href="/transmandu/sms/peligros_identificados">
                <Button variant="outline" size="sm">
                  Volver a la lista
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default ShowDangerIdentification;
