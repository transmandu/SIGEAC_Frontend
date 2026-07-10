"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMeetingMinuteByDepartment } from "@/hooks/general/minuta_reunion/useGetMeetingMinuteByDepartment";
import { useCompanyStore } from "@/stores/CompanyStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, FileText, FileUp, ImageIcon, Info, Loader2, Users } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

const ShowMeetingMinute = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedCompany, selectedStation } = useCompanyStore();

  const { data: meeting, isLoading, isError } = useGetMeetingMinuteByDepartment(
    id,
    selectedStation,
    selectedCompany?.slug,
  );

  const EmployeeDetail = ({
    employee,
    bold = false,
  }: {
    employee?: { first_name: string; last_name: string; job_title?: { name: string } } | null;
    bold?: boolean;
  }) => {
    if (!employee) return <p className="mt-1 text-sm">N/A</p>;
    return (
      <div className="mt-1">
        <p className={`text-sm ${bold ? "font-medium" : ""}`}>
          {employee.first_name} {employee.last_name}
        </p>
        {employee.job_title && (
          <p className="text-xs text-muted-foreground">{employee.job_title.name}</p>
        )}
      </div>
    );
  };

  const dateLabel = (date: string) => {
    try {
      return format(new Date(date), "PPP", { locale: es });
    } catch {
      return date;
    }
  };

  const fileUrl = (filePath?: string | null, action: "serve" | "download" = "serve") => {
    if (!filePath || !selectedCompany?.slug) return null;
    return `/${selectedCompany.slug}/files/${action}/${btoa(filePath)}`;
  };

  if (isLoading) {
    return (
      <ContentLayout title="Minuta de Reunión">
        <div className="flex h-52 w-full items-center justify-center rounded-lg border border-border/60">
          <Loader2 className="size-10 animate-spin" />
        </div>
      </ContentLayout>
    );
  }

  if (isError) {
    return (
      <ContentLayout title="Minuta de Reunión">
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
          <Info className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300">
            Error al cargar la minuta de reunión.
          </p>
        </div>
      </ContentLayout>
    );
  }

  if (!meeting) {
    return (
      <ContentLayout title="Minuta de Reunión">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border/60 p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No se encontró la minuta de reunión solicitada.
          </p>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Minuta de Reunión">
      <div className="rounded-lg border border-border/60 p-4 sm:p-6">
        <div className="mb-5 border-b border-border/60 pb-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-500">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">
                Detalle de Minuta de Reunión
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {meeting.place} &middot; {dateLabel(meeting.date)}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="informacion" className="w-full">
          <TabsList className="mb-5 grid w-full grid-cols-2 gap-2 border border-border/60 bg-transparent p-1 sm:grid-cols-4">
            <TabsTrigger value="informacion" className="flex items-center gap-2 px-2 data-[state=active]:bg-muted">
              <Info className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs sm:text-sm">Información</span>
            </TabsTrigger>
            <TabsTrigger value="asistentes" className="flex items-center gap-2 px-2 data-[state=active]:bg-muted">
              <Users className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs sm:text-sm">Asistentes</span>
            </TabsTrigger>
            <TabsTrigger value="acuerdos" className="flex items-center gap-2 px-2 data-[state=active]:bg-muted">
              <Check className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs sm:text-sm">Acuerdos</span>
            </TabsTrigger>
            <TabsTrigger value="documentos" className="flex items-center gap-2 px-2 data-[state=active]:bg-muted">
              <FileUp className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs sm:text-sm">Documentos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="informacion" className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Fecha
                </p>
                <p className="mt-1 text-sm font-medium">{dateLabel(meeting.date)}</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Lugar
                </p>
                <p className="mt-1 text-sm">{meeting.place || "N/A"}</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Presidida por
                </p>
                <EmployeeDetail employee={meeting.chaired_by} bold />
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Elaborada por
                </p>
                <EmployeeDetail employee={meeting.filled_out_by} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {meeting.reviewed_by && (
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Revisada por
                  </p>
                  <EmployeeDetail employee={meeting.reviewed_by} />
                </div>
              )}
              {meeting.approved_by && (
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Aprobada por
                  </p>
                  <EmployeeDetail employee={meeting.approved_by} />
                </div>
              )}
            </div>

            {meeting.objective && (
              <section className="rounded-lg border border-border/60 p-4">
                <h2 className="pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Objetivo
                </h2>
                <div className="border-t border-border/60 pt-3">
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {meeting.objective}
                  </p>
                </div>
              </section>
            )}

            {meeting.topics && (
              <section className="rounded-lg border border-border/60 p-4">
                <h2 className="pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Temas Abordados
                </h2>
                <div className="border-t border-border/60 pt-2">
                  <div className="divide-y divide-border/30 border border-border/40">
                    {meeting.topics.split(",").map((topic, i) => (
                      <div key={i} className="px-3 py-3 text-sm transition-colors hover:bg-muted/20">
                        {topic.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </TabsContent>

          <TabsContent value="asistentes">
            <div className="rounded-lg border border-border/60 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                  <Users className="h-4 w-4" />
                  Asistentes a la Reunión
                </h2>
                <Badge className="border border-border/40 bg-muted text-foreground">
                  {meeting.attendees?.length ?? 0} asistentes
                </Badge>
              </div>

              {meeting.attendees && meeting.attendees.length > 0 ? (
                <div className="overflow-x-auto rounded border border-border/40">
                  <table className="min-w-full divide-y divide-border/40">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          Nombre
                        </th>
                        <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          Cargo
                        </th>
                        <th className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          Asistió
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {meeting.attendees.map((att) => (
                        <tr key={att.id} className="transition-colors hover:bg-muted/20">
                          <td className="whitespace-nowrap px-3 py-3 text-sm font-medium">
                            {att.employee
                              ? `${att.employee.first_name} ${att.employee.last_name}`
                              : att.attendee_name || "N/A"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-sm text-muted-foreground">
                            {att.employee?.job_title?.name || att.job_title || "—"}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {att.has_attended ? (
                              <Check className="mx-auto h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No hay asistentes registrados.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="acuerdos">
            <div className="rounded-lg border border-border/60 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                  <Check className="h-4 w-4" />
                  Acuerdos y Compromisos
                </h2>
                <Badge className="border border-border/40 bg-muted text-foreground">
                  {meeting.agreements?.length ?? 0} acuerdos
                </Badge>
              </div>

              {meeting.agreements && meeting.agreements.length > 0 ? (
                <div className="divide-y divide-border/30 rounded border border-border/40">
                  {meeting.agreements.map((agreement, i) => (
                    <div key={agreement.id ?? i} className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          Descripción
                        </p>
                        <p className="mt-0.5 text-sm">{agreement.description}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          Responsable
                        </p>
                        {agreement.responsible ? (
                          <div className="mt-0.5">
                            <p className="text-sm font-medium">
                              {agreement.responsible.first_name} {agreement.responsible.last_name}
                            </p>
                            {agreement.responsible.job_title && (
                              <p className="text-xs text-muted-foreground">{agreement.responsible.job_title.name}</p>
                            )}
                          </div>
                        ) : (
                          <div className="mt-0.5">
                            <p className="text-sm font-medium">
                              {agreement.responsible_name || "N/A"}
                            </p>
                            {agreement.responsible_job_title && (
                              <p className="text-xs text-muted-foreground">{agreement.responsible_job_title}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No hay acuerdos registrados.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documentos">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {meeting.photo ? (
                <section className="rounded-lg border border-border/60 p-4">
                  <h2 className="flex items-center gap-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Foto de la Reunión
                  </h2>
                  <div className="border-t border-border/60 pt-3">
                    <div className="group relative h-64 w-full cursor-pointer overflow-hidden rounded border border-border/40 bg-muted/20">
                      <Image
                        src={fileUrl(meeting.photo, "serve") ?? ""}
                        alt="Foto de la reunión"
                        fill
                        className="object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="rounded border border-white/40 bg-black/50 px-3 py-1 text-xs text-white">
                          Ampliar
                        </span>
                      </div>
                    </div>
                    <a
                      href={fileUrl(meeting.photo, "download") ?? "#"}
                      download
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                      <FileUp className="h-3 w-3" />
                      Descargar foto
                    </a>
                  </div>
                </section>
              ) : (
                <section className="rounded-lg border border-border/60 p-4">
                  <h2 className="flex items-center gap-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Foto de la Reunión
                  </h2>
                  <div className="border-t border-border/60 pt-3">
                    <p className="text-sm text-muted-foreground">Sin foto adjunta.</p>
                  </div>
                </section>
              )}

              {meeting.document ? (
                <section className="rounded-lg border border-border/60 p-4">
                  <h2 className="flex items-center gap-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    Documento Adjunto
                  </h2>
                  <div className="border-t border-border/60 pt-3">
                    <p className="mb-2 text-sm text-muted-foreground">
                      {meeting.document.split("/").pop()}
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={fileUrl(meeting.document, "download") ?? "#"} download>
                        <FileUp className="mr-1.5 h-3.5 w-3.5" />
                        Descargar documento
                      </a>
                    </Button>
                  </div>
                </section>
              ) : (
                <section className="rounded-lg border border-border/60 p-4">
                  <h2 className="flex items-center gap-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    Documento Adjunto
                  </h2>
                  <div className="border-t border-border/60 pt-3">
                    <p className="text-sm text-muted-foreground">Sin documento adjunto.</p>
                  </div>
                </section>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default ShowMeetingMinute;
