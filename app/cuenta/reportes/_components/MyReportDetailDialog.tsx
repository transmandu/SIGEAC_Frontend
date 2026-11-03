"use client";

import Image from "next/image";
import { CheckCircle2, HeartHandshake, ImageOff } from "lucide-react";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";
import { normalizeAssetUrl } from "@/lib/utils";
import type { ErrorReport } from "@/types";

import { REPORT_STATUS } from "./reportStatus";

const TONE_BY_STATUS = {
  OPEN: "rose",
  IN_PROGRESS: "amber",
  RESOLVED: "emerald",
} as const;

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 rounded-md border bg-muted/20 px-3 py-2">
    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <span className="text-sm font-medium text-foreground wrap-break-word">
      {value}
    </span>
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
    {children}
  </span>
);

/**
 * Detalle de un reporte para quien lo hizo. A propósito no muestra causa
 * técnica, código HTTP ni pasos de diagnóstico: eso es material del equipo de
 * desarrollo y aquí solo añadiría ruido.
 */
export default function MyReportDetailDialog({
  report,
  open,
  onOpenChange,
}: {
  report: ErrorReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const timeZone = useCompanyTimezone();

  if (!report) return null;

  const { label, tone, icon, hint } = REPORT_STATUS[report.status];
  const isResolved = report.status === "RESOLVED";

  const images = report.images
    .map((image) => ({ id: image.id, url: normalizeAssetUrl(image.image_url) }))
    .filter((image): image is { id: number; url: string } => !!image.url);

  const formatDate = (value: string | null) =>
    formatInstant(value, timeZone, "d 'de' MMMM yyyy, h:mm a", "—");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        icon={HeartHandshake}
        tone={TONE_BY_STATUS[report.status]}
        title={
          <span className="flex flex-wrap items-center gap-2">
            Reporte #{report.id}
            <TagBadge tone={tone} icon={icon}>
              {label}
            </TagBadge>
          </span>
        }
        description={hint}
        lockOutside={false}
        className="sm:max-w-2xl"
        footer={
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        }
      >
        <div className="space-y-5">
          <>
            {/* La solución primero: es lo que el usuario viene a buscar. */}
            {isResolved && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Solución
                </p>
                <p className="whitespace-pre-wrap text-sm">
                  {report.resolution?.trim() ||
                    "El equipo no registró un detalle de la solución."}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <SectionLabel>Lo que reportó</SectionLabel>
              <p className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-sm">
                {report.description}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Módulo"
                value={report.module ?? "No especificado"}
              />
              <Field
                label="Fecha del reporte"
                value={formatDate(report.reported_at)}
              />
              {report.error_reference && (
                <Field label="Código de error" value={report.error_reference} />
              )}
              {isResolved && (
                <>
                  <Field
                    label="Resuelto por"
                    value={report.resolved_by ?? "—"}
                  />
                  <Field
                    label="Fecha de resolución"
                    value={formatDate(report.resolved_at)}
                  />
                </>
              )}
            </div>

            {images.length > 0 && (
              <div className="flex flex-col gap-2">
                <SectionLabel>Imágenes adjuntas</SectionLabel>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {images.map((image) => (
                    <a
                      key={image.id}
                      href={image.url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative aspect-video overflow-hidden rounded-md border bg-muted/30 transition-opacity hover:opacity-80"
                    >
                      <Image
                        src={image.url}
                        alt="Imagen del reporte"
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {report.images.length > 0 && images.length === 0 && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ImageOff className="h-3.5 w-3.5" />
                No se pudieron cargar las imágenes adjuntas.
              </p>
            )}
          </>
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
