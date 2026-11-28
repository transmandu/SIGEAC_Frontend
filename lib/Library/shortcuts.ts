/**
 * Piezas puras de los atajos de teclado de la biblioteca (sin React), para
 * poder probarlas aparte.
 */

/**
 * Elementos que ya reaccionan al teclado por sí solos: un atajo de la
 * biblioteca no debe quitarles Enter, espacio, las flechas ni el texto.
 */
const INTERACTIVE =
  'input, textarea, select, button, a[href], [contenteditable=""], [contenteditable="true"], [role="button"], [role="menuitem"], [role="checkbox"], [role="radio"], [role="tab"], [role="combobox"], [role="option"], [role="textbox"], [role="slider"]';

/**
 * Menús, diálogos, popovers y listas desplegables abiertos: mientras haya uno,
 * el teclado es suyo. Los tooltips no cuentan: salen solos al pasar el cursor.
 */
const OVERLAYS =
  '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]';

export function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(INTERACTIVE) !== null;
}

export function hasOpenOverlay(root: ParentNode = document): boolean {
  return root.querySelector(OVERLAYS) !== null;
}

/** Cuántas columnas tiene una cuadrícula ya pintada: las tarjetas de la primera fila. */
export function gridColumns(grid: HTMLElement | null): number {
  const cards = grid ? Array.from(grid.children) : [];
  if (cards.length === 0) return 1;

  const firstTop = (cards[0] as HTMLElement).offsetTop;
  const inFirstRow = cards.filter(
    (card) => (card as HTMLElement).offsetTop === firstTop,
  ).length;

  return Math.max(1, inFirstRow);
}

export type NavigationKey =
  "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "Home" | "End";

export const isNavigationKey = (key: string): key is NavigationKey =>
  ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(
    key,
  );

/**
 * A qué documento pasa el cursor. `current` es su posición actual (-1 si no
 * hay ninguno); en lista solo cuentan arriba y abajo, en cuadrícula también
 * izquierda y derecha, y arriba y abajo saltan una fila (`columns`). Devuelve
 * `null` si la tecla no mueve nada en esa vista.
 */
export function nextIndex(
  key: NavigationKey,
  current: number,
  count: number,
  columns: number,
  grid: boolean,
): number | null {
  if (count === 0) return null;
  const last = count - 1;
  const step = grid ? columns : 1;

  switch (key) {
    case "Home":
      return 0;
    case "End":
      return last;
    case "ArrowDown":
      return current < 0 ? 0 : Math.min(current + step, last);
    case "ArrowUp":
      return current < 0 ? 0 : Math.max(current - step, 0);
    case "ArrowRight":
      if (!grid) return null;
      return current < 0 ? 0 : Math.min(current + 1, last);
    case "ArrowLeft":
      if (!grid) return null;
      return current < 0 ? 0 : Math.max(current - 1, 0);
  }
}

/** Los ids entre dos posiciones, ambas incluidas (para ampliar la selección con Mays). */
export function idsBetween(ids: number[], from: number, to: number): number[] {
  const [start, end] = from <= to ? [from, to] : [to, from];
  return ids.slice(Math.max(start, 0), end + 1);
}

/**
 * El evento se originó DENTRO del elemento que lo maneja. React hace burbujear
 * los eventos de un portal (diálogos, menús) hacia el componente que los
 * montó, aunque en el DOM estén fuera: sin esta comprobación, un doble clic o
 * un clic derecho dentro de un diálogo de un documento lo abriría o lanzaría
 * su menú.
 */
export const isOwnEvent = (event: {
  currentTarget: EventTarget | null;
  target: EventTarget | null;
}): boolean =>
  event.currentTarget instanceof Node &&
  event.target instanceof Node &&
  event.currentTarget.contains(event.target);
