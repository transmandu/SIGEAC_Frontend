import { useMemo } from "react";

const rawId = (row: unknown): string | null => {
  if (typeof row !== "object" || row === null || !("id" in row)) return null;

  const id = (row as { id: unknown }).id;

  return typeof id === "string" || typeof id === "number" ? String(id) : null;
};

/**
 * Identidad de fila para TanStack: el `id` del registro cuando todos lo traen y
 * ninguno se repite; la posición en cualquier otro caso.
 *
 * Sin esto, la fila se identifica por su posición en el arreglo. Si un refetch
 * mete o saca registros, el estado atado a esa posición —fila expandida,
 * diálogo abierto en la celda de acciones— se queda en la fila equivocada y el
 * usuario actúa sobre otro documento sin notarlo.
 */
export function useStableRowId<TData>(data: readonly TData[]) {
  const byRecordId = useMemo(() => {
    const seen = new Set<string>();

    for (const row of data) {
      const id = rawId(row);
      if (id === null || seen.has(id)) return false;
      seen.add(id);
    }

    return true;
  }, [data]);

  return useMemo(
    () => (row: TData, index: number) =>
      byRecordId ? (rawId(row) as string) : String(index),
    [byRecordId],
  );
}
