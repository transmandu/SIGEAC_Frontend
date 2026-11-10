"use client";

import {
  CheckCircle2,
  HeartHandshake,
  Image as ImageIcon,
  ImageOff,
  Info,
  MessageSquareText,
} from "lucide-react";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { PanelSection } from "@/components/forms/PanelSection";
import { EvidenceGallery } from "@/components/misc/EvidenceGallery";
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

  const details = [
    { label: "Módulo", value: report.module ?? "No especificado" },
    { label: "Fecha del reporte", value: formatDate(report.reported_at) },
    ...(report.error_reference
      ? [
          {
            label: "Código de error",
            value: report.error_reference,
            mono: true,
          },
        ]
      : []),
    ...(isResolved
      ? [
          { label: "Resuelto por", value: report.resolved_by ?? "—" },
          {
            label: "Fecha de resolución",
            value: formatDate(report.resolved_at),
          },
        ]
      : []),
  ];

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
        <div className="space-y-4">
          {/* La solución primero: es lo que el usuario viene a buscar. */}
          {isResolved && (
            <PanelSection
              icon={CheckCircle2}
              title="Solución"
              hint="Lo que hizo el equipo."
              className="border-emerald-300/70 dark:border-emerald-700/40"
            >
              <p className="whitespace-pre-wrap text-sm wrap-anywhere">
                {report.resolution?.trim() ||
                  "El equipo no registró un detalle de la solución."}
              </p>
            </PanelSection>
          )}

          <PanelSection
            icon={MessageSquareText}
            title="Lo que reportó"
            hint="Tal como lo escribió."
          >
            <p className="whitespace-pre-wrap text-sm wrap-anywhere">
              {report.description}
            </p>
          </PanelSection>

          <PanelSection icon={Info} title="Detalles">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {details.map((detail) => (
                <div key={detail.label} className="min-w-0">
                  <dt className="text-[13px] text-muted-foreground">
                    {detail.label}
                  </dt>
                  <dd
                    className={
                      detail.mono
                        ? "font-mono text-sm font-medium wrap-anywhere"
                        : "text-sm font-medium wrap-anywhere"
                    }
                  >
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </PanelSection>

          {images.length > 0 && (
            <PanelSection
              icon={ImageIcon}
              title="Imágenes adjuntas"
              hint={`${images.length} ${images.length === 1 ? "imagen" : "imágenes"}`}
            >
              <EvidenceGallery
                images={images}
                title="Imagen del reporte"
                size={96}
              />
            </PanelSection>
          )}

          {report.images.length > 0 && images.length === 0 && (
            <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <ImageOff className="size-3.5" />
              No se pudieron cargar las imágenes adjuntas.
            </p>
          )}
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
