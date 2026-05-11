"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees";
import { useGetEmployeeTrainingProfile } from "@/hooks/curso/useGetEmployeeTrainingProfile";
import {
  Loader2, Users, FileText, CheckCircle,
  XCircle, Search, FileBadge, ChevronDown, ChevronUp, BookOpen, Calendar, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type CourseSummary = {
  key: string;
  name: string;
  date: Date | null;
  certificates: any[];
  exams: any[];
};

const getFirstValue = (source: any, paths: string[]) => {
  for (const path of paths) {
    const value = path.split(".").reduce((current, key) => current?.[key], source);

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
};

const toValidDate = (value: any) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getCourseKey = (item: any, fallback: string) => {
  return String(
    getFirstValue(item, [
      "course_id",
      "course.id",
      "courseExam.course_id",
      "courseExam.course.id",
      "exam.course_id",
      "exam.course.id",
      "course_name",
      "course.name",
      "courseExam.course.name",
      "exam.course.name",
    ]) || fallback
  );
};

const getCourseName = (item: any, fallback = "Curso no especificado") => {
  return (
    getFirstValue(item, [
      "course_name",
      "course.name",
      "courseExam.course.name",
      "exam.course.name",
    ]) || fallback
  );
};

const getItemDate = (item: any) => {
  return toValidDate(
    getFirstValue(item, [
      "completion_date",
      "issue_date",
      "exam_date",
      "course.end_date",
      "courseExam.exam_date",
      "courseExam.course.end_date",
      "exam.exam_date",
      "created_at",
    ])
  );
};

const encodeFilePath = (path: string) =>
  btoa(path).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const openProtectedDocument = async (endpoint: string) => {
  const documentWindow = window.open("", "_blank");

  try {
    const response = await axiosInstance.get(endpoint, {
      responseType: "blob",
    });
    const blobUrl = URL.createObjectURL(response.data);

    if (documentWindow) {
      documentWindow.location.href = blobUrl;
    } else {
      window.open(blobUrl, "_blank");
    }

    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } catch (error) {
    documentWindow?.close();
    console.error("Error al abrir el documento:", error);
  }
};

const getCertificateUrl = (companySlug: string | undefined, document?: string | null) => {
  if (!companySlug || !document) return null;

  return `/${companySlug}/sms/certificates/serve/${encodeFilePath(document)}`;
};

const getExamDocumentUrl = (companySlug: string | undefined, documentPath?: string | null) => {
  if (!companySlug || !documentPath) return null;

  const normalizedPath = documentPath.replace(/^\/+/, "");
  return `/general/${companySlug}/course-exam-attendance/document/${encodeFilePath(normalizedPath)}`;
};

const buildCourseSummaries = (profile: any): CourseSummary[] => {
  const courses = new Map<string, CourseSummary>();

  const ensureCourse = (item: any, fallback: string) => {
    const key = getCourseKey(item, fallback);
    const date = getItemDate(item);
    const existing = courses.get(key);

    if (existing) {
      if (date && (!existing.date || date > existing.date)) {
        existing.date = date;
      }

      return existing;
    }

    const course: CourseSummary = {
      key,
      name: getCourseName(item),
      date,
      certificates: [],
      exams: [],
    };

    courses.set(key, course);
    return course;
  };

  const attendedCourses: any[] = Array.isArray(profile) ? [] : profile?.courses || [];
  const certificates: any[] = Array.isArray(profile) ? [] : profile?.certificates || [];
  const exams: any[] = Array.isArray(profile) ? profile : profile?.exams || [];

  attendedCourses.forEach((courseAttendance: any, index: number) => {
    ensureCourse(courseAttendance, `course-${index}`);
  });

  certificates?.forEach((certificate: any, index: number) => {
    ensureCourse(certificate, `certificate-${index}`).certificates.push(certificate);
  });

  exams?.forEach((exam: any, index: number) => {
    const course = ensureCourse(exam, `exam-${index}`);
    course.exams.push(exam);

    if (course.name === "Curso no especificado") {
      course.name = getCourseName(exam, exam.exam_name || "Curso no especificado");
    }
  });

  return Array.from(courses.values()).sort((a, b) => {
    const dateA = a.date?.getTime() ?? 0;
    const dateB = b.date?.getTime() ?? 0;
    return dateB - dateA;
  });
};

const CourseSummaryCard = ({
  course,
  companySlug,
  showHeader = true,
}: {
  course: CourseSummary;
  companySlug?: string;
  showHeader?: boolean;
}) => (
  <div className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-[#0b1120] overflow-hidden">
    {showHeader && (
      <div className="bg-gray-50/50 dark:bg-gray-800/30 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h3 className="font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <BookOpen className="w-4 h-4 text-blue-500" />
          {course.name}
        </h3>
        {course.date && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {format(course.date, "dd/MM/yyyy")}
          </span>
        )}
      </div>
    )}

    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div>
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <FileBadge className="w-4 h-4 text-amber-500" />
          Certificados ({course.certificates.length})
        </h4>
        {course.certificates.length > 0 ? (
          <div className="space-y-3">
            {course.certificates.map((cert: any, index: number) => {
              const issueDate = getItemDate(cert);
              const certificateUrl = getCertificateUrl(companySlug, cert.document);

              return (
                <div key={cert.id || index} className="flex justify-between items-start gap-3 border-b border-gray-100 dark:border-gray-800/50 last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {cert.name || cert.course_name || "Certificado"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Emision: {issueDate ? format(issueDate, "dd/MM/yyyy") : "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {cert.expiration_date && (
                      <Badge variant="outline" className="h-6 whitespace-nowrap">
                        Expira {format(new Date(cert.expiration_date), "dd/MM/yyyy")}
                      </Badge>
                    )}
                    {certificateUrl && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 mt-7"
                        onClick={() => openProtectedDocument(certificateUrl)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic py-2">No hay certificados registrados.</p>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-blue-500" />
          Examenes ({course.exams.length})
        </h4>
        {course.exams.length > 0 ? (
          <div className="space-y-3">
            {course.exams.map((exam: any, index: number) => {
              const examDocumentUrl = getExamDocumentUrl(companySlug, exam.document_path);

              return (
                <div key={exam.id || index} className="flex justify-between items-start gap-3 border-b border-gray-100 dark:border-gray-800/50 last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {exam.exam_name || exam.name || exam.courseExam?.name || exam.exam?.name || "Examen"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Puntuacion: <span className="font-medium">{exam.score || "N/A"}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {exam.approved ? (
                      <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-0 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Aprobado
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border-0 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Reprobado
                      </Badge>
                    )}
                    {examDocumentUrl && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => openProtectedDocument(examDocumentUrl)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic py-2">No hay examenes registrados.</p>
        )}
      </div>
    </div>
  </div>
);

// --- COMPONENTE DETALLE EXPANDIDO ---
// Este componente se encarga de fetchear y mostrar los datos del empleado abierto
const EmployeeProfileExpanded = ({
  employee,
  companySlug
}: {
  employee: any;
  companySlug: string | undefined;
}) => {
  const [viewMode, setViewMode] = useState<"latest" | "all">("latest");
  const { data: profile, isLoading, isError } = useGetEmployeeTrainingProfile(
    companySlug,
    employee.dni
  );
  const courseSummaries = buildCourseSummaries(profile);
  const visibleCourses = viewMode === "latest"
    ? courseSummaries.slice(0, 1)
    : courseSummaries;

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-gray-800 rounded-b-lg">

      {/* Encabezado del empleado (Estilo Dashboard como en tu foto) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-blue-200 shadow-md">
            <AvatarImage
              src={employee?.photo_url ? `${employee.photo_url}?size=128` : ""}
              alt="Avatar"
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-600 text-white font-bold text-2xl">
              {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {employee.first_name} {employee.last_name}
            </h2>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className="font-mono">C.I: {employee.dni}</span>
              <span>•</span>
              <span>{employee.email || "Sin correo registrado"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido por curso */}
      {isLoading ? (
        <div className="flex w-full h-32 justify-center items-center">
          <Loader2 className="size-8 animate-spin text-blue-500" />
        </div>
      ) : isError ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <XCircle className="w-5 h-5" /> Ha ocurrido un error al cargar el perfil del empleado.
        </div>
      ) : profile ? (
        <div className="space-y-4">
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b1120] p-1">
            <Button
              type="button"
              size="sm"
              variant={viewMode === "latest" ? "default" : "ghost"}
              className="h-8"
              onClick={() => setViewMode("latest")}
            >
              Ultimo curso
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === "all" ? "default" : "ghost"}
              className="h-8"
              onClick={() => setViewMode("all")}
            >
              Todos los cursos
            </Button>
          </div>

          {visibleCourses.length > 0 ? (
            viewMode === "latest" ? (
              <CourseSummaryCard
                course={visibleCourses[0]}
                companySlug={companySlug}
              />
            ) : (
              <Accordion type="single" collapsible className="space-y-3">
                {visibleCourses.map((course) => (
                  <AccordionItem
                    key={course.key}
                    value={course.key}
                    className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-[#0b1120] px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 text-left">
                        <span className="font-semibold flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          {course.name}
                        </span>
                        {course.date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(course.date, "dd/MM/yyyy")}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CourseSummaryCard
                        course={course}
                        companySlug={companySlug}
                        showHeader={false}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )
          ) : (
            <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-lg py-10 text-center text-sm text-muted-foreground">
              No hay cursos registrados para este empleado.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
const ResumenCapacitacionPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: employees, isLoading, isError } = useGetEmployeesByCompany(selectedCompany?.slug);

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDni, setExpandedDni] = useState<string | null>(null);

  const filteredEmployees = employees?.filter((emp: any) => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const dni = emp.dni?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || dni.includes(search);
  });

  const toggleExpand = (dni: string) => {
    setExpandedDni(expandedDni === dni ? null : dni);
  };

  return (
    <ContentLayout title="Resumen de Capacitaciones">
      <div className="flex flex-col gap-6 w-full border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm bg-white dark:bg-[#0b1120]">

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-6 dark:border-gray-800">
          <div className="flex items-center gap-3 w-full">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                Directorio de Personal
              </h1>
              <p className="text-sm text-muted-foreground">
                Haz clic en un empleado para desplegar su historial de capacitación.
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              className="pl-9 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex w-full h-48 justify-center items-center">
            <Loader2 className="size-10 animate-spin text-blue-500" />
          </div>
        ) : isError ? (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-red-400 font-medium">
              Error al cargar la lista de empleados.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEmployees && filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp: any) => {
                const isExpanded = expandedDni === emp.dni;

                return (
                  <div
                    key={emp.id || emp.dni}
                    className={`border transition-all duration-200 rounded-lg ${isExpanded
                      ? "border-blue-300 dark:border-blue-800/50 shadow-md ring-1 ring-blue-100 dark:ring-blue-900/30"
                      : "border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-gray-700"
                      }`}
                  >
                    {/* Fila colapsada / Encabezado clicable */}
                    <div
                      className={`flex items-center justify-between p-4 cursor-pointer select-none bg-white dark:bg-[#0b1120] ${isExpanded ? "rounded-t-lg" : "rounded-lg"}`}
                      onClick={() => toggleExpand(emp.dni)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <AvatarImage
                            src={emp?.photo_url ? `${emp.photo_url}?size=64` : ""}
                            alt="Avatar"
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-sm">
                            {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {emp.first_name} {emp.last_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            DNI: {emp.dni}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-400 hover:text-blue-500 transition-colors">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {/* Contenido expandido */}
                    {isExpanded && (
                      <EmployeeProfileExpanded
                        employee={emp}
                        companySlug={selectedCompany?.slug}
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                No se encontraron empleados que coincidan con tu búsqueda.
              </div>
            )}
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default ResumenCapacitacionPage;
