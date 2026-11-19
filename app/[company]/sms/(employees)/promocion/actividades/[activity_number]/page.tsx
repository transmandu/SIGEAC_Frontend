"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  AreaChartIcon,
  CalendarDays,
  ClipboardCheck,
  Clock,
  Eye,
  FileText,
  ImageIcon,
  Info,
  Loader2,
  MapPin,
  Maximize2,
  Percent,
  Tags,
  UserCheck,
  UserRound,
  Users,
  UserX,
} from "lucide-react";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";

import PdfEndpointPreviewDialog from "@/components/dialogs/shared/PdfEndpointPreviewDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetActivityAttendanceList } from "@/hooks/sms/useGetActivityAttendanceList";
import { useGetSMSActivityAttendanceStats } from "@/hooks/sms/useGetSMSActivityAttendanceStats";
import { useGetSMSActivityByNumber } from "@/hooks/sms/useGetSMSActivityByNumber";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { AeronauticalActivityDetail } from "@/app/[company]/sms/(employees)/promocion/actividades/_components/aeronautical-activity-detail";
import {
  ActivityDetailHeader,
  ActivityDetailSkeleton,
  AttendanceSnapshot,
  AttendanceStatsPanel,
  InfoItem,
  PersonRow,
  RosterSection,
  SectionLabel,
  StatCard,
  TabEmptyState,
  filterAttendance,
  initialsOf,
} from "@/app/[company]/sms/(employees)/promocion/actividades/_components/activity-detail-parts";
import { DrillEvaluationSummary } from "@/app/[company]/sms/(employees)/promocion/actividades/_components/drill-evaluation-summary";
import { hasDrillActivityCategory } from "@/lib/sms/activity-categories";
import { useCompanyStore } from "@/stores/CompanyStore";
import { generateMinutaPDF } from "@/utils/generateMinutaPDF";

