"use client";

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetProductSuggestions = (
    company: string | undefined,
    search: string,
) => {
    return useQuery<string[], Error>({
        queryKey: ["product-suggestions", company, search],
        queryFn: async () => {
            const params: any = {};
            if(search) params.search = search;
            const { data } = await axiosInstance.get(
                `/${company}/cargo-shipment-items/suggestions`,
                { params },
            );
            return data;
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!company && search.length >= 2,
    });
};
