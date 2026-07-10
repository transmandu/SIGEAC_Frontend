import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type MeetingMinuteDetail = {
  id: number;
  date: string;
  place: string;
  location_id: number;
  objective?: string;
  topics?: string;
  photo?: string;
  document?: string;
  department_id: number;
  chaired_by: {
    id: number;
    first_name: string;
    last_name: string;
    dni: string;
  };
  filled_out_by: {
    id: number;
    first_name: string;
    last_name: string;
    dni: string;
  };
  reviewed_by?: {
    id: number;
    first_name: string;
    last_name: string;
    dni: string;
  } | null;
  approved_by?: {
    id: number;
    first_name: string;
    last_name: string;
    dni: string;
  } | null;
  attendees: {
    id: number;
    employee_id?: number | null;
    attendee_name?: string | null;
    job_title?: string | null;
    has_attended: boolean;
    employee?: {
      id: number;
      first_name: string;
      last_name: string;
      dni: string;
    } | null;
  }[];
  agreements: {
    id: number;
    description: string;
    responsible_employee_id?: number | null;
    responsible_name?: string | null;
    responsible_employee?: {
      id: number;
      first_name: string;
      last_name: string;
    } | null;
  }[];
};

const fetchMeetingMinuteByDepartment = async (
  id: string,
  location: string,
  company?: string,
): Promise<MeetingMinuteDetail> => {
  const { data } = await axiosInstance.get(
    `/${company}/${location}/meeting-minutes/${id}`,
  );
  return data;
};

export const useGetMeetingMinuteByDepartment = (
  id: string,
  location: string,
  company?: string,
) => {
  return useQuery<MeetingMinuteDetail>({
    queryKey: ["meeting-minute-department", id, location, company],
    queryFn: () => fetchMeetingMinuteByDepartment(id, location, company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company && !!location && !!id,
  });
};
