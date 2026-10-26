import { format, parseISO } from "date-fns";

const day = (value: string) => value.slice(0, 10);

const today = () => format(new Date(), "yyyy-MM-dd");

/** Vencido: su fecha es anterior a hoy. El día de vencimiento aún sirve. */
export function isExpired(expiration?: string | null) {
  return !!expiration && day(expiration) < today();
}

export function formatExpiration(expiration: string) {
  return format(parseISO(day(expiration)), "dd/MM/yyyy");
}

/**
 * Orden de salida de los artículos con vencimiento: primero el que vence antes,
 * luego los que no vencen y al final los ya vencidos. Estable: a igualdad
 * respeta el orden original.
 */
export function sortByExpiration<T extends { expiration_date?: string | null }>(
  articles: T[],
): T[] {
  const rank = (a: T) =>
    isExpired(a.expiration_date) ? 2 : a.expiration_date ? 0 : 1;

  return [...articles].sort((a, b) => {
    const byRank = rank(a) - rank(b);
    if (byRank !== 0) return byRank;
    if (rank(a) === 1) return 0;
    return day(a.expiration_date!).localeCompare(day(b.expiration_date!));
  });
}
