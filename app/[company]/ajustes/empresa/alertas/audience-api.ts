import {
  useCreateAlertAudienceRule,
  useDeleteAlertAudienceRule,
  useUpdateAlertAudienceRule,
} from "@/actions/ajustes/alertas/audience-actions";
import type {
  AudienceApi,
  AudienceCopy,
} from "@/components/forms/recipients/audience-types";

/** Quién ve cada alerta crítica en su panel. Nada que ver con los correos. */
export const ALERT_AUDIENCE_API: AudienceApi = {
  keyField: "alert_key",
  useCreate: () => useCreateAlertAudienceRule().createRule,
  useUpdate: () => useUpdateAlertAudienceRule().updateRule,
  useDelete: () => useDeleteAlertAudienceRule().deleteRule,
};

export const ALERT_AUDIENCE_COPY: AudienceCopy = {
  panelTitle: "Quién la ve",
  panelHint:
    "Quién la ve en su panel de alertas críticas. No es quien recibe el correo de la alerta. El superusuario siempre ve las activas.",
  emptyTitle: "Nadie ve esta alerta",
  emptyDescription:
    "Agregue un rol, usuario, empleado o departamento para que la vea en su panel.",
  formTitleNew: "Agregar a quien la ve",
  formTitleEdit: "Editar quién la ve",
  formIntro: (label) => `Quién ve ${label}.`,
  formSectionTitle: "Quién la ve",
  formSectionHint:
    "A quién se le muestra esta alerta en su panel de alertas críticas.",
  inactiveHint:
    "Desactivada, deja de ver la alerta pero se conserva para volver a activarla.",
  removeTitle: "Quitar de la audiencia",
  removeWarning: "Dejará de ver esta alerta en su panel.",
};
