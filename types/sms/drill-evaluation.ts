/** Evaluación de simulacros de actividades SMS de aerolínea. */

export type DrillEvaluationType = "PARCIAL" | "MESA";

/** Respuesta de la evaluación de cada evento del simulacro parcial. */
export type DrillAnswer = "SI" | "NO" | "PARCIAL" | "NA";

/** Cumplimiento de cada fila de la matriz del simulacro de mesa. */
export type DrillCompliance = "SI" | "NO" | "PARCIAL";

export type DrillParticipantKind =
  | "PARTICIPANT"
  | "EXTINGUISHER_EXPERIENCED"
  | "AERONAUTICAL_FIREFIGHTER"
  | "MANDATORY";

export interface DrillEmployeeRef {
  id: number;
  first_name: string;
  last_name: string;
  dni?: string;
}

export interface DrillAuthorizedEmployeeRef {
  id: number;
  full_name?: string;
  dni_employee?: string;
  from_company_db?: string;
}

export interface DrillEvaluator {
  id: number;
  drill_evaluation_id: number;
  employee_id: number | null;
  authorized_employee_id: number | null;
  name: string | null;
  is_lead: boolean;
  sort: number;
  employee?: DrillEmployeeRef | null;
  authorized_employee?: DrillAuthorizedEmployeeRef | null;
}

export interface DrillParticipant {
  id: number;
  drill_evaluation_id: number;
  kind: DrillParticipantKind;
  name: string;
  job_title: string | null;
  sort: number;
}

export interface DrillEvent {
  id: number;
  drill_evaluation_id: number;
  name: string;
  registered_time: string | null;
  observations: string | null;
  question: string;
  answer: DrillAnswer;
  sort: number;
}

export interface DrillFinding {
  id: number;
  drill_evaluation_id: number;
  description: string;
  sort: number;
}

export interface DrillMatrixRow {
  id: number;
  drill_evaluation_id: number;
  criterion: string;
  performance_indicator: string;
  compliance: DrillCompliance;
  observations: string | null;
  sort: number;
}

export interface DrillImprovementAction {
  id: number;
  drill_evaluation_id: number;
  action: string;
  responsible_employee_id: number | null;
  responsible_authorized_employee_id: number | null;
  responsible_name: string | null;
  deadline: string | null;
  company_responsible_employee_id: number | null;
  company_responsible_authorized_employee_id: number | null;
  company_responsible_name: string | null;
  sort: number;
  responsible_employee?: DrillEmployeeRef | null;
  responsible_authorized_employee?: DrillAuthorizedEmployeeRef | null;
  company_responsible_employee?: DrillEmployeeRef | null;
  company_responsible_authorized_employee?: DrillAuthorizedEmployeeRef | null;
}

export interface DrillEvaluation {
  id: number;
  sms_activity_id: number;
  type: DrillEvaluationType;
  number: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  emergency: string;
  place: string;
  objective: string | null;
  hypothesis: string | null;
  coordinator_employee_id: number | null;
  coordinator_authorized_employee_id: number | null;
  coordinator_name: string | null;
  employee_participants_count: number | null;
  foreign_people_count: number | null;
  evacuated_count: number | null;
  observations: string | null;
  registered_by?: string;
  updated_by?: string | null;
  coordinator_employee?: DrillEmployeeRef | null;
  coordinator_authorized_employee?: DrillAuthorizedEmployeeRef | null;
  evaluators: DrillEvaluator[];
  participants: DrillParticipant[];
  events: DrillEvent[];
  findings: DrillFinding[];
  matrix_rows: DrillMatrixRow[];
  improvement_actions: DrillImprovementAction[];
}

/** Persona en un payload: una sola de las tres opciones debe venir con valor. */
export interface DrillPersonPayload {
  employee_id?: number | null;
  authorized_employee_id?: number | null;
  name?: string | null;
}

export interface DrillEvaluatorPayload extends DrillPersonPayload {
  is_lead: boolean;
}

export interface DrillParticipantPayload {
  kind: DrillParticipantKind;
  name: string;
  job_title?: string | null;
}

export interface DrillEventPayload {
  name: string;
  registered_time?: string | null;
  observations?: string | null;
  question: string;
  answer: DrillAnswer;
}

export interface DrillFindingPayload {
  description: string;
}

export interface DrillMatrixRowPayload {
  criterion: string;
  performance_indicator: string;
  compliance: DrillCompliance;
  observations?: string | null;
}

export interface DrillImprovementActionPayload {
  action: string;
  deadline?: string | null;
  responsible_employee_id?: number | null;
  responsible_authorized_employee_id?: number | null;
  responsible_name?: string | null;
  company_responsible_employee_id?: number | null;
  company_responsible_authorized_employee_id?: number | null;
  company_responsible_name?: string | null;
}

export interface StoreDrillEvaluationPayload {
  type: DrillEvaluationType;
  date: string;
  start_time: string;
  end_time: string;
  emergency: string;
  place: string;
  hypothesis?: string | null;
  objective?: string | null;
  observations?: string | null;
  coordinator_employee_id?: number | null;
  coordinator_authorized_employee_id?: number | null;
  coordinator_name?: string | null;
  employee_participants_count?: number | null;
  foreign_people_count?: number | null;
  evacuated_count?: number | null;
  evaluators: DrillEvaluatorPayload[];
  participants: DrillParticipantPayload[];
  events?: DrillEventPayload[];
  findings?: DrillFindingPayload[];
  matrix_rows?: DrillMatrixRowPayload[];
  improvement_actions?: DrillImprovementActionPayload[];
}

export type UpdateDrillEvaluationPayload = Omit<
  StoreDrillEvaluationPayload,
  "type"
>;
