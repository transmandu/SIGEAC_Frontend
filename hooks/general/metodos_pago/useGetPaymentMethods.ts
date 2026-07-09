import axiosInstance from "@/lib/axios";
import { PaymentMethod } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const { data } = await axiosInstance.get(`/payment-methods`);
  return data;
};

export const useGetPaymentMethods = () => {
  return useQuery<PaymentMethod[]>({
    queryKey: ["payment-methods"],
    queryFn: fetchPaymentMethods,
  });
};
