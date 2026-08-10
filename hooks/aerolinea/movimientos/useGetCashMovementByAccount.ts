import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"
import { BankAccount } from "@/types";

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

interface DateParams {
  from?: string
  to?: string
}

const fetchCashMovementByAccount = async (cashId: string, params: DateParams = {}, company?: string): Promise<AccountMovement[]> => {
  // El rango es opcional: sin from/to el backend devuelve todos los movimientos.
  const queryParams = new URLSearchParams()
  if (params.from) queryParams.append("from", params.from)
  if (params.to) queryParams.append("to", params.to)

  const url = `/${company}/movements-by-accounts/${cashId}?${queryParams.toString()}`

  const { data } = await axiosInstance.get(url)
  return data
}

export const useGetCashMovementByAccount = (cashId: string, dateParams: DateParams = {}, company?: string) => {
  return useQuery<AccountMovement[]>({
    queryKey: ["movements-by-accounts", cashId, dateParams.from, dateParams.to, company],
    queryFn: () => fetchCashMovementByAccount(cashId, dateParams, company),
    staleTime: 1000 * 60 * 5,
    enabled: !!cashId && !!company,
  })
}
