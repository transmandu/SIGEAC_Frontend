import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

export interface CargoChargeBulkPayload {
  id: number;
  route?: string | null;
  concept?: string | null;
  charge_type?: string;
  tariff?: number | null;
}

const invalidateAll = (
  queryClient: ReturnType<typeof useQueryClient>,
  clientId?: number,
) => {
  queryClient.invalidateQueries({ queryKey: ["cargo-billing-clients"] });
  queryClient.invalidateQueries({ queryKey: ["cargo-charges", clientId] });
};

export const useBulkUpdateCargoCharges = (
  company: string,
  clientId?: number,
) => {
  const queryClient = useQueryClient();
  const bulkUpdateMutation = useMutation({
    mutationFn: async (charges: CargoChargeBulkPayload[]) => {
      const response = await axiosInstance.put(
        `/${company}/cargo-billing/charges/bulk`,
        { charges },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Guardado", {
        description: "Los cobros se actualizaron correctamente.",
      });
    },
    onError: (error: any) => {
      notifyError(error, { action: "guardar los cambios" });
    },
    onSettled: () => {
      invalidateAll(queryClient, clientId);
    },
  });
  return { bulkUpdateCargoCharges: bulkUpdateMutation };
};
export const useRegisterCargoChargePayment = (
  company: string,
  clientId?: number,
) => {
  const queryClient = useQueryClient();
  const paymentMutation = useMutation({
    mutationFn: async ({
      id,
      amount,
      concept,
      payment_method_id,
      idempotency_key,
    }: {
      id: number;
      amount: number;
      concept?: string;
      payment_method_id?: number;
      idempotency_key: string;
    }) => {
      const response = await axiosInstance.patch(
        `/${company}/cargo-billing/charges/${id}/payment`,
        { amount, concept, payment_method_id, idempotency_key },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Pago registrado", {
        description: "El pago se registró correctamente.",
      });
    },
    onError: (error: any) => {
      notifyError(error, { action: "registrar el pago" });
    },
    onSettled: () => {
      invalidateAll(queryClient, clientId);
      queryClient.invalidateQueries({
        queryKey: ["cargo-charge-payments", clientId],
      });
    },
  });
  return { registerCargoChargePayment: paymentMutation };
};

/**
 * Regulariza un cobro cuyo saldo guardado no coincide con los abonos
 * registrados. Hay dos reparaciones y son excluyentes: el administrador
 * decide cual aplicar segun lo que happened en la caja.
 */
export const useReconcileCargoCharge = (company: string, clientId?: number) => {
  const queryClient = useQueryClient();
  const reconcileMutation = useMutation({
    mutationFn: async ({
      id,
      mode,
      concept,
      payment_method_id,
    }: {
      id: number;
      mode: "sync_balance" | "register_missing";
      concept?: string;
      payment_method_id?: number;
    }) => {
      const response = await axiosInstance.post(
        `/${company}/cargo-billing/charges/${id}/reconcile`,
        { mode, concept, payment_method_id },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Cobro regularizado", {
        description: "El cobro quedó conciliado con los abonos registrados.",
      });
    },
    onError: (error: any) => {
      notifyError(error, { action: "regularizar el cobro" });
    },
    onSettled: () => {
      invalidateAll(queryClient, clientId);
      queryClient.invalidateQueries({
        queryKey: ["cargo-charge-payments", clientId],
      });
    },
  });
  return { reconcileCargoCharge: reconcileMutation };
};

/**
 * Registra una devolución: un abono negativo que baja el saldo del cobro sin
 * borrar el abono original. Se usa cuando el total estaba mal cobrado y hay
 * que devolver la diferencia, o cuando se le devuelve plata al cliente.
 */
export const useRefundCargoCharge = (company: string, clientId?: number) => {
  const queryClient = useQueryClient();
  const refundMutation = useMutation({
    mutationFn: async ({
      id,
      amount,
      concept,
      payment_method_id,
      idempotency_key,
    }: {
      id: number;
      amount: number;
      concept: string;
      payment_method_id?: number;
      idempotency_key: string;
    }) => {
      const response = await axiosInstance.post(
        `/${company}/cargo-billing/charges/${id}/refund`,
        { amount, concept, payment_method_id, idempotency_key },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Devolución registrada", {
        description:
          "El saldo del cobro se ajustó y el movimiento quedó en el historial de abonos.",
      });
    },
    onError: (error: any) => {
      notifyError(error, { action: "registrar la devolución" });
    },
    onSettled: () => {
      invalidateAll(queryClient, clientId);
      queryClient.invalidateQueries({
        queryKey: ["cargo-charge-payments", clientId],
      });
    },
  });
  return { refundCargoCharge: refundMutation };
};
