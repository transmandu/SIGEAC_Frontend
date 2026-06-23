const PRIORITY_RANK = { LOW: 0, MEDIUM: 1, HIGH: 2 } as const;

export type Priority = keyof typeof PRIORITY_RANK;

export function isHigherPriority(a?: Priority, b?: Priority): boolean {
  if (!a) return false;
  return PRIORITY_RANK[a] > PRIORITY_RANK[b ?? "MEDIUM"];
}
