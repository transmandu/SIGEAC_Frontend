import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useGetEmployeeTrainingProfile = (company: string | undefined, dni: string | undefined) => {
  return useQuery({
    queryKey: ["employee-training-profile", company, dni],
    queryFn: async () => {
      // The prefix might be /general/{company} or just /{company}
      // According to backend route: Route::get('/{company}/employee-training-profile/{dni}', ...)
      // With the 'general' prefix from the group: /general/{company}/employee-training-profile/{dni}
      const { data } = await axiosInstance.get(`/general/${company}/employee-training-profile/${dni}`);
      return data;
    },
    enabled: !!company && !!dni,
  });
};
