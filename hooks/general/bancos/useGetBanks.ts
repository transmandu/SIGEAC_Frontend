import axios from '@/lib/axios';
import { Bank } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchBanks = async (): Promise<Bank[]> => {
  const {data} = await axios.get(`/banks`);
  return data;
};

export const useGetBanks   = () => {
  return useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: fetchBanks,
  });
};
