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

/**
 * Evento de un simulacro PARCIAL. La descripción (`name`) es una copia de la
 * plantilla; aquí solo se capturan hora registrada y observaciones.
 */
export interface DrillEvent {
  id: number;
  drill_evaluation_id: number;
  drill_event_template_id: number | null;
  name: string;
  registered_time: string | null;
  observations: string | null;
  sort: number;
}

/**
 * Pregunta respondida en un simulacro PARCIAL. Independiente de los eventos.
 * La descripción es una copia de la plantilla; aquí solo se captura la respuesta.
 */
export interface DrillQuestion {
  id: number;
  drill_evaluation_id: number;
  drill_question_template_id: number | null;
  description: string;
  answer: DrillAnswer;
  sort: number;
}

/** Evento predeterminado del simulacro PARCIAL (plantilla). */
export interface DrillEventTemplate {
  id: number;
  description: string;
  sort: number;
}

/** Pregunta predeterminada del simulacro PARCIAL (plantilla). */
export interface DrillQuestionTemplate {
  id: number;
  description: string;
  sort: number;
}

export interface DrillFinding {
  id: number;
  drill_evaluation_id: number;
  description: string;
  sort: number;
}

/**
 * Criterio de la plantilla fija de la matriz de evaluación. Se siembra una
 * sola vez por tenant y es común a todas las evaluaciones de mesa.
 */
export interface DrillMatrixCriterion {
  id: number;
  criterion: string;
  performance_indicator: string;
  sort: number;
}

export interface DrillMatrixRow {
  id: number;
  drill_evaluation_id: number;
  /** Criterio de la plantilla que originó la fila. Puede ser null en filas antiguas. */
  drill_matrix_criterion_id: number | null;
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
  /** Ruta del acta dentro de la Librería (solo simulacros de mesa). */
  document: string | null;
  /** Referencia al documento de la Librería donde vive el acta. */
  library_document_id: number | null;
  /** Carpetas donde está el acta; la primera es la principal. */
  library_folder_paths?: string[];
  registered_by?: string;
  updated_by?: string | null;
  coordinator_employee?: DrillEmployeeRef | null;
  coordinator_authorized_employee?: DrillAuthorizedEmployeeRef | null;
  evaluators: DrillEvaluator[];
  participants: DrillParticipant[];
  events: DrillEvent[];
  questions: DrillQuestion[];
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

/**
 * Datos de un evento PARCIAL. La descripción no se envía: la copia el
 * servidor desde la plantilla. Solo hora y observaciones (opcionales).
 */
export interface DrillEventPayload {
  /** Id del evento existente, solo al editar. */
  event_id?: number;
  /** Id del evento de la plantilla que se está registrando. */
  drill_event_template_id?: number | null;
  registered_time?: string | null;
  observations?: string | null;
}

/**
 * Respuesta de una pregunta PARCIAL. La descripción no se envía: la copia el
 * servidor desde la plantilla.
 */
export interface DrillQuestionPayload {
  /** Id de la pregunta existente, solo al editar. */
  question_id?: number;
  /** Id de la pregunta de la plantilla que se está respondiendo. */
  drill_question_template_id?: number | null;
  answer: DrillAnswer;
}

export interface DrillFindingPayload {
  description: string;
}

/**
 * Respuesta de una fila de la matriz. Los textos del criterio y del
 * indicador no se envían: los copia el servidor desde la plantilla.
 */
export interface DrillMatrixRowPayload {
  /** Id de la fila existente, solo al editar. */
  matrix_row_id?: number;
  /** Id del criterio de la plantilla que se está respondiendo. */
  drill_matrix_criterion_id?: number | null;
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
  questions?: DrillQuestionPayload[];
  findings?: DrillFindingPayload[];
  matrix_rows?: DrillMatrixRowPayload[];
  improvement_actions?: DrillImprovementActionPayload[];
}

export type UpdateDrillEvaluationPayload = Omit<
  StoreDrillEvaluationPayload,
  "type"
>;
