export type MailTargetType =
  "ROLE" | "USER" | "EMPLOYEE" | "DEPARTMENT" | "EMAIL";

export interface MailNoticeStage {
  key: string;
  label: string;
}

/** Un aviso por correo configurable (catálogo del backend, `config/mail_notices.php`). */
export interface MailNotice {
  key: string;
  label: string;
  group: string | null;
  description: string | null;
  /** Vacío = el aviso no tiene etapas. */
  stages: MailNoticeStage[];
}

export interface MailRecipientRule {
  id: number;
  notice_key: string;
  target_type: MailTargetType;
  user_id: number | null;
  employee_id: number | null;
  department_id: number | null;
  role_name: string | null;
  email: string | null;
  label: string | null;
  /** null = todas las etapas. */
  stages: string[] | null;
  instruction: string | null;
  is_active: boolean;
  /** Nombre del destino ya resuelto por el servidor. */
  target_label: string;
  /** Correo del destino, si tiene. */
  target_detail: string | null;
}

export interface MailRecipientRulesResponse {
  notices: MailNotice[];
  rules: MailRecipientRule[];
}

/** Un aviso con sus reglas: la fila de la tabla. */
export interface MailNoticeRow extends MailNotice {
  rules: MailRecipientRule[];
}

export interface MailRecipientRulePayload {
  notice_key?: string;
  target_type?: MailTargetType;
  user_id?: number | null;
  employee_id?: number | null;
  department_id?: number | null;
  role_name?: string | null;
  email?: string | null;
  label?: string | null;
  stages?: string[] | null;
  instruction?: string | null;
  is_active?: boolean;
}

export interface MailAudiencePreviewRecipient {
  email: string;
  name: string | null;
  instruction: string | null;
}
