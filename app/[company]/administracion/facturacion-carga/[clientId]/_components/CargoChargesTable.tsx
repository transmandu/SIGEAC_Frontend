"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { CargoCharge } from "@/types";
import {
  useBulkUpdateCargoCharges,
  useRegisterCargoChargePayment,
  useReconcileCargoCharge,
  useRefundCargoCharge,
} from "@/actions/administracion/facturacion_carga/actions";
import { useGetPaymentMethods } from "@/hooks/general/metodos_pago/useGetPaymentMethods";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import { DecimalInput } from "./DecimalInput";
import { RouteAutocompleteInput } from "@/components/forms/administracion/facturacion_carga/RouteAutoCompleteInput";
import { ReconcileChargeDialog } from "./ReconcileChargeDialog";
import { RefundChargeDialog } from "./RefundChargeDialog";

const CHARGE_TYPES = ["CARGA", "PAX"];

type DraftRow = {
  id: number;
  route: string;
  concept: string;
  charge_type: string;
  tariff: string;
};

// ── Funciones puras del borrador ─────────────────────────────────────────────
// Están fuera del componente a propósito: al no cerrar sobre estado de
// React, los hooks useMemo/useCallback no las declaran como dependencias y
// no hay que memorizarlas para que dejen de recrearse en cada render.

const toDraftRow = (charge: CargoCharge): DraftRow => ({
  id: charge.id,
  route: charge.route ?? "",
  concept: charge.concept ?? "",
  charge_type: charge.charge_type,
  tariff: charge.tariff != null ? String(charge.tariff) : "",
});

const toDraftRows = (charges: CargoCharge[]): DraftRow[] =>
  charges.map(toDraftRow);

/** Si el borrador difiere del servidor, la fila tiene ediciones sin guardar. */
const isDraftDirty = (draft: DraftRow, charge: CargoCharge) =>
  draft.route !== (charge.route ?? "") ||
  draft.concept !== (charge.concept ?? "") ||
  draft.charge_type !== charge.charge_type ||
  draft.tariff !== (charge.tariff != null ? String(charge.tariff) : "");

/**
 * Mezcla los cobros frescos del servidor con los borradores en edición.
 * Una fila con cambios sin guardar se conserva tal cual: un refetch no puede
 * pisar lo que el usuario está escribiendo en este momento.
 */
const mergeDraftRows = (
  currentRows: DraftRow[],
  charges: CargoCharge[],
): DraftRow[] =>
  charges.map((charge) => {
    const existing = currentRows.find((row) => row.id === charge.id);

    return existing && isDraftDirty(existing, charge)
      ? existing
      : toDraftRow(charge);
  });

/**
 * Un cobro está descuadrado cuando el saldo guardado no coincide con la suma
 * de los abonos registrados. El backend es quien lo determina; si no vino la
 * caja (estado null) no se puede afirmar nada.
 */
const isUnreconciled = (charge?: CargoCharge) =>
  !!charge && !!charge.estado && charge.estado !== "reconciled";

/** Detecta si una fila editada reduce el total por debajo de lo ya pagado. */
const rowHasBalanceViolation = (row: DraftRow, charge?: CargoCharge) => {
  const amountPaid = Number(charge?.amount_paid ?? 0);
  if (amountPaid <= 0) return false;

  const draftTotal = (Number(row.tariff) || 0) * Number(charge?.weight ?? 0);

  return draftTotal < amountPaid;
};

