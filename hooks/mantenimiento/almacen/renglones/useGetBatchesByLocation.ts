import axios from "@/lib/axios";
import { Batch } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBatchesByLocation = async (
  company: string,
  location_id: string,
): Promise<Batch[]> => {
  const { data } = await axios.get(`/${company}/${location_id}/batches`);
  return data;
};

// La clave arranca por "batches": los actions que crean o editan lotes
// invalidan ["batches"], y así esta lista se refresca sola.
export const useGetBatchesByLocation = (
  company?: string,
  location_id?: string | null,
) => {
  return useQuery<Batch[], Error>({
    queryKey: ["batches", "by-location", company, location_id],
    queryFn: () => fetchBatchesByLocation(company!, location_id!),
    enabled: !!company && !!location_id,
  });
};
