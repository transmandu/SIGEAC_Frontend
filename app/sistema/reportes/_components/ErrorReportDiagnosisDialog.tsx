"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { ErrorReport } from "@/types";
import { useUpdateErrorReportDiagnosis } from "@/hooks/sistema/reportes/useUpdateErrorReportDiagnosis";
import { useAddErrorReportImages } from "@/hooks/sistema/reportes/useAddErrorReportImages";
import { useDeleteErrorReportImage } from "@/hooks/sistema/reportes/useDeleteErrorReportImage";

interface ErrorReportDiagnosisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ErrorReport;
}

export default function ErrorReportDiagnosisDialog({
  open,
  onOpenChange,
  report,
}: ErrorReportDiagnosisDialogProps) {
  const [httpStatus, setHttpStatus] = useState(report.http_status?.toString() ?? "");
  const [technicalCause, setTechnicalCause] = useState(report.technical_cause ?? "");
  const [newStep, setNewStep] = useState("");
  const { updateErrorReportDiagnosis } = useUpdateErrorReportDiagnosis();
  const { addErrorReportImages } = useAddErrorReportImages();
  const { deleteErrorReportImage } = useDeleteErrorReportImage();

  useEffect(() => {
    if (open) {
      setHttpStatus(report.http_status?.toString() ?? "");
      setTechnicalCause(report.technical_cause ?? "");
      setNewStep("");
    }
  }, [open, report]);

  const canEdit = report.status === "OPEN" || report.status === "IN_PROGRESS";
  const diagnosticSteps = report.diagnostic_steps ?? [];
  const hasExistingDiagnosis =
    report.http_status_label != null || report.technical_cause != null || diagnosticSteps.length > 0;

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
      <DialogContent className="sm:max-w-[560px] max-h-[calc(100vh-8rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Diagnóstico del reporte #{report.id}</DialogTitle>
          <DialogDescription>
            Investiga y documenta la causa técnica antes de resolver el reporte.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Reportado por</p>
              <p>{report.reported_by}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Teléfono</p>
              <p>{report.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Origen</p>
              <p>{report.source}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Módulo</p>
              <p>{report.module}</p>
            </div>
            {report.duplicate_count > 0 && (
              <div>
                <p className="text-muted-foreground">Duplicados</p>
                <Badge variant="secondary">{report.duplicate_count}</Badge>
              </div>
            )}
          </div>

          <div>
            <p className="text-muted-foreground text-sm">Descripción</p>
            <p className="text-sm whitespace-pre-wrap">{report.description}</p>
          </div>

          <div className="space-y-2">
            <Label>Imágenes</Label>
            <div className="flex flex-wrap gap-2">
              {report.images.map((image) => (
                <div key={image.id} className="relative h-16 w-16">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.image_url}
                    alt={`Imagen del reporte #${report.id}`}
                    className="h-16 w-16 rounded object-cover border cursor-pointer"
                    onClick={() => window.open(image.image_url, "_blank")}
                  />
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={deleteErrorReportImage.isPending}
                      aria-label="Eliminar imagen"
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive text-destructive-foreground h-5 w-5 flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              {canEdit && (
                <>
                  <label
                    htmlFor="add-images"
                    className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded border border-dashed text-muted-foreground cursor-pointer hover:bg-muted/50"
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
                </>
              )}
              {report.images.length === 0 && !canEdit && (
                <p className="text-sm text-muted-foreground">Sin imágenes adjuntas.</p>
              )}
            </div>
          </div>

          {canEdit ? (
            <>
              {hasExistingDiagnosis && (
                <div className="space-y-2 p-3 rounded-md border bg-muted/30 text-sm">
                  <p className="font-medium">Diagnóstico registrado</p>
                  {report.http_status_label && (
                    <div>
                      <p className="text-muted-foreground">Código HTTP</p>
                      <p>{report.http_status_label}</p>
                    </div>
                  )}
                  {report.technical_cause && (
                    <div>
                      <p className="text-muted-foreground">Causa técnica</p>
                      <p className="whitespace-pre-wrap">{report.technical_cause}</p>
                    </div>
                  )}
                  {diagnosticSteps.length > 0 && (
                    <div>
                      <p className="text-muted-foreground">Pasos de diagnóstico</p>
                      <ul className="list-disc list-inside space-y-1">
                        {diagnosticSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="http-status">Código HTTP</Label>
                <Input
                  id="http-status"
                  type="number"
                  value={httpStatus}
                  onChange={(event) => setHttpStatus(event.target.value)}
                  placeholder="Ej: 404"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="technical-cause">Causa técnica</Label>
                <Textarea
                  id="technical-cause"
                  className="min-h-24"
                  value={technicalCause}
                  onChange={(event) => setTechnicalCause(event.target.value)}
                  placeholder="Describe la causa técnica identificada..."
                />
              </div>

              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="new-step">Nuevo paso de diagnóstico</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-step"
                    value={newStep}
                    onChange={(event) => setNewStep(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddStep();
                      }
                    }}
                    placeholder="Agregar un nuevo paso..."
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddStep}
                    disabled={!newStep.trim() || updateErrorReportDiagnosis.isPending}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  El paso escrito aquí tambien se guarda al presionar &quot;Guardar diagnóstico&quot;.
                </p>
              </div>

              <Button
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

             
            </>
          ) : (
            <div className="space-y-3 pt-2 border-t">
              <div>
                <p className="text-muted-foreground text-sm">Código HTTP</p>
                <p className="text-sm">{report.http_status_label ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Causa técnica</p>
                <p className="text-sm whitespace-pre-wrap">{report.technical_cause ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Pasos de diagnóstico</p>
                {diagnosticSteps.length > 0 ? (
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {diagnosticSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">—</p>
                )}
              </div>
              {report.status === "RESOLVED" && (
                <div>
                  <p className="text-muted-foreground text-sm">Resolución</p>
                  <p className="text-sm whitespace-pre-wrap">{report.resolution}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Resuelto por {report.resolved_by} el{" "}
                    {report.resolved_at ? format(new Date(report.resolved_at), "dd/MM/yyyy HH:mm") : "—"}
                    {report.resolution_minutes != null && ` (${report.resolution_minutes} min)`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
