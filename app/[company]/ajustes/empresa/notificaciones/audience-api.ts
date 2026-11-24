import {
  useCreateInAppAudienceRule,
  useDeleteInAppAudienceRule,
  useUpdateInAppAudienceRule,
} from "@/actions/ajustes/notificaciones/actions";
import type {
  AudienceApi,
  AudienceCopy,
} from "@/components/forms/recipients/audience-types";

/** A quién le llega cada notificación in-app. Nada que ver con los correos ni con las alertas. */
export const IN_APP_AUDIENCE_API: AudienceApi = {
  keyField: "notice_key",
  useCreate: () => useCreateInAppAudienceRule().createRule,
  useUpdate: () => useUpdateInAppAudienceRule().updateRule,
  useDelete: () => useDeleteInAppAudienceRule().deleteRule,
};

export const IN_APP_AUDIENCE_COPY: AudienceCopy = {
  panelTitle: "Quién la recibe",
  panelHint:
    "Quién recibe esta notificación dentro del sistema. No es quien recibe el correo del mismo aviso. El superusuario siempre la recibe.",
  emptyTitle: "Nadie recibe esta notificación",
  emptyDescription:
    "Agregue un rol, usuario, empleado o departamento para que la reciba.",
  formTitleNew: "Agregar a quien la recibe",
  formTitleEdit: "Editar quién la recibe",
  formIntro: (label) => `Quién recibe ${label}.`,
  formSectionTitle: "Quién la recibe",
  formSectionHint: "A quién le llega esta notificación dentro del sistema.",
  inactiveHint:
    "Desactivada, deja de recibir la notificación pero se conserva para volver a activarla.",
  removeTitle: "Quitar de la audiencia",
  removeWarning: "Dejará de recibir esta notificación.",
};
