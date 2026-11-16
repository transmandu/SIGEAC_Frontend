"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  BarChart3,
  Info,
  Loader2,
  MapPin,
  Pencil,
  UserCheck,
  Users,
} from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { useGetAeronauticalActivityByNumber } from "@/hooks/sms/aeronautical/useGetAeronauticalActivityByNumber";
import { useGetActivityAttendanceList } from "@/hooks/sms/useGetActivityAttendanceList";
import { useGetSMSActivityAttendanceStats } from "@/hooks/sms/useGetSMSActivityAttendanceStats";
import {
  useCloseAeronauticalActivity,
  useOpenAeronauticalActivity,
} from "@/actions/sms/aeronautical/activities/actions";
import { useCompanyStore } from "@/stores/CompanyStore";

const statusClassName: Record<string, string> = {
  ABIERTO:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",
  CERRADO:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  PROCESO:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  PENDIENTE:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  PENDING:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function AeronauticalActivityDetail() {
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();
  const { activity_number } = useParams<{ activity_number: string }>();
  const company = selectedCompany?.slug ?? "";

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

  const { data: attendanceStats } =
    useGetSMSActivityAttendanceStats(activity_number);

  const { closeAeronauticalActivity } = useCloseAeronauticalActivity();
  const { openAeronauticalActivity } = useOpenAeronauticalActivity();

  const attendanceChartData = [
    { name: "Asistieron", value: attendanceStats?.attended ?? 0 },
    { name: "No asistieron", value: attendanceStats?.not_attended ?? 0 },
  ];

  return (
    <ContentLayout title="Actividad SMS">
      <PageHeader className="mb-6" />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {activity?.activity_name ?? "Actividad SMS"}
            </h1>
            {activity?.status ? (
              <Badge
                className={`border text-xs font-medium ${
                  statusClassName[activity.status] ??
                  "bg-muted text-foreground border-border/40"
                }`}
              >
                {activity.status}
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Referencia: {activity?.activity_number || "N/A"}
          </p>
        </div>

        {activity ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/${company}/sms/promocion/actividades/editar/${activity.activity_number}`}
              >
                <Pencil className="mr-2 size-4" />
                Editar
              </Link>
            </Button>
            {activity.status === "CERRADO" ? (
              <Button
                size="sm"
                onClick={() =>
                  openAeronauticalActivity.mutate({
                    company,
                    id: String(activity.id),
                  })
                }
              >
                Reabrir
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  closeAeronauticalActivity.mutate({
                    company,
                    id: String(activity.id),
                  })
                }
              >
                Cerrar
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {isLoading && (
        <div className="flex h-52 w-full items-center justify-center rounded-lg border border-border/60">
          <Loader2 className="size-10 animate-spin" />
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-100 p-4 dark:border-red-800 dark:bg-red-950/20">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300">
            No fue posible cargar la actividad.
          </p>
        </div>
      )}

      {activity && (
        <Tabs defaultValue="informacion" className="w-full">
          <TabsList className="mb-5 grid w-full grid-cols-2 gap-2 border border-border/60 bg-transparent p-1 sm:grid-cols-4">
            <TabsTrigger
              value="informacion"
              className="flex items-center gap-2 px-2 data-[state=active]:bg-muted"
            >
              <Info className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs sm:text-sm">Información</span>
            </TabsTrigger>
            <TabsTrigger
              value="participantes"
              className="flex items-center gap-2 px-2 data-[state=active]:bg-muted"
            >
              <Users className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs sm:text-sm">Participantes</span>
            </TabsTrigger>
            <TabsTrigger
              value="asistencia"
              className="flex items-center gap-2 px-2 data-[state=active]:bg-muted"
            >
              <UserCheck className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs sm:text-sm">Asistencia</span>
            </TabsTrigger>
            <TabsTrigger
              value="estadisticas"
              className="flex items-center gap-2 px-2 data-[state=active]:bg-muted"
            >
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs sm:text-sm">Estadísticas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="informacion" className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Lugar
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  {activity.place || "N/A"}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Registrado por
                </p>
                <p className="mt-1 text-sm font-medium">
                  {activity.registered_by || "N/A"}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Categorías
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {activity.categories.length > 0 ? (
                    activity.categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant="outline"
                        className="text-[10px]"
                      >
                        {category.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Sin categoría
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Descripción
              </p>
              <p className="mt-2 whitespace-pre-line text-sm">
                {activity.description || "Sin descripción."}
              </p>
            </div>

            {(activity.imageUrl || activity.documentUrl) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {activity.imageUrl ? (
                  <a
                    href={activity.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-border/60 p-3 text-sm text-primary hover:underline"
                  >
                    Ver imagen adjunta
                  </a>
                ) : null}
                {activity.documentUrl ? (
                  <a
                    href={activity.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-border/60 p-3 text-sm text-primary hover:underline"
                  >
                    Ver documento adjunto
                  </a>
                ) : null}
              </div>
            )}
          </TabsContent>

          <TabsContent value="participantes">
            <div className="rounded-lg border border-border/60 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                  <Users className="h-4 w-4" />
                  Participantes inscritos
                </h2>
                <Badge className="border border-border/40 bg-muted text-foreground">
                  {attendanceList?.length ?? 0} participantes
                </Badge>
              </div>

              {isAttendanceLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-8 animate-spin" />
                </div>
              ) : isAttendanceError ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Error al cargar la lista de participantes.
                </p>
              ) : attendanceList && attendanceList.length > 0 ? (
                <div className="overflow-x-auto rounded border border-border/40">
                  <table className="min-w-full divide-y divide-border/40">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          #
                        </th>
                        <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          Nombre
                        </th>
                        <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          DNI
                        </th>
                        <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          Origen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {attendanceList.map((attendance, index) => (
                        <tr key={attendance.id}>
                          <td className="px-3 py-3 text-sm text-muted-foreground">
                            {index + 1}
                          </td>
                          <td className="px-3 py-3 text-sm font-medium">
                            {attendance.employee?.first_name}{" "}
                            {attendance.employee?.last_name}
                          </td>
                          <td className="px-3 py-3 font-mono text-sm text-muted-foreground">
                            {attendance.employee?.dni ||
                              attendance.employee_dni ||
                              "N/A"}
                          </td>
                          <td className="px-3 py-3 text-sm">
                            {attendance.employee_type === "authorized" ? (
                              <Badge variant="outline" className="text-[10px]">
                                Externo
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">
                                Interno
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState message="No hay participantes inscritos en esta actividad." />
              )}
            </div>
          </TabsContent>

          <TabsContent value="asistencia">
            <div className="rounded-lg border border-border/60 p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                  <UserCheck className="h-4 w-4" />
                  Registro de asistencia
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Badge className="border border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400">
                    Asistentes: {attendanceStats?.attended ?? 0}
                  </Badge>
                  <Badge className="border border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                    Inasistentes: {attendanceStats?.not_attended ?? 0}
                  </Badge>
                </div>
              </div>

              {isAttendanceLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-8 animate-spin" />
                </div>
              ) : attendanceList && attendanceList.length > 0 ? (
                <div className="overflow-x-auto rounded border border-border/40">
                  <table className="min-w-full divide-y divide-border/40">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          Nombre
                        </th>
                        <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {attendanceList.map((attendance) => (
                        <tr key={attendance.id}>
                          <td className="px-3 py-3 text-sm font-medium">
                            {attendance.employee?.first_name}{" "}
                            {attendance.employee?.last_name}
                          </td>
                          <td className="px-3 py-3">
                            <Badge
                              className={
                                attendance.attended
                                  ? "border border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400"
                                  : "border border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
                              }
                            >
                              {attendance.attended ? "Asistió" : "No asistió"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState message="No hay registros de asistencia para esta actividad." />
              )}
            </div>
          </TabsContent>

          <TabsContent value="estadisticas">
            <div className="rounded-lg border border-border/60 p-4 sm:p-5">
              {(attendanceStats?.total ?? 0) > 0 ? (
                <PieChartComponent
                  data={attendanceChartData}
                  title="Asistencia de la actividad"
                  height={300}
                />
              ) : (
                <EmptyState message="Aún no hay inscritos para calcular estadísticas." />
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </ContentLayout>
  );
}
