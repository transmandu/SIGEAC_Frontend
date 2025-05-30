import axios from '@/lib/axios';
import { GeneralSalesReport } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

export const useGetGeneralReport = () => {
  const searchParams = useSearchParams();
  const company = searchParams.get("company") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const location_id = searchParams.get("location_id") || "";
  return useQuery<GeneralSalesReport, Error>({
    queryKey: ["general-report", from, to],
    queryFn: async () => {
     const {data} = await axios.get('/general-report', {
      params: {
        from,
        to,
        company,
        location_id,
      },
    });
     return data;
   },
    refetchOnWindowFocus: false,
  });
};
