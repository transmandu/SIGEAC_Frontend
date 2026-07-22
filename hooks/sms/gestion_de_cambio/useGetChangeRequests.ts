import axiosInstance from "@/lib/axios";
import { ChangeRequest } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchChangeRequests = async (
  company?: string
): Promise<ChangeRequest[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/change-requests`
  );
  return data;
};

export const useGetChangeRequests = (company?: string) => {
  return useQuery<ChangeRequest[]>({
    queryKey: ["change-requests", company],
    queryFn: () => fetchChangeRequests(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
