"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  EDIT_REASONS,
  EDIT_REASON_HINTS,
  EDIT_REASON_LABELS,
  EditReason,
} from "@/lib/planificacion/editReasons";
import { cn } from "@/lib/utils";

export interface EditReasonValue {
  edit_reason?: EditReason;
  edit_note?: string;
}

interface EditReasonFieldsProps {
  value: EditReasonValue;
  onChange: (value: EditReasonValue) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
}

// Controlado y sin depender de react-hook-form: EditWorkOrderForm guarda las
// tareas fuera del form y necesita el motivo para todas las llamadas.
export function EditReasonFields({
  value,
  onChange,
  error,
  disabled,
  className,
  label = "Motivo de la edición",
}: EditReasonFieldsProps) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-lg border border-amber-300/60 bg-amber-50/40 p-3 md:grid-cols-2 dark:bg-amber-950/20",
        className,
      )}
    >
      <div className="space-y-1.5">
        <Label className={cn(error && "text-destructive")}>{label}</Label>
        <Select
          value={value.edit_reason}
          onValueChange={(reason) =>
            onChange({ ...value, edit_reason: reason as EditReason })
          }
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione el motivo..." />
          </SelectTrigger>
          <SelectContent>
            {EDIT_REASONS.map((reason) => (
              <SelectItem key={reason} value={reason}>
                {EDIT_REASON_LABELS[reason]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p
          className={cn(
            "text-xs",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {error ??
            (value.edit_reason
              ? EDIT_REASON_HINTS[value.edit_reason]
              : "Queda en la auditoría de Planificación.")}
        </p>
      </div>
      <div className="space-y-1.5">
        <Label>
          Nota <span className="text-xs text-muted-foreground">(Opcional)</span>
        </Label>
        <Textarea
          rows={2}
          maxLength={500}
          value={value.edit_note ?? ""}
          onChange={(e) => onChange({ ...value, edit_note: e.target.value })}
          placeholder="Qué estaba mal o por qué cambia..."
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// El backend responde 422 con errors.edit_reason si la corrección llegó sin motivo.
export function editReasonErrorFrom(error: unknown): string | undefined {
  const errors = (
    error as {
      response?: {
        status?: number;
        data?: { errors?: Record<string, string[]> };
      };
    }
  )?.response?.data?.errors;

  return errors?.edit_reason?.[0];
}

/** Primer mensaje del backend, sea del campo que sea ("tiene cumplimientos: debe darse de baja"). */
export function backendMessageFrom(error: unknown): string | undefined {
  const data = (
    error as {
      response?: {
        data?: { errors?: Record<string, string[]>; message?: string };
      };
    }
  )?.response?.data;

  return Object.values(data?.errors ?? {}).flat()[0] ?? data?.message;
}
