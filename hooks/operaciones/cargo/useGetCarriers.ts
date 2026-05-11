"use client";

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface Carrier {
  id: number;
  name: string;
  middle_name: string;
  last_name: string;
  second_last_name: string;
  dni: string;
  phone: string;
}

const fetchCarriers = async (
  company: string | undefined,
): Promise<Carrier[]> => {
  const { data } = await axiosInstance.get(`/${company}/carriers`);
  return data;
};

export const useGetCarriers = (company: string | undefined) => {
  return useQuery<Carrier[]>({
    queryKey: ["carriers", company],
    queryFn: () => fetchCarriers(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
