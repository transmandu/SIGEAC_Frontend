import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from "react";

const sameDeps = (a: readonly unknown[], b: readonly unknown[]) =>
  a.length === b.length &&
  a.every((value, index) => Object.is(value, b[index]));

/**
 * Estado que vuelve a su valor inicial cuando cambia alguno de `deps`.
 *
 * Es la forma de expresar "reinicia la página al filtrar", "vacía el formulario
 * al abrir" o "descarta la vista previa si cambia la entrada" sin un `useEffect`
 * que llame a `setState`: el efecto pintaba primero un render con el valor
 * viejo y luego otro con el nuevo. Aquí el valor correcto sale en el mismo
 * render, usando el ajuste de estado durante el render que documenta React
 * ("Adjusting some state when a prop changes").
 *
 * `init` puede ser el valor o una función que lo calcula; la función solo se
 * llama al montar y cuando cambian las dependencias, no en cada render.
 */
export function useResettingState<T>(
  init: T | (() => T),
  deps: readonly unknown[],
): [T, Dispatch<SetStateAction<T>>] {
  const create = () => (init instanceof Function ? init() : init);

  const [slot, setSlot] = useState(() => ({ deps, value: create() }));

  let current = slot;

  if (!sameDeps(slot.deps, deps)) {
    current = { deps, value: create() };
    setSlot(current);
  }

  const setValue = useCallback<Dispatch<SetStateAction<T>>>((next) => {
    setSlot((prev) => ({
      deps: prev.deps,
      value: next instanceof Function ? next(prev.value) : next,
    }));
  }, []);

  return [current.value, setValue];
}
