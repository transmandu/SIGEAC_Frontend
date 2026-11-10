"use client";

import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  AreaChartIcon,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCheck,
  Clock,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Loader2,
  Percent,
  Search,
  UserCheck,
  UserRound,
  Users,
  UserX,
  X,
} from "lucide-react";

import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { DownloadCourseCertificatesDialog } from "@/components/dialogs/general/DownloadCourseCertificatesDialog";
import { PdfEndpointPreviewDialog } from "@/components/dialogs/shared/PdfEndpointPreviewDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/misc/EmptyState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCourseAttendanceList } from "@/hooks/curso/useGetCourseAttendanceList";
import { useGetCourseAttendanceStats } from "@/hooks/curso/useGetCourseAttendanceStats";
import {
  type CourseExamDocument,
  useGetCourseExamDocuments,
} from "@/hooks/curso/useGetCourseExamDocuments";
import { useGetCourseById } from "@/hooks/curso/useGetCourseById";
import { courseStatusLabelEsUpper } from "@/lib/cursos/statuses";
import { getExamDocumentUrl } from "@/lib/cursos/exam-documents";
import { formatCalendarDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";

const COURSE_TYPE_LABELS: Record<string, string> = {
  INICIAL: "Inicial",
  RECURRENTE: "Recurrente",
};

const courseTypeLabel = (value?: string | null) => {
  if (!value) return "N/A";
  const key = value.trim().toUpperCase();
  return COURSE_TYPE_LABELS[key] ?? key;
};

const courseStatusBadgeClass = (status?: string | null) => {
  switch (status?.trim().toUpperCase()) {
    case "CERRADO":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400";
    case "ABIERTO":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400";
    default:
      return "border-border/60 bg-muted text-muted-foreground";
  }
};

const formatTimeRange = (start?: string | null, end?: string | null) => {
  if (!start && !end) return "N/A";
  return `${start || "N/A"} - ${end || "N/A"}`;
};

const initialsOf = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";

/**
 * `origin-center` es la corrección importante: sin él, algunos navegadores
 * giran el SVG tomando la esquina superior izquierda como eje y el loader
 * parece desplazarse en lugar de girar sobre sí mismo.
 */
const Spinner = ({ className }: { className?: string }) => (
  <Loader2
    aria-hidden="true"
    className={cn("shrink-0 origin-center animate-spin", className)}
  />
);

const InfoItem = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5",
      className,
    )}
  >
    <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      <span>{label}</span>
    </div>
    <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
  </div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  hint,
  iconClassName,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  hint?: string;
  iconClassName?: string;
  children?: ReactNode;
}) => (
  <Card className="overflow-hidden">
    <CardContent className="flex h-full flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold leading-none tracking-tight tabular-nums text-foreground">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            iconClassName,
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      {children}
    </CardContent>
  </Card>
);

const CourseDetailSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Skeleton className="size-12 rounded-2xl sm:size-14" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-7 w-64 max-w-full" />
              <Skeleton className="h-4 w-48 max-w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>

    <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-28 rounded-xl" />
      ))}
    </div>

    <div className="grid gap-6 xl:grid-cols-3">
      <Skeleton className="h-96 rounded-xl xl:col-span-2" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  </div>
);

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
    <TooltipProvider>
      <div className="flex items-center gap-0.5">
        {docs.map((doc) => {
          const endpoint = getExamDocumentUrl(company, doc.document_path);
          if (!endpoint) return null;
          return (
            <Tooltip key={doc.exam_id}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setPreview({
                      endpoint,
                      fileName: `examen_${doc.exam_name}_${dni}`,
                      title: `${doc.exam_name} - ${employeeName}`,
                    })
                  }
                >
                  <Eye className="size-4" />
                  <span className="sr-only">
                    Ver examen {doc.exam_name} de {employeeName}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Ver examen {doc.exam_name}
              </TooltipContent>
            </Tooltip>
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
    </TooltipProvider>
  );
};

const ShowCourse = () => {
  const { course_id } = useParams<{ course_id: string }>();
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const [openCertificates, setOpenCertificates] = useState(false);
  const [certificateFocusDni, setCertificateFocusDni] = useState<string | null>(
    null,
  );
  const [employeeSearch, setEmployeeSearch] = useState("");

  const canDownloadCertificates = user?.roles?.some((role) =>
    ["JEFE_SMS", "ANALISTA_SMS", "SUPERUSER"].includes(role.name.toUpperCase()),
  );

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
    data: attendanceStats,
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

  const attendance = useMemo(() => attendanceList ?? [], [attendanceList]);

  const filteredAttendance = useMemo(() => {
    const term = employeeSearch.trim().toLowerCase();
    if (!term) return attendance;

    return attendance.filter((item) => {
      const fullName =
        `${item.employee.first_name} ${item.employee.last_name}`.toLowerCase();
      return (
        fullName.includes(term) ||
        item.employee_dni.toLowerCase().includes(term)
      );
    });
  }, [attendance, employeeSearch]);

  const totalParticipants = attendanceStats?.total ?? attendance.length;
  const attendedCount =
    attendanceStats?.attended ??
    attendance.filter((item) => Boolean(item.attended)).length;
  const notAttendedCount =
    attendanceStats?.not_attended ??
    Math.max(totalParticipants - attendedCount, 0);

  const rawAttendanceRate =
    attendanceStats?.attended_percentage ??
    (totalParticipants > 0 ? (attendedCount / totalParticipants) * 100 : 0);
  const rawNotAttendedRate =
    attendanceStats?.not_attended_percentage ??
    (totalParticipants > 0 ? (notAttendedCount / totalParticipants) * 100 : 0);
  const attendanceRate = Math.min(
    100,
    Math.max(0, Number(rawAttendanceRate) || 0),
  );
  const notAttendedRate = Math.min(
    100,
    Math.max(0, Number(rawNotAttendedRate) || 0),
  );

  const pieChartData = useMemo(
    () =>
      totalParticipants > 0
        ? [
            { name: "Asistentes", value: attendedCount },
            { name: "Inasistentes", value: notAttendedCount },
          ]
        : [],
    [totalParticipants, attendedCount, notAttendedCount],
  );

  const typeLabel = courseTypeLabel(course?.course_type);
  const durationLabel = course
    ? course.hours != null
      ? `${course.hours} ${course.hours === 1 ? "hora" : "horas"}`
      : course.duration || "N/A"
    : "N/A";

  return (
    <ContentLayout title="Detalles del Curso">
      <PageHeader className="mb-6" currentLabel={course?.name} />

      {isCourseLoading && <CourseDetailSkeleton />}

      {courseError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertTitle>No se pudo cargar el curso</AlertTitle>
          <AlertDescription>
            Revisa tu conexión y vuelve a intentarlo. Si el problema persiste,
            contacta al administrador del sistema.
          </AlertDescription>
        </Alert>
      )}

      {course && (
        <div className="space-y-6">
          {/* Resumen principal */}
          <Card className="overflow-hidden">
            <div className="h-1.5 w-full bg-linear-to-r from-primary via-primary/60 to-sky-400" />
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 sm:size-14">
                    <BookOpen className="size-6 sm:size-7" />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium",
                          courseStatusBadgeClass(course.status),
                        )}
                      >
                        {courseStatusLabelEsUpper(course.status)}
                      </Badge>
                      <Badge variant="secondary" className="font-medium">
                        {typeLabel}
                      </Badge>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {course.name || "Curso sin nombre"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {course.department?.name || "Sin departamento"}
                      {course.instructor
                        ? ` · Instructor: ${course.instructor}`
                        : " · Instructor no asignado"}
                    </p>
                  </div>
                </div>

                {canDownloadCertificates && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCertificateFocusDni(null);
                      setOpenCertificates(true);
                    }}
                    disabled={!attendance.length}
                    className="w-full shrink-0 sm:w-auto"
                  >
                    <Download className="mr-2 size-4" />
                    Descargar certificados
                  </Button>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoItem
                  icon={CalendarDays}
                  label="Fechas"
                  value={`${formatCalendarDate(course.start_date, "long")} — ${formatCalendarDate(course.end_date, "long")}`}
                />
                <InfoItem
                  icon={Clock}
                  label="Horario"
                  value={formatTimeRange(course.start_time, course.end_time)}
                />
                <InfoItem
                  icon={Building2}
                  label="Departamento"
                  value={course.department?.name || "N/A"}
                />
                <InfoItem
                  icon={UserRound}
                  label="Instructor"
                  value={course.instructor || "N/A"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Indicadores rápidos */}
          {isAttendanceListLoading && isAttendanceStatsLoading ? (
            <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
              <StatCard
                icon={Users}
                label="Participantes"
                value={totalParticipants}
                hint="Empleados inscritos"
                iconClassName="bg-primary/10 text-primary"
              />
              <StatCard
                icon={UserCheck}
                label="Asistentes"
                value={attendedCount}
                hint={
                  totalParticipants
                    ? `${Math.round(attendanceRate)}% del total`
                    : "Sin registros"
                }
                iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              />
              <StatCard
                icon={UserX}
                label="Inasistentes"
                value={notAttendedCount}
                hint={
                  totalParticipants
                    ? `${Math.round(notAttendedRate)}% del total`
                    : "Sin registros"
                }
                iconClassName="bg-rose-500/10 text-rose-600 dark:text-rose-400"
              />
              <StatCard
                icon={Percent}
                label="Asistencia"
                value={`${Math.round(attendanceRate)}%`}
                hint="Sobre el total inscrito"
                iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
              >
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>
              </StatCard>
            </div>
          )}

          {/* Información y distribución */}
          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </span>
                  <div>
                    <CardTitle className="text-base">
                      Información del curso
                    </CardTitle>
                    <CardDescription>
                      Descripción, detalles académicos y programación
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Descripción
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {course.description?.trim() ||
                      "Sin descripción registrada."}
                  </p>
                </div>

                <Separator />

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    icon={GraduationCap}
                    label="Tipo de curso"
                    value={typeLabel}
                  />
                  <InfoItem
                    icon={Clock}
                    label="Duración"
                    value={durationLabel}
                  />
                </div>

                <Separator />

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Programación
                  </p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        Inicio
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-foreground">
                        {formatCalendarDate(course.start_date, "long")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.start_time || "Hora no definida"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        <span className="size-2 rounded-full bg-rose-500" />
                        Fin
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-foreground">
                        {formatCalendarDate(course.end_date, "long")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.end_time || "Hora no definida"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      <AreaChartIcon className="size-4" />
                    </span>
                    <div>
                      <CardTitle className="text-base">Asistencia</CardTitle>
                      <CardDescription>Distribución del curso</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {totalParticipants} inscritos
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                {isAttendanceStatsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-2.5 w-full rounded-full" />
                    <Skeleton className="mx-auto size-48 rounded-full" />
                  </div>
                ) : isAttendanceStatsError && attendance.length === 0 ? (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertTitle>Sin estadísticas</AlertTitle>
                    <AlertDescription>
                      No se pudieron cargar las estadísticas de asistencia.
                    </AlertDescription>
                  </Alert>
                ) : totalParticipants === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="Sin participantes"
                    description="Este curso todavía no tiene empleados inscritos."
                    className="my-auto py-8"
                  />
                ) : (
                  <>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-4xl font-bold leading-none tracking-tight tabular-nums text-foreground">
                          {Math.round(attendanceRate)}%
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          de asistencia
                        </p>
                      </div>
                      <div className="space-y-0.5 text-right text-xs text-muted-foreground">
                        <p>
                          <span className="font-semibold text-foreground">
                            {attendedCount}
                          </span>{" "}
                          asistentes
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">
                            {notAttendedCount}
                          </span>{" "}
                          inasistentes
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${attendanceRate}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        Asistentes {Math.round(attendanceRate)}%
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-rose-500" />
                        Inasistentes {Math.round(notAttendedRate)}%
                      </span>
                    </div>

                    <div className="mt-2 h-56">
                      <PieChartComponent
                        data={pieChartData}
                        title=""
                        height={220}
                        colors={["#10b981", "#f43f5e"]}
                      />
                    </div>

                    {isAttendanceStatsError && (
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                        <AlertCircle className="size-3.5 shrink-0" />
                        Estadísticas calculadas con la lista de participantes.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Participantes */}
          <Card>
            <CardHeader className="gap-4 space-y-0 pb-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="size-4" />
                </span>
                <div>
                  <CardTitle className="text-base">Participantes</CardTitle>
                  <CardDescription>
                    {attendance.length}{" "}
                    {attendance.length === 1
                      ? "empleado inscrito"
                      : "empleados inscritos"}
                  </CardDescription>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={employeeSearch}
                    onChange={(event) => setEmployeeSearch(event.target.value)}
                    placeholder="Buscar por nombre o DNI"
                    aria-label="Buscar participantes"
                    disabled={attendance.length === 0}
                    className="h-9 w-full pl-8 sm:w-64"
                  />
                </div>

                {canDownloadCertificates && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCertificateFocusDni(null);
                      setOpenCertificates(true);
                    }}
                    disabled={!attendance.length}
                  >
                    <Download className="mr-2 size-4" />
                    Certificados
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {isAttendanceListLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : isAttendanceListError ? (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>No se pudo cargar la lista</AlertTitle>
                  <AlertDescription>
                    No fue posible obtener los empleados inscritos en este
                    curso. Vuelve a intentarlo en unos minutos.
                  </AlertDescription>
                </Alert>
              ) : attendance.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Sin participantes"
                  description="Este curso todavía no tiene empleados inscritos."
                  className="py-10"
                />
              ) : filteredAttendance.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Sin coincidencias"
                  description={`No se encontraron participantes para "${employeeSearch}".`}
                  className="py-10"
                />
              ) : (
                <div className="overflow-hidden rounded-lg border border-border/60">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="hover:bg-transparent">
                        <TableHead scope="col" className="min-w-56">
                          Participante
                        </TableHead>
                        <TableHead scope="col" className="w-40">
                          Asistencia
                        </TableHead>
                        <TableHead scope="col" className="w-28">
                          Examen
                        </TableHead>
                        {canDownloadCertificates && (
                          <TableHead scope="col" className="w-28 text-right">
                            Certificado
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredAttendance.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9 border border-border/60">
                                <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                                  {initialsOf(
                                    item.employee.first_name,
                                    item.employee.last_name,
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {item.employee.first_name}{" "}
                                  {item.employee.last_name}
                                </p>
                                <p className="font-mono text-[11px] text-muted-foreground">
                                  CI {item.employee_dni}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            {item.attended ? (
                              <Badge
                                variant="outline"
                                className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400"
                              >
                                <CheckCheck className="size-3.5" />
                                Asistió
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="gap-1 border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-400"
                              >
                                <X className="size-3.5" />
                                No asistió
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            {isExamDocumentsLoading ? (
                              <Spinner className="size-4 text-primary" />
                            ) : isExamDocumentsError ? (
                              <span className="text-xs text-destructive">
                                Error
                              </span>
                            ) : (
                              <ExamPreviewCell
                                company={selectedCompany?.slug}
                                docs={examDocuments?.[item.employee_dni]}
                                employeeName={`${item.employee.first_name} ${item.employee.last_name}`}
                                dni={item.employee_dni}
                              />
                            )}
                          </TableCell>

                          {canDownloadCertificates && (
                            <TableCell className="text-right">
                              {course && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => {
                                    setCertificateFocusDni(item.employee_dni);
                                    setOpenCertificates(true);
                                  }}
                                  title="Descargar certificado"
                                >
                                  <Download className="size-4" />
                                  <span className="sr-only">
                                    Descargar certificado de{" "}
                                    {item.employee.first_name}{" "}
                                    {item.employee.last_name}
                                  </span>
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {course && selectedCompany?.slug && attendanceList && (
        <DownloadCourseCertificatesDialog
          open={openCertificates}
          onOpenChange={setOpenCertificates}
          course={course}
          company={selectedCompany.slug}
          focusDni={certificateFocusDni}
          employees={attendanceList.map((attendanceItem) => ({
            dni: attendanceItem.employee_dni,
            first_name: attendanceItem.employee.first_name,
            last_name: attendanceItem.employee.last_name,
          }))}
        />
      )}
    </ContentLayout>
  );
};

export default ShowCourse;
