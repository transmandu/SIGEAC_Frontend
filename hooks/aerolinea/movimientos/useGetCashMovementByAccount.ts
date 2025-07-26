import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"
import { BankAccount } from "@/types";

// Definir la estructura de datos que devuelve el endpoint
interface MovementDetail {
  id: number;
  details: string;
  amount: string;
  accountant_id: number;
  category_id: number;
  cash_movement_id: number;
  category: {
    name: string;
  };
}

interface CashMovement {
  date: string;
  type: "INCOME" | "OUTPUT";
  cash_movement_details: MovementDetail;
}

interface AccountMovement {
  accountant_name: string;
  INCOME: number;
  OUTPUT: number;
  movements: CashMovement[];
}

// Interfaz para los parámetros de fecha
interface DateParams {
  from?: string
  to?: string
}

const fetchCashMovementByAccount = async (cashId: string, params: DateParams = {}, company?: string): Promise<AccountMovement[]> => {
  //parámetros de consulta para la URL
  const queryParams = new URLSearchParams()
  if (params.from) queryParams.append("from", params.from)
  if (params.to) queryParams.append("to", params.to)

  // Construir la URL con los parámetros
  const url = `/${company}/movements-by-accounts/${cashId}?${queryParams.toString()}`

  const { data } = await axiosInstance.get(url)
  return data
}

export const useGetCashMovementByAccount = (cashId: string, dateParams: DateParams = {}, company?: string) => {
  return useQuery<AccountMovement[]>({
    queryKey: ["movements-by-accounts", cashId, dateParams.from, dateParams.to, company],
    queryFn: () => fetchCashMovementByAccount(cashId, dateParams, company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!cashId && !!company, // Solo ejecuta la consulta si hay un ID y una compañía
  })
}
