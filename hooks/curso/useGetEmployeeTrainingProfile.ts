import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useGetEmployeeTrainingProfile = (company: string | undefined, dni: string | undefined) => {
  return useQuery({
    queryKey: ["employee-training-profile", company, dni],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/general/${company}/employee-training-profile/${dni}`);
      return data;
    },
    enabled: !!company && !!dni,
  });
};
