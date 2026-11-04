/**
 * Estado del curso (`courses.status`). Debe coincidir con Course::STATUSES
 * del backend. ABIERTO admite inscripciones y cambios de calendario.
 */
export const COURSE_STATUSES = ["ABIERTO", "CERRADO"] as const;

export type CourseStatus = (typeof COURSE_STATUSES)[number];

const COURSE_STATUS_ES: Record<string, string> = {
  ABIERTO: "Abierto",
  CERRADO: "Cerrado",
};

export const courseStatusLabelEs = (status?: string | null) => {
  if (!status) return "N/A";
  const key = status.trim().toUpperCase();
  return COURSE_STATUS_ES[key] ?? key;
};

/** Igual que courseStatusLabelEs, en mayúsculas: "ABIERTO". */
export const courseStatusLabelEsUpper = (status?: string | null) =>
  courseStatusLabelEs(status).toLocaleUpperCase("es");

/**
 * Vigencia del entrenamiento del empleado (`employee_training.status`), derivada
 * de su fecha de expiración. Debe coincidir con EmployeeTraining::STATUSES.
 */
export const TRAINING_STATUSES = [
  "VALIDO",
  "PROXIMO A VENCER",
  "VENCIDO",
  "PENDIENTE",
] as const;

export type TrainingStatus = (typeof TRAINING_STATUSES)[number];

const TRAINING_STATUS_ES: Record<string, string> = {
  VALIDO: "Válido",
  "PROXIMO A VENCER": "Próximo a vencer",
  VENCIDO: "Vencido",
  PENDIENTE: "Pendiente",
};

export const trainingStatusLabelEs = (status?: string | null) => {
  if (!status) return "N/A";
  const key = status.trim().toUpperCase();
  return TRAINING_STATUS_ES[key] ?? key;
};

/** Igual que trainingStatusLabelEs, en mayúsculas: "VÁLIDO". */
export const trainingStatusLabelEsUpper = (status?: string | null) =>
  trainingStatusLabelEs(status).toLocaleUpperCase("es");

/** Eventos de la línea de tiempo del entrenamiento (employee_training_history). */
export const TRAINING_EVENT_ES: Record<string, string> = {
  VENCIDO: "Vencido",
  RENOVADO: "Renovado",
  "INICIAL TOMADO": "Inicial tomado",
};

export const trainingEventLabelEs = (event?: string | null) => {
  if (!event) return "N/A";
  return TRAINING_EVENT_ES[event.trim().toUpperCase()] ?? event;
};
