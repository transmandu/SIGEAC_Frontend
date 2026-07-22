import axiosInstance from "@/lib/axios";
import { ChangeRequest } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchChangeRequestById = async (
  company?: string,
  id?: number | string
): Promise<ChangeRequest> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/change-requests/${id}`
  );
  return data;
};

export const useGetChangeRequestById = (
  company?: string,
  id?: number | string
) => {
  return useQuery<ChangeRequest>({
    queryKey: ["change-request", company, id],
    queryFn: () => fetchChangeRequestById(company, id),
    staleTime: 1000 * 60 * 5,
    enabled: !!company && !!id,
  });
};
