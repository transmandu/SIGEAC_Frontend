/**
 * Categorias de actividad SMS que requieren un paso extra en el wizard de
 * "nueva actividad": el contenido (boletin / encuesta) se crea despues y se
 * asocia a la actividad.
 *
 * Los nombres de categoria son texto libre editable por el usuario
 * (ActivityCategoriesForm) y pueden venir con tildes o en plural
 * ("BOLETÍN", "BOLETINES", "ENCUESTAS"), por eso se comparan normalizados.
 */
export type ActivityContentKind = "boletin" | "encuesta";

const CONTENT_KEYWORDS: Record<ActivityContentKind, string> = {
  boletin: "BOLETIN",
  encuesta: "ENCUESTA",
};

export const normalizeActivityCategoryName = (name: string): string =>
  (name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

export const isActivityContentCategory = (
  name: string,
  kind: ActivityContentKind,
): boolean =>
  normalizeActivityCategoryName(name).includes(CONTENT_KEYWORDS[kind]);

/**
 * Contenidos a crear para las categorias seleccionadas, en el orden en que se
 * deben resolver (boletin primero, luego encuesta). Devuelve [] cuando la
 * actividad no necesita paso extra.
 */
export const getActivityContentKinds = (
  categoryNames: string[],
): ActivityContentKind[] =>
  (Object.keys(CONTENT_KEYWORDS) as ActivityContentKind[]).filter((kind) =>
    categoryNames.some((name) => isActivityContentCategory(name, kind)),
  );
