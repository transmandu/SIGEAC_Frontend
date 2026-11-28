"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { DialogButton } from "@/components/misc/DialogButton";
import { Dialog } from "@/components/ui/dialog";
import {
  PanelSection,
  PanelStaticLabel,
} from "@/components/forms/PanelSection";
import { fieldClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { Input } from "@/components/ui/input";
import { useResettingState } from "@/hooks/useResettingState";
import { cn } from "@/lib/utils";
import { PackageCheck } from "lucide-react";

interface ReceiveQuantityDialogProps {
  /** Lo que se esperaba recibir (la cantidad del artículo en tránsito). */
  expected: number;
  unit?: string | null;
  /** Para nombrar lo que se recibe: número de parte o, si no tiene, el renglón. */
  articleLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending?: boolean;
  /** Recibe la cantidad confirmada; igual al total es una recepción completa. */
  onConfirm: (quantity: number) => void | Promise<void>;
}

const EPSILON = 1e-6;

/** Quita ruido de coma flotante (0.1 + 0.2) sin tocar los decimales reales. */
const tidy = (value: number) => Number(value.toFixed(6));

/**
 * Confirmación de la cantidad que llegó al pasar un consumible de tránsito a
 * recepción. Una compra puede llegar en varias cajas: si llegó menos de lo
 * esperado, lo recibido entra a recepción y el resto sigue en tránsito.
 */
export function ReceiveQuantityDialog({
  expected,
  unit,
  articleLabel,
  open,
  onOpenChange,
  pending = false,
  onConfirm,
}: ReceiveQuantityDialogProps) {
  // Cada vez que se abre vuelve al total: lo normal es que llegue todo.
  const [text, setText] = useResettingState(String(tidy(expected)), [
    open,
    expected,
  ]);

  const quantity = Number(text);
  const isNumber = text.trim() !== "" && Number.isFinite(quantity);
  const tooMuch = isNumber && quantity > expected + EPSILON;
  const valid = isNumber && quantity > 0 && !tooMuch;
  const remaining = valid ? tidy(expected - quantity) : 0;
  const isPartial = valid && remaining > EPSILON;

  const error = !isNumber
    ? null
    : quantity <= 0
      ? "Indique cuántas unidades llegaron."
      : tooMuch
        ? `Solo se esperan ${tidy(expected)}. Si llegó más, corrija primero la cantidad del artículo.`
        : null;

  const handleChange = (raw: string) => {
    let value = raw.replace(/[^0-9.,]/g, "").replace(",", ".");
    const [integer, ...decimals] = value.split(".");
    value = decimals.length ? `${integer}.${decimals.join("")}` : integer;
    setText(value);
  };

  const suffix = unit ? ` ${unit}` : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && pending) return;
        onOpenChange(next);
      }}
    >
      <FormDialogContent
        className="sm:max-w-md"
        icon={PackageCheck}
        title="Confirmar cantidad recibida"
        description={
          <>
            Indique cuántas unidades de{" "}
            <span className="font-mono font-semibold text-foreground">
              {articleLabel}
            </span>{" "}
            llegaron al almacén.
          </>
        }
        footer={
          <>
            <DialogButton
              tone="cancel"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </DialogButton>
            <DialogButton
              disabled={!valid}
              busy={pending}
              onClick={() => onConfirm(tidy(quantity))}
              icon={<PackageCheck />}
              className="min-w-35"
            >
              Confirmar recepción
            </DialogButton>
          </>
        }
      >
        <PanelSection
          compact
          icon={PackageCheck}
          title="Cantidad"
          hint="Unidades que llegaron en esta entrega."
        >
          <dl className="mb-4 flex items-baseline justify-between gap-3 border-b border-border/60 pb-3">
            <dt className="text-[13px] text-muted-foreground">Esperado</dt>
            <dd className="text-sm font-medium tabular-nums">
              {tidy(expected)}
              {suffix}
            </dd>
          </dl>

          <PanelStaticLabel>Cantidad recibida</PanelStaticLabel>
          <Input
            id="received-quantity"
            aria-label="Cantidad recibida"
            inputMode="decimal"
            autoFocus
            value={text}
            disabled={pending}
            aria-invalid={!!error}
            className={cn(fieldClass, "tabular-nums")}
            onChange={(event) => handleChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && valid && !pending) {
                event.preventDefault();
                onConfirm(tidy(quantity));
              }
            }}
          />
          {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}

          {isPartial && (
            <p className="mt-3 rounded-lg border border-amber-300/60 bg-amber-50/60 px-3 py-2 text-xs text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300">
              Se recibirán {tidy(quantity)}
              {suffix} y las {remaining}
              {suffix} restantes seguirán en tránsito hasta que lleguen.
            </p>
          )}
        </PanelSection>
      </FormDialogContent>
    </Dialog>
  );
}
