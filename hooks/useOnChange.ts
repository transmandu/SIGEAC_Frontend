import { useState } from "react";

const sameDeps = (a: readonly unknown[], b: readonly unknown[]) =>
  a.length === b.length && a.every((value, index) => Object.is(value, b[index]));

/**
 * Ejecuta `adjust` en el render en que cambia alguna de `deps` (y en el primero).
 *
 * Es para reiniciar *varios* estados a la vez cuando algo cambia (abrir un
 * diálogo, elegir otro registro). Reemplaza al `useEffect` que llamaba a varios
 * `setState`: el efecto pintaba un render con los valores viejos antes de
 * corregirlos; aquí React descarta ese render y vuelve a empezar con los
 * valores ya ajustados ("Adjusting some state when a prop changes", react.dev).
 *
 * `adjust` solo debe llamar a setters de estado de este mismo componente. Si
 * hay un único estado que reiniciar, `useResettingState` es más directo.
 */
export function useOnChange(
  deps: readonly unknown[],
  adjust: () => void,
): void {
  const [seen, setSeen] = useState<readonly unknown[] | null>(null);

  if (seen === null || !sameDeps(seen, deps)) {
    setSeen(deps);
    adjust();
  }
}
