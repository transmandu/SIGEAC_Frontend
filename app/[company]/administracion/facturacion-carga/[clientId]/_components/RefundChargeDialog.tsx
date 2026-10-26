"use client";

import { type ReactNode, useState } from "react";
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
import { Loader2, RotateCcw } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { CargoCharge } from "@/types";
import { useGetPaymentMethods } from "@/hooks/general/metodos_pago/useGetPaymentMethods";
import { DecimalInput } from "./DecimalInput";

/**
 * Registra una devolución: un abono negativo que baja el saldo del cobro sin
 * borrar el abono original. Se usa cuando el total estaba mal cobrado y hay
 * que devolver la diferencia, o cuando se le devuelve plata al cliente.
 *
 * El monto arranca con el excedente ya calculado (lo pagado menos el total
 * nuevo) pero queda editable, por si la devolución es solo una parte.
 */
export function RefundChargeDialog({
  charge,
  isPending,
  defaultAmount,
  trigger,
  onConfirm,
}: {
  charge: CargoCharge;
  isPending: boolean;
  defaultAmount?: number;
  trigger?: ReactNode;
  onConfirm: (
    amount: number,
    concept: string,
    paymentMethodId?: number,
  ) => Promise<any>;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");

  const { data: paymentMethods } = useGetPaymentMethods();

  const amountPaid = Number(charge.amount_paid ?? 0);
  const totalAmount = Number(charge.total_amount ?? 0);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setAmount(defaultAmount != null ? defaultAmount.toFixed(2) : "");
      setConcept("");
      setPaymentMethodId("");
    }

    setOpen(nextOpen);
  };

  const numericAmount = Number(amount);
  const hasNumber = amount.trim() !== "" && !isNaN(numericAmount);
  const isZeroOrNegative = hasNumber && numericAmount <= 0;
  const isExceeded = hasNumber && numericAmount > amountPaid;
  const missingConcept = concept.trim().length === 0;
  const isAmountValid =
    hasNumber && numericAmount > 0 && numericAmount <= amountPaid;

  // Estado resultante para que el operador vea el efecto antes de confirmar.
  const resultingPaid = isAmountValid ? amountPaid - numericAmount : amountPaid;
  const resultingPending = Math.max(0, totalAmount - resultingPaid);

  const handleConfirm = async () => {
    if (!isAmountValid || missingConcept) return;

    try {
      await onConfirm(
        numericAmount,
        concept.trim(),
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
        {trigger ?? (
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-destructive/40 px-2 text-[11px] text-destructive hover:bg-destructive/5"
          >
            <RotateCcw className="mr-1 size-3" />
            Devolución
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar devolución</DialogTitle>
          <DialogDescription>
            Guía{" "}
            <span className="font-medium text-foreground">
              {charge.guide_number ?? "-"}
            </span>{" "}
            · se registra un movimiento negativo en el historial de abonos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-3 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total
            </p>
            <p className="text-sm font-semibold tabular-nums">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Cobrado
            </p>
            <p className="text-sm font-semibold tabular-nums">
              {formatCurrency(amountPaid)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Podés devolver
            </p>
            <p className="text-sm font-semibold tabular-nums text-destructive">
              {formatCurrency(amountPaid)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">
              Monto a devolver
            </label>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-[11px] text-primary"
              onClick={() => setAmount(amountPaid.toFixed(2))}
            >
              Devolver todo ({formatCurrency(amountPaid)})
            </Button>
          </div>
          <DecimalInput
            value={amount}
            onValueChange={setAmount}
            placeholder="0.00"
            className={cn(
              "h-9",
              (isExceeded || isZeroOrNegative) &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
          {isExceeded && (
            <span className="text-[11px] text-destructive">
              No podés devolver más de lo cobrado ({formatCurrency(amountPaid)}
              ).
            </span>
          )}
          {isZeroOrNegative && (
            <span className="text-[11px] text-destructive">
              Ingresá un monto válido mayor a 0.
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">
            Motivo (obligatorio)
          </label>
          <Input
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Ej: Cobro mal calculado, se devolvió la diferencia"
            className={cn(
              "h-9",
              missingConcept &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
          {missingConcept && (
            <span className="text-[11px] text-destructive">
              El motivo queda como respaldo de la devolución.
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">
            Método (opcional)
          </label>
          <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
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

        <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Quedará cobrado{" "}
          <strong className="tabular-nums text-foreground">
            {formatCurrency(resultingPaid)}
          </strong>{" "}
          · pendiente{" "}
          <strong
            className={cn(
              "tabular-nums",
              resultingPending > 0 ? "text-amber-600" : "text-emerald-600",
            )}
          >
            {formatCurrency(resultingPending)}
          </strong>
          {resultingPending <= 0.009 && " · el cobro queda cuadrado"}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || !isAmountValid || missingConcept}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Registrar devolución
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
