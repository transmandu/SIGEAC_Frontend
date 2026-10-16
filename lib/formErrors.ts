export interface FieldIssue {
  field: string;
  message: string;
}

/**
 * Aplana el árbol de errores de react-hook-form a un mensaje por campo.
 *
 * Los campos de lista (alternos, seriales) guardan el error en cada elemento y
 * no en el campo, por eso hay que bajar al árbol; `ref` es el elemento del DOM
 * y recorrerlo se metería en el árbol de React.
 */
export const collectIssues = (errors: unknown, field = ""): FieldIssue[] => {
  if (!errors || typeof errors !== "object") return [];

  const { message } = errors as { message?: unknown };
  if (typeof message === "string" && message) return [{ field, message }];

  return Object.entries(errors).flatMap(([key, nested]) =>
    key === "ref" || key === "types"
      ? []
      : collectIssues(nested, field ? `${field}.${key}` : key),
  );
};
