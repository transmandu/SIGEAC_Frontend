"use client";
import BarChartCourseComponent from "@/components/charts/BarChartCourseComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PdfEndpointPreviewDialog } from "@/components/dialogs/shared/PdfEndpointPreviewDialog";
import { useGetCourseAttendanceList } from "@/hooks/curso/useGetCourseAttendanceList";
import { useGetCourseAttendanceStats } from "@/hooks/curso/useGetCourseAttendanceStats";
import {
  CourseExamDocument,
  useGetCourseExamDocuments,
} from "@/hooks/curso/useGetCourseExamDocuments";
import { useGetCourseById } from "@/hooks/curso/useGetCourseById";
import { getExamDocumentUrl } from "@/lib/cursos/exam-documents";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AreaChartIcon } from "lucide-react";
import {
  AlertCircle,
  BookOpen,
  Building,
  Calendar,
  CheckCheck,
  Clock,
  Eye,
  FileText,
  Loader2,
  Users,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatCalendarDate } from "@/lib/date";
import { courseStatusLabelEsUpper } from "@/lib/cursos/statuses";
import { useState } from "react";

const ExamPreviewCell = ({
  company,
  docs,
  employeeName,
  dni,
}: {
  company?: string;
  docs?: CourseExamDocument[];
  employeeName: string;
  dni: string;
}) => {
  const [preview, setPreview] = useState<{
    endpoint: string;
    fileName: string;
    title: string;
  } | null>(null);

  if (!docs || docs.length === 0) {
    return <span className="text-xs text-muted-foreground">Sin examen</span>;
  }

  return (
    <>
      <div className="flex items-center gap-1">
        {docs.map((doc) => {
          const endpoint = getExamDocumentUrl(company, doc.document_path);
          if (!endpoint) return null;
          return (
            <TooltipProvider key={doc.exam_id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setPreview({
                        endpoint,
                        fileName: `examen_${doc.exam_name}_${dni}`,
                        title: `${doc.exam_name} - ${employeeName}`,
                      })
                    }
                  >
                    <Eye className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Ver examen {doc.exam_name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {preview && (
        <PdfEndpointPreviewDialog
          open={!!preview}
          onOpenChange={(value) => {
            if (!value) setPreview(null);
          }}
          endpoint={preview.endpoint}
          fileName={preview.fileName}
          title={preview.title}
          description="Revisa el examen antes de descargarlo."
        />
      )}
    </>
  );
};

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
    isLoading: isAttendanceStatsLoading,
    isError: isAttendanceStatsError,
  } = useGetCourseAttendanceStats(course_id);

  const {
    data: examDocuments,
    isLoading: isExamDocumentsLoading,
    isError: isExamDocumentsError,
  } = useGetCourseExamDocuments({
    company: selectedCompany?.slug,
    course_id,
  });

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
    <ContentLayout title="Detalles del Curso">
      <PageHeader className="mb-6" currentLabel={course?.name} />

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
                      {formatCalendarDate(course.start_date, "long")} -{" "}
                      {formatCalendarDate(course.end_date, "long")}
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
                      variant="outline"
                      className={`font-medium border px-2.5 py-0.5 ${
                        course.status === "CLOSED"
                          ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800"
                          : course.status === "OPEN"
                            ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
                            : "bg-muted text-muted-foreground border-border/60"
                      }`}
                    >
                      {courseStatusLabelEsUpper(course.status)}
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
                          {formatCalendarDate(course.start_date, "long")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Fecha de fin:
                        </p>
                        <p>{formatCalendarDate(course.end_date, "long")}</p>
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Examen
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {isExamDocumentsLoading ? (
                                <Loader2 className="size-4 animate-spin text-blue-500" />
                              ) : isExamDocumentsError ? (
                                <span className="text-xs text-red-500">
                                  Error
                                </span>
                              ) : (
                                <ExamPreviewCell
                                  company={selectedCompany?.slug}
                                  docs={examDocuments?.[attendance.employee_dni]}
                                  employeeName={`${attendance.employee.first_name} ${attendance.employee.last_name}`}
                                  dni={attendance.employee_dni}
                                />
                              )}
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

        {/* Sección de Estadísticas */}
        <div className="mt-8">
          <div className="flex justify-start items-center dark:bg-gray-800 p-6 rounded-lg gap-2">
            <AreaChartIcon className="size-8 text-blue-500" />
            <h1 className="text-lg font-bold">Estadísticas del Curso</h1>
          </div>

          {isAttendanceStatsLoading ? (
            <div className="flex justify-center items-center h-64 border border-gray-300 dark:bg-gray-800 rounded-lg">
              <Loader2 className="size-12 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600 dark:text-gray-300">
                Cargando estadísticas...
              </span>
            </div>
          ) : isAttendanceStatsError ? (
            <div className="border dark:bg-red-900/20 border-red-200 dark:border-red-800 rounded-lg p-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-red-700 dark:text-gray-300">
                Error al cargar las estadísticas de asistencia
              </p>
            </div>
          ) : AttendanceStats && AttendanceStats.total !== 0 ? (
            <div className="flex border border-gray-300 dark:bg-gray-800 p-6 rounded-lg">
              <BarChartCourseComponent
                height="100%"
                width="100%"
                title=""
                data={AttendanceStats}
                bar_first_name="Asistente"
                bar_second_name="Inasistente"
              />
              <PieChartComponent
                data={PieChartData}
                title="Porcentaje de Asistencia"
              />
            </div>
          ) : (
            <div className="border border-gray-300 dark:bg-gray-800 p-6 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No hay datos estadísticos disponibles para este curso
              </p>
            </div>
          )}
        </div>
      </div>
    </ContentLayout>
  );
};

export default ShowCourse;
