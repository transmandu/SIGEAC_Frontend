/**
 * Estado del curso (`courses.status`). Debe coincidir con Course::STATUSES
 * del backend. OPEN admite inscripciones y cambios de calendario.
 */
export const COURSE_STATUSES = ["OPEN", "CLOSED"] as const;

export type CourseStatus = (typeof COURSE_STATUSES)[number];

const COURSE_STATUS_ES: Record<string, string> = {
  OPEN: "Abierto",
  CLOSED: "Cerrado",
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
  "VALID",
  "EXPIRING_SOON",
  "EXPIRED",
  "PENDING",
] as const;

export type TrainingStatus = (typeof TRAINING_STATUSES)[number];

const TRAINING_STATUS_ES: Record<string, string> = {
  VALID: "Válido",
  EXPIRING_SOON: "Próximo a vencer",
  EXPIRED: "Vencido",
  PENDING: "Pendiente",
};

export const trainingStatusLabelEs = (status?: string | null) => {
  if (!status) return "N/A";
  const key = status.trim().toUpperCase();
  return TRAINING_STATUS_ES[key] ?? key;
};

/** Igual que trainingStatusLabelEs, en mayúsculas: "VÁLIDO". */
export const trainingStatusLabelEsUpper = (status?: string | null) =>
  trainingStatusLabelEs(status).toLocaleUpperCase("es");
