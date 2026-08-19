"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams } from "next/navigation";
import { useGetChangeRequestById } from "@/hooks/sms/gestion_de_cambio/useGetChangeRequestById";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  DollarSign,
  Activity,
  Camera,
} from "lucide-react";
import Link from "next/link";
import { dateFormat } from "@/lib/utils";
import {
  ChangeRequest,
  ChangeStatus,
  ChangeRequiredItem,
  ChangeFinancialResource,
  ChangeRiskAssessment,
  ChangeActivity,
  ChangePhotographicRecord,
} from "@/types";
import { FileServer } from "@/components/misc/FileServer";
import { ImageGalleryDialog } from "@/components/dialogs/general/ImageGalleryDialog";
import Image from "next/image";

const STATUS_STYLES: Record<
  ChangeStatus,
  { label: string; className: string }
> = {
  BORRADOR: {
    label: "Borrador",
    className: "bg-muted text-muted-foreground border-border",
  },
  EN_REVISION: {
    label: "En Revisión",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  },
  APROBADO: {
    label: "Aprobado",
    className:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800",
  },
  RECHAZADO: {
    label: "Rechazado",
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
  },
  EN_EJECUCION: {
    label: "En Ejecución",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  },
  CERRADO: {
    label: "Cerrado",
    className:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800",
  },
};

const CHANGE_TYPE_LABELS: Record<string, string> = {
  facilities: "INSTALACIONES",
  documentary: "DOCUMENTAL",
  staff: "PERSONAL",
  equipment: "EQUIPAMIENTO",
  procedures: "PROCEDIMIENTOS",
  technology: "TECNOLOGIA",
  other: "OTRO",
};

const TOLERABILITY_LABELS: Record<string, { label: string; className: string }> = {
  acceptable: {
    label: "Aceptable",
    className:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800",
  },
  tolerable: {
    label: "Tolerable",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  },
  intolerable: {
    label: "Intolerable",
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
  },
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
    {children}
  </span>
);

const FieldValue = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm mt-0.5">{children || "—"}</p>
);