const AirlineActivityDetail = () => {
  const { selectedCompany } = useCompanyStore();
  const { activity_number } = useParams<{ activity_number: string }>();

  const [openPdf, setOpenPdf] = useState<boolean>(false);
  const [participantsSearch, setParticipantsSearch] = useState("");
  const [attendanceSearch, setAttendanceSearch] = useState("");

  const {
    data: activity,
    isLoading: isActivityLoading,
    isError: activityError,
  } = useGetSMSActivityByNumber({
    company: selectedCompany?.slug,
    activityNumber: activity_number,
  });

  const {
    data: attendedList,
    isLoading: isAttendedListLoading,
    isError: attendedListError,
  } = useGetActivityAttendanceList({
    company: selectedCompany?.slug,
    activityNumber: activity_number?.toString(),
  });

  const {
    data: attendanceStats,
    isLoading: isAttendanceStatsLoading,
    isError: isAttendanceStatsError,
  } = useGetSMSActivityAttendanceStats(activity_number);

  const dateLabel = (date: Date) =>
    format(addDays(date, 1), "PPP", {
      locale: es,
    });

  const topics = activity?.topics
    ? activity.topics
        .split(",")
        .map((topic) => topic.trim())
        .filter(Boolean)
    : [];

  const participants = useMemo(() => attendedList ?? [], [attendedList]);

  const totalParticipants = attendanceStats?.total ?? participants.length;
  const attendedCount =
    attendanceStats?.attended ??
    participants.filter((item) => item.attended).length;
  const notAttendedCount =
    attendanceStats?.not_attended ??
    Math.max(totalParticipants - attendedCount, 0);
  const attendancePercentage =
    totalParticipants > 0
      ? Math.round((attendedCount / totalParticipants) * 100)
      : 0;

  const displayTitle =
    activity?.title || activity?.activity_name || "Actividad sin título";

  const filteredParticipants = useMemo(
    () => filterAttendance(participants, participantsSearch),
    [participants, participantsSearch],
  );
  const filteredAttendance = useMemo(
    () => filterAttendance(participants, attendanceSearch),
    [participants, attendanceSearch],
  );

  const hasDrillCategory = hasDrillActivityCategory(activity?.categories);
  const drillTypeLabel =
    activity?.drill_type === "PARCIAL"
      ? "Simulacro parcial"
      : activity?.drill_type === "MESA"
        ? "Simulacro de mesa"
        : "Simulacro por definir";

  const tabs = [
    { value: "informacion", label: "Información", icon: Info },
    { value: "participantes", label: "Participantes", icon: Users },
    { value: "asistencia", label: "Asistencia", icon: UserCheck },
    { value: "estadisticas", label: "Estadísticas", icon: AreaChartIcon },
    ...(hasDrillCategory
      ? [
          {
            value: "simulacro",
            label: "Simulacro",
            icon: ClipboardCheck,
          },
        ]
      : []),
  ];

  return (
    <>
      <ContentLayout title="Actividad de SMS">
        <PageHeader
          className="mb-6"
          currentLabel={activity?.activity_number}
          backFallbackHref={
            selectedCompany
              ? `/${selectedCompany.slug}/sms/promocion/actividades`
              : undefined
          }
        />

        {isActivityLoading && <ActivityDetailSkeleton />}

        {activityError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="size-4" />
            <AlertTitle>No se pudo cargar la actividad</AlertTitle>
            <AlertDescription>
              Revisa tu conexión y vuelve a intentarlo. Si el problema persiste,
              contacta al administrador del sistema.
            </AlertDescription>
          </Alert>
        )}

        {activity && (
          <div className="space-y-6">
            <ActivityDetailHeader
              activityNumber={activity.activity_number}
              title={displayTitle}
              status={activity.status}
              subtitle={
                [
                  activity.activity_name &&
                  activity.activity_name !== displayTitle
                    ? activity.activity_name
                    : null,
                  activity.place || "Lugar no definido",
                ]
                  .filter(Boolean)
                  .join(" · ") ||
                "Actividad de promoción de la seguridad operacional"
              }
              badges={
                hasDrillCategory ? (
                  <Badge variant="secondary" className="font-medium">
                    {drillTypeLabel}
                  </Badge>
                ) : null
              }
              actions={
                <>
                  {activity.document && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => setOpenPdf(true)}
                    >
                      <Eye className="mr-2 size-4" />
                      Vista previa
                    </Button>
                  )}
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      generateMinutaPDF(activity, attendedList?.length || 0)
                    }
                  >
                    <FileText className="mr-2 size-4" />
                    Descargar minuta
                  </Button>
                </>
              }
              meta={
                <>
                  <InfoItem
                    icon={CalendarDays}
                    label="Fechas"
                    value={`${dateLabel(activity.start_date)} — ${dateLabel(
                      activity.end_date,
                    )}`}
                  />
                  <InfoItem
                    icon={Clock}
                    label="Horario"
                    value={
                      <span className="font-mono tabular-nums">
                        {activity.start_time || "N/A"} -{" "}
                        {activity.end_time || "N/A"}
                      </span>
                    }
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Lugar"
                    value={activity.place || "N/A"}
                  />
                  <InfoItem
                    icon={Tags}
                    label="Categorías"
                    value={
                      activity.categories?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {activity.categories.map((category) => (
                            <Badge
                              key={category.id}
                              variant="outline"
                              className="text-[10px] font-normal"
                            >
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm font-normal text-muted-foreground">
                          Sin categorías
                        </span>
                      )
                    }
                  />
                </>
              }
            />

            {isAttendanceStatsLoading && isAttendedListLoading ? (
              <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
                <StatCard
                  icon={Users}
                  label="Inscritos"
                  value={totalParticipants}
                  hint="Total registrado"
                />
                <StatCard
                  icon={UserCheck}
                  label="Asistentes"
                  value={attendedCount}
                  hint={
                    totalParticipants > 0
                      ? `${attendancePercentage}% del total`
                      : "Sin registros"
                  }
                  iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                />
                <StatCard
                  icon={UserX}
                  label="Inasistentes"
                  value={notAttendedCount}
                  hint={
                    totalParticipants > 0
                      ? `${100 - attendancePercentage}% del total`
                      : "Sin registros"
                  }
                  iconClassName="bg-rose-500/10 text-rose-600 dark:text-rose-400"
                />
                <StatCard
                  icon={Percent}
                  label="Asistencia"
                  value={`${attendancePercentage}%`}
                  hint="Sobre el total inscrito"
                >
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${attendancePercentage}%` }}
                    />
                  </div>
                </StatCard>
              </div>
            )}

            <Tabs defaultValue="informacion" className="w-full">
              <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-border/60 bg-transparent p-0">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="-mb-px group shrink-0 gap-2 rounded-none border-b-2 border-transparent px-3 pb-3 pt-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    <tab.icon className="size-4 text-muted-foreground transition-colors group-data-[state=active]:text-foreground" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="informacion" className="mt-6">
                <div className="grid gap-6 xl:grid-cols-3">
                  <div className="space-y-6 xl:col-span-2">
                    <Card>
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="size-4" />
                          </span>
                          <div className="space-y-0.5">
                            <CardTitle className="text-base">
                              Contenido de la actividad
                            </CardTitle>
                            <CardDescription>
                              Temas abordados, objetivo y descripción
                              registrados
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-5">
                        <section>
                          <SectionLabel>Temas abordados</SectionLabel>
                          {topics.length > 0 ? (
                            <ol className="mt-2 divide-y divide-border/30 overflow-hidden rounded-lg border border-border/60">
                              {topics.map((topic, index) => (
                                <li
                                  key={`${topic}-${index}`}
                                  className="flex items-start gap-3 px-3 py-2.5"
                                >
                                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-muted font-mono text-[10px] tabular-nums text-muted-foreground">
                                    {index + 1}
                                  </span>
                                  <span className="text-sm leading-relaxed text-foreground">
                                    {topic}
                                  </span>
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <p className="mt-1.5 text-sm text-muted-foreground">
                              No hay temas registrados.
                            </p>
                          )}
                        </section>

                        <Separator />

                        <section>
                          <SectionLabel>Objetivo y observaciones</SectionLabel>
                          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                            {activity.objetive ||
                              "No hay observaciones registradas."}
                          </p>
                        </section>

                        <Separator />

                        <section>
                          <SectionLabel>Descripción</SectionLabel>
                          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                            {activity.description ||
                              "No hay descripción registrada."}
                          </p>
                        </section>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UserRound className="size-4" />
                          </span>
                          <div className="space-y-0.5">
                            <CardTitle className="text-base">
                              Responsables
                            </CardTitle>
                            <CardDescription>
                              Autorización, elaboración y ejecución
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <PersonRow
                          role="Autorizado por"
                          name={`${activity.authorized_by.first_name || ""} ${
                            activity.authorized_by.last_name || ""
                          }`.trim()}
                          dni={activity.authorized_by.dni}
                          initials={initialsOf(
                            activity.authorized_by.first_name,
                            activity.authorized_by.last_name,
                          )}
                        />
                        <Separator />
                        <PersonRow
                          role="Elaborado por"
                          name={`${activity.planned_by.first_name || ""} ${
                            activity.planned_by.last_name || ""
                          }`.trim()}
                          dni={activity.planned_by.dni}
                          initials={initialsOf(
                            activity.planned_by.first_name,
                            activity.planned_by.last_name,
                          )}
                        />
                        <Separator />
                        <PersonRow
                          role="Realizado por"
                          name={activity.executed_by || "N/A"}
                        />
                      </CardContent>
                    </Card>

                    {activity.imageUrl && (
                      <Card>
                        <CardHeader className="pb-4">
                          <div className="flex items-start gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <ImageIcon className="size-4" />
                            </span>
                            <div className="space-y-0.5">
                              <CardTitle className="text-base">
                                Evidencia fotográfica
                              </CardTitle>
                              <CardDescription>
                                Imagen adjunta a la actividad
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button
                                type="button"
                                className="group relative block h-44 w-full overflow-hidden rounded-lg border border-border/60 bg-muted/20"
                              >
                                <Image
                                  src={activity.imageUrl}
                                  alt="Imagen de la actividad"
                                  fill
                                  sizes="(min-width: 1280px) 33vw, 100vw"
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
                                  <span className="flex items-center gap-1.5 rounded border border-white/40 bg-black/60 px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                                    <Maximize2 className="size-3" />
                                    Ampliar
                                  </span>
                                </span>
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Imagen de la actividad
                                </DialogTitle>
                              </DialogHeader>
                              <div className="relative flex h-[60vh] justify-center">
                                <Image
                                  src={activity.imageUrl}
                                  fill
                                  alt="Imagen completa de la actividad"
                                  className="rounded-lg border object-contain"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="participantes" className="mt-6">
                <RosterSection
                  icon={Users}
                  title="Empleados inscritos"
                  description="Participantes registrados en esta actividad"
                  total={participants.length}
                  rows={filteredParticipants}
                  isLoading={isAttendedListLoading}
                  isError={attendedListError}
                  errorMessage="No fue posible obtener los empleados inscritos. Vuelve a intentarlo en unos minutos."
                  searchValue={participantsSearch}
                  onSearchChange={setParticipantsSearch}
                  emptyTitle="Sin participantes"
                  emptyDescription="Esta actividad todavía no tiene empleados inscritos."
                />
              </TabsContent>

              <TabsContent value="asistencia" className="mt-6 space-y-6">
                <AttendanceSnapshot
                  attended={attendedCount}
                  notAttended={notAttendedCount}
                  total={totalParticipants}
                  rate={attendancePercentage}
                />

                <RosterSection
                  icon={UserCheck}
                  title="Registro de asistencia"
                  description="Estado de asistencia de cada participante"
                  total={participants.length}
                  rows={filteredAttendance}
                  showAttendance
                  isLoading={isAttendedListLoading}
                  isError={attendedListError}
                  errorMessage="No fue posible obtener el registro de asistencia. Vuelve a intentarlo en unos minutos."
                  searchValue={attendanceSearch}
                  onSearchChange={setAttendanceSearch}
                  emptyTitle="Sin registros de asistencia"
                  emptyDescription="Esta actividad todavía no tiene registros de asistencia."
                />
              </TabsContent>

              <TabsContent value="estadisticas" className="mt-6">
                {isAttendanceStatsLoading ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Skeleton className="h-80 rounded-xl" />
                    <Skeleton className="h-80 rounded-xl" />
                  </div>
                ) : isAttendanceStatsError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertTitle>
                      No se pudieron calcular las estadísticas
                    </AlertTitle>
                    <AlertDescription>
                      La asistencia se puede revisar en la pestaña de registro.
                      Vuelve a intentarlo en unos minutos.
                    </AlertDescription>
                  </Alert>
                ) : totalParticipants > 0 ? (
                  <AttendanceStatsPanel
                    attended={attendedCount}
                    notAttended={notAttendedCount}
                    total={totalParticipants}
                    rate={attendancePercentage}
                  />
                ) : (
                  <TabEmptyState
                    icon={AreaChartIcon}
                    title="Sin datos estadísticos"
                    description="Esta actividad todavía no tiene inscritos para calcular la asistencia."
                  />
                )}
              </TabsContent>

              {hasDrillCategory && (
                <TabsContent value="simulacro" className="mt-6">
                  <DrillEvaluationSummary
                    activityNumber={activity_number}
                    categories={activity.categories}
                    drillType={activity.drill_type}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </ContentLayout>

      {activity?.document && (
        <PdfEndpointPreviewDialog
          open={openPdf}
          onOpenChange={setOpenPdf}
          endpoint={`/${selectedCompany?.slug}/sms/document/${btoa(
            activity.document as string,
          )}`}
          fileName={`ACTIVIDAD_${activity.activity_number}`}
          title="Vista Previa del Documento"
          description="Revisa el documento adjunto antes de descargarlo."
        />
      )}
    </>
  );
};

const ShowSMSActivity = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: isOMAC, isLoading } = useIsOmac(selectedCompany?.slug);

  if (isLoading) {
    return (
      <ContentLayout title="Actividad SMS">
        <PageHeader className="mb-6" />
        <div className="flex w-full items-center justify-center py-20">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        </div>
      </ContentLayout>
    );
  }

  return isOMAC ? <AeronauticalActivityDetail /> : <AirlineActivityDetail />;
};

export default ShowSMSActivity;
