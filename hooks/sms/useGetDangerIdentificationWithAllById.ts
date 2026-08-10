import axiosInstance from "@/lib/axios";
import { MitigationTable } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetDangerIdentificationWithAllById = async ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/danger-identification/with-all-by/${id}`
  );
  return data;
};

export const useGetDangerIdentificationWithAllById = ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  return useQuery<MitigationTable>({
    queryKey: ["danger-identification/with-all-by", id],
    queryFn: () => fetDangerIdentificationWithAllById({ company, id }),
    staleTime: 1000 * 60 * 5,
    enabled: !!id && !!company,
  });
};
