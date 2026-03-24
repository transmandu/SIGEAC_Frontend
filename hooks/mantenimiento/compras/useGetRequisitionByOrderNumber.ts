import axios from '@/lib/axios';
import { Aircraft, Unit, User } from '@/types';
import { useQuery } from '@tanstack/react-query';

export interface RequisitionByOrderNumber {
  id: number;
  order_number: string;
  status: string;
  type: 'GENERAL' | 'AERONAUTICO';
  created_by: User;
  requested_by: string;
  received_by: string;
  image?: string;
  justification: string;
  arrival_date?: Date;
  submission_date?: Date;
  submitted_date?: Date;
  aircraft?: Aircraft;
  batch: {
    id: number;
    name: string;
    batch_articles: {
      article_part_number: string;
      article_alt_part_number?: string;
      pma?: string;
      manual?: string;
      reference_cod?: string;
      justification?: string;
      quantity: number;
      unit?: Unit;
      image?: string;
      certificates?: string[];
    }[];
  }[];
}

const fetchRequisitionByOrderNumber = async ({
  company,
  order_number,
}: {
  company: string | undefined;
  order_number: string;
}): Promise<RequisitionByOrderNumber> => {
  const { data } = await axios.get(
    `/${company}/show-requisition-order/${order_number}`
  );
  return data[0];
};

export const useGetRequisitionByOrderNumber = ({
  company,
  order_number,
}: {
  company: string | undefined;
  order_number: string;
}) => {
  return useQuery<RequisitionByOrderNumber, Error>({
    queryKey: ['requisition-order', company, order_number],
    queryFn: () => fetchRequisitionByOrderNumber({ company, order_number }),
    enabled: !!company && !!order_number,
  });
};
