// Configuration constants
export const PAGINATION_CONFIG = {
  INITIAL_PAGE: 1,
  INITIAL_PER_PAGE: 25,
} as const;

// Grid configuration
export const ARTICLE_GRID = {
  MOBILE_COLS: 1,
  TABLET_COLS: 3,
  DESKTOP_COLS: 6,
} as const;

// Change indicators
export const CHANGE_COLORS = {
  QUANTITY: {
    border: "border-orange-500",
    background: "bg-orange-50",
  },
  ZONE: {
    border: "border-blue-500", 
    background: "bg-blue-50",
  },
  JUSTIFICATION: {
    valid: {
      border: "border-green-500",
      background: "bg-green-50",
    },
    invalid: {
      border: "border-red-500",
      background: "bg-red-50",
    },
  },
  MODIFIED_ARTICLE: {
    border: "border-orange-300",
    background: "bg-orange-50/50",
    hover: "hover:bg-orange-100/50",
  },
} as const;

// Validation rules
export const VALIDATION = {
  MIN_JUSTIFICATION_LENGTH: 1,
  MIN_QUANTITY: 0,
} as const;

// Toast messages
export const TOAST_MESSAGES = {
  NO_CHANGES: "No hay cambios para guardar",
  JUSTIFICATION_REQUIRED: "Justificación requerida",
  SAVE_SUCCESS: "¡Actualizado!",
  SAVE_SUCCESS_DESCRIPTION: "Las cantidades y ubicaciones han sido actualizadas correctamente.",
} as const;
