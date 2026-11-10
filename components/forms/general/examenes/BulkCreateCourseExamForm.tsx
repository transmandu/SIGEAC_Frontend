"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  FileCheck2,
  FileText,
  Loader2,
  Trash2,
  UploadCloud,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useBulkCreateCourseExams } from "@/actions/general/cursos/actions";
import { useGetCourseAttendanceList } from "@/hooks/curso/useGetCourseAttendanceList";
import { useGetCourseExamImportStatus } from "@/hooks/curso/useGetCourseExamImportStatus";
import { cn } from "@/lib/utils";
import type { CourseExamImport } from "@/types";
import {
  buildFileId,
  extractDniFromFileName,
  isAllowedExamFile,
  normalizeDni,
} from "@/lib/cursos/exam-bulk";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CertificateImportProgress } from "@/components/forms/general/certificados/_components/CertificateImportProgress";
import type { CertificateImportPhase } from "@/components/forms/general/certificados/_components/types";

// PHP descarta en silencio los archivos que superan `max_file_uploads` (20 por
// defecto). Nos quedamos en ese límite y acotamos también el tamaño total para
// no chocar con `post_max_size`.
const MAX_FILES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 90 * 1024 * 1024;

interface BulkCreateCourseExamFormProps {
  examId: string;
  examName: string;
  courseId: string;
  onClose: () => void;
  /** Avisa al diálogo que no debe cerrarse mientras el lote está en curso. */
  onRunningChange?: (running: boolean) => void;
}

interface SelectedFile {
  id: string;
  file: File;
  dni: string | null;
}

interface AttendanceEmployee {
  dni?: string;
  first_name?: string;
  last_name?: string;
}

