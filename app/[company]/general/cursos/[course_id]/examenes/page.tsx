"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileCheck2,
  FilePlus2,
  FileText,
  Loader2,
  Lock,
  Save,
  Search,
  Trash2,
  UploadCloud,
  UserCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  useDeleteCourseExam,
  useUpdateCourseExamResult,
} from "@/actions/general/cursos/actions";
import { PdfEndpointPreviewDialog } from "@/components/dialogs/shared/PdfEndpointPreviewDialog";
import { CreateExamForm } from "@/components/forms/aerolinea/sms/CreateExamForm";
import { BulkCreateCourseExamForm } from "@/components/forms/general/examenes/BulkCreateCourseExamForm";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/misc/EmptyState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useGetCourseById } from "@/hooks/curso/useGetCourseById";
import { useGetCourseExamAttendance } from "@/hooks/curso/useGetCourseExamAttendance";
import { useGetCourseExams } from "@/hooks/curso/useGetCourseExams";
import { getExamDocumentUrl } from "@/lib/cursos/exam-documents";
import { courseStatusLabelEsUpper } from "@/lib/cursos/statuses";
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
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-400";
    default:
      return "border-border/60 bg-muted text-muted-foreground";
  }
};

const isTruthyFlag = (value: boolean | number | null | undefined) =>
  value === true || value === 1;

const hasScore = (value: string | number | null | undefined) =>
  value !== null && value !== undefined && String(value).trim() !== "";

const initialsOf = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";

type StatusFilter = "all" | "approved" | "failed" | "pending";

const StatCard = ({
  icon: Icon,
  label,
  value,
  hint,
  iconClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  hint?: string;
  iconClassName?: string;
}) => (
  <Card className="overflow-hidden">
    <CardContent className="flex items-start justify-between gap-3 p-4">
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
    </CardContent>
  </Card>
);

const CourseHeaderSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="h-1.5 w-full bg-muted" />
    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
      <div className="flex items-start gap-4">
        <Skeleton className="size-12 rounded-2xl sm:size-14" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="h-4 w-52 max-w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-40" />
    </CardContent>
  </Card>
);

const ExamsSkeleton = () => (
  <Card>
    <CardContent className="space-y-4 p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-28" />
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
    </CardContent>
  </Card>
);

const ResultsSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-24 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-9 w-full sm:w-72" />
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

