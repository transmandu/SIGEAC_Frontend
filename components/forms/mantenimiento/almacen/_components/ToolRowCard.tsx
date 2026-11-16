"use client";

import { Button } from "@/components/ui/button";
import { TagBadge, type TagTone } from "@/components/misc/TagBadge";
import { toolStatusLabelEs } from "@/lib/warehouse/statuses";
import { X } from "lucide-react";
import type { ReactNode } from "react";

const TOOL_STATUS_TONE: Record<string, TagTone> = {
  CALIBRATED: "green",
  IN_CALIBRATION: "amber",
  EXPIRED: "rose",
  NOT_APPLICABLE: "slate",
};

interface ToolRowCardProps {
  title: string;
  subtitle: string;
  /** Estado de calibración; vacío si la herramienta no se calibra. */
  toolStatus?: string | null;
  /** Captura de evidencia fotográfica de la entrega. Opcional. */
  evidenceNode?: ReactNode;
  onRemove: () => void;
}

/**
 * Fila de una herramienta en la salida. Es una unidad serializada: no tiene
 * cantidad que capturar, así que la fila solo identifica el equipo y deja
 * adjuntar la foto de cómo se entrega.
 */
export function ToolRowCard({
  title,
  subtitle,
  toolStatus,
  evidenceNode,
  onRemove,
}: ToolRowCardProps) {
  return (
    <div className="rounded-md border border-l-4 border-l-violet-500/50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          {toolStatus && (
            <TagBadge tone={TOOL_STATUS_TONE[toolStatus] ?? "slate"}>
              {toolStatusLabelEs(toolStatus)}
            </TagBadge>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {evidenceNode}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Quitar herramienta"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
