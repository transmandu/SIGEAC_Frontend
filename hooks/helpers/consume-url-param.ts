const pending = new Set<string>();
let scheduled = false;

/**
 * Retira de la URL un parámetro ya consumido (`accion`, `tab`). Varios hooks de
 * una misma pantalla pueden consumir parámetros distintos en el mismo instante:
 * se juntan en una sola navegación que parte de la URL actual, en vez de que
 * cada uno reescriba la suya con una copia vieja y reponga el parámetro del otro.
 */
export function consumeUrlParam(
  name: string,
  replace: (url: string) => void,
): void {
  pending.add(name);
  if (scheduled) return;

  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;

    const params = new URLSearchParams(window.location.search);
    pending.forEach((param) => params.delete(param));
    pending.clear();

    const query = params.toString();
    const { pathname } = window.location;

    replace(query ? `${pathname}?${query}` : pathname);
  });
}
