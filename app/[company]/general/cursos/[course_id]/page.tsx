"use client";
import BarChartCourseComponent from "@/components/charts/BarChartCourseComponent";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { useGetCourseAttendanceList } from "@/hooks/curso/useGetCourseAttendanceList";
import { useGetCourseAttendanceStats } from "@/hooks/curso/useGetCourseAttendanceStats";
import { useGetCourseById } from "@/hooks/curso/useGetCourseById";
import { useCompanyStore } from "@/stores/CompanyStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  BookOpen,
  Building,
  Calendar,
  CheckCheck,
  Clock,
  FileText,
  Loader2,
  Users,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";

const ShowCourse = () => {
  const { course_id } = useParams<{ course_id: string }>();
  const { selectedCompany } = useCompanyStore();

  const {
    data: course,
    isLoading: isCourseLoading,
    isError: courseError,
  } = useGetCourseById({ id: course_id, company: selectedCompany?.slug });

  const {
    data: attendanceList,
    isLoading: isAttendanceListLoading,
    isError: isAttendanceListError,
  } = useGetCourseAttendanceList({ course_id, company: selectedCompany?.slug });

  const {
    data: AttendanceStats,
    isLoading: AttendanceStatsLoading,
    isError: isAttendanceStatsError,
  } = useGetCourseAttendanceStats(course_id);

  return (
    <ContentLayout title="Detalles del Curso">
      {/* Contenido principal */}
      <div className="w-full border border-gray-300 rounded-lg p-6 shadow-md dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Detalles del Curso
          </h1>
        </div>

        {isCourseLoading && (
          <div className="flex w-full h-64 justify-center items-center">
            <Loader2 className="size-24 animate-spin text-blue-500" />
          </div>
        )}

        {course && (
          <>
            {/* Sección de información del curso */}
            <div className="space-y-6">
              {/* Sección superior con información básica */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tarjeta de información básica */}
                <div className="border dark:bg-gray-800 p-5 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      {course.name || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <p className=" font-bold text-gray-700 dark:text-gray-300">
                      Departamento:
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {course.department?.name || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <p className="text-gray-700 dark:text-gray-300">
                      {format(course.start_date, "PPP", { locale: es })} -{" "}
                      {format(course.end_date, "PPP", { locale: es })}
                    </p>
                  </div>
                </div>

                {/* Tarjeta de estado */}
                <div className="border dark:bg-gray-800 p-5 rounded-lg flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Estado:
                      </span>
                    </div>
                    <Badge
                      className={`font-bold ${
                        course.status === "CERRADO"
                          ? "bg-red-600"
                          : course.status === "PROCESO"
                            ? "bg-yellow-400"
                            : course.status === "ABIERTO"
                              ? "bg-green-400"
                              : "bg-gray-500"
                      }`}
                    >
                      {course.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Instructor:
                      </p>
                      <p className="font-medium">
                        {course.instructor || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de detalles */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna 1 */}
                <div className="space-y-6">
                  <div className="border  dark:bg-gray-800 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Horario
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Horario de Inicio:
                        </p>
                        <p>{course.start_time || "N/A"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Horario de Finalización:
                        </p>
                        <p>{course.end_time || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border dark:bg-gray-800 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Descripción
                    </h3>
                    <p className="whitespace-pre-line">
                      {course.description || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Columna 2 */}
                <div className="space-y-6">
                  <div className="border dark:bg-gray-800 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Cronograma
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Fecha de inicio:
                        </p>
                        <p>
                          {format(course.start_date, "PPP", { locale: es })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Fecha de fin:
                        </p>
                        <p>{format(course.end_date, "PPP", { locale: es })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de empleados al final */}
            <div className="mt-8">
              <div className="border border-gray-300 dark:bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    Empleados Inscritos
                  </h2>
                  <Badge>{attendanceList?.length || 0} participantes</Badge>
                </div>

                {isAttendanceListLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-8 animate-spin text-blue-500" />
                  </div>
                ) : isAttendanceListError ? (
                  <div className="border dark:bg-red-900/20 border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700 dark:text-gray-300">
                      Error al cargar la lista de empleados
                    </p>
                  </div>
                ) : attendanceList && attendanceList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Nombre Completo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Asistencia
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            DNI
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {attendanceList.map((attendance) => (
                          <tr key={attendance.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {attendance.employee.first_name}{" "}
                              {attendance.employee.last_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              <div className="flex items-center">
                                {attendance.attended ? (
                                  <CheckCheck className="text-green-500 size-5" />
                                ) : (
                                  <X className="text-red-500 size-5" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {attendance.employee_dni}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay empleados inscritos en este curso
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {courseError && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-gray-300">
              Error al cargar la información del curso
            </p>
          </div>
        )}
        <div className="border border-gray-300 dark:bg-gray-800 p-6 rounded-lg">
          Holaa this is the new content{" "}
            {AttendanceStats && (
              <BarChartCourseComponent
                height="100%"
                width="100%"
                title="Estadisticas de Asistencia"
                data={AttendanceStats}
                bar_first_name="Asistentes"
                bar_second_name="Inasistentes"
              ></BarChartCourseComponent>
            )}
        </div>
      </div>
    </ContentLayout>
  );
};

export default ShowCourse;
