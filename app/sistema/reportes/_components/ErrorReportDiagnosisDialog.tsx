"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  History,
  ImagePlus,
  Loader2,
  Phone,
  Plus,
  UserRound,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { ErrorReport } from "@/types";
import { normalizeAssetUrl } from "@/lib/utils";
import { getErrorReportSeverityLabel } from "@/lib/errorReportSeverity";
import { ERROR_REPORT_MODULES } from "@/lib/errorReportModules";
import { useUpdateErrorReportDiagnosis } from "@/hooks/sistema/reportes/useUpdateErrorReportDiagnosis";
import { useAddErrorReportImages } from "@/hooks/sistema/reportes/useAddErrorReportImages";
import { useDeleteErrorReportImage } from "@/hooks/sistema/reportes/useDeleteErrorReportImage";
import { Chip, STATUS_CHIP, sourceTone, httpStatusTone } from "./errorReportChips";

interface ErrorReportDiagnosisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ErrorReport;
}

/* ───────────────────────── Technical cause: mono console block ───────────────────────── */

function ConsoleField({
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative rounded-xl border border-slate-800 bg-slate-950 shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
          causa_técnica
        </span>
        {value && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        )}
      </div>
      {readOnly ? (
        <p className="whitespace-pre-wrap px-3 py-2.5 font-mono text-[13px] leading-relaxed text-slate-200">
          {value || <span className="text-slate-600">Sin causa técnica registrada.</span>}
        </p>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full resize-none bg-transparent px-3 py-2.5 font-mono text-[13px] leading-relaxed text-slate-200 placeholder:text-slate-600 focus:outline-none"
        />
      )}
    </div>
  );
}

/* ───────────────────────── Diagnostic steps: interactive timeline ───────────────────────── */

function StepsTimeline({
  steps,
  newStep,
  setNewStep,
  onAddStep,
  pending,
  editable,
}: {
  steps: string[];
  newStep: string;
  setNewStep: (v: string) => void;
  onAddStep: () => void;
  pending: boolean;
  editable: boolean;
}) {
  if (steps.length === 0 && !editable) {
    return <p className="text-sm text-muted-foreground">Sin pasos de diagnóstico registrados.</p>;
  }

  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.04 }}
          className="relative flex gap-3 pb-4 pl-1 last:pb-0"
        >
          <div className="flex flex-col items-center">
            <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-indigo-500 bg-background" />
            {(index < steps.length - 1 || editable) && (
              <div className="w-px flex-1 bg-slate-200 dark:bg-slate-800" />
            )}
          </div>
          <p className="-mt-0.5 pb-1 text-sm leading-relaxed">{step}</p>
        </motion.div>
      ))}

      {editable && (
        <div className="relative flex gap-3 pl-1">
          <div className="flex flex-col items-center">
            <div className="mt-0.5 flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700" />
          </div>
          <div className="-mt-1.5 flex flex-1 gap-2">
            <Input
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddStep();
                }
              }}
              placeholder="Escribe un paso y presiona Enter…"
              className="h-8 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onAddStep}
              disabled={!newStep.trim() || pending}
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Lightbox ───────────────────────── */

function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: { id: number; url: string }[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % images.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, images.length, onClose, onNavigate]);

  const current = images[index];
  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index - 1 + images.length) % images.length);
            }}
            aria-label="Anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white sm:left-5"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index + 1) % images.length);
            }}
            aria-label="Siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white sm:right-5"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.url}
        alt="Evidencia ampliada"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
      />

      {images.length > 1 && (
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-white/70">
          {index + 1} / {images.length}
        </span>
      )}
    </div>
  );
}

/* ───────────────────────── Main dialog ───────────────────────── */

