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

import {
  useGetSMSCoursesList,
  useGetEmployeesList,
} from "@/hooks/sms/useGetCertificates";
import { useGetCertificateImportStatus } from "@/hooks/sms/useGetCertificateImportStatus";
import { useBulkCreateSMSCertificates } from "@/actions/sms/certificates/actions";
import { toCalendarPayload } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { SMSCertificateImport } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CertificateImportProgress } from "./certificados/_components/CertificateImportProgress";
import type { CertificateImportPhase } from "./certificados/_components/types";

// PHP descarta en silencio los archivos que superan `max_file_uploads`, que
// por defecto es 20. Nos quedamos en ese límite y además acotamos el tamaño
// total para no chocar con `post_max_size`.
const MAX_FILES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 90 * 1024 * 1024;

interface BulkCreateCertificateFormProps {
  onClose: () => void;
  /** Avisa al diálogo que no debe cerrarse mientras el lote está en curso. */
  onRunningChange?: (running: boolean) => void;
}

interface SelectedFile {
  id: string;
  file: File;
  dni: string | null;
}

const buildId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

/** El contrato es `dni_nombre...`; se admite `V-12345678_nombre`. */
const extractDni = (fileName: string): string | null => {
  const baseName = fileName.replace(/\.[^/.]+$/, "").trim();
  const match = baseName.match(/^([A-Za-z]?[-\s]?\d{5,12})(?=[_\-\s]|$)/);

  return match ? match[1].trim() : null;
};

const normalizeDni = (dni: string) =>
  dni.replace(/[^0-9a-z]/gi, "").toUpperCase();

const isPdf = (file: File) =>
  file.type === "application/pdf" || /\.pdf$/i.test(file.name);

export const BulkCreateCertificateForm = ({
  onClose,
  onRunningChange,
}: BulkCreateCertificateFormProps) => {
  const params = useParams();
  const companySlug = params.company as string;
  const queryClient = useQueryClient();

  const { data: courses, isLoading: loadingCourses } =
    useGetSMSCoursesList(companySlug);
  const { data: employees, isLoading: loadingEmployees } =
    useGetEmployeesList(companySlug);
  const { mutateAsync: bulkCreate, isPending: isUploading } =
    useBulkCreateSMSCertificates();

  const [courseId, setCourseId] = useState("");
  const [completionDate, setCompletionDate] = useState(
    toCalendarPayload(new Date()) ?? "",
  );
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [phase, setPhase] = useState<CertificateImportPhase>("editing");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importId, setImportId] = useState<string | null>(null);
  const [initialImport, setInitialImport] =
    useState<SMSCertificateImport | null>(null);
  const finishedNotified = useRef(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: importStatus } = useGetCertificateImportStatus(
    companySlug,
    importId,
    phase === "processing",
  );

  const currentImport = importStatus ?? initialImport;

  // El estado del backend manda: en cuanto la importación termina, la UI pasa
  // a la vista de balance sin esperar a un setState dentro de un efecto.
  // `initialImport` ya trae el estado final cuando el backend procesó el lote
  // en la misma petición, así que no dependemos del primer sondeo.
  const currentStatus = (importStatus ?? initialImport)?.status;

  const effectivePhase: CertificateImportPhase =
    phase === "processing" &&
    (currentStatus === "completed" || currentStatus === "failed")
      ? "done"
      : phase;

  const employeeLookup = useMemo(() => {
    const byNormalized = new Map<string, any>();
    const byDigits = new Map<string, any>();
    // Si dos DNIs distintos comparten los mismos dígitos (V-123 y E-123), el
    // atajo por dígitos no puede decidir: se marca ambiguo y no se usa. El
    // backend aplica la misma regla.
    const ambiguousDigits = new Set<string>();

    for (const employee of employees ?? []) {
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
      queryClient.invalidateQueries({ queryKey: ["sms-certificates"] });

      if (currentImport.status === "failed") {
        toast.error("La importación falló", {
          description:
            currentImport.error ??
            "No se pudo completar el lote de certificados.",
        });
      } else if (currentImport.imported > 0) {
        toast.success("Lote procesado", {
          description: `${currentImport.imported} de ${currentImport.total} certificados fueron asignados.`,
        });
      } else {
        toast.warning("No se asignó ningún certificado", {
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

      if (!isPdf(file)) {
        rejected.push(`${file.name} (solo se aceptan PDF)`);
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
        id: buildId(),
        file,
        dni: extractDni(file.name),
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

    if (!courseId) {
      toast.error("Selecciona un curso", {
        description:
          "Todos los certificados del lote quedarán asociados a ese curso.",
      });
      return;
    }

    if (!completionDate) {
      toast.error("Selecciona la fecha de carga");
      return;
    }

    if (files.length === 0) {
      toast.error("Agrega al menos un PDF");
      return;
    }

    if (matchedCount === 0) {
      toast.error("Ningún archivo coincide con un empleado", {
        description:
          "Los nombres deben empezar con el DNI del empleado: dni_nombre.pdf",
      });
      return;
    }

    const formData = new FormData();
    formData.append("course_id", courseId);
    formData.append("completion_date", completionDate);
    formData.append("documents_count", String(files.length));
    files.forEach((item) => formData.append("documents[]", item.file));

    setPhase("uploading");
    setUploadProgress(0);
    finishedNotified.current = false;

    try {
      const started = await bulkCreate({
        company: companySlug,
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
      // useBulkCreateSMSCertificates ya muestra el aviso de error.
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
          courseName={currentImport?.course_name}
          completionDate={currentImport?.completion_date}
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
      <div className="grid gap-2">
        <Label>Curso / Capacitación</Label>
        <Select
          value={courseId}
          onValueChange={setCourseId}
          disabled={loadingCourses}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                loadingCourses ? "Cargando cursos..." : "Seleccione el curso"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {courses?.map((course: any) => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bulk-completion-date">Fecha de carga</Label>
        <Input
          id="bulk-completion-date"
          type="date"
          value={completionDate}
          onChange={(event) => setCompletionDate(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label>Archivos PDF</Label>
          <span className="text-[11px] text-muted-foreground">
            {files.length}/{MAX_FILES}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
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
              ? "Suelta los PDF aquí"
              : "Arrastra los certificados o haz clic para seleccionarlos"}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Solo PDF · máx. 10 MB por archivo · hasta {MAX_FILES} archivos · 90
            MB en total
          </p>
          <p className="mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
            El nombre debe empezar con el DNI: 12345678_nombre.pdf
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
                            : " · No se encontró el empleado"}
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
          Cada PDF se asigna por el DNI del nombre
        </p>
        <p className="mt-1 opacity-80">
          Ejemplo: <span className="font-mono">27506361_juan_perez.pdf</span>.
          El curso y la fecha se aplican a todo el lote. Al finalizar verás el
          balance de importados y fallidos.
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
            isUploading ||
            loadingCourses ||
            loadingEmployees ||
            files.length === 0 ||
            !courseId
          }
          className="min-w-40"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Enviando...
            </>
          ) : (
            `Cargar ${files.length || ""} certificado${files.length === 1 ? "" : "s"}`
          )}
        </Button>
      </div>
    </form>
  );
};
