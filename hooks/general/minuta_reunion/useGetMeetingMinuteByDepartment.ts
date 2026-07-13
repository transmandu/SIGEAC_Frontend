import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type MeetingMinuteDetail = {
  id: number;
  date: string;
  place: string;
  location_id: string;
  objective?: string;
  topics?: string | string[];
  photo?: string | null;
  document?: string | null;
  department_id: string;
  chaired_by: {
    id: number;
    first_name: string;
    last_name: string;
    job_title: {
      id: number;
      name: string;
    };
  };
  filled_out_by: {
    id: number;
    first_name: string;
    last_name: string;
    job_title: {
      id: number;
      name: string;
    };
  };
  reviewed_by?: {
    id: number;
    first_name: string;
    last_name: string;
    job_title: {
      id: number;
      name: string;
    };
  } | null;
  approved_by?: {
    id: number;
    first_name: string;
    last_name: string;
    job_title: {
      id: number;
      name: string;
    };
  } | null;
  attendees: {
    id: string;
    employee_id?: string | null;
    attendee_name?: string | null;
    job_title?: string | null;
    has_attended: boolean | string;
    employee?: {
      id: number;
      first_name: string;
      last_name: string;
      job_title: {
        id: number;
        name: string;
      };
    } | null;
  }[];
  agreements: {
    id: number;
    description: string;
    responsible_employee_id?: string | null;
    responsible_name?: string | null;
    responsible_job_title?: string | null;
    responsible?: {
      id: number;
      first_name: string;
      last_name: string;
      job_title: {
        id: number;
        name: string;
      };
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
