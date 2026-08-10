"use client"

import axiosInstance from '@/lib/axios';
import { Accountant } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchAccount = async (company?: string): Promise<Accountant[]> => {
  const {data} = await axiosInstance.get(`/${company}/accountants`);
  return data;
};

export const useGetAccountant = (company?: string) => {
  return useQuery<Accountant[]>({
    queryKey: ["accountants"],
    queryFn: () => fetchAccount(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
