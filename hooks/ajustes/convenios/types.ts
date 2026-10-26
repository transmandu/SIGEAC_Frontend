/** Qué puede hacer una persona de otra empresa aquí; lo abre el convenio. */
export type CompanyScope =
  | "warehouse.dispatch"
  | "purchases.requisition"
  | "meetings.minutes"
  | "sms.activities"
  | "sms.change_management";

/** Persona de otra empresa habilitada para actuar aquí. */
export interface ExternalEmployee {
  id: number;
  dni_employee: string;
  from_company_db: string;
  from_company_name: string;
  to_company_db: string;
  employee_name: string;
  job_title: string;
  department: string;
  /** Rótulos de los alcances en que puede actuar. */
  scopes?: string[];
}

export interface CompanyLoanScope {
  scope: CompanyScope;
  label: string;
  module: string;
  description: string;
  is_active: boolean;
}

export interface CompanyLoanAgreement {
  id: number;
  /** Otorgante: dueña del recurso. */
  lender_company_slug: string;
  lender_company_name: string;
  /** Receptor: quien lo usa. */
  borrower_company_slug: string;
  borrower_company_name: string;
  is_active: boolean;
  /** Día (`YYYY-MM-DD`) desde el que está suspendido; null si está vigente. */
  suspended_at: string | null;
  created_by: string | null;
  created_at: string;
  scopes: CompanyLoanScope[];
}

export interface CompanyLoansResponse {
  /** Empresas a las que esta otorga acceso a sus módulos. */
  granted: CompanyLoanAgreement[];
  /** Empresas cuyos módulos puede usar esta. */
  received: CompanyLoanAgreement[];
}

/** Un alcance del catálogo: lo que una empresa puede abrir a otra. */
export interface CompanyScopeInfo {
  scope: CompanyScope;
  label: string;
  module: string;
  description: string;
}

/** Lo vigente hoy de la audiencia de un alcance recibido. */
export interface LoanAudience {
  scope: CompanyScope;
  is_active: boolean;
  /** `valid_from` (`YYYY-MM-DD`): desde cuándo vale la elección. */
  employees: { dni: string; name: string; valid_from: string }[];
  departments: { id: number; valid_from: string }[];
  /** Personas de un departamento elegido que se dejaron fuera, con desde cuándo. */
  excluded: { dni: string; valid_from: string }[];
}

export interface LoanPersonnel {
  dni: string;
  first_name: string;
  last_name: string;
  department: string | null;
  job_title: string | null;
  /** Rótulos de los alcances en que puede actuar. */
  scopes: string[];
}

/** Mismos valores que el enum `AgreementEvent` del servidor. */
export type LoanHistoryEventType =
  | "agreement_created"
  | "agreement_suspended"
  | "agreement_resumed"
  | "scope_opened"
  | "scope_closed"
  | "scope_reopened"
  | "person_added"
  | "person_removed"
  | "department_added"
  | "department_removed"
  | "person_excluded"
  | "exclusion_lifted";

export interface LoanHistoryEvent {
  /** `YYYY-MM-DD` */
  date: string;
  type: LoanHistoryEventType;
  /** Rótulo del alcance, si el hecho es de uno. */
  scope: string | null;
  /** Persona o departamento afectado. */
  subject: string | null;
  by: string | null;
}

export interface LoanDepartment {
  id: number;
  name: string;
  acronym: string | null;
}
