import type { AudienceRule } from "@/components/forms/recipients/audience-types";

/** Una opción de comportamiento que la alerta declara (hoy solo de tipo lista). */
export interface CriticalAlertOption {
  key: string;
  label: string;
  type: "enum";
  options: Record<string, string>;
  default: string;
  help?: string;
  /** Lo que la compañía tiene elegido (o el valor por defecto). */
  value: string;
}

/** Una alerta crítica tal como la configura la compañía. */
export interface CriticalAlertConfig {
  key: string;
  label: string;
  description: string;
  group: string;
  /** El sistema la genera por día en lugar de calcularla en vivo. */
  generates: boolean;
  /** Clave del aviso por correo que puede disparar, si dispara alguno. */
  mail_notice: string | null;
  is_enabled: boolean;
  options: CriticalAlertOption[];
}

/** Quién ve una alerta crítica en su panel. No tiene relación con los destinatarios de correo. */
export interface CriticalAlertAudienceRule extends AudienceRule {
  alert_key: string;
}

/** Una alerta con las reglas de quién la ve: la fila de la tabla. */
export interface CriticalAlertRow extends CriticalAlertConfig {
  rules: CriticalAlertAudienceRule[];
}
