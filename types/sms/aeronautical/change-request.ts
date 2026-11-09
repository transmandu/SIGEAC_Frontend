import type {
  Department,
  Employee,
  Location,
  MitigationMeasure,
} from "@/types";

export type ChangeType = "INTERNO" | "EXTERNO";

export type ChangeStatus =
  | "BORRADOR"
  | "EN_REVISION"
  | "APROBADO"
  | "RECHAZADO"
  | "EN_EJECUCION"
  | "CERRADO";

export type PhotographicStage = "before" | "after";

export type ChangeReasonType = "INTERNO" | "EXTERNO";

export type ChangeReason = {
  id: number;
  type: ChangeReasonType;
  name: string;
  is_active: boolean;
  sort_order: number;
};

export type ChangeRequestReason = {
  id?: number;
  change_reason_id: number;
  name?: string;
  type?: ChangeReasonType;
  other_description?: string | null;
  reason?: ChangeReason;
  pivot?: {
    other_description?: string | null;
  };
};

export type ChangePhotographicRecord = {
  id: number;
  change_request_id: number;
  stage: PhotographicStage;
  image_url: string;
  created_at: string;
  updated_at: string;
};

export type ChangeHazardAnalysis = {
  id?: number;
  probability: string;
  severity: string;
  result: string;
  analysis_type?: string;
};

export type ChangeHazardPlan = {
  id?: number;
  area_responsible: string;
  possible_consequences: string;
  consequence_to_evaluate: string;
  description?: string;
  analysis?: ChangeHazardAnalysis | null;
  measures?: MitigationMeasure[];
};

export type ChangeHazard = {
  id: number;
  change_request_id: number;
  report_number: string;
  danger_type: string;
  description: string;
  location_id?: number | null;
  mitigation_plan?: ChangeHazardPlan | null;
  analysis?: ChangeHazardAnalysis | null;
};

export type ChangeRequest = {
  id: number;
  status: ChangeStatus;
  request_number: string;
  request_date: string;
  department_id: number;
  requested_by: Employee;
  approved_by: Employee | null;
  change_type: ChangeType;
  description: string;
  affects_other_departments: boolean;
  affects_other_processes: boolean;
  registered_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  department: Department;
  locations: Location[];
  affected_departments: Department[];
  reasons: ChangeRequestReason[];
  hazards: ChangeHazard[];
  hazards_count?: number;
  photographic_records: ChangePhotographicRecord[];
  document: string | null;
  library_document_id: number | null;
  library_folder_paths?: string[];
};

export type ChangeReasonPayload = {
  change_reason_id: number;
  other_description?: string | null;
};

export type ChangeHazardPayload = {
  id?: number;
  danger_type: string;
  description: string;
  possible_consequences: string;
  area_responsible: string;
  probability: number;
  severity: string;
  result: string;
  location_id?: number | null;
};

export type StoreChangeRequestPayload = {
  request_date: string;
  department_id: number;
  requested_by: number;
  approved_by?: number | null;
  change_type: ChangeType;
  description: string;
  affects_other_departments: boolean;
  affects_other_processes: boolean;
  locations: number[];
  affected_departments?: number[];
  reasons: ChangeReasonPayload[];
  hazards?: ChangeHazardPayload[];
  document?: string | File | null;
  library_folder_paths?: string[];
};

export type UpdateChangeRequestPayload = Partial<StoreChangeRequestPayload> & {
  status?: ChangeStatus;
  approved_by?: number | null;
};
