import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { ShippingAgency } from "@/types";

export const useGetShippingAgencies = (companySlug?: string) => {
  return useQuery<ShippingAgency[]>({
    queryKey: ["shipping-agencies", companySlug],
    queryFn: async () => {
      if (!companySlug) return [];

      const { data } = await axios.get(`/${companySlug}/shipping-agencies`);

      return data;
    },
    enabled: !!companySlug,
  });
};