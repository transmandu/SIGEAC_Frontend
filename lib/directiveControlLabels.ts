import {
  DirectiveApplicability,
  DirectiveAuthority,
  DirectiveComplianceType,
} from "@/types";

// Valores en inglés en el backend (DirectiveControlItem::AUTHORITIES,
// ::APPLICABILITIES, ::COMPLIANCE_TYPES); acá solo se traducen.

export const DIRECTIVE_AUTHORITY_LABELS: Record<DirectiveAuthority, string> = {
  INAC: "INAC",
  FAA: "FAA",
  EASA: "EASA",
  OTHER: "Otra",
};

export const DIRECTIVE_APPLICABILITY_LABELS: Record<
  DirectiveApplicability,
  string
> = {
  PENDING_ANALYSIS: "Pendiente de análisis",
  APPLICABLE: "Aplicable",
  NOT_APPLICABLE: "No aplicable",
  SUPERSEDED: "Supersedida",
};

export const DIRECTIVE_COMPLIANCE_TYPE_LABELS: Record<
  DirectiveComplianceType,
  string
> = {
  ONE_TIME: "Única vez",
  RECURRENT: "Recurrente",
};
