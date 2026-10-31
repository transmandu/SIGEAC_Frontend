"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { CargoCharge } from "@/types";
import { useGetPaymentMethods } from "@/hooks/general/metodos_pago/useGetPaymentMethods";

type Mode = "sync_balance" | "register_missing";

const MODE_LABEL: Record<Mode, string> = {
  sync_balance: "Sincronizar saldo desde los abonos",
  register_missing: "Registrar el abono que falta",
};

const MODE_HELP: Record<Mode, string> = {
  sync_balance:
    "La caja es la verdad: el saldo del cobro se recalcula con la suma de los abonos registrados. No se registra ningun movimiento de caja nuevo.",
  register_missing:
    "El dinero si entró y lo que faltaba era la fila del abono: se registra el abono por la diferencia. El saldo no se toca porque ya estaba.",
};

/**
 * Regulariza un cobro descuadrado. El modal obliga a elegir el modo: son
 * dos reparaciones que asumen hechos opuestos sobre la caja y el sistema no
 * puede deducir cual corresponde.
 */
export function ReconcileChargeDialog({
  charge,
  isPending,
  onConfirm,
}: {
  charge: CargoCharge;
  isPending: boolean;
  onConfirm: (
    mode: Mode,
    concept?: string,
    paymentMethodId?: number,
  ) => Promise<any>;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("sync_balance");
  const [concept, setConcept] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");

  const { data: paymentMethods } = useGetPaymentMethods();

  // El modo por defecto depende de hacia donde va la diferencia: si el
  // saldo dice mas de lo que entro, lo natural es que falte el abono.
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const diferencia = Number(charge.diferencia ?? 0);
      setMode(diferencia > 0 ? "register_missing" : "sync_balance");
      setConcept("");
      setPaymentMethodId("");
    }

    setOpen(nextOpen);
  };

  const requiereConcepto = mode === "register_missing";
  const diferencia = Number(charge.diferencia ?? 0);
  const faltaConcepto = requiereConcepto && concept.trim().length === 0;

  const handleConfirm = async () => {
    if (faltaConcepto) return;

    try {
      await onConfirm(
        mode,
        concept.trim() || undefined,
        paymentMethodId ? Number(paymentMethodId) : undefined,
      );
      setOpen(false);
    } catch {
      // El toast de la mutacion ya informa del error.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-amber-300 px-2 text-[11px] text-amber-700 hover:bg-amber-50 dark:border-amber-800/60 dark:text-amber-400"
        >
          <AlertTriangle className="mr-1 size-3" />
          Regularizar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Regularizar cobro</DialogTitle>
          <DialogDescription>
            Guía{" "}
            <span className="font-medium text-foreground">
              {charge.guide_number ?? "-"}
            </span>{" "}
            · el saldo guardado no coincide con los abonos registrados.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-3 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total
            </p>
            <p className="text-sm font-semibold tabular-nums">
              {formatCurrency(Number(charge.total_amount ?? 0))}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Saldo
            </p>
            <p className="text-sm font-semibold tabular-nums">
              {formatCurrency(Number(charge.amount_paid ?? 0))}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Abonos
            </p>
            <p className="text-sm font-semibold tabular-nums">
              {formatCurrency(Number(charge.abonos_total ?? 0))}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            Diferencia de{" "}
            <strong className="tabular-nums">
              {formatCurrency(Math.abs(diferencia))}
            </strong>
            :{" "}
            {diferencia > 0
              ? "el saldo dice que se cobró más de lo que entró en caja."
              : "entró dinero que el saldo no refleja."}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">
            ¿Cómo se corrige?
          </label>
          <Select
            value={mode}
            onValueChange={(value) => setMode(value as Mode)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MODE_LABEL) as Mode[]).map((value) => (
                <SelectItem key={value} value={value} className="text-sm">
                  {MODE_LABEL[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">{MODE_HELP[mode]}</p>
        </div>

        {requiereConcepto && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                Concepto del abono (obligatorio)
              </label>
              <Input
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Ej: Transferencia recibida el 12/10"
                className={cn(
                  "h-9",
                  faltaConcepto &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
              {faltaConcepto && (
                <span className="text-[11px] text-destructive">
                  El concepto queda como respaldo de la regularización.
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                Método de pago (opcional)
              </label>
              <Select
                value={paymentMethodId}
                onValueChange={setPaymentMethodId}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {(paymentMethods ?? []).map((method) => (
                    <SelectItem key={method.id} value={String(method.id)}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isPending || faltaConcepto}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Regularizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
