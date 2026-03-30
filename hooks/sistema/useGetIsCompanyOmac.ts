import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

const fetchIsCompanyOmac = async (company?: string) => {
    const { data } = await axiosInstance.get(`/${company}/is-omac`);
    return data.data;
};

export const useGetIsCompanyOmac = (company?: string) => {
    return useQuery<boolean>({ // Especificamos que el resultado es boolean
        queryKey: ["company-is-omac", company],
        queryFn: () => fetchIsCompanyOmac(company),
        staleTime: 1000 * 60 * 5,
        enabled: !!company,
    });
};
