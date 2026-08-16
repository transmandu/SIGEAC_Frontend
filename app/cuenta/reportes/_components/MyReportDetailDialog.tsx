"use client";

import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, CheckCircle2, Clock, ImageOff } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Chip, STATUS_CHIP } from "@/app/sistema/reportes/_components/errorReportChips";
import { normalizeAssetUrl } from "@/lib/utils";
import type { ErrorReport } from "@/types";

const STATUS_ICON: Record<ErrorReport["status"], typeof AlertTriangle> = {
  OPEN: AlertTriangle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle2,
};

/** Qué esperar según el estado, en lenguaje de usuario y no de desarrollo. */
const STATUS_HINT: Record<ErrorReport["status"], string> = {
  OPEN: "Tu reporte fue recibido y está en espera de ser revisado por el equipo.",
  IN_PROGRESS: "El equipo está trabajando en tu reporte.",
  RESOLVED: "El equipo resolvió tu reporte.",
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <span className="text-sm">{value}</span>
  </div>
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
  if (!report) return null;

  const { label, tone } = STATUS_CHIP[report.status];
  const Icon = STATUS_ICON[report.status];
  const isResolved = report.status === "RESOLVED";

  const images = report.images
    .map((image) => ({ id: image.id, url: normalizeAssetUrl(image.image_url) }))
    .filter((image): image is { id: number; url: string } => !!image.url);

  const formatDate = (value: string | null) =>
    value ? format(new Date(value), "d 'de' MMMM yyyy, h:mm a", { locale: es }) : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Reporte #{report.id}
            <Chip tone={tone} icon={<Icon className="h-3 w-3" />}>
              {label}
            </Chip>
          </DialogTitle>
          <DialogDescription>{STATUS_HINT[report.status]}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-3">
          <div className="space-y-5">
            {/* La solución primero: es lo que el usuario viene a buscar. */}
            {isResolved && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Solución
                </p>
                <p className="whitespace-pre-wrap text-sm">
                  {report.resolution?.trim() || "El equipo no registró un detalle de la solución."}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Lo que reportaste
              </span>
              <p className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-sm">
                {report.description}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Módulo" value={report.module ?? "No especificado"} />
              <Field label="Fecha del reporte" value={formatDate(report.reported_at)} />
              {isResolved && (
                <>
                  <Field label="Resuelto por" value={report.resolved_by ?? "—"} />
                  <Field label="Fecha de resolución" value={formatDate(report.resolved_at)} />
                </>
              )}
            </div>

            {images.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Imágenes adjuntas
                </span>
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
