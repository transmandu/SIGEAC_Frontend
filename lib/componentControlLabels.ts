import { ComponentAction, ComponentLimitKind } from "@/types";

// Los valores viven en inglés en el backend (ComponentControlItem::ACTIONS,
// ComponentControlItemInterval::LIMIT_KINDS); acá solo se traducen.

export const COMPONENT_ACTION_LABELS: Record<ComponentAction, string> = {
  OVERHAUL: "Overhaul",
  CHECK: "Chequeo",
  TEST: "Testeo",
};

export const COMPONENT_LIMIT_KIND_LABELS: Record<ComponentLimitKind, string> = {
  HARD_TIME: "Hard Time",
  LIFE_LIMIT: "Life Limit",
};
