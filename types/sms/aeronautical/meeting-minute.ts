import type { Employee } from "@/types";

export type AeronauticalMeetingMinuteStatus = "ABIERTA" | "CERRADA";

export type AeronauticalAuthorizedEmployeeRef = {
  id: number;
  dni_employee: string;
  from_company_db: string;
  full_name?: string;
};

export type AeronauticalMeetingAttendance = {
  id?: number;
  attendable_type?: string;
  attendable_id?: number;
  attendee_name?: string | null;
  job_title?: string | null;
  employee_id?: number | null;
  authorized_employee_id?: number | null;
  authorized_employee?: AeronauticalAuthorizedEmployeeRef | null;
  employee?: Employee | null;
  has_attended: boolean;
};

export type AeronauticalMeetingAgreement = {
  id?: number;
  meeting_minute_id?: number;
  description: string;
  /** Fecha aproximada de cumplimiento del acuerdo. */
  estimated_date?: string | null;
  responsible_employee_id?: number | null;
  responsible_authorized_employee_id?: number | null;
  responsible_name?: string | null;
  responsible_job_title?: string | null;
  responsible?: Employee | null;
  responsible_authorized_employee?: AeronauticalAuthorizedEmployeeRef | null;
};

export type AeronauticalMeetingMinute = {
  id: number;
  minute_number: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  status?: AeronauticalMeetingMinuteStatus;
  place: string;
  location_id: number;
  objective?: string | null;
  topics?: string | string[];
  photo?: string | null;
  document?: string | null;
  filled_out_by?: Employee | null;
  agreements?: AeronauticalMeetingAgreement[];
  attendees?: AeronauticalMeetingAttendance[];
  library_folder_paths?: string[];
  library_document_id?: number | null;
};

export type AeronauticalMeetingMinuteDetail = AeronauticalMeetingMinute & {
  department_id: number | string;
  attendees: (AeronauticalMeetingAttendance & {
    employee?: (Employee & { job_title?: { id: number; name: string } }) | null;
  })[];
  agreements: (AeronauticalMeetingAgreement & {
    responsible?:
      (Employee & { job_title?: { id: number; name: string } }) | null;
  })[];
};
