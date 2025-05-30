import axiosInstance from '@/lib/axios';
import axios from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';

interface locationsByCompanyId {
  id: number,
  address: string,
  type: string,
  cod_iata:  string,
  isMainBase: boolean,
}[]

const fetchUserLocationsByCompanyId = async (company_id: number): Promise<locationsByCompanyId[]> => {
  const response = await axiosInstance.post('/user-locations-by-company-id', { company_id });
  return response.data;
};

export const useGetUserLocationsByCompanyId = () => {
  return useMutation<locationsByCompanyId[], Error, number>({
    mutationFn: fetchUserLocationsByCompanyId,
  });
};
