import type { ActivityCategory } from "@/types";

export interface AeronauticalActivityAttendance {
  id: number;
  sms_activity_id: number;
  employee_dni: string | null;
  authorized_employee_id: number | null;
  attended: boolean;
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    dni: string;
  } | null;
}

export interface AeronauticalActivity {
  id: number;
  activity_name: string;
  activity_number: string;
  place: string;
  description: string;
  image?: string | null;
  imageUrl?: string | null;
  document?: string | null;
  documentUrl?: string | null;
  library_document_id?: number | null;
  library_folder_paths?: string[];
  status: string;
  registered_by?: string;
  updated_by?: string | null;
  categories: ActivityCategory[];
  attendance?: AeronauticalActivityAttendance[];
}

export interface StoreAeronauticalActivityPayload {
  activity_name: string;
  activity_number: string;
  place: string;
  description: string;
  categories: string[];
  status?: string;
}

export interface UpdateAeronauticalActivityPayload extends Partial<StoreAeronauticalActivityPayload> {}

export const AERONAUTICAL_ACTIVITY_STATUSES = [
  "PENDIENTE",
  "PROCESO",
  "ABIERTO",
  "CERRADO",
] as const;

export type AeronauticalActivityStatus =
  (typeof AERONAUTICAL_ACTIVITY_STATUSES)[number];
