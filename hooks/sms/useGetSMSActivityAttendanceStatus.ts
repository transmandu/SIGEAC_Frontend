import axiosInstance from "@/lib/axios";
import { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface EnrolledEmployees {
  attended: Employee[];
  not_attended: Employee[];
}

const fetchGetActivityAttendanceStatus = async ({
  activity_id,
  company,
}: {
  activity_id: string;
  company: string | null;
}): Promise<EnrolledEmployees> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/activities/${activity_id}/employee-attendance-status`
  );
  return data;
};

export const useGetSMSActivityAttendanceStatus = ({
  activity_id,
  company,
}: {
  company: string | null;
  activity_id: string;
}) => {
  const value = {
    activity_id: activity_id,
    company: company,
  };
  return useQuery<EnrolledEmployees>({
    queryKey: ["sms-activity-attendance-status",activity_id],
    queryFn: () => fetchGetActivityAttendanceStatus(value),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
