"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  AreaChartIcon,
  CalendarDays,
  FileText,
  ImageIcon,
  Info,
  MapPin,
  Maximize2,
  Paperclip,
  Pencil,
  Plane,
  Tags,
  UserCheck,
  UserRound,
  Users,
  UserX,
} from "lucide-react";

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
import { useGetAeronauticalActivityByNumber } from "@/hooks/sms/aeronautical/useGetAeronauticalActivityByNumber";
import { useGetActivityAttendanceList } from "@/hooks/sms/useGetActivityAttendanceList";
import { useGetSMSActivityAttendanceStats } from "@/hooks/sms/useGetSMSActivityAttendanceStats";
import {
  useCloseAeronauticalActivity,
  useOpenAeronauticalActivity,
} from "@/actions/sms/aeronautical/activities/actions";
import {
  ActivityDetailHeader,
  ActivityDetailSkeleton,
  AttendanceSnapshot,
  AttendanceStatsPanel,
  InfoItem,
  RosterSection,
  SectionLabel,
  StatCard,
  TabEmptyState,
  filterAttendance,
} from "@/app/[company]/sms/(employees)/promocion/actividades/_components/activity-detail-parts";
import { useCompanyStore } from "@/stores/CompanyStore";
import { cn } from "@/lib/utils";

const tabs = [
  { value: "informacion", label: "Información", icon: Info },
  { value: "participantes", label: "Participantes", icon: Users },
  { value: "asistencia", label: "Asistencia", icon: UserCheck },
  { value: "estadisticas", label: "Estadísticas", icon: AreaChartIcon },
];

