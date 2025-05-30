import axios from '@/lib/axios';
import { Unit } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchUnits = async (): Promise<Unit[]> => {
  const {data} = await axios.get(`/hangar74/unit`);
  return data;
};

export const useGetUnits = () => {
  return useQuery<Unit[]>({
    queryKey: ["units"],
    queryFn: fetchUnits,
  });
};
