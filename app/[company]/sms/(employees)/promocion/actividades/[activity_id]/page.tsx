"use client";

import BarChartCourseComponent from "@/components/charts/BarChartCourseComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetActivityAttendanceList } from "@/hooks/sms/useGetActivityAttendanceList";
import { useGetSMSActivityAttendanceStats } from "@/hooks/sms/useGetSMSActivityAttendanceStats";
import { useGetSMSActivityById } from "@/hooks/sms/useGetSMSActivityById";
import { useCompanyStore } from "@/stores/CompanyStore";
import { generateMinutaPDF } from "@/utils/generateMinutaPDF";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  AreaChartIcon,
  BarChart3,
  Calendar,
  Check,
  FileText,
  Info,
  Loader2,
  Paperclip,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

const statusClassName = {
  ABIERTO:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",
  CERRADO:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  PROCESO:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  PENDIENTE:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
} as const;

const ShowSMSActivity = () => {
  const { selectedCompany } = useCompanyStore();
  const { activity_id } = useParams<{ activity_id: string }>();

  const {
    data: activity,
    isLoading: isActivityLoading,
    isError: activityError,
  } = useGetSMSActivityById({
    company: selectedCompany?.slug,
    id: activity_id,
  });

  const {
    data: attendedList,
    isLoading: isAttendedListLoading,
    isError: attendedListError,
  } = useGetActivityAttendanceList({
    company: selectedCompany?.slug,
    activity_id: activity_id.toString(),
  });

  const {
    data: attendanceStats,
    isLoading: isAttendanceStatsLoading,
    isError: isAttendanceStatsError,
  } = useGetSMSActivityAttendanceStats(activity_id);

  const pieChartData = attendanceStats
    ? [
        { name: "Asistentes", value: attendanceStats.attended },
        { name: "Inasistentes", value: attendanceStats.not_attended },
      ]
    : [];

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

  return (
    <ContentLayout title="Actividad de SMS">
      <div className="w-full rounded-lg border border-border/60 p-4 sm:p-6">
        <div className="mb-5 border-b border-border/60 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-500">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-base font-semibold leading-tight">
                  Detalle de Actividad SMS
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Referencia: {activity?.activity_number || "N/A"}
                </p>
              </div>
            </div>

            {activity?.status && (
              <Badge
                className={`border text-xs font-medium ${
                  statusClassName[
                    activity.status as keyof typeof statusClassName
                  ] || "bg-muted text-foreground border-border/40"
                }`}
              >
                {activity.status.replace("_", " ")}
              </Badge>
            )}
          </div>
        </div>

        {isActivityLoading && (
          <div className="flex h-52 w-full items-center justify-center rounded-lg border border-border/60">
            <Loader2 className="size-10 animate-spin" />
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Título
                  </p>
                  <p className="mt-1 text-sm font-medium">{activity.title || "N/A"}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Nombre de Actividad
                  </p>
                  <p className="mt-1 text-sm">{activity.activity_name || "N/A"}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Número
                  </p>
                  <p className="mt-1 text-sm tracking-wide">
                    {activity.activity_number || "N/A"}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Lugar
                  </p>
                  <p className="mt-1 text-sm">{activity.place || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <section className="rounded-lg border border-border/60 p-4 lg:col-span-2">
                  <h2 className="pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Meta de Actividad
                  </h2>
                  <div className="grid grid-cols-1 gap-3 border-t border-border/60 pt-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1 border border-border/40 px-3 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Fecha Inicio
                      </p>
                      <p className=" text-sm">{dateLabel(activity.start_date)}</p>
                    </div>
                    <div className="space-y-1 border border-border/40 px-3 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Fecha Final
                      </p>
                      <p className=" text-sm">{dateLabel(activity.end_date)}</p>
                    </div>
                    <div className="space-y-1 border border-border/40 px-3 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Horario
                      </p>
                      <p className=" text-sm">
                        {activity.start_time || "N/A"} - {activity.end_time || "N/A"}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <h2 className="pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Categorías
                  </h2>
                  <div className="border-t border-border/60 pt-3">
                    {activity.categories && activity.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {activity.categories.map((category) => (
                          <span
                            key={category.id}
                            className="rounded border border-border/40 bg-muted/20 px-2 py-0.5 text-xs"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin categorías registradas.</p>
                    )}
                  </div>
                </section>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <section className="rounded-lg border border-border/60 p-4">
                  <h2 className="pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Responsables
                  </h2>
                  <div className="space-y-3 border-t border-border/60 pt-3 text-sm">
                    <div className="border border-border/40 px-3 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Autorizado por
                      </p>
                      <p className="mt-1 font-medium">
                        {activity.authorized_by.first_name || "N/A"} {activity.authorized_by.last_name || ""}
                      </p>
                      <p className="text-xs  text-muted-foreground">
                        DNI: {activity.authorized_by.dni || "N/A"}
                      </p>
                    </div>
                    <div className="border border-border/40 px-3 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Elaborado por
                      </p>
                      <p className="mt-1 font-medium">
                        {activity.planned_by.first_name || "N/A"} {activity.planned_by.last_name || ""}
                      </p>
                      <p className="text-xs  text-muted-foreground">
                        DNI: {activity.planned_by.dni || "N/A"}
                      </p>
                    </div>
                    <div className="border border-border/40 px-3 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Realizado por
                      </p>
                      <p className="mt-1 font-medium">{activity.executed_by || "N/A"}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 p-4 lg:col-span-2">
                  <h2 className="pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Temas Abordados
                  </h2>
                  <div className="border-t border-border/60 pt-2">
                    {topics.length > 0 ? (
                      <div className="divide-y divide-border/30 border border-border/40">
                        {topics.map((topic, index) => (
                          <div
                            key={`${topic}-${index}`}
                            className="px-3 py-3 text-sm transition-colors hover:bg-muted/20"
                          >
                            {topic}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay temas registrados.</p>
                    )}
                  </div>
                </section>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <section className="rounded-lg border border-border/60 p-4">
                  <h2 className="pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Objetivo y Observaciones
                  </h2>
                  <div className="border-t border-border/60 pt-3">
                    <p className="whitespace-pre-line text-sm text-muted-foreground">
                      {activity.objetive || "No hay observaciones registradas."}
                    </p>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <h2 className="pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Descripción
                  </h2>
                  <div className="border-t border-border/60 pt-3">
                    <p className="whitespace-pre-line text-sm text-muted-foreground">
                      {activity.description || "No hay descripción registrada."}
                    </p>
                  </div>
                </section>
              </div>

              {(activity?.imageUrl || activity?.documentUrl) && (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {activity?.imageUrl && (
                    <section className="rounded-lg border border-border/60 p-4">
                      <h2 className="pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Imagen Adjunta
                      </h2>
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="group relative mt-3 h-64 w-full cursor-pointer overflow-hidden rounded border border-border/40 bg-muted/20">
                            <Image
                              src={activity.imageUrl}
                              alt="Imagen de la actividad"
                              fill
                              className="object-contain"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="rounded border border-white/40 bg-black/50 px-3 py-1 text-xs text-white">
                                Ampliar
                              </span>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Imagen de la Actividad</DialogTitle>
                          </DialogHeader>
                          <div className="relative flex h-[60vh] justify-center">
                            <Image
                              src={activity.imageUrl}
                              fill
                              alt="Imagen completa de la actividad"
                              className="max-h-full max-w-full rounded-lg border object-contain"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </section>
                  )}

                  {activity?.documentUrl && (
                    <section className="rounded-lg border border-border/60 p-4">
                      <h2 className="pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Documento Adjunto
                      </h2>
                      <div className="mt-3 flex h-64 flex-col items-center justify-center gap-3 rounded border border-border/40 bg-muted/20 p-4 text-center">
                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Documento listo para descargar.
                        </p>
                        <a href={activity.documentUrl} download={`ACT-${activity.activity_number}.pdf`}>
                          <Button type="button" className="h-10">
                            <FileText className="mr-2 h-4 w-4" />
                            Descargar documento
                          </Button>
                        </a>
                      </div>
                    </section>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="participantes">
              <div className="rounded-lg border border-border/60 p-4 sm:p-5">
                <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                    <Users className="h-4 w-4" />
                    Empleados Inscritos
                  </h2>
                  <Badge className="border border-border/40 bg-muted text-foreground">
                    {attendedList?.length || 0} participantes
                  </Badge>
                </div>

                {isAttendedListLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-8 animate-spin" />
                  </div>
                ) : attendedListError ? (
                  <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-100 p-4 dark:border-red-800 dark:bg-red-950/20">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Error al cargar la lista de empleados.
                    </p>
                  </div>
                ) : attendedList && attendedList.length > 0 ? (
                  <div className="overflow-x-auto rounded border border-border/40">
                    <table className="min-w-full divide-y divide-border/40">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                            Nombre Completo
                          </th>
                          <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                            DNI
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {attendedList.map((attended) => (
                          <tr key={attended.id} className="transition-colors hover:bg-muted/20">
                            <td className="whitespace-nowrap px-3 py-3 text-sm font-medium">
                              {attended.employee.first_name} {attended.employee.last_name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3  text-sm text-muted-foreground">
                              {attended.employee_dni}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No hay empleados inscritos en esta actividad.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="asistencia">
              <div className="rounded-lg border border-border/60 p-4 sm:p-5">
                <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                    <UserCheck className="h-4 w-4" />
                    Registro de Asistencia
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="border border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400">
                      Asistentes: {attendanceStats?.attended || 0}
                    </Badge>
                    <Badge className="border border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                      Inasistentes: {attendanceStats?.not_attended || 0}
                    </Badge>
                  </div>
                </div>

                {isAttendedListLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-8 animate-spin" />
                  </div>
                ) : attendedListError ? (
                  <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-100 p-4 dark:border-red-800 dark:bg-red-950/20">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Error al cargar la lista de asistencia.
                    </p>
                  </div>
                ) : attendedList && attendedList.length > 0 ? (
                  <div className="overflow-x-auto rounded border border-border/40">
                    <table className="min-w-full divide-y divide-border/40">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                            Nombre Completo
                          </th>
                          <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                            Asistencia
                          </th>
                          <th className="hidden px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 sm:table-cell">
                            DNI
                          </th>
                          <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {attendedList.map((attended) => (
                          <tr key={attended.id} className="transition-colors hover:bg-muted/20">
                            <td className="whitespace-nowrap px-3 py-3 text-sm font-medium">
                              {attended.employee.first_name} {attended.employee.last_name}
                            </td>
                            <td className="px-3 py-3">
                              {attended.attended ? (
                                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                              )}
                            </td>
                            <td className="hidden whitespace-nowrap px-3 py-3  text-sm text-muted-foreground sm:table-cell">
                              {attended.employee_dni}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3">
                              <Badge
                                className={
                                  attended.attended
                                    ? "border border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400"
                                    : "border border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
                                }
                              >
                                {attended.attended ? "Asistió" : "No Asistió"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No hay registros de asistencia para esta actividad.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="estadisticas">
              <div className="rounded-lg border border-border/60 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <AreaChartIcon className="size-5 text-muted-foreground" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    Estadísticas de la Actividad
                  </h2>
                </div>

                {isAttendanceStatsLoading ? (
                  <div className="flex h-56 items-center justify-center rounded-lg border border-border/60">
                    <Loader2 className="size-10 animate-spin" />
                    <span className="ml-3 text-sm text-muted-foreground">
                      Cargando estadísticas...
                    </span>
                  </div>
                ) : isAttendanceStatsError ? (
                  <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-100 p-6 dark:border-red-800 dark:bg-red-950/20">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Error al cargar las estadísticas de asistencia.
                    </p>
                  </div>
                ) : attendanceStats && attendanceStats.total !== 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded border border-border/40 px-3 py-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Total
                        </p>
                        <p className=" text-xl font-bold tabular-nums">
                          {attendanceStats.total}
                        </p>
                      </div>
                      <div className="rounded border border-green-200 px-3 py-3 dark:border-green-800">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Asistentes
                        </p>
                        <p className=" text-xl font-bold tabular-nums text-green-700 dark:text-green-400">
                          {attendanceStats.attended}
                        </p>
                      </div>
                      <div className="rounded border border-red-200 px-3 py-3 dark:border-red-800">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Inasistentes
                        </p>
                        <p className=" text-xl font-bold tabular-nums text-red-700 dark:text-red-400">
                          {attendanceStats.not_attended}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-border/60 p-4 md:flex-row">
                      <div className="w-full md:w-1/2">
                        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Asistencia
                        </h3>
                        <BarChartCourseComponent
                          height="100%"
                          width="100%"
                          title=""
                          data={attendanceStats}
                          bar_first_name="Asistente"
                          bar_second_name="Inasistente"
                        />
                      </div>
                      <div className="h-[300px] w-full md:w-1/2">
                        <PieChartComponent
                          data={pieChartData}
                          title="Porcentaje de Asistencia"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border/60 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No hay datos estadísticos disponibles para esta actividad.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {activity && (
          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              className="h-10 w-full sm:w-auto"
              onClick={() => generateMinutaPDF(activity, attendedList?.length || 0)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Descargar Minuta PDF
            </Button>
          </div>
        )}

        {activityError && (
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-100 p-4 dark:border-red-800 dark:bg-red-950/20">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-300">
              Error al cargar la actividad.
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default ShowSMSActivity;