export function AeronauticalActivityDetail() {
  const { selectedCompany } = useCompanyStore();
  const { activity_number } = useParams<{ activity_number: string }>();
  const company = selectedCompany?.slug ?? "";

  const [participantsSearch, setParticipantsSearch] = useState("");
  const [attendanceSearch, setAttendanceSearch] = useState("");

  const {
    data: activity,
    isLoading,
    isError,
  } = useGetAeronauticalActivityByNumber({
    company,
    activityNumber: activity_number,
  });

  const {
    data: attendanceList,
    isLoading: isAttendanceLoading,
    isError: isAttendanceError,
  } = useGetActivityAttendanceList({
    company,
    activityNumber: activity_number,
  });

  const {
    data: attendanceStats,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useGetSMSActivityAttendanceStats(activity_number);

  const { closeAeronauticalActivity } = useCloseAeronauticalActivity();
  const { openAeronauticalActivity } = useOpenAeronauticalActivity();

  const participants = useMemo(() => attendanceList ?? [], [attendanceList]);

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

  const filteredParticipants = useMemo(
    () => filterAttendance(participants, participantsSearch),
    [participants, participantsSearch],
  );
  const filteredAttendance = useMemo(
    () => filterAttendance(participants, attendanceSearch),
    [participants, attendanceSearch],
  );

  const hasAttachments = Boolean(activity?.imageUrl || activity?.documentUrl);

  return (
    <ContentLayout title="Actividad SMS">
      <PageHeader
        className="mb-6"
        currentLabel={activity?.activity_number}
        backFallbackHref={`/${company}/sms/promocion/actividades`}
      />

      {isLoading && <ActivityDetailSkeleton />}

      {isError && (
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
            icon={Plane}
            activityNumber={activity.activity_number}
            title={activity.activity_name || "Actividad sin título"}
            status={activity.status}
            subtitle={activity.place || "Lugar no definido"}
            actions={
              <>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link
                    href={`/${company}/sms/promocion/actividades/editar/${activity.activity_number}`}
                  >
                    <Pencil className="mr-2 size-4" />
                    Editar
                  </Link>
                </Button>
                {activity.documentUrl && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <a
                      href={activity.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FileText className="mr-2 size-4" />
                      Documento
                    </a>
                  </Button>
                )}
                {activity.status === "CERRADO" ? (
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() =>
                      openAeronauticalActivity.mutate({
                        company,
                        id: String(activity.id),
                      })
                    }
                    disabled={openAeronauticalActivity.isPending}
                  >
                    Reabrir
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      closeAeronauticalActivity.mutate({
                        company,
                        id: String(activity.id),
                      })
                    }
                    disabled={closeAeronauticalActivity.isPending}
                  >
                    Cerrar
                  </Button>
                )}
              </>
            }
            meta={
              <>
                <InfoItem
                  icon={MapPin}
                  label="Lugar"
                  value={activity.place || "N/A"}
                />
                <InfoItem
                  icon={UserRound}
                  label="Registrado por"
                  value={activity.registered_by || "N/A"}
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
                <InfoItem
                  icon={Paperclip}
                  label="Adjuntos"
                  value={
                    hasAttachments ? (
                      <div className="flex flex-wrap gap-1">
                        {activity.imageUrl && (
                          <Badge
                            variant="outline"
                            className="gap-1 text-[10px] font-normal"
                          >
                            <ImageIcon className="size-3" />
                            Imagen
                          </Badge>
                        )}
                        {activity.documentUrl && (
                          <Badge
                            variant="outline"
                            className="gap-1 text-[10px] font-normal"
                          >
                            <FileText className="size-3" />
                            Documento
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-normal text-muted-foreground">
                        Sin adjuntos
                      </span>
                    )
                  }
                />
              </>
            }
          />

          {isStatsLoading && isAttendanceLoading ? (
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
                icon={CalendarDays}
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
                <Card className={cn(hasAttachments && "xl:col-span-2")}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="size-4" />
                      </span>
                      <div className="space-y-0.5">
                        <CardTitle className="text-base">
                          Descripción de la actividad
                        </CardTitle>
                        <CardDescription>
                          Detalle registrado para esta actividad aeronáutica
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <section>
                      <SectionLabel>Descripción</SectionLabel>
                      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {activity.description || "Sin descripción registrada."}
                      </p>
                    </section>

                    {activity.updated_by && (
                      <>
                        <Separator />
                        <section>
                          <SectionLabel>Última actualización</SectionLabel>
                          <p className="mt-1.5 text-sm text-foreground">
                            {activity.updated_by}
                          </p>
                        </section>
                      </>
                    )}
                  </CardContent>
                </Card>

                {hasAttachments && (
                  <div className="space-y-6">
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

                    {activity.documentUrl && (
                      <Card>
                        <CardHeader className="pb-4">
                          <div className="flex items-start gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <FileText className="size-4" />
                            </span>
                            <div className="space-y-0.5">
                              <CardTitle className="text-base">
                                Documento adjunto
                              </CardTitle>
                              <CardDescription>
                                Archivo vinculado a la actividad
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Button
                            asChild
                            variant="outline"
                            className="w-full sm:w-auto"
                          >
                            <a
                              href={activity.documentUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FileText className="mr-2 size-4" />
                              Abrir documento
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="participantes" className="mt-6">
              <RosterSection
                icon={Users}
                title="Empleados inscritos"
                description="Participantes registrados en esta actividad"
                total={participants.length}
                rows={filteredParticipants}
                isLoading={isAttendanceLoading}
                isError={isAttendanceError}
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
                isLoading={isAttendanceLoading}
                isError={isAttendanceError}
                errorMessage="No fue posible obtener el registro de asistencia. Vuelve a intentarlo en unos minutos."
                searchValue={attendanceSearch}
                onSearchChange={setAttendanceSearch}
                emptyTitle="Sin registros de asistencia"
                emptyDescription="Esta actividad todavía no tiene registros de asistencia."
              />
            </TabsContent>

            <TabsContent value="estadisticas" className="mt-6">
              {isStatsLoading ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  <Skeleton className="h-80 rounded-xl" />
                  <Skeleton className="h-80 rounded-xl" />
                </div>
              ) : isStatsError ? (
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
          </Tabs>
        </div>
      )}
    </ContentLayout>
  );
}
