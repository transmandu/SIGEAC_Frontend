import axios from "@/lib/axios";
import { Batch } from "@/types";
import { useMutation } from "@tanstack/react-query";

const fetchBatchesByLocationId = async ({
  location_id,
  company,
}: {
  location_id: number;
  company?: string;
}): Promise<Batch[]> => {
  const { data } = await axios.post(`/${company}/batches-by-location`, { location_id });
  return data;
};

export const useGetBatchesByLocationId = () => {
  return useMutation<Batch[], Error, { location_id: number; company?: string }>({
    mutationKey: ["batches", "company"],
    mutationFn: fetchBatchesByLocationId,
  });
};
