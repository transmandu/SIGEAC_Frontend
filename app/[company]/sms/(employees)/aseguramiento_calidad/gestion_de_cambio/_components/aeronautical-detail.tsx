"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Camera,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  ShieldAlert,
  User,
} from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileServer } from "@/components/misc/FileServer";
import { useGetChangeRequestByNumber } from "@/hooks/sms/aeronautical/gestion_de_cambio/useGetChangeRequestByNumber";
import { useChangeRequestPhotoUrls } from "@/hooks/sms/aeronautical/gestion_de_cambio/useChangeRequestPhotoUrls";
import { useCompanyStore } from "@/stores/CompanyStore";
import { dateFormat } from "@/lib/utils";
import { ChangeStatus } from "@/types/sms/aeronautical/change-request";

const STATUS_LABELS: Record<ChangeStatus, string> = {
  BORRADOR: "Borrador",
  EN_REVISION: "En revisión",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
  EN_EJECUCION: "En ejecución",
  CERRADO: "Cerrado",
};

const STATUS_CLASSES: Record<ChangeStatus, string> = {
  BORRADOR: "bg-muted text-muted-foreground",
  EN_REVISION: "bg-amber-100 text-amber-700",
  APROBADO: "bg-green-100 text-green-700",
  RECHAZADO: "bg-red-100 text-red-700",
  EN_EJECUCION: "bg-amber-100 text-amber-700",
  CERRADO: "bg-blue-100 text-blue-700",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
      {children}
    </span>
  );
}

function FieldValue({ children }: { children: React.ReactNode }) {
  return <p className="text-sm mt-1">{children || "—"}</p>;
}

