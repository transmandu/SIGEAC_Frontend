"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useGetPaymentMethods } from "@/hooks/general/metodos_pago/useGetPaymentMethods";
import { Loader2 } from "lucide-react";

interface PaymentMethodMultiSelectProps {
  value: number[];
  onChange: (value: number[]) => void;
}

/**
 * Selección múltiple de métodos de pago del catálogo global (checkboxes).
 * Se usa en el formulario de cuentas bancarias para definir "esta cuenta
 * puede usar estos métodos de pago" (pivote bank_account_payment_method).
 */
export function PaymentMethodMultiSelect({ value, onChange }: PaymentMethodMultiSelectProps) {
  const { data: paymentMethods, isLoading } = useGetPaymentMethods();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando métodos de pago...
      </div>
    );
  }

  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        No hay métodos de pago registrados en el catálogo.
      </p>
    );
  }

  const toggle = (methodId: number, checked: boolean) => {
    onChange(
      checked
        ? [...value, methodId]
        : value.filter((id) => id !== methodId)
    );
  };

  return (
    <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
      {paymentMethods.map((method) => (
        <label
          key={method.id}
          className="flex cursor-pointer items-center gap-2 text-sm"
        >
          <Checkbox
            checked={value.includes(method.id)}
            onCheckedChange={(checked) => toggle(method.id, !!checked)}
          />
          <span className="truncate">{method.name}</span>
        </label>
      ))}
    </div>
  );
}
