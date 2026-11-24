import type { AudienceRule } from "@/components/forms/recipients/audience-types";

/** Una notificación in-app configurable (catálogo del backend, `config/in_app_notices.php`). */
export interface InAppNotice {
  key: string;
  label: string;
  group: string | null;
  description: string | null;
}

/** A quién le llega una notificación in-app. No tiene relación con los correos ni con las alertas críticas. */
export interface InAppAudienceRule extends AudienceRule {
  notice_key: string;
}

export interface InAppAudienceResponse {
  notices: InAppNotice[];
  rules: InAppAudienceRule[];
}

/** Una notificación con las reglas de a quién le llega: la fila de la tabla. */
export interface InAppNoticeRow extends InAppNotice {
  rules: InAppAudienceRule[];
}
