"use client";

import { useCreateErrorReport } from "@/hooks/sistema/reportes/useCreateErrorReport";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
import { ChipTone } from "@/app/sistema/reportes/_components/errorReportChips";

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Describe el problema o solicitud con al menos 10 carácteres.",
  }),
  module: z.string().min(1, {
    message: "Debe seleccionar un módulo.",
  }),
  severity: z.string().optional(),
  http_status: z.string().optional(),
});

interface FormProps {
  onClose: () => void;
  /** Muestra severidad y código HTTP, solo disponibles para el superuser desde el panel de gestión. */
  showAdvancedFields?: boolean;
}

/* ───────────────────────── Clasificación: selector explícito ───────────────────────── */

type ReportKind = "bug" | "suggestion" | "question";

const REPORT_KINDS: {
  value: ReportKind;
  label: string;
  tag: string;
}[] = [
  { value: "bug", label: "🐛 Error / Problema técnico", tag: "[ERROR]" },
  { value: "suggestion", label: "💡 Sugerencia de mejora", tag: "[SUGERENCIA]" },
  { value: "question", label: "❓ Duda / Consulta", tag: "[DUDA]" },
];

/* ───────────────────────── Chips seleccionables (severidad) ───────────────────────── */

const SEVERITY_TONE: Record<string, ChipTone> = {
  LOW: "sky",
  MEDIUM: "amber",
  HIGH: "orange",
  CRITICAL: "rose",
};

const SEVERITY_ACTIVE_CLASS: Record<ChipTone, string> = {
  sky: "border-sky-400 bg-sky-500 text-white shadow-sm shadow-sky-500/30",
  amber: "border-amber-400 bg-amber-500 text-white shadow-sm shadow-amber-500/30",
  orange: "border-orange-400 bg-orange-500 text-white shadow-sm shadow-orange-500/30",
  rose: "border-rose-400 bg-rose-500 text-white shadow-sm shadow-rose-500/30",
  emerald: "border-emerald-400 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30",
  indigo: "border-indigo-400 bg-indigo-500 text-white shadow-sm shadow-indigo-500/30",
  slate: "border-slate-400 bg-slate-600 text-white shadow-sm shadow-slate-500/30",
};

const HTTP_QUICK_PICKS = [
  { value: "500", label: "500 Internal" },
  { value: "404", label: "404 Not Found" },
  { value: "401", label: "401 Auth" },
  { value: "400", label: "400 Bad Request" },
];

