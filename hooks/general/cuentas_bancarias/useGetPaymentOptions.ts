import axiosInstance from "@/lib/axios";
import { BankAccount } from "@/types";
import { useQuery } from "@tanstack/react-query";

/**
 * Opciones de pago disponibles para una compañía: sus cuentas bancarias
 * (con banco) junto a los métodos de pago de cada una y, dentro del método
 * TARJETA, únicamente las tarjetas válidas para esa compañía.
 *
 * Es la fuente para el flujo de pago de una orden de compra:
 * banco → método de pago (la cuenta viene implícita) → tarjeta (si aplica).
 */
const fetchPaymentOptions = async (companyId: number): Promise<BankAccount[]> => {
  const { data } = await axiosInstance.get(`/companies/${companyId}/payment-options`);
  return data;
};

export const useGetPaymentOptions = (companyId?: number) => {
  return useQuery<BankAccount[]>({
    queryKey: ["payment-options", companyId],
    queryFn: () => fetchPaymentOptions(companyId!),
    enabled: !!companyId,
  });
};
