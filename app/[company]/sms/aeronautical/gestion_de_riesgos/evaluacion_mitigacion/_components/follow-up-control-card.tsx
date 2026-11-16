"use client";

import { ChevronDown, ChevronUp, PencilLine } from "lucide-react";

import CreateFollowUpControl from "@/components/forms/mantenimiento/sms/CreateFollowUpControl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { FollowUpControl } from "@/types/sms/mantenimiento";

import { SummaryField } from "./evaluation-workflow-shared";
import { FollowUpControlPreview } from "./follow-up-control-preview";

type FollowUpControlCardProps = {
  company: string;
  control: FollowUpControl;
  measureId: number;
  isExpanded: boolean;
  isEditing: boolean;
  onToggleExpand: () => void;
  onToggleEdit: () => void;
  onCloseEdit: () => void;
};

export function FollowUpControlCard({
  company,
  control,
  measureId,
  isExpanded,
  isEditing,
  onToggleExpand,
  onToggleEdit,
  onCloseEdit,
}: FollowUpControlCardProps) {
  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={isExpanded}
        className="flex w-full items-start justify-between gap-3 p-3 text-left transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
      >
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Control #{control.id}</Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(control.date)}
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {control.description}
          </p>
        </div>

        {isExpanded ? (
          <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {isExpanded ? (
        <div className="space-y-3 border-t p-3">
          <div className="grid gap-3 md:grid-cols-2">
            <SummaryField
              label="Descripción completa"
              value={control.description}
            />
            <SummaryField label="Fecha" value={formatDate(control.date)} />
            <SummaryField
              label="Imagen"
              value={control.image ? "Adjunta" : "No adjunta"}
            />
            <SummaryField
              label="Documento"
              value={control.document ? "Adjunto" : "No adjunto"}
            />
          </div>

          {control.image || control.document ? (
            <div className="flex flex-wrap gap-2">
              {control.image ? (
                <FollowUpControlPreview
                  company={company}
                  path={control.image}
                  title={`Imagen del control #${control.id}`}
                  description="Revise la evidencia visual del control antes de abrirla o descargarla."
                  triggerLabel="Abrir imagen"
                />
              ) : null}

              {control.document ? (
                <FollowUpControlPreview
                  company={company}
                  path={control.document}
                  title={`Documento del control #${control.id}`}
                  description="Revise el documento adjunto del control antes de abrirlo o descargarlo."
                  triggerLabel="Abrir documento"
                />
              ) : null}
            </div>
          ) : null}

          {isEditing ? (
            <div className="border-t pt-3">
              <CreateFollowUpControl
                mitigationMeasureId={measureId}
                initialData={control}
                onSuccess={onCloseEdit}
                onCancel={onCloseEdit}
              />
            </div>
          ) : (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onToggleEdit}
              >
                <PencilLine className="mr-2 h-4 w-4" />
                Editar control
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
