import axiosInstance from '@/lib/axios';
import { Quote } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchQuoteByQuoteNumber = async (company: string | null, quote_number: string): Promise<Quote> => {
  const {data} = await axiosInstance.get(`/show-quote/${company}/${quote_number}`);
  return data[0];
};

export const useGetQuoteByQuoteNumber = (company: string | null, quote_number: string) => {
  return useQuery<Quote, Error>({
    queryKey: ["quote", company, quote_number],
    queryFn: () => fetchQuoteByQuoteNumber(company, quote_number),
    enabled: !!company && !!quote_number,
  });
};