export default function ErrorReportDiagnosisDialog({
  open,
  onOpenChange,
  report,
}: ErrorReportDiagnosisDialogProps) {
  const [httpStatus, setHttpStatus] = useState(report.http_status?.toString() ?? "");
  const [technicalCause, setTechnicalCause] = useState(report.technical_cause ?? "");
  const [newStep, setNewStep] = useState("");
  const [activeTab, setActiveTab] = useState("resumen");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { updateErrorReportDiagnosis } = useUpdateErrorReportDiagnosis();
  const { addErrorReportImages } = useAddErrorReportImages();
  const { deleteErrorReportImage } = useDeleteErrorReportImage();

  useEffect(() => {
    if (open) {
      setHttpStatus(report.http_status?.toString() ?? "");
      setTechnicalCause(report.technical_cause ?? "");
      setNewStep("");
      setActiveTab("resumen");
      setLightboxIndex(null);
    }
  }, [open, report]);

  const canEdit = report.status === "OPEN" || report.status === "IN_PROGRESS";
  const diagnosticSteps = report.diagnostic_steps ?? [];
  const moduleLabel =
    ERROR_REPORT_MODULES.find((m) => m.value === report.module)?.label ?? report.module;
  const severityLabel = getErrorReportSeverityLabel(report.severity);
  const statusChip = STATUS_CHIP[report.status];

  const galleryImages = useMemo(
    () =>
      report.images
        .map((image) => ({ id: image.id, url: normalizeAssetUrl(image.image_url) }))
        .filter((image): image is { id: number; url: string } => !!image.url),
    [report.images]
  );

  const handleSaveDiagnosis = async () => {
    const trimmedStep = newStep.trim();
    await updateErrorReportDiagnosis.mutateAsync({
      id: report.id,
      http_status: httpStatus ? Number(httpStatus) : undefined,
      technical_cause: technicalCause || undefined,
      diagnostic_steps: trimmedStep ? [trimmedStep] : undefined,
    });
    if (trimmedStep) setNewStep("");
  };

  const handleAddStep = async () => {
    if (!newStep.trim()) return;
    await updateErrorReportDiagnosis.mutateAsync({
      id: report.id,
      diagnostic_steps: [newStep.trim()],
    });
    setNewStep("");
  };

  const handleAddImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    await addErrorReportImages.mutateAsync({ id: report.id, images: Array.from(files) });
  };

  const handleDeleteImage = async (imageId: number) => {
    await deleteErrorReportImage.mutateAsync({ id: report.id, imageId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden p-0 sm:max-w-[620px]">
        {/* ───────── Sticky header ───────── */}
        <DialogHeader className="shrink-0 border-b border-slate-200/80 bg-gradient-to-b from-slate-50 to-background px-6 pb-4 pt-6 dark:border-slate-800/80 dark:from-slate-900/40">
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="space-y-1.5">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Reporte <span className="text-muted-foreground">#{report.id}</span>
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {format(new Date(report.reported_at), "dd MMM yyyy, HH:mm")}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              <Chip tone={statusChip.tone}>{statusChip.label}</Chip>
              {severityLabel && <Chip tone="amber">{severityLabel}</Chip>}
              {report.duplicate_count > 0 && (
                <Chip tone="slate">×{report.duplicate_count + 1}</Chip>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* ───────── Body ───────── */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="shrink-0 border-b border-slate-200/80 px-6 pt-3 dark:border-slate-800/80">
            <TabsList className="h-9 bg-slate-100/80 dark:bg-slate-900/60">
              <TabsTrigger value="resumen" className="text-xs">
                Resumen
              </TabsTrigger>
              <TabsTrigger value="diagnostico" className="text-xs">
                Diagnóstico
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {/* ───────── Tab: Resumen ───────── */}
            <TabsContent value="resumen" className="mt-0 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 dark:border-slate-800/80 dark:bg-slate-900/30">
                  <UserRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Reportado por
                    </p>
                    <p className="truncate text-sm font-medium">{report.reported_by}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 dark:border-slate-800/80 dark:bg-slate-900/30">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Teléfono
                    </p>
                    <p className="truncate text-sm font-medium">{report.phone ?? "—"}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Chip tone={sourceTone(report.source)}>{report.source}</Chip>
                {moduleLabel && <Chip tone="indigo">{moduleLabel}</Chip>}
                {report.http_status_label && (
                  <Chip tone={httpStatusTone(report.http_status)}>
                    {report.http_status} · {report.http_status_label}
                  </Chip>
                )}
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Descripción
                </p>
                <p className="whitespace-pre-wrap rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-sm leading-relaxed dark:border-slate-800/80 dark:bg-slate-900/30">
                  {report.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Evidencias
                </Label>
                <div className="flex flex-wrap gap-2">
                  {galleryImages.map((image, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={image.id}
                      src={image.url}
                      alt={`Evidencia del reporte #${report.id}`}
                      className="h-20 w-20 cursor-pointer rounded-lg border border-slate-200/80 object-cover transition-transform duration-200 hover:scale-[1.03] dark:border-slate-800/80"
                      onClick={() => setLightboxIndex(index)}
                    />
                  ))}
                  {galleryImages.length === 0 && (
                    <p className="text-sm text-muted-foreground">Sin imágenes adjuntas.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ───────── Tab: Diagnóstico ───────── */}
            <TabsContent value="diagnostico" className="mt-0 space-y-5">
              {canEdit ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="http-status" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Código HTTP
                    </Label>
                    <Input
                      id="http-status"
                      type="number"
                      value={httpStatus}
                      onChange={(event) => setHttpStatus(event.target.value)}
                      placeholder="Ej: 404"
                      className="h-9 max-w-[140px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Causa técnica
                    </Label>
                    <ConsoleField
                      value={technicalCause}
                      onChange={setTechnicalCause}
                      placeholder="describe_la_causa_tecnica_identificada();"
                    />
                  </div>

                  <div className="space-y-1.5 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
                    <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <History className="h-3.5 w-3.5" />
                      Línea de diagnóstico
                    </Label>
                    <StepsTimeline
                      steps={diagnosticSteps}
                      newStep={newStep}
                      setNewStep={setNewStep}
                      onAddStep={handleAddStep}
                      pending={updateErrorReportDiagnosis.isPending}
                      editable
                    />
                  </div>

                  <div className="space-y-1.5 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Evidencias
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {galleryImages.map((image, index) => (
                        <div key={image.id} className="group relative h-20 w-20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.url}
                            alt={`Evidencia del reporte #${report.id}`}
                            className="h-20 w-20 cursor-pointer rounded-lg border border-slate-200/80 object-cover transition-transform duration-200 group-hover:scale-[1.03] dark:border-slate-800/80"
                            onClick={() => setLightboxIndex(index)}
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(image.id)}
                            disabled={deleteErrorReportImage.isPending}
                            aria-label="Eliminar imagen"
                            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <label
                        htmlFor="add-images"
                        className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-muted-foreground transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 dark:border-slate-700 dark:hover:bg-indigo-500/10"
                      >
                        {addErrorReportImages.isPending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <ImagePlus className="h-5 w-5" />
                            <span className="text-[10px]">Agregar</span>
                          </>
                        )}
                      </label>
                      <input
                        id="add-images"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={addErrorReportImages.isPending}
                        onChange={(event) => {
                          handleAddImages(event.target.files);
                          event.target.value = "";
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Código HTTP
                    </span>
                    {report.http_status_label ? (
                      <Chip tone={httpStatusTone(report.http_status)}>
                        {report.http_status} · {report.http_status_label}
                      </Chip>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Causa técnica
                    </Label>
                    <ConsoleField value={report.technical_cause ?? ""} readOnly />
                  </div>

                  <div className="space-y-1.5 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
                    <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <History className="h-3.5 w-3.5" />
                      Línea de diagnóstico
                    </Label>
                    <StepsTimeline
                      steps={diagnosticSteps}
                      newStep=""
                      setNewStep={() => {}}
                      onAddStep={() => {}}
                      pending={false}
                      editable={false}
                    />
                  </div>

                  {report.status === "RESOLVED" && (
                    <div className="space-y-1.5 rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Resolución
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{report.resolution}</p>
                      <p className="text-xs text-muted-foreground">
                        Resuelto por {report.resolved_by} el{" "}
                        {report.resolved_at ? format(new Date(report.resolved_at), "dd/MM/yyyy HH:mm") : "—"}
                        {report.resolution_minutes != null && ` (${report.resolution_minutes} min)`}
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* ───────── Sticky footer ───────── */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200/80 bg-gradient-to-t from-slate-50 to-background px-6 py-3.5 dark:border-slate-800/80 dark:from-slate-900/40">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {canEdit ? "Cancelar" : "Cerrar"}
          </Button>
          {canEdit && (
            <Button
              type="button"
              size="sm"
              onClick={handleSaveDiagnosis}
              disabled={updateErrorReportDiagnosis.isPending}
            >
              {updateErrorReportDiagnosis.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Guardar diagnóstico"
              )}
            </Button>
          )}
        </div>
      </DialogContent>

      <AnimatePresence>
        {open && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Lightbox
              images={galleryImages}
              index={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onNavigate={setLightboxIndex}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