const ExamAttendanceRow = ({
  attendance,
  company,
  examId,
  readOnly = false,
}: {
  attendance: any;
  company: string;
  examId: string;
  readOnly?: boolean;
}) => {
  const initialScore =
    attendance.score === null || attendance.score === undefined
      ? ""
      : String(attendance.score);

  const [score, setScore] = useState(initialScore);
  const [approved, setApproved] = useState(
    attendance.approved !== undefined && attendance.approved !== null
      ? isTruthyFlag(attendance.approved)
      : true,
  );
  const [file, setFile] = useState<File | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{
    endpoint: string;
    fileName: string;
    title: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateCourseExamResult } = useUpdateCourseExamResult();

  const employee = attendance.employee ?? {};
  const firstName = employee.first_name ?? "Empleado";
  const lastName = employee.last_name ?? "";
  const employeeName = `${firstName} ${lastName}`.trim();
  const dni = attendance.employee_dni ?? employee.dni ?? "—";
  const scoreInputId = `score-${String(dni).replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const isAttended = isTruthyFlag(attendance.attended);
  const canEdit = !readOnly && isAttended;

  const documentEndpoint = getExamDocumentUrl(
    company,
    attendance.document_path,
  );

  const handleSave = () => {
    const formData = new FormData();
    formData.append("_method", "PATCH");
    if (score !== "") formData.append("score", score.toString());
    formData.append("approved", approved ? "1" : "0");
    formData.append("exam_id", examId);
    formData.append("employee_dni", attendance.employee_dni);
    if (attendance.course_attendance_id) {
      formData.append(
        "course_attendance_id",
        attendance.course_attendance_id.toString(),
      );
    }
    if (file && isAttended) formData.append("document", file);

    updateCourseExamResult.mutate(
      {
        company,
        id: attendance.exam_attendance_id?.toString(),
        exam_id: examId,
        employee_dni: attendance.employee_dni,
        data: formData,
      },
      {
        onSuccess: () => {
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      },
    );
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <li className="grid gap-4 px-4 py-4 transition-colors hover:bg-muted/20 lg:grid-cols-[minmax(0,1.7fr)_110px_100px_140px_minmax(0,1.2fr)_auto] lg:items-center lg:gap-3">
        {/* Empleado */}
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-9 border border-border/60">
            <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
              {initialsOf(firstName, lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {employeeName}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              CI {dni}
            </p>
          </div>
        </div>

        {/* Asistencia */}
        <div className="flex items-center justify-between gap-3 lg:block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground lg:hidden">
            Asistencia
          </span>
          {isAttended ? (
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
        </div>

        {/* Calificación */}
        <div className="flex items-center justify-between gap-3 lg:block">
          <label
            htmlFor={scoreInputId}
            className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground lg:hidden"
          >
            Calificación
          </label>
          <Input
            id={scoreInputId}
            type="number"
            inputMode="decimal"
            min={0}
            placeholder="Ej: 85"
            className="h-9 w-24 text-center tabular-nums"
            value={score}
            disabled={!canEdit}
            onChange={(event) => setScore(event.target.value)}
            aria-label={`Calificación de ${employeeName}`}
          />
        </div>

        {/* Aprobado */}
        <div className="flex items-center justify-between gap-3 lg:block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground lg:hidden">
            Aprobado
          </span>
          <div className="flex items-center gap-2">
            <Switch
              checked={approved}
              disabled={!canEdit}
              onCheckedChange={setApproved}
              aria-label={`Marcar como aprobado a ${employeeName}`}
            />
            <span
              className={cn(
                "text-xs font-medium",
                approved
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground",
              )}
            >
              {approved ? "Sí" : "No"}
            </span>
          </div>
        </div>

        {/* Documento */}
        <div className="flex flex-col gap-2 lg:block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground lg:hidden">
            Documento
          </span>

          {!isAttended ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400"
              >
                No habilitado
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                No asistió al curso
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {file ? (
                <div className="flex items-center gap-1.5 text-xs text-foreground">
                  <FileCheck2 className="size-4 shrink-0 text-primary" />
                  <span className="max-w-40 truncate" title={file.name}>
                    {file.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6 shrink-0 text-muted-foreground"
                    disabled={!canEdit}
                    onClick={clearFile}
                    aria-label="Quitar archivo seleccionado"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : documentEndpoint ? (
                <button
                  type="button"
                  className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                  onClick={() =>
                    setPreviewDoc({
                      endpoint: documentEndpoint,
                      fileName: `examen_${attendance.employee_dni}`,
                      title: `Examen - ${employeeName}`,
                    })
                  }
                >
                  <Eye className="size-4" />
                  Documento adjunto
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Sin documento
                </span>
              )}

              {canEdit && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(event) =>
                      setFile(event.target.files?.[0] || null)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-fit gap-1.5 px-2.5 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="size-3.5" />
                    {file
                      ? "Cambiar"
                      : documentEndpoint
                        ? "Reemplazar"
                        : "Subir"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Acción */}
        <div className="flex items-center justify-end gap-2 lg:block">
          {canEdit ? (
            <Button
              type="button"
              size="sm"
              className="w-full gap-1.5 lg:w-auto"
              onClick={handleSave}
              disabled={updateCourseExamResult.isPending}
            >
              {updateCourseExamResult.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {updateCourseExamResult.isPending ? "Guardando..." : "Guardar"}
            </Button>
          ) : (
            <span className="text-[11px] font-medium text-muted-foreground">
              {readOnly ? "Solo lectura" : "—"}
            </span>
          )}
        </div>
      </li>

      {previewDoc && (
        <PdfEndpointPreviewDialog
          open={!!previewDoc}
          onOpenChange={(value) => {
            if (!value) setPreviewDoc(null);
          }}
          endpoint={previewDoc.endpoint}
          fileName={previewDoc.fileName}
          title={previewDoc.title}
          description="Revisa el examen antes de descargarlo."
        />
      )}
    </>
  );
};

const ManageExamsPage = () => {
  const { course_id } = useParams<{ course_id: string }>();
  const { selectedCompany } = useCompanyStore();
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [openCreateExam, setOpenCreateExam] = useState(false);
  const [openDeleteExam, setOpenDeleteExam] = useState(false);
  const [openBulkExam, setOpenBulkExam] = useState(false);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { deleteCourseExam } = useDeleteCourseExam();

  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = useGetCourseById({
    id: course_id,
    company: selectedCompany?.slug,
  });

  const {
    data: exams,
    isLoading: isExamsLoading,
    isError: isExamsError,
  } = useGetCourseExams({ course_id, company: selectedCompany?.slug });

  /**
   * El examen activo sale de la lista, no de un estado que pueda quedar
   * apuntando a un examen eliminado. Si el usuario aún no ha elegido uno, se
   * usa el primero: así la página abre con resultados en vez de un panel vacío.
   */
  const activeExamId = useMemo(() => {
    const ids = exams?.map((exam) => exam.id.toString()) ?? [];
    if (selectedExamId && ids.includes(selectedExamId)) return selectedExamId;
    return ids[0] ?? "";
  }, [exams, selectedExamId]);

  const selectedExam = useMemo(
    () => exams?.find((exam) => exam.id.toString() === activeExamId),
    [exams, activeExamId],
  );

  const {
    data: attendanceList,
    isLoading: isAttendanceListLoading,
    isError: isAttendanceListError,
  } = useGetCourseExamAttendance({
    company: selectedCompany?.slug,
    course_id,
    exam_id: activeExamId || undefined,
  });

  const isCourseClosed = course?.status === "CERRADO";

  const attendanceRows = useMemo(() => attendanceList ?? [], [attendanceList]);

  const handleExamChange = (value: string) => {
    setSelectedExamId(value);
    setEmployeeSearch("");
    setStatusFilter("all");
  };

  const stats = useMemo(() => {
    const total = attendanceRows.length;
    const attended = attendanceRows.filter((attendance: any) =>
      isTruthyFlag(attendance.attended),
    ).length;
    const graded = attendanceRows.filter((attendance: any) =>
      hasScore(attendance.score),
    ).length;
    const approved = attendanceRows.filter((attendance: any) =>
      isTruthyFlag(attendance.approved),
    ).length;

    return { total, attended, graded, approved };
  }, [attendanceRows]);

  const filteredAttendance = useMemo(() => {
    const term = employeeSearch.trim().toLowerCase();

    return attendanceRows.filter((attendance: any) => {
      const employee = attendance.employee ?? {};
      const fullName =
        `${employee.first_name ?? ""} ${employee.last_name ?? ""}`.toLowerCase();
      const dni = String(
        attendance.employee_dni ?? employee.dni ?? "",
      ).toLowerCase();

      if (term && !fullName.includes(term) && !dni.includes(term)) {
        return false;
      }

      const isApproved = isTruthyFlag(attendance.approved);
      const isGraded = hasScore(attendance.score);

      switch (statusFilter) {
        case "approved":
          return isApproved;
        case "failed":
          return isGraded && !isApproved;
        case "pending":
          return !isGraded;
        default:
          return true;
      }
    });
  }, [attendanceRows, employeeSearch, statusFilter]);

  const attendedRate = stats.total
    ? Math.round((stats.attended / stats.total) * 100)
    : 0;
  const gradedRate = stats.total
    ? Math.round((stats.graded / stats.total) * 100)
    : 0;
  const approvedRate = stats.graded
    ? Math.min(100, Math.round((stats.approved / stats.graded) * 100))
    : 0;

  const handleDeleteExam = async () => {
    if (!selectedExam) return;

    try {
      await deleteCourseExam.mutateAsync({
        company: selectedCompany!.slug,
        id: selectedExam.id.toString(),
      });

      setSelectedExamId("");
      setEmployeeSearch("");
      setStatusFilter("all");
      setOpenDeleteExam(false);
    } catch {
      // La mutación ya muestra el error; el diálogo queda abierto.
    }
  };

  const handleBulkOpenChange = useCallback(
    (next: boolean) => {
      if (!next && bulkRunning) return;
      setOpenBulkExam(next);
    },
    [bulkRunning],
  );

  const clearFilters = () => {
    setEmployeeSearch("");
    setStatusFilter("all");
  };

  return (
    <ContentLayout title="Gestionar Exámenes">
      <PageHeader className="mb-6" currentLabel="Exámenes" />

      <div className="space-y-6">
        {/* Encabezado del curso */}
        {isCourseLoading ? (
          <CourseHeaderSkeleton />
        ) : (
          <Card className="overflow-hidden">
            <div className="h-1.5 w-full bg-linear-to-r from-primary via-primary/60 to-sky-400" />
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 sm:size-14">
                    <ClipboardList className="size-6 sm:size-7" />
                  </div>

                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {course && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-medium",
                            courseStatusBadgeClass(course.status),
                          )}
                        >
                          {courseStatusLabelEsUpper(course.status)}
                        </Badge>
                      )}
                      {course?.course_type && (
                        <Badge variant="secondary" className="font-medium">
                          {courseTypeLabel(course.course_type)}
                        </Badge>
                      )}
                    </div>

                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      Gestión de exámenes
                    </h1>

                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {course?.name ?? "Curso"}
                      </span>
                      {course?.department?.name
                        ? ` · ${course.department.name}`
                        : ""}
                      {course?.instructor
                        ? ` · Instructor: ${course.instructor}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                  {isCourseClosed ? (
                    <Badge
                      variant="outline"
                      className="w-fit gap-1.5 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400"
                    >
                      <Lock className="size-3.5" />
                      Curso cerrado · solo lectura
                    </Badge>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setOpenCreateExam(true)}
                      className="w-full sm:w-auto"
                    >
                      <FilePlus2 className="mr-2 size-4" />
                      Agregar examen
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isCourseError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>No se pudo cargar la información del curso</AlertTitle>
            <AlertDescription>
              Revisa tu conexión y vuelve a intentarlo. Los exámenes se pueden
              gestionar igualmente, pero faltan los datos del curso.
            </AlertDescription>
          </Alert>
        )}

        {/* Selector de examen */}
        {isExamsLoading ? (
          <ExamsSkeleton />
        ) : isExamsError ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>No se pudieron cargar los exámenes</AlertTitle>
            <AlertDescription>
              Revisa tu conexión y vuelve a intentarlo. Si el problema persiste,
              contacta al administrador del sistema.
            </AlertDescription>
          </Alert>
        ) : !exams || exams.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <EmptyState
                icon={FileText}
                title="Aún no hay exámenes registrados"
                description="Registra el primer examen del curso para empezar a gestionar notas y documentos."
                action={
                  isCourseClosed ? undefined : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpenCreateExam(true)}
                    >
                      <FilePlus2 className="mr-2 size-4" />
                      Agregar primer examen
                    </Button>
                  )
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader className="gap-3 space-y-0 pb-4 sm:flex sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </span>
                  <div>
                    <CardTitle className="text-base">
                      Exámenes del curso
                    </CardTitle>
                    <CardDescription>
                      Selecciona un examen para gestionar sus resultados
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit shrink-0">
                  {exams.length} {exams.length === 1 ? "examen" : "exámenes"}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Select value={activeExamId} onValueChange={handleExamChange}>
                    <SelectTrigger className="h-11 w-full sm:flex-1">
                      <SelectValue placeholder="Seleccionar examen" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id.toString()}>
                          {exam.name} —{" "}
                          {formatCalendarDate(exam.exam_date, "date")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!isCourseClosed && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={!selectedExam || deleteCourseExam.isPending}
                      onClick={() => setOpenDeleteExam(true)}
                    >
                      <Trash2 className="size-4" />
                      <span className="hidden sm:inline">Eliminar</span>
                      <span className="sr-only sm:hidden">Eliminar examen</span>
                    </Button>
                  )}
                </div>

                {selectedExam && (
                  <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1.5">
                      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        <CalendarDays className="size-3.5 shrink-0" />
                        {formatCalendarDate(selectedExam.exam_date, "long")}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedExam.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedExam.description?.trim() ||
                          "Sin descripción registrada."}
                      </p>
                    </div>

                    {!isAttendanceListLoading && !isAttendanceListError && (
                      <Badge
                        variant="outline"
                        className="w-fit shrink-0 border-border/60 bg-background text-muted-foreground"
                      >
                        {stats.total}{" "}
                        {stats.total === 1 ? "inscrito" : "inscritos"}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resultados */}
            <Card>
              <CardHeader className="gap-4 space-y-0 pb-4 sm:flex sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <Users className="size-4" />
                  </span>
                  <div>
                    <CardTitle className="text-base">
                      Resultados del examen
                    </CardTitle>
                    <CardDescription>
                      Notas, aprobación y documentos de los participantes
                    </CardDescription>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isCourseClosed && (
                    <Badge
                      variant="outline"
                      className="gap-1.5 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400"
                    >
                      <Lock className="size-3.5" />
                      Solo lectura
                    </Badge>
                  )}

                  {!isAttendanceListLoading && !isAttendanceListError && (
                    <Badge variant="secondary">
                      {stats.total}{" "}
                      {stats.total === 1 ? "inscrito" : "inscritos"}
                    </Badge>
                  )}

                  {!isCourseClosed && selectedExam && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setOpenBulkExam(true)}
                    >
                      <UploadCloud className="mr-2 size-4" />
                      Carga masiva
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {isAttendanceListLoading ? (
                  <ResultsSkeleton />
                ) : isAttendanceListError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertTitle>
                      No se pudo cargar la lista de participantes
                    </AlertTitle>
                    <AlertDescription>
                      No fue posible obtener los empleados inscritos y sus
                      resultados. Vuelve a intentarlo en unos minutos.
                    </AlertDescription>
                  </Alert>
                ) : attendanceRows.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="Sin participantes inscritos"
                    description="Cuando haya empleados inscritos en el curso, aparecerán aquí para registrar sus exámenes."
                    className="py-10"
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                      <StatCard
                        icon={Users}
                        label="Inscritos"
                        value={stats.total}
                        hint="Empleados en el curso"
                        iconClassName="bg-primary/10 text-primary"
                      />
                      <StatCard
                        icon={UserCheck}
                        label="Asistentes"
                        value={stats.attended}
                        hint={`${attendedRate}% del total`}
                        iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      />
                      <StatCard
                        icon={FileCheck2}
                        label="Evaluados"
                        value={stats.graded}
                        hint={`${gradedRate}% con nota`}
                        iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                      />
                      <StatCard
                        icon={CheckCircle2}
                        label="Aprobados"
                        value={stats.approved}
                        hint={
                          stats.graded
                            ? `${approvedRate}% de los evaluados`
                            : "Sin evaluaciones"
                        }
                        iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      />
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="relative w-full sm:w-72">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={employeeSearch}
                          onChange={(event) =>
                            setEmployeeSearch(event.target.value)
                          }
                          placeholder="Buscar por nombre o DNI"
                          aria-label="Buscar participantes"
                          className="h-9 pl-8 pr-8"
                        />
                        {employeeSearch && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0.5 top-0.5 size-8 text-muted-foreground"
                            onClick={() => setEmployeeSearch("")}
                            aria-label="Limpiar búsqueda"
                          >
                            <X className="size-3.5" />
                          </Button>
                        )}
                      </div>

                      <Select
                        value={statusFilter}
                        onValueChange={(value) =>
                          setStatusFilter(value as StatusFilter)
                        }
                      >
                        <SelectTrigger
                          className="h-9 w-full sm:w-44"
                          aria-label="Filtrar por estado"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="approved">Aprobados</SelectItem>
                          <SelectItem value="failed">Desaprobados</SelectItem>
                          <SelectItem value="pending">Sin calificar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {filteredAttendance.length === 0 ? (
                      <EmptyState
                        icon={Search}
                        title="Sin resultados"
                        description="Ningún participante coincide con la búsqueda o el filtro seleccionado."
                        action={
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                          >
                            Limpiar filtros
                          </Button>
                        }
                        className="py-10"
                      />
                    ) : (
                      <div className="overflow-hidden rounded-xl border border-border/60">
                        <div className="hidden gap-3 border-b border-border/60 bg-muted/40 px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground lg:grid lg:grid-cols-[minmax(0,1.7fr)_110px_100px_140px_minmax(0,1.2fr)_auto]">
                          <span>Empleado</span>
                          <span>Asistencia</span>
                          <span>Calificación</span>
                          <span>Aprobado</span>
                          <span>Documento</span>
                          <span className="text-right">Acción</span>
                        </div>

                        <ul className="divide-y divide-border/60">
                          {filteredAttendance.map((attendance: any) => (
                            <ExamAttendanceRow
                              key={`${activeExamId}-${
                                attendance.row_id ?? attendance.employee_dni
                              }`}
                              attendance={attendance}
                              company={selectedCompany?.slug || ""}
                              examId={activeExamId}
                              readOnly={isCourseClosed}
                            />
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={openCreateExam} onOpenChange={setOpenCreateExam}>
        <DialogContent className="flex max-h-[calc(100dvh-1.5rem)] max-w-lg flex-col overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar examen al curso</DialogTitle>
            <DialogDescription>
              Registra el nombre, la fecha y una descripción breve del examen.
            </DialogDescription>
          </DialogHeader>
          <CreateExamForm
            courseId={course_id}
            onClose={() => setOpenCreateExam(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openBulkExam} onOpenChange={handleBulkOpenChange}>
        <DialogContent className="flex max-h-[calc(100dvh-1.5rem)] max-w-2xl flex-col overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargar exámenes en lote</DialogTitle>
            <DialogDescription>
              Asigna cada archivo a un empleado inscrito usando el DNI del
              nombre.
            </DialogDescription>
          </DialogHeader>
          {selectedExam && (
            <BulkCreateCourseExamForm
              examId={selectedExam.id.toString()}
              examName={selectedExam.name}
              courseId={course_id}
              onClose={() => setOpenBulkExam(false)}
              onRunningChange={setBulkRunning}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={openDeleteExam}
        onOpenChange={(next) => {
          if (!deleteCourseExam.isPending) setOpenDeleteExam(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar examen</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el examen{" "}
              <span className="font-semibold text-foreground">
                {selectedExam?.name}
              </span>{" "}
              junto con los resultados y documentos de los participantes. Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCourseExam.isPending}>
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              onClick={handleDeleteExam}
              disabled={deleteCourseExam.isPending || !selectedExam}
            >
              {deleteCourseExam.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {deleteCourseExam.isPending ? "Eliminando..." : "Eliminar examen"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ContentLayout>
  );
};

export default ManageExamsPage;
