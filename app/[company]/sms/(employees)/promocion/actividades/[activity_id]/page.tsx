"use client";
import BarChartCourseComponent from "@/components/charts/BarChartCourseComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetActivityAttendanceList } from "@/hooks/sms/useGetActivityAttendanceList";
import { useGetSMSActivityAttendanceStats } from "@/hooks/sms/useGetSMSActivityAttendanceStats";
import { useGetSMSActivityById } from "@/hooks/sms/useGetSMSActivityById";
import { useCompanyStore } from "@/stores/CompanyStore";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  AlertCircle,
  AlertTriangle,
  AreaChartIcon,
  Calendar,
  CheckCheck,
  ChevronRight,
  FileText,
  Hash,
  Loader2,
  MapPin,
  Tag,
  Users,
  X,
  BarChart3,
  UserCheck,
  Info,
  ClipboardList,
} from "lucide-react";
import { useParams } from "next/navigation";

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
    data: AttendanceStats,
    isLoading: isAttendanceStatsLoading,
    isError: isAttendanceStatsError,
  } = useGetSMSActivityAttendanceStats(activity_id);

  const PieChartData = AttendanceStats
    ? [
      {
        name: "Asistentes",
        value: AttendanceStats.attended,
      },
      {
        name: "Inasistentes",
        value: AttendanceStats.not_attended,
      },
    ]
    : [];

  return (
    <ContentLayout title="Actividad de SMS">
      {/* Contenedor principal del contenido */}
      <div className="w-full rounded-lg border border-gray-300 p-6 shadow-md dark:border-gray-700 dark:bg-gray-900">
        {/* Encabezado */}
        <div className="mb-6 flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Detalles de la Actividad SMS
          </h1>
        </div>

        {isActivityLoading && (
          <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="size-24 animate-spin text-blue-500" />
          </div>
        )}

        {activity && (
          <Tabs defaultValue="informacion" className="w-full">
            {/* Lista de pestañas - Totalmente responsive */}
            <TabsList className="mb-6 grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              <TabsTrigger
                value="informacion"
                className="flex items-center gap-2 px-2 sm:px-4"
              >
                <Info className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-xs sm:text-sm">Información</span>
              </TabsTrigger>
              <TabsTrigger
                value="participantes"
                className="flex items-center gap-2 px-2 sm:px-4"
              >
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-xs sm:text-sm">
                  Participantes
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="asistencia"
                className="flex items-center gap-2 px-2 sm:px-4"
              >
                <UserCheck className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-xs sm:text-sm">Asistencia</span>
              </TabsTrigger>
              <TabsTrigger
                value="estadisticas"
                className="flex items-center gap-2 px-2 sm:px-4"
              >
                <BarChart3 className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-xs sm:text-sm">
                  Estadísticas
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Pestaña de Información General (combinada con Detalles) */}
            <TabsContent value="informacion" className="space-y-6">
              {/* Sección superior con información básica */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Tarjeta de información básica */}
                <div className="rounded-lg border border-gray-300 p-5 dark:border-gray-700 dark:bg-gray-800">
                  <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-200">
                    Información General
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        <span className="font-bold">Título:</span>{" "}
                        {activity.title || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        <span className="font-bold">Nombre:</span>{" "}
                        {activity.activity_name || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        <span className="font-bold">Número:</span>{" "}
                        {activity.activity_number || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-bold">Fecha:</span>{" "}
                        {format(addDays(activity.start_date, 1), "PPP", {
                          locale: es,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-bold">Lugar:</span>{" "}
                        {activity.place || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tarjeta de estado y responsables */}
                <div className="rounded-lg border border-gray-300 p-5 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      Estado y Responsables
                    </h2>
                    <Badge
                      className={`font-bold ${activity.status === "ABIERTO"
                        ? "bg-green-500 text-white"
                        : activity.status === "PROCESO"
                          ? "bg-yellow-500 text-black"
                          : activity.status === "CERRADO"
                            ? "bg-red-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                    >
                      {activity.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-400">
                        Autorizado por:
                      </p>
                      <p className="text-base">
                        {activity.authorized_by.first_name || "N/A"}{" "}
                        {activity.authorized_by.last_name || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.authorized_by.job_title?.name || "N/A"}{" "}
                        {activity.authorized_by.department?.name || ""}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-400">
                        Elaborado por:
                      </p>
                      <p className="text-base">
                        {activity.planned_by.first_name || "N/A"}{" "}
                        {activity.planned_by.last_name || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.planned_by.job_title?.name || "N/A"}{" "}
                        {activity.planned_by.department?.name || ""}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-400">
                        Realizado por:
                      </p>
                      <p className="text-base">
                        {activity.executed_by || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de detalles combinada */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Horario y Cronograma */}
                <div className="rounded-lg border border-gray-300 p-5 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
                    <Calendar className="h-5 w-5" />
                    Horario y Cronograma
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Hora Inicio:
                        </p>
                        <p className="font-semibold">{activity.start_time}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Hora Final:
                        </p>
                        <p className="font-semibold">
                          {activity.end_time || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Fecha Inicio:
                        </p>
                        <p className="font-semibold">
                          {format(addDays(activity.start_date, 1), "PPP", {
                            locale: es,
                          })}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Fecha Finalización:
                        </p>
                        <p className="font-semibold">
                          {format(addDays(activity.end_date, 1), "PPP", {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Temas */}
                <div className="rounded-lg border border-gray-300 p-5 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
                    <FileText className="h-5 w-5" />
                    Temas
                  </h3>
                  {activity.topics ? (
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                      {activity.topics.split(",").map(
                        (topic, index) =>
                          topic.trim() && (
                            <li key={index} className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0 text-blue-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {topic.trim()}
                              </span>
                            </li>
                          )
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay temas registrados
                    </p>
                  )}
                </div>

                {/* Observaciones y Descripción */}
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-300 p-5 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                      <FileText className="h-5 w-5" />
                      Observaciones
                    </h3>
                    <p className="text-sm whitespace-pre-line text-gray-600 dark:text-gray-400">
                      {activity.objetive || "No hay observaciones registradas"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-300 p-5 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                      <FileText className="h-5 w-5" />
                      Descripción
                    </h3>
                    <p className="text-sm whitespace-pre-line text-gray-600 dark:text-gray-400">
                      {activity.description || "No hay descripción registrada"}
                    </p>
                  </div>
                </div>

              </div>

              {/* Sección de Imagen y Documento */}
              <div className="space-y-4">
                {activity?.imageUrl && (
                  <Card>
                    <CardHeader className="pb-3">
                      <h3 className="text-lg font-semibold">Imagen Adjunta</h3>
                    </CardHeader>
                    <CardContent>
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative group w-full max-w-sm h-64 mx-auto cursor-pointer">
                            {/* ✅ USAR img NORMAL */}
                            <Image
                              src={activity.imageUrl}
                              alt="Imagen de la actividad"
                              fill
                              crossOrigin="use-credentials"
                              className="w-full h-full object-contain rounded-md border group-hover:border-gray-400 transition-all"
                              onError={(e) => {
                                console.error("Error cargando imagen:", e);
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity rounded-md">
                              <span className="text-white bg-black/70 px-3 py-2 rounded-md text-sm">
                                Ver imagen
                              </span>
                            </div>
                          </div>
                        </DialogTrigger>

                        <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw]">
                          <DialogHeader>
                            <DialogTitle>Imagen de la Actividad</DialogTitle>
                          </DialogHeader>
                          <div className="relative h-[60vh] flex justify-center">
                            {/* ✅ USAR img NORMAL en el dialog también */}
                            <Image
                              src={activity.imageUrl}
                              fill
                              alt="Imagen completa de la actividad"
                              className="max-w-full max-h-full object-contain rounded-lg border"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                )}

                {activity?.documentUrl && (
                  <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg text-center">
                    <h3 className="text-xl font-semibold mb-4">Documento Adjunto</h3>
                    <a
                      href={`${activity.documentUrl}`}
                      download={`ACT-${activity.activity_number}.pdf`}
                      className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Descargar Documento Adjunto
                    </a>
                  </div>
                )}
              </div>
            </TabsContent>



            {/* Pestaña de Participantes */}
            <TabsContent value="participantes">
              <div className="rounded-lg border border-gray-300 p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Empleados Inscritos
                  </h2>
                  <Badge className="bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                    {attendedList?.length || 0} participantes
                  </Badge>
                </div>

                {isAttendedListLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-8 animate-spin text-blue-500" />
                  </div>
                ) : attendedListError ? (
                  <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-100 p-4 dark:border-red-800 dark:bg-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700 dark:text-red-300">
                      Error al cargar la lista de empleados.
                    </p>
                  </div>
                ) : attendedList && attendedList.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Nombre Completo
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            DNI
                          </th>
                          <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:table-cell">
                            Departamento
                          </th>
                          <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 lg:table-cell">
                            Cargo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {attendedList.map((attended) => (
                          <tr
                            key={attended.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              {attended.employee.first_name}{" "}
                              {attended.employee.last_name}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {attended.employee_dni}
                            </td>
                            {/* <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400 sm:table-cell">
                              {attended.employee.department?.name || "N/A"}
                            </td>
                            <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400 lg:table-cell">
                              {attended.employee.job_title?.name || "N/A"}
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay empleados inscritos en esta actividad.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Pestaña de Asistencia */}
            <TabsContent value="asistencia">
              <div className="rounded-lg border border-gray-300 p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
                    <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    Registro de Asistencia
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">
                      Asistentes: {AttendanceStats?.attended || 0}
                    </Badge>
                    <Badge className="bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200">
                      Inasistentes: {AttendanceStats?.not_attended || 0}
                    </Badge>
                  </div>
                </div>

                {isAttendedListLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-8 animate-spin text-blue-500" />
                  </div>
                ) : attendedListError ? (
                  <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-100 p-4 dark:border-red-800 dark:bg-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700 dark:text-red-300">
                      Error al cargar la lista de asistencia.
                    </p>
                  </div>
                ) : attendedList && attendedList.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Nombre Completo
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Asistencia
                          </th>
                          <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:table-cell">
                            DNI
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {attendedList.map((attended) => (
                          <tr
                            key={attended.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              {attended.employee.first_name}{" "}
                              {attended.employee.last_name}
                            </td>
                            <td className="px-4 py-4">
                              {attended.attended ? (
                                <CheckCheck className="h-5 w-5 text-green-500" />
                              ) : (
                                <X className="h-5 w-5 text-red-500" />
                              )}
                            </td>
                            <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400 sm:table-cell">
                              {attended.employee_dni}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4">
                              <Badge
                                className={
                                  attended.attended
                                    ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                    : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
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
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay registros de asistencia para esta actividad.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Pestaña de Estadísticas */}
            <TabsContent value="estadisticas">
              <div className="rounded-lg border border-gray-300 p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-6 flex items-center gap-2">
                  <AreaChartIcon className="size-8 text-blue-500 dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    Estadísticas de la Actividad
                  </h2>
                </div>

                {isAttendanceStatsLoading ? (
                  <div className="flex h-64 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800">
                    <Loader2 className="size-12 animate-spin text-blue-500" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">
                      Cargando estadísticas...
                    </span>
                  </div>
                ) : isAttendanceStatsError ? (
                  <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-100 p-6 dark:border-red-800 dark:bg-red-900/20">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                    <p className="text-red-700 dark:text-red-300">
                      Error al cargar las estadísticas de asistencia.
                    </p>
                  </div>
                ) : AttendanceStats && AttendanceStats.total !== 0 ? (
                  <div className="flex flex-col items-center justify-center gap-8 rounded-lg border border-gray-300 p-6 dark:border-gray-700 dark:bg-gray-800 md:flex-row">
                    <div className="w-full md:w-1/2">
                      <>
                        <h2 className="text-sm sm:text-base font-bold">
                          Asistencia
                        </h2>
                        <BarChartCourseComponent
                          height="100%"
                          width="100%"
                          title=""
                          data={AttendanceStats}
                          bar_first_name="Asistente"
                          bar_second_name="Inasistente"
                        />
                      </>
                    </div>
                    <div className="h-[300px] w-full md:w-1/2">
                      <PieChartComponent
                        data={PieChartData}
                        title="Porcentaje de Asistencia"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-300 p-6 text-center dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay datos estadísticos disponibles para esta actividad.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {activityError && (
          <div className="mt-8 flex items-center gap-3 rounded-lg border border-red-200 bg-red-100 p-4 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 dark:text-red-300">
              Error al cargar la actividad.
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default ShowSMSActivity;
