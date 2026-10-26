/** Ids de los departamentos raíz y de todos los que cuelgan de ellos. */
export const departmentSubtree = (
  all: { id: number; department_parent_id?: number | null }[],
  rootIds: number[],
): Set<number> => {
  const childrenOf = new Map<number, number[]>();
  for (const d of all) {
    if (d.department_parent_id != null) {
      childrenOf.set(d.department_parent_id, [
        ...(childrenOf.get(d.department_parent_id) ?? []),
        d.id,
      ]);
    }
  }

  const found = new Set<number>();
  const pending = [...rootIds];
  while (pending.length > 0) {
    const id = pending.pop()!;
    if (found.has(id)) continue;
    found.add(id);
    pending.push(...(childrenOf.get(id) ?? []));
  }
  return found;
};

/** Huella de lo elegido con su fecha, para saber si algo cambió. */
export const signature = (
  keys: Iterable<string>,
  dates: Record<string, string>,
  fallback: string,
) =>
  [...keys]
    .sort()
    .map((key) => `${key}@${dates[key] ?? fallback}`)
    .join("|");