export const BulkCreateCourseExamForm = ({
  examId,
  examName,
  courseId,
  onClose,
  onRunningChange,
}: BulkCreateCourseExamFormProps) => {
  const params = useParams();
  const companySlug = params.company as string;
  const queryClient = useQueryClient();

  const { data: attendanceList, isLoading: loadingEmployees } =
    useGetCourseAttendanceList({ company: companySlug, course_id: courseId });
  const { mutateAsync: bulkCreate, isPending: isUploading } =
    useBulkCreateCourseExams();

  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [phase, setPhase] = useState<CertificateImportPhase>("editing");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importId, setImportId] = useState<string | null>(null);
  const [initialImport, setInitialImport] = useState<CourseExamImport | null>(
    null,
  );
  const finishedNotified = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: importStatus } = useGetCourseExamImportStatus(
    companySlug,
    importId,
    phase === "processing",
  );

  const currentImport = importStatus ?? initialImport;
  const currentStatus = currentImport?.status;

  const effectivePhase: CertificateImportPhase =
    phase === "processing" &&
    (currentStatus === "completed" || currentStatus === "failed")
      ? "done"
      : phase;

  const employees = useMemo(() => {
    const seen = new Set<string>();

    return (attendanceList ?? [])
      .filter((attendance) => Boolean(attendance.attended))
      .map((attendance) => attendance.employee as AttendanceEmployee | null)
      .filter((employee): employee is AttendanceEmployee => !!employee?.dni)
      .filter((employee) => {
        const dni = normalizeDni(String(employee.dni));

        if (seen.has(dni)) return false;

        seen.add(dni);
        return true;
      });
  }, [attendanceList]);

  const employeeLookup = useMemo(() => {
    const byNormalized = new Map<string, AttendanceEmployee>();
    const byDigits = new Map<string, AttendanceEmployee>();
    // Si dos DNIs distintos comparten los mismos dígitos (V-123 y E-123), el
    // atajo por dígitos no puede decidir: se marca ambiguo y no se usa. El
    // backend aplica la misma regla.
    const ambiguousDigits = new Set<string>();

    for (const employee of employees) {
      const normalized = normalizeDni(String(employee.dni ?? ""));
      if (normalized) byNormalized.set(normalized, employee);

      const digits = String(employee.dni ?? "").replace(/\D/g, "");

      if (!digits || ambiguousDigits.has(digits)) continue;

      if (byDigits.has(digits)) {
        ambiguousDigits.add(digits);
        byDigits.delete(digits);
      } else {
        byDigits.set(digits, employee);
      }
    }

    return { byNormalized, byDigits };
  }, [employees]);

  const matchEmployee = useCallback(
    (dni: string | null) => {
      if (!dni) return null;

      const normalized = normalizeDni(dni);
      const direct = employeeLookup.byNormalized.get(normalized);
      if (direct) return direct;

      const withoutPrefix = normalized.replace(/^[A-Z]/, "");
      const prefixed = employeeLookup.byNormalized.get(withoutPrefix);
      if (prefixed) return prefixed;

      const digits = dni.replace(/\D/g, "");
      return employeeLookup.byDigits.get(digits) ?? null;
    },
    [employeeLookup],
  );

  const matchedCount = useMemo(
    () => files.filter((item) => matchEmployee(item.dni)).length,
    [files, matchEmployee],
  );

  const isRunning =
    effectivePhase === "uploading" || effectivePhase === "processing";

  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  useEffect(() => {
    return () => onRunningChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentImport || finishedNotified.current) return;

    if (
      currentImport.status === "completed" ||
      currentImport.status === "failed"
    ) {
      finishedNotified.current = true;
      queryClient.invalidateQueries({ queryKey: ["course-exam-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["course-exams"] });
      queryClient.invalidateQueries({ queryKey: ["course-exam-documents"] });

      if (currentImport.status === "failed") {
        toast.error("La importación falló", {
          description:
            currentImport.error ?? "No se pudo completar el lote de exámenes.",
        });
      } else if (currentImport.imported > 0) {
        toast.success("Lote procesado", {
          description: `${currentImport.imported} de ${currentImport.total} exámenes fueron asignados.`,
        });
      } else {
        toast.warning("No se asignó ningún examen", {
          description:
            "Revisa el detalle de los archivos al final del resumen.",
        });
      }
    }
  }, [currentImport, queryClient]);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const selected = Array.from(fileList);
    const nextFiles: SelectedFile[] = [];
    const rejected: string[] = [];
    let totalSize = files.reduce((sum, item) => sum + item.file.size, 0);

    for (const file of selected) {
      if (files.length + nextFiles.length >= MAX_FILES) {
        rejected.push(`${file.name} (máximo ${MAX_FILES} archivos)`);
        continue;
      }

      if (!isAllowedExamFile(file)) {
        rejected.push(`${file.name} (solo PDF, JPG, PNG o WebP)`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        rejected.push(`${file.name} (supera los 10 MB)`);
        continue;
      }

      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        rejected.push(`${file.name} (el lote supera los 90 MB en total)`);
        continue;
      }

      const duplicate = [...files, ...nextFiles].some(
        (item) =>
          item.file.name === file.name &&
          item.file.size === file.size &&
          item.file.lastModified === file.lastModified,
      );

      if (duplicate) continue;

      totalSize += file.size;

      nextFiles.push({
        id: buildFileId(),
        file,
        dni: extractDniFromFileName(file.name),
      });
    }

    if (rejected.length > 0) {
      toast.error(
        rejected.length === 1
          ? "Un archivo no se agregó"
          : `${rejected.length} archivos no se agregaron`,
        {
          description: rejected.slice(0, 3).join(" · "),
        },
      );
    }

    if (nextFiles.length > 0) {
      setFiles((previous) => [...previous, ...nextFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles((previous) => previous.filter((item) => item.id !== id));
  };

  const resetForAnotherBatch = () => {
    setFiles([]);
    setPhase("editing");
    setUploadProgress(0);
    setImportId(null);
    setInitialImport(null);
    finishedNotified.current = false;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (files.length === 0) {
      toast.error("Agrega al menos un archivo");
      return;
    }

    if (matchedCount === 0) {
      toast.error("Ningún archivo coincide con un empleado con asistencia", {
        description:
          "Los nombres deben empezar con el DNI del empleado: dni_nombre_apellido.pdf",
      });
      return;
    }

    const formData = new FormData();
    formData.append("documents_count", String(files.length));
    files.forEach((item) => formData.append("documents[]", item.file));

    setPhase("uploading");
    setUploadProgress(0);
    finishedNotified.current = false;

    try {
      const started = await bulkCreate({
        company: companySlug,
        exam_id: examId,
        data: formData,
        onUploadProgress: (event) => {
          if (!event.total) return;
          setUploadProgress(
            Math.min(100, Math.round((event.loaded / event.total) * 100)),
          );
        },
      });

      setInitialImport(started);
      setImportId(started.id);
      setPhase("processing");
    } catch {
      // useBulkCreateCourseExams ya muestra el aviso de error.
      setPhase("editing");
    }
  };

  const percentage =
    effectivePhase === "uploading"
      ? uploadProgress
      : (currentImport?.percentage ?? (effectivePhase === "done" ? 100 : 0));

  const total = currentImport?.total ?? files.length;
  const imported = currentImport?.imported ?? 0;
  const failed = currentImport?.failed ?? 0;

  if (effectivePhase !== "editing") {
    const results = currentImport?.results ?? [];

    return (
      <div className="space-y-4 py-2">
        <CertificateImportProgress
          phase={effectivePhase}
          percentage={percentage}
          total={total}
          imported={imported}
          failed={failed}
          processed={currentImport?.processed ?? 0}
          courseName={examName}
          error={currentImport?.error}
          importFailed={currentImport?.status === "failed"}
          results={results}
        />

        <div className="flex justify-end gap-3 border-t pt-4">
          {effectivePhase === "done" ? (
            <>
              <Button variant="outline" onClick={resetForAnotherBatch}>
                Cargar otro lote
              </Button>
              <Button onClick={onClose}>Cerrar</Button>
            </>
          ) : (
            <Button disabled>
              {effectivePhase === "uploading" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Procesando...
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-2">
      <div className="rounded-md border bg-accent/20 px-3 py-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Examen
        </p>
        <p className="truncate text-sm font-semibold">{examName}</p>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label>Archivos de examen</Label>
          <span className="text-[11px] text-muted-foreground">
            {files.length}/{MAX_FILES}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
          multiple
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            addFiles(event.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "cursor-pointer rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
            isDragging
              ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/20"
              : "border-border bg-background hover:border-blue-400 hover:bg-accent/20",
          )}
        >
          <UploadCloud className="mx-auto mb-2 size-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            {isDragging
              ? "Suelta los exámenes aquí"
              : "Arrastra los exámenes o haz clic para seleccionarlos"}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            PDF, JPG, PNG o WebP · máx. 10 MB por archivo · hasta {MAX_FILES}{" "}
            archivos · 90 MB en total
          </p>
          <p className="mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
            El nombre debe empezar con el DNI: 12345678_nombre_apellido.pdf
          </p>
        </div>

        {files.length > 0 && (
          <div className="rounded-md border">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <UserCheck className="size-3.5" />
                  {matchedCount} con empleado
                </span>
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <UserX className="size-3.5" />
                  {files.length - matchedCount} sin coincidencia
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={(event) => {
                  event.stopPropagation();
                  setFiles([]);
                }}
              >
                <Trash2 className="mr-1 size-3.5" />
                Quitar todos
              </Button>
            </div>

            <ScrollArea className="h-56">
              <div className="flex flex-col divide-y">
                {files.map((item) => {
                  const employee = matchEmployee(item.dni);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 px-3 py-2"
                    >
                      <FileText
                        className={cn(
                          "size-4 shrink-0",
                          employee
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {item.file.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.dni
                            ? `DNI ${item.dni}`
                            : "Sin DNI en el nombre"}
                          {employee
                            ? ` · ${employee.last_name}, ${employee.first_name}`
                            : " · No se encontró un empleado con asistencia"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0"
                        onClick={() => removeFile(item.id)}
                        aria-label={`Quitar ${item.file.name}`}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50/60 p-3 text-[11px] text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-200">
        <p className="flex items-center gap-1 font-semibold">
          <FileCheck2 className="size-3.5" />
          Cada archivo se asigna por el DNI del nombre
        </p>
        <p className="mt-1 opacity-80">
          Ejemplo: <span className="font-mono">27506361_juan_perez.pdf</span>.
          Solo se aceptan empleados activos con asistencia registrada en este
          curso. Al finalizar verás el balance de importados y fallidos.
        </p>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isUploading || loadingEmployees}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            isUploading || loadingEmployees || files.length === 0 || !examId
          }
          className="min-w-40"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Enviando...
            </>
          ) : (
            `Cargar ${files.length || ""} examen${files.length === 1 ? "" : "es"}`
          )}
        </Button>
      </div>
    </form>
  );
};
