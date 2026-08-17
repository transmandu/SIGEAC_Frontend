import type { Row, SortingFn } from "@tanstack/react-table";

const EMPTY = new Set(["", "n/a", "—", "-", "sin asignar", "sin descripción", "sin condición"]);

const isEmpty = (value: unknown) => {
  if (value == null) return true;
  return EMPTY.has(String(value).trim().toLowerCase());
};

/** símbolos → números → letras */
const bucket = (char: string) => {
  if (/\d/.test(char)) return 1;
  if (/[a-zA-ZÀ-ÿ]/.test(char)) return 2;
  return 0;
};

/**
 * Compara alfanuméricamente: agrupa por tipo de carácter y trata los dígitos
 * como números, de modo que "PN-2" va antes de "PN-10" en vez de después.
 */
export const compareAlphanumeric = (a: string, b: string): number => {
  const left = a.trim();
  const right = b.trim();

  const chunk = /(\d+|\D)/g;
  const lChunks = left.match(chunk) ?? [];
  const rChunks = right.match(chunk) ?? [];

  for (let i = 0; i < Math.min(lChunks.length, rChunks.length); i++) {
    const l = lChunks[i];
    const r = rChunks[i];

    const lNum = /^\d+$/.test(l);
    const rNum = /^\d+$/.test(r);

    if (lNum && rNum) {
      const diff = Number(l) - Number(r);
      if (diff !== 0) return diff;
      continue;
    }

    const lBucket = bucket(l[0]);
    const rBucket = bucket(r[0]);
    if (lBucket !== rBucket) return lBucket - rBucket;

    const diff = l.localeCompare(r, "es", { sensitivity: "base" });
    if (diff !== 0) return diff;
  }

  return lChunks.length - rChunks.length;
};

/**
 * Ordena por el texto que la celda realmente muestra. `getValue` de la columna
 * no sirve cuando la celda combina campos (serial/lote) o lee un anidado.
 */
export const textSortingFn =
  <TData,>(accessor: (row: TData) => unknown): SortingFn<TData> =>
  (rowA: Row<TData>, rowB: Row<TData>) => {
    const a = accessor(rowA.original);
    const b = accessor(rowB.original);

    // Los vacíos siempre al final, sin importar la dirección.
    const aEmpty = isEmpty(a);
    const bEmpty = isEmpty(b);
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;

    return compareAlphanumeric(String(a), String(b));
  };

export const numericSortingFn =
  <TData,>(accessor: (row: TData) => number | null | undefined): SortingFn<TData> =>
  (rowA: Row<TData>, rowB: Row<TData>) => {
    const a = accessor(rowA.original);
    const b = accessor(rowB.original);

    const aEmpty = a == null || Number.isNaN(a);
    const bEmpty = b == null || Number.isNaN(b);
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;

    return (a as number) - (b as number);
  };

export const dateSortingFn =
  <TData,>(accessor: (row: TData) => Date | null | undefined): SortingFn<TData> =>
  (rowA: Row<TData>, rowB: Row<TData>) => {
    const a = accessor(rowA.original);
    const b = accessor(rowB.original);

    const aEmpty = !a || Number.isNaN(a.getTime());
    const bEmpty = !b || Number.isNaN(b.getTime());
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;

    return (a as Date).getTime() - (b as Date).getTime();
  };
