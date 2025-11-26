import axios from '@/lib/axios';
import { AdministrationRequisition, Convertion, Unit, User } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface Requisition {
  id: number,
  status: string,
  created_by: User,
  requested_by: string,
  received_by: string,
  image?: string,
  justification: string,
  arrival_date: Date,
  submitted_date: Date,
  batch: {
    id: number,
    name: string,
    batch_articles: {
      article_part_number: string,
      article_alt_part_number?: string,
      pma?: string,
      manual?: string,
      reference_cod?: string,
      justification: string,
      quantity: number,
      unit?: Unit,
      image?: string,
      certificates?: string[]
    }[]
  }[]
}[]


const fetchRequisitionByOrderNumber = async ({company, order_number}:{company: string | undefined, order_number: string}): Promise<Requisition> => {
  const {data} = await axios.get(`/${company}/show-requisition-order/${order_number}`);
  return data[0];
};

export const useGetRequisitionByOrderNumber = ({company, order_number}:{company: string | undefined, order_number: string}) => {
  return useQuery<Requisition, Error>({
    queryKey: ["requisition-order", company, order_number],
    queryFn: () => fetchRequisitionByOrderNumber({company, order_number}),
    enabled: !!company && !!order_number,
  });
};