export default function ChangeRequestDetailPage() {
  const params = useParams<{ company: string; requestNumber: string }>();
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug ?? params.company;

  const { data: changeRequest, isLoading } = useGetChangeRequestByNumber(
    company,
    params.requestNumber,
  );

  const photoUrls = useChangeRequestPhotoUrls(
    changeRequest?.photographic_records ?? [],
    company,
  );

  if (isLoading) {
    return (
      <ContentLayout title="Detalle de Gestión de Cambio">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="animate-spin size-12 text-primary" />
        </div>
      </ContentLayout>
    );
  }

  if (!changeRequest) {
    return (
      <ContentLayout title="Detalle de Gestión de Cambio">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-sm text-muted-foreground">
            No se encontró la solicitud de cambio.
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
        </div>
      </ContentLayout>
    );
  }

  const status = changeRequest.status;

  return (
    <ContentLayout title="Detalle de Gestión de Cambio">
      <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full pb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
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
                Solicitud{" "}
                <span className="text-muted-foreground">
                  {changeRequest.request_number}
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {changeRequest.change_type} — {changeRequest.department?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className={STATUS_CLASSES[status]}>
              {STATUS_LABELS[status]}
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/${company}/sms/aseguramiento_calidad/gestion_de_cambio/${changeRequest.request_number}/editar`}
              >
                <Pencil className="mr-2 size-4" />
                Editar
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link
                href={`/${company}/sms/aseguramiento_calidad/gestion_de_cambio/${changeRequest.request_number}/evaluacion`}
              >
                <ShieldAlert className="mr-2 size-4" />
                Evaluar peligros
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                Datos generales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <FieldLabel>Fecha de solicitud</FieldLabel>
                <FieldValue>
                  {dateFormat(changeRequest.request_date, "PPP")}
                </FieldValue>
              </div>
              <div>
                <FieldLabel>Departamento</FieldLabel>
                <FieldValue>{changeRequest.department?.name}</FieldValue>
              </div>
              <div>
                <FieldLabel>Descripción</FieldLabel>
                <FieldValue>{changeRequest.description}</FieldValue>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                Responsables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <FieldLabel>Solicitante</FieldLabel>
                <FieldValue>
                  {changeRequest.requested_by?.first_name}{" "}
                  {changeRequest.requested_by?.last_name}
                </FieldValue>
              </div>
              <div>
                <FieldLabel>Aprobado por</FieldLabel>
                <FieldValue>
                  {changeRequest.approved_by
                    ? `${changeRequest.approved_by.first_name} ${changeRequest.approved_by.last_name}`
                    : "—"}
                </FieldValue>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                Alcance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <FieldLabel>Ubicaciones</FieldLabel>
                <FieldValue>
                  {changeRequest.locations
                    ?.map((location) => location.name ?? location.cod_iata)
                    .join(", ")}
                </FieldValue>
              </div>
              <div>
                <FieldLabel>Afecta otros departamentos</FieldLabel>
                <FieldValue>
                  {changeRequest.affects_other_departments
                    ? changeRequest.affected_departments
                        ?.map((department) => department.name)
                        .join(", ")
                    : "No"}
                </FieldValue>
              </div>
              <div>
                <FieldLabel>Afecta otros procesos</FieldLabel>
                <FieldValue>
                  {changeRequest.affects_other_processes ? "Sí" : "No"}
                </FieldValue>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Motivos del cambio</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {changeRequest.reasons?.map((reason) => (
              <div
                key={reason.id ?? reason.change_reason_id}
                className="text-sm"
              >
                <span className="font-medium">{reason.name}</span>
                {reason.pivot?.other_description ? (
                  <span className="text-muted-foreground">
                    {" "}
                    — {reason.pivot.other_description}
                  </span>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="size-4 text-muted-foreground" />
              Peligros identificados
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {changeRequest.hazards?.map((hazard) => (
              <div
                key={hazard.id}
                className="rounded-lg border border-border/60 p-4 flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {hazard.danger_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hazard.report_number}
                    </p>
                  </div>
                  {hazard.analysis ? (
                    <Badge variant="outline">
                      Riesgo inicial {hazard.analysis.probability}
                      {hazard.analysis.severity} ({hazard.analysis.result})
                    </Badge>
                  ) : null}
                  {hazard.mitigation_plan?.analysis ? (
                    <Badge variant="outline">
                      Riesgo residual{" "}
                      {hazard.mitigation_plan.analysis.probability}
                      {hazard.mitigation_plan.analysis.severity} (
                      {hazard.mitigation_plan.analysis.result})
                    </Badge>
                  ) : null}
                </div>

                <div>
                  <FieldLabel>Descripción del peligro</FieldLabel>
                  <FieldValue>{hazard.description}</FieldValue>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Área responsable</FieldLabel>
                    <FieldValue>
                      {hazard.mitigation_plan?.area_responsible}
                    </FieldValue>
                  </div>
                  <div>
                    <FieldLabel>Posibles consecuencias</FieldLabel>
                    <FieldValue>
                      {hazard.mitigation_plan?.possible_consequences}
                    </FieldValue>
                  </div>
                </div>

                {hazard.mitigation_plan?.measures?.length ? (
                  <div>
                    <FieldLabel>Medidas de mitigación</FieldLabel>
                    <div className="mt-2 flex flex-col gap-3">
                      {hazard.mitigation_plan.measures.map((measure) => (
                        <div
                          key={measure.id}
                          className="rounded-md bg-muted/30 p-3 text-sm"
                        >
                          <p className="font-medium">{measure.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Responsable: {measure.implementation_responsible} ·
                            Fecha estimada:{" "}
                            {measure.estimated_date
                              ? dateFormat(measure.estimated_date, "PPP")
                              : "—"}
                          </p>
                          {measure.follow_up_controls?.length ? (
                            <div className="mt-2 flex flex-col gap-1">
                              {measure.follow_up_controls.map((control) => (
                                <p
                                  key={control.id}
                                  className="text-xs text-muted-foreground"
                                >
                                  Control: {control.description}
                                  {control.date
                                    ? ` — ${dateFormat(control.date, "PPP")}`
                                    : ""}
                                </p>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documento</CardTitle>
            </CardHeader>
            <CardContent>
              {changeRequest.document ? (
                <FileServer path={changeRequest.document} company={company}>
                  {(url, isLoading, hasError) => (
                    <Button
                      asChild
                      variant="outline"
                      disabled={!url || hasError}
                    >
                      <a href={url ?? "#"} download>
                        {isLoading
                          ? "Cargando..."
                          : hasError
                            ? "No disponible"
                            : "Descargar documento"}
                      </a>
                    </Button>
                  )}
                </FileServer>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin documento adjunto.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="size-4 text-muted-foreground" />
                Registro fotográfico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {changeRequest.photographic_records?.length ? (
                <div className="grid grid-cols-2 gap-3">
                  {changeRequest.photographic_records.map((record) => (
                    <div key={record.id} className="flex flex-col gap-1">
                      {photoUrls[record.id] ? (
                        <Image
                          src={photoUrls[record.id]}
                          alt={record.stage}
                          width={240}
                          height={160}
                          unoptimized
                          className="h-32 w-full rounded-md object-cover border"
                        />
                      ) : (
                        <div className="h-32 w-full rounded-md bg-muted" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {record.stage === "before" ? "Antes" : "Después"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin registros fotográficos.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />
      </div>
    </ContentLayout>
  );
}
