import axios from '@/lib/axios';
import { Convertion } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchSecondaryUnits = async (): Promise<Convertion[]> => {
  const {data} = await axios.get(`/hangar74/convertion`);
  return data;
};

export const useGetSecondaryUnits = () => {
  return useQuery<Convertion[]>({
    queryKey: ["secondary-units"],
    queryFn: fetchSecondaryUnits,
  });
};