export default function CreateErrorReportForm({ onClose, showAdvancedFields = false }: FormProps) {
  const { createErrorReport } = useCreateErrorReport();
  const { user } = useAuth();
  const { selectedCompany } = useCompanyStore();
  const [images, setImages] = useState<File[]>([]);
  const [reportKind, setReportKind] = useState<ReportKind>("bug");
  const [isDragging, setIsDragging] = useState(false);
  const [customHttpOpen, setCustomHttpOpen] = useState(false);

  // El panel de gestión (superuser) siempre puede reportar/reclasificar cualquier módulo.
  const availableModules = showAdvancedFields
    ? ERROR_REPORT_MODULES
    : getAvailableErrorReportModules(selectedCompany?.modules);

  const defaultModule = showAdvancedFields ? "" : getDefaultErrorReportModule(user?.roles) ?? "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      module: defaultModule,
      severity: "",
      http_status: "",
    },
  });

  const showSeverity = showAdvancedFields;
  const showHttpStatus = showAdvancedFields && reportKind === "bug";
  const severity = form.watch("severity");
  const httpStatus = form.watch("http_status");

  const previews = useMemo(() => images.map((image) => URL.createObjectURL(image)), [images]);

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
      setCustomHttpOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHttpStatus]);

  const handleAddImages = (files: FileList | null) => {
    if (!files) return;
    setImages((prev) => [...prev, ...Array.from(files)]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const tag = REPORT_KINDS.find((k) => k.value === reportKind)?.tag;
    const description = tag ? `${tag} ${values.description}` : values.description;

    await createErrorReport.mutateAsync({
      description,
      module: values.module,
      severity: showSeverity && values.severity
        ? (values.severity as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")
        : undefined,
      http_status: showHttpStatus && values.http_status
        ? Number(values.http_status)
        : undefined,
      images: images.length > 0 ? images : undefined,
    });
    form.reset();
    setImages([]);
    setReportKind("bug");
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
        {/* ───────── Sticky header ───────── */}
        <div className="shrink-0 border-b border-slate-200/80 bg-gradient-to-b from-slate-50 to-background px-6 pb-4 pt-6 dark:border-slate-800/80 dark:from-slate-900/40">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Reportar un problema o sugerencia
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs">
            Cuéntanos qué error encontraste o qué te gustaría que mejoráramos en SIGEAC.
          </DialogDescription>
        </div>

        {/* ───────── Body (scrollable) ───────── */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tipo de solicitud
            </Label>
            <Select value={reportKind} onValueChange={(v) => setReportKind(v as ReportKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_KINDS.map((kind) => (
                  <SelectItem key={kind.value} value={kind.value}>
                    {kind.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FormField
            control={form.control}
            name="module"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Módulo
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Descripción
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe el error que encontraste o la solicitud que quieres hacer..."
                    className="min-h-32 rounded-xl border-slate-200/80 dark:border-slate-800/80"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ───────── Dropzone de evidencias ───────── */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Evidencias (opcional)
            </Label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleAddImages(e.dataTransfer.files);
              }}
              className={cn(
                "rounded-xl border border-dashed p-3 transition-colors",
                isDragging
                  ? "border-indigo-400 bg-indigo-50/60 dark:bg-indigo-500/10"
                  : "border-slate-200/80 bg-slate-50/40 dark:border-slate-800/80 dark:bg-slate-900/20"
              )}
            >
              <div className="flex flex-wrap gap-2">
                {previews.map((preview, index) => (
                  <div key={preview} className="group relative h-16 w-16">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={`Imagen ${index + 1}`}
                      className="h-16 w-16 rounded-lg border border-slate-200/80 object-cover dark:border-slate-800/80"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      aria-label={`Quitar imagen ${index + 1}`}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label
                  htmlFor="images"
                  className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-muted-foreground transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 dark:border-slate-700 dark:hover:bg-indigo-500/10"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[10px]">Agregar</span>
                </label>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    handleAddImages(event.target.files);
                    event.target.value = "";
                  }}
                />
              </div>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                <UploadCloud className="h-3 w-3" />
                Arrastra capturas aquí o haz clic en &quot;Agregar&quot;.
              </p>
            </div>
          </div>

          {/* ───────── Severidad ───────── */}
          {showSeverity && (
            <div className="space-y-1.5 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Severidad
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {ERROR_REPORT_SEVERITIES.map((option) => {
                  const tone = SEVERITY_TONE[option.value];
                  const active = severity === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        form.setValue("severity", active ? "" : option.value, {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                        active
                          ? SEVERITY_ACTIVE_CLASS[tone]
                          : "border-slate-200/80 bg-slate-50/60 text-muted-foreground hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/30"
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ───────── Código HTTP (solo tipo Error) ───────── */}
          {showHttpStatus && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Código HTTP
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {HTTP_QUICK_PICKS.map((option) => {
                  const active = httpStatus === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        form.setValue("http_status", active ? "" : option.value, {
                          shouldValidate: true,
                        });
                        setCustomHttpOpen(false);
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1 font-mono text-xs font-medium transition-all",
                        active
                          ? "border-indigo-400 bg-indigo-500 text-white shadow-sm shadow-indigo-500/30"
                          : "border-slate-200/80 bg-slate-50/60 text-muted-foreground hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/30"
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    if (customHttpOpen) {
                      form.setValue("http_status", "");
                    }
                    setCustomHttpOpen((v) => !v);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                    customHttpOpen
                      ? "border-indigo-400 bg-indigo-500 text-white shadow-sm shadow-indigo-500/30"
                      : "border-slate-200/80 bg-slate-50/60 text-muted-foreground hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/30"
                  )}
                >
                  Otro código…
                </button>
                {!customHttpOpen && (
                  <button
                    type="button"
                    onClick={() => form.setValue("http_status", "")}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                      !httpStatus
                        ? "border-slate-400 bg-slate-600 text-white shadow-sm shadow-slate-500/30"
                        : "border-slate-200/80 bg-slate-50/60 text-muted-foreground hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/30"
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
                    <FormItem className="pt-1">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ej: 422"
                          className="h-8 max-w-[140px] rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}
        </div>

        {/* ───────── Sticky footer ───────── */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200/80 bg-gradient-to-t from-slate-50 to-background px-6 py-3.5 dark:border-slate-800/80 dark:from-slate-900/40">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" disabled={createErrorReport.isPending} type="submit">
            {createErrorReport.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Enviar reporte"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
