import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type SMSTrainingExpiring = {
  employee_dni: string;
  employee: {
    id?: number;
    dni: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    [key: string]: any;
  } | null;
  course: {
    id: number;
    name: string;
    [key: string]: any;
  } | null;
  expiration: string | null;
  status: string;
  days_left: number | null;
};

const fetchSMSTrainingExpiring = async (
  company?: string,
): Promise<SMSTrainingExpiring[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/employee-training/expiring`,
  );
  return data;
};

export const useGetSMSTrainingExpiring = (company?: string) => {
  return useQuery<SMSTrainingExpiring[]>({
    queryKey: ["sms-training-expiring", company],
    queryFn: () => fetchSMSTrainingExpiring(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
