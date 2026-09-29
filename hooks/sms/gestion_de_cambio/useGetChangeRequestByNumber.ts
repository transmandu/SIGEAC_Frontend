import axiosInstance from "@/lib/axios";
import { ChangeRequest } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchChangeRequestByNumber = async (
  company?: string,
  requestNumber?: string,
): Promise<ChangeRequest> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/change-requests/by-number/${encodeURIComponent(requestNumber ?? "")}`,
  );
  return data;
};

export const useGetChangeRequestByNumber = (
  company?: string,
  requestNumber?: string,
) => {
  return useQuery<ChangeRequest>({
    queryKey: ["change-request", company, requestNumber],
    queryFn: () => fetchChangeRequestByNumber(company, requestNumber),
    staleTime: 1000 * 60 * 5,
    enabled: !!company && !!requestNumber,
  });
};
