"use client";
import CreateDangerIdentificationDialog from "@/components/dialogs/aerolinea/sms/CreateDangerIdentificationDialog";
import CreateObligatoryDialog from "@/components/dialogs/aerolinea/sms/CreateObligatoryDialog";
import DeleteObligatoryReportDialog from "@/components/dialogs/aerolinea/sms/DeleteObligatoryReportDialog";
import PreviewObligatoryReportPdfDialog from "@/components/dialogs/aerolinea/sms/PreviewObligatoryReportPdfDialog";
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
  Mail,
  MapPin,
  Phone,
  Plane,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCompanyStore } from "@/stores/CompanyStore";

const ShowObligatoryReport = () => {
  const { obligatory_id } = useParams<{ obligatory_id: string }>();

  const { selectedCompany } = useCompanyStore();

  const {
    data: obligatoryReport,
    isLoading,
    isError,
  } = useGetObligatoryReportById({
    company: selectedCompany?.slug,
    id: obligatory_id,
  });

  return (
    <ContentLayout title="Reportes Obligatorios">
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        data-tour="obligatorio-detalle-acciones"
      >
        {obligatoryReport &&
        obligatoryReport.status === "ABIERTO" &&
        obligatoryReport.danger_identification === null ? (
          <CreateDangerIdentificationDialog
            title={"Crear Identificación de Peligro"}
            id={obligatoryReport?.id}
            reportType="ROS"
          />
        ) : (
          obligatoryReport &&
          obligatoryReport.status === "ABIERTO" &&
          obligatoryReport.danger_identification?.id && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-full"
              asChild
            >
              <Link
                href={`/transmandu/sms/gestion_reportes/peligros_identificados/${obligatoryReport.danger_identification.id}`}
              >
                Ver Identificación
              </Link>
            </Button>
          )
        )}

        {obligatoryReport && obligatoryReport.status === "ABIERTO" && (
          <CreateObligatoryDialog
            initialData={obligatoryReport}
            isEditing={true}
            title={"Editar"}
          />
        )}

        {obligatoryReport && obligatoryReport.status === "ABIERTO" && (
          <DeleteObligatoryReportDialog
            company={selectedCompany!.slug}
            id={obligatoryReport.id.toString()}
          />
        )}

        {obligatoryReport && (
          <PreviewObligatoryReportPdfDialog
            title={"Descargar PDF"}
            obligatoryReport={obligatoryReport}
          />
        )}
      </div>

      <div className="flex flex-col justify-center items-center border border-border/60 rounded-lg p-5 gap-y-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-sm font-semibold text-center">
            Detalles del Reporte Obligatorio
          </h1>
        </div>

        {isLoading && (
          <div className="flex w-full h-64 justify-center items-center">
            <Loader2 className="size-24 animate-spin text-muted-foreground" />
          </div>
        )}

        {obligatoryReport && (
          <div className="w-full space-y-4">
            {obligatoryReport.report_number && (
              <div
                className="flex flex-col md:flex-row justify-between p-4 rounded-lg gap-2 border border-border/60"
                data-tour="obligatorio-detalle-encabezado"
              >
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Código:
                  </span>
                  <span className="text-sm font-mono tracking-wide">
                    ROS-{obligatoryReport.report_number}
                  </span>
                  <Badge
                    className={`text-xs font-semibold ${
                      obligatoryReport.status === "CERRADO"
                        ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800"
                        : obligatoryReport.status === "ABIERTO"
                          ? "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800"
                          : "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
                    }`}
                  >
                    {obligatoryReport.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Fecha del Reporte:
                  </span>
                  <span className="text-sm">
                    {format(obligatoryReport.report_date, "PPP", {
                      locale: es,
                    })}
                  </span>
                </div>
              </div>
            )}

            <div
              className="p-4 rounded-lg space-y-3 border border-border/60"
              data-tour="obligatorio-detalle-incidente"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Lugar del Suceso
                  </span>
                  <p className="text-sm mt-0.5">
                    {obligatoryReport.incident_location}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Fecha:
                  </span>
                  <span className="text-sm">
                    {format(obligatoryReport.incident_date, "PPP", {
                      locale: es,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Hora:
                  </span>
                  <span className="text-sm">
                    {obligatoryReport.incident_time?.substring(0, 5)}
                  </span>
                </div>
              </div>
            </div>

            <div data-tour="obligatorio-detalle-incidentes">
              {obligatoryReport.other_incidents && (
                <div className="p-4 rounded-lg border border-border/60">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Otros Incidentes
                      </span>
                      <p className="text-sm mt-0.5">
                        {obligatoryReport.other_incidents}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {obligatoryReport.incidents && (
                <div className="p-4 rounded-lg border border-border/60">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Lista de Incidentes
                    </span>
                  </div>
                  {(() => {
                    try {
                      const incidentsArray = JSON.parse(
                        obligatoryReport.incidents,
                      ) as string[];
                      return (
                        <ul className="space-y-1">
                          {incidentsArray.map(
                            (incident: string, index: number) => (
                              <li
                                key={index}
                                className="text-sm flex items-start gap-2"
                              >
                                <span className="text-muted-foreground">•</span>
                                <span>{incident}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      );
                    } catch (error) {
                      console.error("Error parsing incidents:", error);
                      return <p className="text-sm">Error al mostrar incidentes</p>;
                    }
                  })()}
                </div>
              )}

              <div className="p-4 rounded-lg border border-border/60">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Descripción
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {obligatoryReport.description}
                </p>
              </div>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              data-tour="obligatorio-detalle-contacto"
            >
              <div className="p-4 rounded-lg border border-border/60">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email de Contacto
                  </span>
                </div>
                <p className="text-sm font-mono">
                  {obligatoryReport.email || (
                    <span className="text-muted-foreground/60">No registrado</span>
                  )}
                </p>
              </div>

              <div className="p-4 rounded-lg border border-border/60">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Teléfono de Contacto
                  </span>
                </div>
                <p className="text-sm font-mono">
                  {obligatoryReport.phone_number || (
                    <span className="text-muted-foreground/60">No registrado</span>
                  )}
                </p>
              </div>
            </div>

            <div
              className="flex flex-col lg:flex-row justify-center items-stretch gap-4"
              data-tour="obligatorio-detalle-vuelo"
            >
              {obligatoryReport.aircraft && (
                <div className="p-4 rounded-lg flex-1 border border-border/60">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Plane className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Datos de Aeronave
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Matrícula
                      </span>
                      <p className="text-sm font-mono tracking-wide">
                        {obligatoryReport.aircraft.acronym}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Modelo
                      </span>
                      <p className="text-sm">
                        {obligatoryReport.aircraft.model}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg flex-1 border border-border/60">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Plane className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Datos de Vuelo
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Número de Vuelo
                    </span>
                    <p className="text-sm font-mono tracking-wide">
                      {obligatoryReport.flight_number}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Hora de Vuelo
                    </span>
                    <p className="text-sm">{obligatoryReport.flight_time?.substring(0, 5)}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Origen
                    </span>
                    <p className="text-sm">{obligatoryReport.flight_origin}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Destino
                    </span>
                    <p className="text-sm">{obligatoryReport.flight_destiny}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Destino Alterno
                    </span>
                    <p className="text-sm">
                      {obligatoryReport.flight_alt_destiny}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex flex-col lg:flex-row justify-center items-stretch gap-4"
              data-tour="obligatorio-detalle-tripulacion"
            >
              {obligatoryReport.pilot && (
                <div className="p-4 rounded-lg flex-1 border border-border/60">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Datos del Piloto
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        DNI
                      </span>
                      <p className="text-sm font-mono">
                        {obligatoryReport.pilot.employee?.dni}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Licencia
                      </span>
                      <p className="text-sm font-mono">
                        {obligatoryReport.pilot.license_number}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Nombre
                      </span>
                      <p className="text-sm">
                        {obligatoryReport.pilot.employee?.first_name}{" "}
                        {obligatoryReport.pilot.employee?.last_name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {obligatoryReport.copilot && (
                <div className="p-4 rounded-lg flex-1 border border-border/60">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Datos del Copiloto
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        DNI
                      </span>
                      <p className="text-sm font-mono">
                        {obligatoryReport.copilot.employee?.dni}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Licencia
                      </span>
                      <p className="text-sm font-mono">
                        {obligatoryReport.copilot.license_number}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Nombre
                      </span>
                      <p className="text-sm">
                        {obligatoryReport.copilot.employee?.first_name}{" "}
                        {obligatoryReport.copilot.employee?.last_name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {obligatoryReport?.imageUrl && (
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer flex justify-center">
                    <CardContent className="flex flex-col gap-2 p-0">
                      <div className="relative group">
                        <div className="w-64 h-64">
                          <Image
                            src={`${obligatoryReport.imageUrl}`}
                            alt={`vista previa del ${obligatoryReport.report_number}`}
                            fill
                            className="object-contain rounded-md border border-border/60 group-hover:border-border transition-all"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black/50 text-white px-3 py-1 rounded-md flex items-center gap-1 text-sm">
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
                  <DialogHeader className="pb-2 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-500 shrink-0">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <DialogTitle className="text-base font-semibold leading-tight">
                          Imagen del Reporte
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ROS-{obligatoryReport.report_number}
                        </p>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="relative flex justify-center items-center h-[70vh]">
                    <Image
                      src={`${obligatoryReport.imageUrl}`}
                      alt={`vista previa del ${obligatoryReport.report_number}`}
                      fill
                      className="max-w-full max-h-[70vh] object-contain border border-border/60 rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end mt-4">
                    <a
                      href={`${obligatoryReport.imageUrl}`}
                      download={`ROS-${obligatoryReport.report_number}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Imagen
                    </a>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {obligatoryReport.documentUrl && (
              <div className="border border-border/60 p-5 rounded-lg text-center">
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-4">
                  Documento Adjunto
                </h3>
                <a
                  href={`${obligatoryReport.documentUrl}`}
                  download={`ROS-${obligatoryReport.report_number}.pdf`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                >
                  <File className="w-4 h-4 mr-2" />
                  Descargar Documento Adjunto
                </a>
              </div>
            )}
          </div>
        )}

        {isError && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-300">
              Ha ocurrido un error al cargar el reporte obligatorio...
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default ShowObligatoryReport;
