"use client";

import { useCreateErrorReport } from "@/actions/sistema/reportes/actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dialogs/shared/FormDialogContent";
import { zodResolver } from "@/lib/zod-resolver";
import {
  Bug,
  CircleHelp,
  HeartHandshake,
  ImagePlus,
  Lightbulb,
  Loader2,
  Send,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  ERROR_REPORT_MODULES,
  getAvailableErrorReportModules,
  getDefaultErrorReportModule,
} from "@/lib/errorReportModules";
import { ERROR_REPORT_SEVERITIES } from "@/lib/errorReportSeverity";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { cn } from "@/lib/utils";
import {
  FieldLabelRow,
  hintClass,
  labelClass,
  numericFieldClass,
  selectTriggerClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import type { ErrorReportDraft } from "@/stores/ErrorReportDraftStore";
import { useResettingState } from "@/hooks/useResettingState";

const MAX_DESCRIPTION = 2000;

// Lo mismo que valida el backend (`images.*`): mejor avisar al elegir que
// fallar al enviar.
const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formSchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, {
      message:
        "Describa el problema o la solicitud con al menos 10 caracteres.",
    })
    .max(MAX_DESCRIPTION, {
      message: `La descripción no puede superar los ${MAX_DESCRIPTION} caracteres.`,
    }),
  module: z.string().min(1, {
    message: "Seleccione el módulo relacionado.",
  }),
  severity: z.string().optional(),
  http_status: z
    .string()
    .optional()
    .refine(
      (value) => !value || (Number(value) >= 100 && Number(value) <= 599),
      { message: "Ingrese un código entre 100 y 599." },
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface FormProps {
  onClose: () => void;
  /** Muestra severidad y código HTTP, solo disponibles para el superuser desde el panel de gestión. */
  showAdvancedFields?: boolean;
  /** Reporte que nace de un aviso de error: llega con el contexto ya cargado. */
  draft?: ErrorReportDraft;
}

/* ───────────────────────── Tipo de solicitud ───────────────────────── */

type ReportKind = "bug" | "suggestion" | "question";

const REPORT_KINDS: {
  value: ReportKind;
  label: string;
  hint: string;
  icon: LucideIcon;
  tag: string;
}[] = [
  {
    value: "bug",
    label: "Error",
    hint: "Algo no funciona",
    icon: Bug,
    tag: "[ERROR]",
  },
  {
    value: "suggestion",
    label: "Sugerencia",
    hint: "Una mejora",
    icon: Lightbulb,
    tag: "[SUGERENCIA]",
  },
  {
    value: "question",
    label: "Duda",
    hint: "Una consulta",
    icon: CircleHelp,
    tag: "[DUDA]",
  },
];

/* ───────────────────────── Opciones de clasificación (panel de gestión) ───────────────────────── */

const SEVERITY_ACTIVE_CLASS: Record<string, string> = {
  LOW: "border-sky-500 bg-sky-500 text-white",
  MEDIUM: "border-amber-500 bg-amber-500 text-white",
  HIGH: "border-orange-500 bg-orange-500 text-white",
  CRITICAL: "border-rose-500 bg-rose-500 text-white",
};

const HTTP_QUICK_PICKS = [
  { value: "500", label: "500 Internal" },
  { value: "404", label: "404 Not Found" },
  { value: "401", label: "401 Auth" },
  { value: "400", label: "400 Bad Request" },
];

const optionButtonClass = (active: boolean, activeClass: string) =>
  cn(
    "h-8 select-none rounded-lg border px-3 text-xs font-medium transition-colors",
    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40",
    active
      ? activeClass
      : "border-slate-300/70 bg-background text-muted-foreground hover:border-slate-400 hover:text-foreground dark:border-slate-600/60",
  );

const fileKey = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}`;

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function CreateErrorReportForm({
  onClose,
  showAdvancedFields = false,
  draft,
}: FormProps) {
  const { createErrorReport } = useCreateErrorReport();
  const { user } = useAuth();
  const { selectedCompany } = useCompanyStore();
  const fieldId = useId();
  const [images, setImages] = useState<File[]>([]);
  const [reportKind, setReportKind] = useState<ReportKind>("bug");
  const [isDragging, setIsDragging] = useState(false);
  // dragenter/dragleave se disparan también al cruzar los hijos de la zona:
  // contar las entradas evita que el resaltado parpadee.
  const dragDepth = useRef(0);

  // El panel de gestión (superuser) siempre puede reportar/reclasificar cualquier módulo.
  const availableModules = showAdvancedFields
    ? ERROR_REPORT_MODULES
    : getAvailableErrorReportModules(selectedCompany?.modules);

  // Un reporte que nace de un aviso ya sabe en qué pantalla ocurrió.
  const draftModule = availableModules.some(
    (option) => option.value === draft?.module,
  )
    ? draft?.module
    : undefined;

  const defaultModule = showAdvancedFields
    ? ""
    : (draftModule ?? getDefaultErrorReportModule(user?.roles) ?? "");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: draft?.description ?? "",
      module: defaultModule,
      severity: "",
      http_status: "",
    },
  });

  const showSeverity = showAdvancedFields;
  const showHttpStatus = showAdvancedFields && reportKind === "bug";
  const [customHttpOpen, setCustomHttpOpen] = useResettingState(false, [
    showHttpStatus,
  ]);
  const severity = useWatch({ control: form.control, name: "severity" });
  const httpStatus = useWatch({ control: form.control, name: "http_status" });
  const description = useWatch({ control: form.control, name: "description" });

  const previews = useMemo(
    () => images.map((image) => URL.createObjectURL(image)),
    [images],
  );

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [previews]);

  useEffect(() => {
    if (!showSeverity) form.setValue("severity", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSeverity]);

  useEffect(() => {
    if (!showHttpStatus) {
      form.setValue("http_status", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHttpStatus]);

  const addImages = (incoming: File[]) => {
    if (incoming.length === 0) return;

    const accepted: File[] = [];
    const rejected: string[] = [];
    const known = new Set(images.map(fileKey));
    let free = MAX_IMAGES - images.length;

    for (const file of incoming) {
      if (known.has(fileKey(file))) continue;

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        rejected.push(`${file.name}: solo JPG, PNG o WebP`);
      } else if (file.size > MAX_IMAGE_BYTES) {
        rejected.push(`${file.name}: supera los 5 MB`);
      } else if (free <= 0) {
        rejected.push(`${file.name}: máximo ${MAX_IMAGES} imágenes`);
      } else {
        accepted.push(file);
        known.add(fileKey(file));
        free -= 1;
      }
    }

    if (accepted.length > 0) setImages((prev) => [...prev, ...accepted]);

    if (rejected.length > 0) {
      toast.warning("No se agregaron algunas imágenes", {
        description: rejected.slice(0, 3).join(" · "),
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    const tag = REPORT_KINDS.find((k) => k.value === reportKind)?.tag;
    const text = tag ? `${tag} ${values.description}` : values.description;

    try {
      await createErrorReport.mutateAsync({
        description: text,
        module: values.module,
        severity:
          showSeverity && values.severity
            ? (values.severity as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")
            : undefined,
        http_status:
          showHttpStatus && values.http_status
            ? Number(values.http_status)
            : undefined,
        // Un reporte que nace de un aviso lleva el código HTTP del fallo aunque
        // el usuario normal no vea ese campo.
        ...(draft?.httpStatus !== undefined && !showHttpStatus
          ? { http_status: draft.httpStatus }
          : {}),
        error_reference: draft?.errorReference,
        error_code: draft?.errorCode,
        page_url: draft?.pageUrl,
        error_context: draft?.context
          ? JSON.stringify({
              ...draft.context,
              user_agent: draft.context.userAgent,
              userAgent: undefined,
            })
          : undefined,
        // Deja constancia de desde qué empresa se reportó: sin esto, un
        // soporte asignado por compañía no puede filtrar lo que le toca.
        company: selectedCompany?.slug,
        images: images.length > 0 ? images : undefined,
      });
    } catch {
      // El toast de error ya lo muestra useCreateErrorReport (onError); aqui
      // solo se evita que el rechazo de la promesa quede sin manejar.
      return;
    }
    onClose();
  };

  const isPending = createErrorReport.isPending;
  const imagesFull = images.length >= MAX_IMAGES;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        // Capturas pegadas desde el portapapeles (Ctrl+V): el texto pegado no
        // trae archivos, así que no interfiere con escribir.
        onPaste={(event) => {
          const files = Array.from(event.clipboardData.files);
          if (files.length > 0) addImages(files);
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        {/* ───────── Encabezado ───────── */}
        <FormDialogHeader
          icon={HeartHandshake}
          title="Reportar un problema o sugerencia"
          description="Cuéntenos qué error encontró o qué le gustaría que mejoremos en SIGEAC."
        />

        {/* ───────── Cuerpo (desplazable) ───────── */}
        <FormDialogBody className="space-y-5">
          {draft && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="min-w-0 space-y-0.5 text-sm">
                <p className="font-medium">{draft.errorTitle}</p>
                {draft.errorReference && (
                  <p className={hintClass}>
                    Código de error{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {draft.errorReference}
                    </span>
                    . Viaja con el reporte: no hace falta que lo copie.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className={labelClass} id={`${fieldId}-kind-label`}>
              Tipo de solicitud
            </p>
            <RadioGroup
              value={reportKind}
              onValueChange={(value) => setReportKind(value as ReportKind)}
              aria-labelledby={`${fieldId}-kind-label`}
              className="grid-cols-3 gap-2"
            >
              {REPORT_KINDS.map(({ value, label, hint, icon: Icon }) => (
                <label
                  key={value}
                  htmlFor={`${fieldId}-${value}`}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-slate-300/70 bg-background px-2 py-2.5 text-center transition-colors sm:flex-row sm:gap-3 sm:px-3 sm:text-left dark:border-slate-600/60",
                    "hover:border-primary/40 hover:bg-primary/3",
                    "has-focus-visible:ring-2 has-focus-visible:ring-primary/40",
                    "has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/6",
                  )}
                >
                  <RadioGroupItem
                    id={`${fieldId}-${value}`}
                    value={value}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors",
                      reportKind === value && "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium leading-tight">
                      {label}
                    </span>
                    <span className="block text-xs text-muted-foreground max-sm:hidden">
                      {hint}
                    </span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <FormField
            control={form.control}
            name="module"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Módulo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Seleccione el módulo relacionado..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableModules.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FieldLabelRow
                  action={
                    <span
                      className={cn(
                        hintClass,
                        "tabular-nums",
                        (description?.length ?? 0) > MAX_DESCRIPTION &&
                          "text-destructive",
                      )}
                    >
                      {description?.length ?? 0}/{MAX_DESCRIPTION}
                    </span>
                  }
                >
                  <FormLabel className={labelClass}>Descripción</FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Textarea
                    placeholder="Describa el error que encontró o la solicitud que desea hacer..."
                    rows={5}
                    className={cn(textareaClass, "min-h-32")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ───────── Evidencias ───────── */}
          <div className="space-y-2">
            <FieldLabelRow
              action={
                <span className={cn(hintClass, "tabular-nums")}>
                  {images.length}/{MAX_IMAGES}
                </span>
              }
            >
              <p className={labelClass}>
                Evidencias{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </p>
            </FieldLabelRow>

            <div
              onDragEnter={(event) => {
                if (!event.dataTransfer.types.includes("Files")) return;
                dragDepth.current += 1;
                setIsDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => {
                dragDepth.current = Math.max(0, dragDepth.current - 1);
                if (dragDepth.current === 0) setIsDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                dragDepth.current = 0;
                setIsDragging(false);
                addImages(Array.from(event.dataTransfer.files));
              }}
              className={cn(
                "rounded-lg border border-dashed p-3 transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-slate-300/70 bg-slate-50/40 dark:border-slate-600/60 dark:bg-slate-900/20",
              )}
            >
              {images.length > 0 && (
                <ul className="mb-3 flex flex-wrap gap-2">
                  {previews.map((preview, index) => (
                    <li
                      key={preview}
                      className="relative size-20"
                      title={`${images[index].name} · ${formatSize(images[index].size)}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt={`Imagen ${index + 1}`}
                        className="size-20 rounded-lg border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        aria-label={`Quitar imagen ${index + 1}`}
                        className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-xs transition-colors hover:border-destructive/40 hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <label
                htmlFor={`${fieldId}-images`}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md px-3 py-4 text-center text-muted-foreground transition-colors",
                  "hover:text-primary has-focus-visible:ring-2 has-focus-visible:ring-primary/40",
                  imagesFull && "pointer-events-none opacity-50",
                )}
              >
                <ImagePlus className="size-6" />
                <span className="text-sm font-medium">
                  {imagesFull
                    ? "Alcanzó el máximo de imágenes"
                    : "Arrastre capturas, pegue con Ctrl+V o haga clic para agregar"}
                </span>
                <span className="text-xs">
                  JPG, PNG o WebP · hasta 5 MB cada una
                </span>
              </label>
              <input
                id={`${fieldId}-images`}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                multiple
                disabled={imagesFull}
                className="sr-only"
                onChange={(event) => {
                  addImages(Array.from(event.target.files ?? []));
                  event.target.value = "";
                }}
              />
            </div>
          </div>

          {/* ───────── Severidad (panel de gestión) ───────── */}
          {showSeverity && (
            <div className="space-y-2 border-t pt-4">
              <p className={labelClass}>Severidad</p>
              <div className="flex flex-wrap gap-1.5">
                {ERROR_REPORT_SEVERITIES.map((option) => {
                  const active = severity === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        form.setValue("severity", active ? "" : option.value, {
                          shouldValidate: true,
                        })
                      }
                      className={optionButtonClass(
                        active,
                        SEVERITY_ACTIVE_CLASS[option.value],
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ───────── Código HTTP (panel de gestión, solo tipo Error) ───────── */}
          {showHttpStatus && (
            <div className="space-y-2">
              <p className={labelClass}>Código HTTP</p>
              <div className="flex flex-wrap gap-1.5">
                {HTTP_QUICK_PICKS.map((option) => {
                  const active = httpStatus === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        form.setValue(
                          "http_status",
                          active ? "" : option.value,
                          { shouldValidate: true },
                        );
                        setCustomHttpOpen(false);
                      }}
                      className={cn(
                        optionButtonClass(
                          active,
                          "border-primary bg-primary text-primary-foreground",
                        ),
                        "font-mono",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-pressed={customHttpOpen}
                  onClick={() => {
                    if (customHttpOpen) {
                      form.setValue("http_status", "");
                    }
                    setCustomHttpOpen((open) => !open);
                  }}
                  className={optionButtonClass(
                    customHttpOpen,
                    "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  Otro código…
                </button>
                {!customHttpOpen && (
                  <button
                    type="button"
                    aria-pressed={!httpStatus}
                    onClick={() => form.setValue("http_status", "")}
                    className={optionButtonClass(
                      !httpStatus,
                      "border-slate-600 bg-slate-600 text-white",
                    )}
                  >
                    No aplica
                  </button>
                )}
              </div>
              {customHttpOpen && (
                <FormField
                  control={form.control}
                  name="http_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={3}
                          placeholder="Ej: 422"
                          className={cn(numericFieldClass, "max-w-36")}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value.replace(/\D/g, ""),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}
        </FormDialogBody>

        {/* ───────── Pie ───────── */}
        <FormDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} className="min-w-35">
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                <Send className="mr-2 size-4" />
                Enviar reporte
              </>
            )}
          </Button>
        </FormDialogFooter>
      </form>
    </Form>
  );
}