const RequiredItemsSection = ({
  items,
}: {
  items: ChangeRequiredItem[];
}) => {
  if (!items.length) return null;
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Ítems Requeridos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-center">N°</TableHead>
              <TableHead>Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-center text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="text-sm">{item.item_description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const FinancialResourcesSection = ({
  resources,
}: {
  resources: ChangeFinancialResource[];
}) => {
  if (!resources.length) return null;
  const total = resources.reduce((acc, r) => acc + Number(r.estimated_value), 0);
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          Recursos Financieros
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-center">N°</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Valor Estimado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource, index) => (
              <TableRow key={resource.id}>
                <TableCell className="text-center text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="text-sm">{resource.description}</TableCell>
                <TableCell className="text-right font-mono tabular-nums text-sm">
                  {resource.estimated_value.toLocaleString("es-VE", {
                    style: "currency",
                    currency: resource.currency_unit || "USD",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end px-4 py-3 border-t border-border/30">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total
            </span>
            <span className="font-mono text-lg font-bold tabular-nums">
              {total.toLocaleString("es-VE", {
                style: "currency",
                currency: "USD",
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RiskAssessmentsSection = ({
  risks,
}: {
  risks: ChangeRiskAssessment[];
}) => {
  if (!risks.length) return null;
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          Evaluación de Riesgos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-center">N°</TableHead>
              <TableHead>Peligro</TableHead>
              <TableHead className="text-center">Probabilidad</TableHead>
              <TableHead className="text-center">Severidad</TableHead>
              <TableHead className="text-center">Índice</TableHead>
              <TableHead className="text-center">Tolerabilidad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risks.map((risk, index) => {
              const tolerability = TOLERABILITY_LABELS[risk.tolerability_level];
              return (
                <TableRow key={risk.id}>
                  <TableCell className="text-center text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-sm">
                    {risk.hazard_description}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">
                    {risk.probability_value}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">
                    {risk.severity_value}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm font-semibold">
                    {risk.risk_index}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={tolerability?.className}>
                      {tolerability?.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const ActivitiesSection = ({ activities }: { activities: ChangeActivity[] }) => {
  if (!activities.length) return null;
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Actividades
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-center">N°</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Asignado a</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity, index) => (
              <TableRow key={activity.id}>
                <TableCell className="text-center text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="text-sm">
                  {activity.activity_description}
                </TableCell>
                <TableCell className="text-sm">
                  {activity.assigned_employee
                    ? `${activity.assigned_employee.first_name} ${activity.assigned_employee.last_name}`
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const PhotographicRecordsSection = ({
  records,
  company,
}: {
  records: ChangePhotographicRecord[];
  company: string;
}) => {
  if (!records.length) return null;

  const beforeRecords = records.filter((r) => r.stage === "before");
  const afterRecords = records.filter((r) => r.stage === "after");

  const allImages = records.map((r) => ({
    src: r.image_url,
    alt: `Registro fotográfico — ${r.stage === "before" ? "Antes" : "Después"}`,
  }));

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base flex items-center gap-2">
          <Camera className="h-4 w-4 text-muted-foreground" />
          Registros Fotográficos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {beforeRecords.length > 0 && (
          <div className="flex flex-col gap-2">
            <SectionLabel>ANTES del Cambio</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {beforeRecords.map((record, index) => (
                <FileServer
                  key={record.id}
                  path={record.image_url}
                  company={company}
                  type="document"
                >
                  {(url) => (
                    <ImageGalleryDialog
                      images={beforeRecords.map((r) => ({
                        src: r.image_url,
                        alt: `ANTES ${r.id}`,
                      }))}
                      trigger={
                        <div className="relative aspect-square rounded-md overflow-hidden border border-border/40 cursor-pointer hover:opacity-80 transition-opacity">
                          {url ? (
                            <Image
                              src={url}
                              alt={`ANTES ${index + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-muted/30">
                              <Loader2 className="size-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      }
                      initialIndex={index}
                    />
                  )}
                </FileServer>
              ))}
            </div>
          </div>
        )}

        {afterRecords.length > 0 && (
          <div className="flex flex-col gap-2">
            <SectionLabel>DESPUÉS del Cambio</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {afterRecords.map((record, index) => (
                <FileServer
                  key={record.id}
                  path={record.image_url}
                  company={company}
                  type="document"
                >
                  {(url) => (
                    <ImageGalleryDialog
                      images={afterRecords.map((r) => ({
                        src: r.image_url,
                        alt: `DESPUÉS ${r.id}`,
                      }))}
                      trigger={
                        <div className="relative aspect-square rounded-md overflow-hidden border border-border/40 cursor-pointer hover:opacity-80 transition-opacity">
                          {url ? (
                            <Image
                              src={url}
                              alt={`DESPUÉS ${index + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-muted/30">
                              <Loader2 className="size-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      }
                      initialIndex={index}
                    />
                  )}
                </FileServer>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function GestionDeCambioDetailPage() {
  const params = useParams();
  const company = params.company as string;
  const id = params.id as string;

  const {
    data: changeRequest,
    isLoading,
    isError,
  } = useGetChangeRequestById(company, id);

  if (isLoading) {
    return (
      <ContentLayout title="Detalle de Gestión de Cambio">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="animate-spin size-12 text-primary" />
        </div>
      </ContentLayout>
    );
  }

  if (isError || !changeRequest) {
    return (
      <ContentLayout title="Detalle de Gestión de Cambio">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-sm text-muted-foreground">
            No se pudo encontrar la solicitud de cambio especificada.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/${company}/sms/aseguramiento_calidad/gestion_de_cambio`}
            >
              Volver al listado
            </Link>
          </Button>
        </div>
      </ContentLayout>
    );
  }

  const status = STATUS_STYLES[changeRequest.status];

  return (
    <ContentLayout title="Detalle de Gestión de Cambio">
      <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full pb-10">
        {/* Header */}
        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="h-9 w-9">
              <Link
                href={`/${company}/sms/aseguramiento_calidad/gestion_de_cambio`}
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Solicitud de Cambio{" "}
                <span className="text-muted-foreground">
                  #{changeRequest.id}
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {CHANGE_TYPE_LABELS[changeRequest.change_type]} —{" "}
                {changeRequest.department?.name}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Datos Generales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <SectionLabel>Fecha de Solicitud</SectionLabel>
                <FieldValue>
                  {dateFormat(changeRequest.request_date, "PPP")}
                </FieldValue>
              </div>
              <div>
                <SectionLabel>Solicitante</SectionLabel>
                <FieldValue>
                  {changeRequest.requested_by?.first_name}{" "}
                  {changeRequest.requested_by?.last_name}
                </FieldValue>
              </div>
              <div>
                <SectionLabel>Departamento</SectionLabel>
                <FieldValue>{changeRequest.department?.name}</FieldValue>
              </div>
              <div>
                <SectionLabel>Temporal</SectionLabel>
                <FieldValue>
                  {changeRequest.is_temporary ? "Sí" : "No"}
                  {changeRequest.is_temporary &&
                    changeRequest.temporary_duration &&
                    ` (${changeRequest.temporary_duration})`}
                </FieldValue>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Responsables
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <SectionLabel>Líder del Proyecto</SectionLabel>
                <FieldValue>
                  {changeRequest.project_lead_by
                    ? `${changeRequest.project_lead_by.first_name} ${changeRequest.project_lead_by.last_name}`
                    : "—"}
                </FieldValue>
              </div>
              <div>
                <SectionLabel>Revisado por</SectionLabel>
                <FieldValue>
                  {changeRequest.reviewed_by
                    ? `${changeRequest.reviewed_by.first_name} ${changeRequest.reviewed_by.last_name}`
                    : "—"}
                </FieldValue>
              </div>
              <div>
                <SectionLabel>Aprobado por</SectionLabel>
                <FieldValue>
                  {changeRequest.approved_by
                    ? `${changeRequest.approved_by.first_name} ${changeRequest.approved_by.last_name}`
                    : "—"}
                </FieldValue>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                Fechas Clave
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <SectionLabel>Fecha Estimada de Cambio</SectionLabel>
                <FieldValue>
                  {changeRequest.estimated_change_date
                    ? dateFormat(changeRequest.estimated_change_date, "PPP")
                    : "—"}
                </FieldValue>
              </div>
              <div>
                <SectionLabel>Fecha de Corte</SectionLabel>
                <FieldValue>
                  {changeRequest.cutoff_date
                    ? dateFormat(changeRequest.cutoff_date, "PPP")
                    : "—"}
                </FieldValue>
              </div>
              <div>
                <SectionLabel>Período de Estabilización</SectionLabel>
                <FieldValue>
                  {changeRequest.stabilization_period || "—"}
                </FieldValue>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description, Scope, Justification */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base">Descripción del Cambio</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <SectionLabel>Descripción</SectionLabel>
              <p className="text-sm mt-1">{changeRequest.description}</p>
            </div>
            <div className="border-t border-border/30 pt-4">
              <SectionLabel>Alcance</SectionLabel>
              <p className="text-sm mt-1">{changeRequest.scope}</p>
            </div>
            <div className="border-t border-border/30 pt-4">
              <SectionLabel>Justificación</SectionLabel>
              <p className="text-sm mt-1">{changeRequest.justification}</p>
            </div>
            {changeRequest.mitigation_plan && (
              <div className="border-t border-border/30 pt-4">
                <SectionLabel>Plan de Mitigación</SectionLabel>
                <p className="text-sm mt-1">{changeRequest.mitigation_plan}</p>
              </div>
            )}
            {changeRequest.planned_changes && (
              <div className="border-t border-border/30 pt-4">
                <SectionLabel>Cambios Planificados</SectionLabel>
                <p className="text-sm mt-1">{changeRequest.planned_changes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sub-sections */}
        <div className="flex flex-col gap-5">
          <RequiredItemsSection items={changeRequest.required_items} />
          <FinancialResourcesSection resources={changeRequest.financial_resources} />
          <RiskAssessmentsSection risks={changeRequest.risk_assessments} />
          <ActivitiesSection activities={changeRequest.activities} />
          <PhotographicRecordsSection
            records={changeRequest.photographic_records}
            company={company}
          />
        </div>
      </div>
    </ContentLayout>
  );
}
