// Guarda estado a nivel de módulo, que en el servidor sería compartido entre
// peticiones concurrentes. Marcarlo como cliente evita que alguien lo importe
// por error desde un server component.
"use client";

export const BASE_TITLE = "SIGEAC";

/**
 * El título de la pestaña lo dibuja el navegador con la fuente del sistema
 * (Segoe UI en Windows), no con la del sitio: no hay CSS que lo controle.
 * Por eso se usa el punto medio, que está bien hinteado y centrado en la
 * altura del texto. El pipe `|` cuelga bajo la línea base y los caracteres
 * de caja (U+2502) se rasterizan borrosos fuera de una grilla de terminal.
 */
const SEP = "·";

/**
 * Único dueño de document.title. El título de página y el contador de
 * notificaciones son fuentes independientes: si cada una escribiera por su
 * cuenta, la última en correr pisaría a la otra. Aquí se componen.
 */
type TitleState = {
  page: string;
  unread: number;
  burst: string | null;
};

const state: TitleState = { page: "", unread: 0, burst: null };

const compose = () => {
  const base = state.page ? `${BASE_TITLE} ${SEP} ${state.page}` : BASE_TITLE;

  if (state.burst) return `(${state.unread}) ${state.burst} ${SEP} ${BASE_TITLE}`;
  if (state.unread > 0) return `(${state.unread}) ${base}`;

  return base;
};

const flush = () => {
  if (typeof document === "undefined") return;

  const next = compose();
  if (document.title !== next) document.title = next;
};

export const setPageTitle = (page: string) => {
  state.page = page;
  flush();
};

export const setUnreadCount = (unread: number) => {
  state.unread = unread;
  flush();
};

/** Mensaje temporal al llegar notificaciones; se limpia con clearBurst. */
export const setBurst = (label: string | null) => {
  state.burst = label;
  flush();
};

export const getPageTitle = () => state.page;