// El botón dispara un modal (no un popover): con 3 campos más el resumen
// de contexto (guía/monto total/pendiente) ya se siente un formulario, no
// una interacción rápida — el modal le da el aire que un popover no tiene.
function RegisterPaymentDialog({
  disabled,
  isPending,
  guideNumber,
  totalAmount,
  pendingAmount,
  onConfirm,
}: {
  disabled: boolean;
  isPending: boolean;
  guideNumber?: string;
  totalAmount: number;
  pendingAmount: number;
  onConfirm: (
    amount: number,
    concept?: string,
    paymentMethodId?: number,
  ) => Promise<any>;
}) {
  const isPaid = pendingAmount <= 0.009;
  const isActionDisabled = disabled || isPaid || isPending;
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");

  const { data: paymentMethods } = useGetPaymentMethods();

  const numericAmount = Number(amount);
  const isAmountValid =
    !isNaN(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= pendingAmount;
  const isExceeded = !isNaN(numericAmount) && numericAmount > pendingAmount;
  const isZeroOrNegative =
    amount.trim() !== "" && (!isNaN(numericAmount) ? numericAmount <= 0 : true);

  const handleConfirm = async () => {
    if (!isAmountValid || isPaid) return;

    try {
      await onConfirm(
        numericAmount,
        concept.trim() || undefined,
        paymentMethodId ? Number(paymentMethodId) : undefined,
      );
      //SOLO SI TIENE EXITO: Se limpia el formulario y se cierra el modal
      setAmount("");
      setConcept("");
      setPaymentMethodId("");
      setOpen(false);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2 text-[11px]"
          disabled={isActionDisabled}
        >
          Pagar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
          <DialogDescription>
            Guía{" "}
            <span className="font-medium text-foreground">
              {guideNumber ?? "-"}
            </span>{" "}
            · Monto total{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(totalAmount)}
            </span>{" "}
            · Pendiente{" "}
            <span className="font-semibold text-amber-600">
              {formatCurrency(pendingAmount)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Monto</label>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-[11px] text-primary"
                onClick={() => setAmount(pendingAmount.toFixed(2))}
              >
                Pagar restante ({formatCurrency(pendingAmount)})
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
                El monto excede el saldo pendiente (
                {formatCurrency(pendingAmount)}).
              </span>
            )}
            {isZeroOrNegative && (
              <span className="text-[11px] text-destructive">
                Ingresa un monto válido mayor a 0.
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              Concepto (opcional)
            </label>
            <Input
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Nota del abono"
              className="h-9"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              Método de pago (opcional)
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
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || !isAmountValid}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Confirmar pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CargoChargesTable({
  company,
  clientId,
  charges,
  onlyUnreconciled = false,
}: {
  company: string;
  clientId: number;
  charges: CargoCharge[];
  onlyUnreconciled?: boolean;
}) {
  const [rows, setRows] = useState<DraftRow[]>(() => toDraftRows(charges));

  const { bulkUpdateCargoCharges } = useBulkUpdateCargoCharges(
    company,
    clientId,
  );
  const { registerCargoChargePayment } = useRegisterCargoChargePayment(
    company,
    clientId,
  );
  const { reconcileCargoCharge } = useReconcileCargoCharge(company, clientId);
  const { refundCargoCharge } = useRefundCargoCharge(company, clientId);

  // Los cobros frescos del servidor cambian tras cada guardado o refetch.
  // Se mezclan aquí, durante el render, y no en un useEffect: React documenta
  // este patrón ("adjusting state when a prop changes") y evita el render en
  // cascada que provoca un setState dentro de un efecto.
  const [previousCharges, setPreviousCharges] =
    useState<CargoCharge[]>(charges);

  if (previousCharges !== charges) {
    setPreviousCharges(charges);
    setRows((currentRows) => mergeDraftRows(currentRows, charges));
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        registerCargoChargePayment.isPending ||
        bulkUpdateCargoCharges.isPending
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [registerCargoChargePayment.isPending, bulkUpdateCargoCharges.isPending]);

  const originals = useMemo(
    () => new Map(charges.map((charge) => [charge.id, charge])),
    [charges],
  );

  const changedRows = useMemo(
    () =>
      rows.filter((row) => {
        const original = originals.get(row.id);

        return original ? isDraftDirty(row, original) : false;
      }),
    [rows, originals],
  );

  const dirtyIds = useMemo(
    () => new Set(changedRows.map((row) => row.id)),
    [changedRows],
  );

  const visibleRows = useMemo(
    () =>
      onlyUnreconciled
        ? rows.filter((row) => isUnreconciled(originals.get(row.id)))
        : rows,
    [rows, originals, onlyUnreconciled],
  );

  // El monto total no se digita: siempre es tarifa * peso de la guía, igual
  // que lo calcula el backend al guardar. Mientras la fila no se haya
  // guardado, se muestra el total ya persistido (fuente de verdad real,
  // sobre todo para lo ya pagado); el cálculo en vivo con el borrador solo
  // se usa como vista previa en filas que se están editando ahora mismo.
  const rowTotal = useCallback(
    (row: DraftRow, charge?: CargoCharge) =>
      dirtyIds.has(row.id)
        ? (Number(row.tariff) || 0) * Number(charge?.weight ?? 0)
        : Number(charge?.total_amount ?? 0),
    [dirtyIds],
  );

  const totals = useMemo(() => {
    const totalServices = rows.reduce(
      (sum, row) => sum + rowTotal(row, originals.get(row.id)),
      0,
    );
    const totalPaid = charges.reduce(
      (sum, charge) => sum + Number(charge.amount_paid),
      0,
    );

    return {
      totalServices,
      totalPending: Math.max(0, totalServices - totalPaid),
    };
  }, [rows, originals, charges, rowTotal]);

  const updateCell = (
    id: number,
    field: keyof Omit<DraftRow, "id">,
    value: string,
  ) =>
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );

  const handleSave = async () => {
    const payload = changedRows.map((row) => ({
      id: row.id,
      route: row.route.trim() || null,
      concept: row.concept.trim() || null,
      charge_type: row.charge_type,
      tariff: row.tariff === "" ? null : Number(row.tariff),
    }));

    if (payload.length === 0) return;

    await bulkUpdateCargoCharges.mutateAsync(payload);
  };

  const handlePayment = async (
    chargeId: number,
    amount: number,
    concept?: string,
    payment_method_id?: number,
  ) => {
    const sessinoKey = `sigeac:pending-cargo-payment:${chargeId}`;

    // Recuperar la clave existente o generar una nueva y guardarla.
    // Si el usuario reintenta (misma pestaña o tras refrescar), reutiliza
    // exactamente la misma clave para que el backend identifique el duplicado.
    let idempotency_key = sessionStorage.getItem(sessinoKey);
    if (!idempotency_key) {
      idempotency_key = crypto.randomUUID();
      sessionStorage.setItem(sessinoKey, idempotency_key);
    }

    try {
      const result = await registerCargoChargePayment.mutateAsync({
        id: chargeId,
        amount,
        concept,
        payment_method_id,
        idempotency_key,
      });
      // Solo borrar la clave tras una respuesta exitosa del servidor
      sessionStorage.removeItem(sessinoKey);
      return result;
    } catch (error: any) {
      // La clave se conserva en sessionStorage para que el próximo intento
      // use la misma y el backend reconozca el reintento. Excepción: un 409
      // significa que esa clave ya identifica otro abono con datos distintos;
      // reusarla va a fallar siempre, así que se descarta.
      if (error?.response?.status === 409) {
        sessionStorage.removeItem(sessinoKey);
      }
      throw error;
    }
  };

  const handleRefund = async (
    chargeId: number,
    amount: number,
    concept: string,
    paymentMethodId?: number,
  ) => {
    const sessionKey = `sigeac:pending-cargo-refund:${chargeId}`;

    let idempotency_key = sessionStorage.getItem(sessionKey);
    if (!idempotency_key) {
      idempotency_key = crypto.randomUUID();
      sessionStorage.setItem(sessionKey, idempotency_key);
    }

    try {
      const result = await refundCargoCharge.mutateAsync({
        id: chargeId,
        amount,
        concept,
        payment_method_id: paymentMethodId,
        idempotency_key,
      });
      // Solo borrar la clave tras una respuesta exitosa del servidor.
      sessionStorage.removeItem(sessionKey);
      return result;
    } catch (error: any) {
      // Mismo criterio que en el pago: un 409 deja la clave inservible.
      if (error?.response?.status === 409) {
        sessionStorage.removeItem(sessionKey);
      }
      throw error;
    }
  };

  const handleReconcile = async (
    chargeId: number,
    mode: "sync_balance" | "register_missing",
    concept?: string,
    paymentMethodId?: number,
  ) => {
    return reconcileCargoCharge.mutateAsync({
      id: chargeId,
      mode,
      concept,
      payment_method_id: paymentMethodId,
    });
  };

  // Comprueba si hay alguna fila en conflicto en toda la tabla
  const hasAnyBalanceViolation = useMemo(() => {
    return changedRows.some((row) =>
      rowHasBalanceViolation(row, originals.get(row.id)),
    );
  }, [changedRows, originals]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-center px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Fecha
                </th>
                <th className="text-center px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Guía
                </th>
                <th className="text-center px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Aeronave
                </th>
                <th className="text-center px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Matrícula
                </th>
                <th className="text-center px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 w-28">
                  Ruta
                </th>
                <th className="text-center px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 w-36">
                  Concepto
                </th>
                <th className="text-center px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Tipo
                </th>
                <th className="text-center px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 w-20">
                  Peso (Kg)
                </th>
                <th className="text-center px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 w-24">
                  Tarifa
                </th>
                <th className="text-center px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 w-28">
                  Monto Total
                </th>
                <th className="text-center px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 w-40">
                  Pendiente / Pagar
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const charge = originals.get(row.id);
                const total = rowTotal(row, charge);
                const amountPaid = Number(charge?.amount_paid ?? 0);
                const pending = Math.max(0, total - amountPaid);
                const isDirty = dirtyIds.has(row.id);
                const isPaid =
                  (total > 0 || amountPaid > 0) && pending <= 0.009;
                const unreconciled = isUnreconciled(charge);

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-t border-border/50 text-center",
                      isDirty && "bg-primary/5",
                      unreconciled && "bg-amber-50/60 dark:bg-amber-950/20",
                    )}
                  >
                    <td className="px-2 py-1.5 text-muted-foreground whitespace-nowrap">
                      {charge ? formatDate(charge.billing_date) : "-"}
                    </td>
                    <td className="px-2 py-1.5 font-medium whitespace-nowrap">
                      {charge?.cargo_shipment_id ? (
                        <Link
                          href={`/${company}/administracion/facturacion-carga/${clientId}/guia/${charge.cargo_shipment_id}`}
                          className="text-primary hover:underline hover:underline-offset-4"
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Ver detalle de la guía ${charge.guide_number ?? ""}`}
                        >
                          {charge.guide_number ?? "-"}
                        </Link>
                      ) : (
                        (charge?.guide_number ?? "-")
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground whitespace-nowrap">
                      {charge?.aircraft_model ?? "-"}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground whitespace-nowrap">
                      {charge?.aircraft_registration ?? "-"}
                    </td>
                    <td className="px-2 py-1.5">
                      <RouteAutocompleteInput
                        company={company}
                        value={row.route}
                        onChange={(value) => updateCell(row.id, "route", value)}
                        className="h-8 w-32 mx-auto bg-background/70 border-border/60 text-center"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        value={row.concept}
                        onChange={(e) =>
                          updateCell(row.id, "concept", e.target.value)
                        }
                        className="h-8 w-64  bg-background/70 border-border/60"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Select
                        value={row.charge_type}
                        onValueChange={(value) =>
                          updateCell(row.id, "charge_type", value)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-background/70 border-border/60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHARGE_TYPES.map((type) => (
                            <SelectItem
                              key={type}
                              value={type}
                              className="text-xs"
                            >
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground tabular-nums">
                      {Number(charge?.weight ?? 0).toFixed(2)}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex flex-col items-center gap-0.5">
                        <DecimalInput
                          value={row.tariff}
                          onValueChange={(value) =>
                            updateCell(row.id, "tariff", value)
                          }
                          className={cn(
                            "h-8 w-20 mx-auto bg-background/70 border-border/60 text-center",
                            rowHasBalanceViolation(row, charge) &&
                              "border-destructive text-destructive font-bold focus-visible:ring-destructive",
                          )}
                        />
                        {rowHasBalanceViolation(row, charge) && (
                          <span className="text-[10px] text-destructive whitespace-nowrap">
                            Menor a pagado ({formatCurrency(amountPaid)})
                          </span>
                        )}
                        {rowHasBalanceViolation(row, charge) && charge && (
                          <RefundChargeDialog
                            charge={charge}
                            isPending={refundCargoCharge.isPending}
                            defaultAmount={Number(
                              Math.max(0, amountPaid - total).toFixed(2),
                            )}
                            onConfirm={(amount, concept, paymentMethodId) =>
                              handleRefund(
                                row.id,
                                amount,
                                concept,
                                paymentMethodId,
                              )
                            }
                            trigger={
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 border-destructive/40 px-2 text-[10px] text-destructive hover:bg-destructive/5"
                              >
                                <RotateCcw className="mr-1 size-3" />
                                Devolver {formatCurrency(amountPaid - total)}
                              </Button>
                            }
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 font-medium tabular-nums">
                      {formatCurrency(total)}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {unreconciled ? (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2 text-[11px]"
                                    disabled
                                  >
                                    Pagar
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Regularizá este cobro antes de abonarlo: el
                                  saldo guardado no coincide con los abonos
                                  registrados.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300 cursor-help text-[10px] px-1.5 py-0 font-medium flex items-center gap-1"
                                >
                                  <AlertTriangle className="size-2.5" /> No
                                  cuadra
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Saldo{" "}
                                  {formatCurrency(
                                    Number(charge?.amount_paid ?? 0),
                                  )}{" "}
                                  · abonos{" "}
                                  {formatCurrency(
                                    Number(charge?.abonos_total ?? 0),
                                  )}{" "}
                                  · diferencia{" "}
                                  {formatCurrency(
                                    Math.abs(Number(charge?.diferencia ?? 0)),
                                  )}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            {charge && (
                              <ReconcileChargeDialog
                                charge={charge}
                                isPending={reconcileCargoCharge.isPending}
                                onConfirm={(mode, concept, paymentMethodId) =>
                                  handleReconcile(
                                    row.id,
                                    mode,
                                    concept,
                                    paymentMethodId,
                                  )
                                }
                              />
                            )}
                          </>
                        ) : isDirty ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-[11px]"
                                  disabled
                                >
                                  Pagar
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Guarda los cambios de esta fila antes de
                                registrar un pago.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ) : isPaid ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-[11px]"
                                  disabled
                                >
                                  Pagar
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Este servicio ya fue pagado en su totalidad.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ) : total <= 0 ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-[11px]"
                                  disabled
                                >
                                  Pagar
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Asigna una tarifa para poder registrar un pago.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <RegisterPaymentDialog
                            disabled={registerCargoChargePayment.isPending}
                            isPending={registerCargoChargePayment.isPending}
                            guideNumber={charge?.guide_number}
                            totalAmount={total}
                            pendingAmount={pending}
                            onConfirm={(amount, concept, paymentMethodId) =>
                              handlePayment(
                                row.id,
                                amount,
                                concept,
                                paymentMethodId,
                              )
                            }
                          />
                        )}
                        {isPaid ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] px-1.5 py-0 font-medium flex items-center gap-1"
                          >
                            <Check className="size-2.5" /> Pagado
                          </Badge>
                        ) : (
                          <span
                            className={cn(
                              "text-xs font-semibold tabular-nums",
                              pending > 0
                                ? "text-amber-600"
                                : "text-muted-foreground",
                            )}
                          >
                            {formatCurrency(pending)}
                          </span>
                        )}
                        {amountPaid > 0 &&
                          !unreconciled &&
                          !isDirty &&
                          !rowHasBalanceViolation(row, charge) &&
                          charge && (
                            <RefundChargeDialog
                              charge={charge}
                              isPending={refundCargoCharge.isPending}
                              onConfirm={(amount, concept, paymentMethodId) =>
                                handleRefund(
                                  row.id,
                                  amount,
                                  concept,
                                  paymentMethodId,
                                )
                              }
                            />
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-muted/30 font-semibold">
              <tr>
                <td colSpan={9} className="px-2 py-2 text-right text-xs">
                  Monto Total de Servicios / Pendiente por Pagar:
                </td>
                <td className="px-2 py-2 text-xs">
                  {formatCurrency(totals.totalServices)}
                </td>
                <td
                  className={cn(
                    "px-2 py-2 text-xs",
                    totals.totalPending > 0
                      ? "text-amber-600"
                      : "text-muted-foreground",
                  )}
                >
                  {formatCurrency(totals.totalPending)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <span className="mr-auto text-[11px] text-muted-foreground">
          {changedRows.length > 0
            ? `${changedRows.length} fila(s) con cambios`
            : "Sin cambios"}
        </span>
        <Button
          onClick={handleSave}
          disabled={
            changedRows.length === 0 ||
            bulkUpdateCargoCharges.isPending ||
            hasAnyBalanceViolation
          }
        >
          {bulkUpdateCargoCharges.isPending && (
            <Loader2 className="mr-2 size-4 animate-spin" />
          )}
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
