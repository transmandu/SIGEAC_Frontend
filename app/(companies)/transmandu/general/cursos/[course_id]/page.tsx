"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { useGetCourseById } from "@/hooks/curso/useGetCourseById";
import { useCompanyStore } from "@/stores/CompanyStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  BookOpen,
  Building,
  Calendar,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";
import { useParams } from "next/navigation";

const ShowCourse = () => {
  const { course_id } = useParams<{ course_id: string }>();
  const { selectedCompany } = useCompanyStore();
  const value = {
    id: course_id,
    company: selectedCompany,
  };
  const {
    data: course,
    isLoading: isCourseLoading,
    isError: courseError,
  } = useGetCourseById(value);

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
                <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      {course.name || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <p className="text-gray-700 dark:text-gray-300">
                      Departamento: {course.deparment_id?.name || "N/A"}
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
                <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Estado:
                      </span>
                    </div>
                    <Badge
                      className={`font-bold ${
                        course.status === "COMPLETADO"
                          ? "bg-green-400"
                          : course.status === "EN_PROGRESO"
                            ? "bg-yellow-400"
                            : course.status === "PLANIFICADO"
                              ? "bg-blue-400"
                              : "bg-gray-500"
                      }`}
                    >
                      {course.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Duración:
                      </p>
                      <p className="font-medium">{course.duration || "N/A"}</p>
                    </div>
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
                  <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Horario
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Horario:
                        </p>
                        <p>{course.time || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg">
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
                  <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Fechas importantes
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
      </div>
    </ContentLayout>
  );
};

export default ShowCourse;
