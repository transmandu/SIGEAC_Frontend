/**
 * `rank` es texto libre: interno usa PRIMER_OFICIAL, externo "Primer Oficial",
 * y capitán aparece con y sin tilde. Normalizamos una sola vez para comparar.
 */
export const normalizeRank = (value?: string) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");

export const isCaptain = (pilot: { rank?: string }) =>
  normalizeRank(pilot.rank) === "CAPITAN";

export const isFirstOfficer = (pilot: { rank?: string }) =>
  normalizeRank(pilot.rank) === "PRIMER OFICIAL";
