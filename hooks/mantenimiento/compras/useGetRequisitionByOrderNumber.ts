import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import type { RequisitionByOrderNumber } from '@/types/purchase';

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
    // Las mutaciones invalidan por prefijo ['requisition-order'], así que
    // la caché solo evita refetches al navegar de ida y vuelta.
    staleTime: 1000 * 60 * 2,
  });
};

export type { RequisitionByOrderNumber };