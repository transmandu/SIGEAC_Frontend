/**
 * Lo último que se supo de la sesión y que la barra de navegación necesita para
 * pintarse: roles, iniciales, tablas de cada empresa y estaciones. Tras una
 * recarga, esas respuestas compiten con el resto de las peticiones de la
 * página; con esto el menú y el navbar se pintan al instante con lo de la
 * última vez y, cuando llega lo real, manda lo real. Es solo presentación: los
 * permisos de verdad los aplica el servidor.
 */
const STORAGE_KEY = "session-snapshot";

type Station = {
  id: number;
  address: string;
  name?: string | null;
  cod_iata: string;
  isMainBase: boolean;
};

export type SessionSnapshot = {
  roles: string[] | null;
  initials: string | null;
  tables: Record<string, string[]>;
  locations: Record<string, Station[]>;
};

const EMPTY: SessionSnapshot = {
  roles: null,
  initials: null,
  tables: {},
  locations: {},
};

const asRecord = <T>(value: unknown): Record<string, T> =>
  value && typeof value === "object" ? (value as Record<string, T>) : {};

export function readSessionSnapshot(): SessionSnapshot {
  if (typeof window === "undefined") return EMPTY;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return EMPTY;

    const parsed = JSON.parse(saved) as Partial<SessionSnapshot>;

    return {
      roles: Array.isArray(parsed.roles) ? parsed.roles : null,
      initials: typeof parsed.initials === "string" ? parsed.initials : null,
      tables: asRecord<string[]>(parsed.tables),
      locations: asRecord<Station[]>(parsed.locations),
    };
  } catch {
    return EMPTY;
  }
}

export type SessionSnapshotPatch = {
  roles?: string[];
  initials?: string;
  tablesOf?: { company: string; tables: string[] };
  locationsOf?: { company: string; locations: Station[] };
};

export function writeSessionSnapshot(patch: SessionSnapshotPatch) {
  try {
    const current = readSessionSnapshot();

    const next: SessionSnapshot = {
      roles: patch.roles ?? current.roles,
      initials: patch.initials ?? current.initials,
      tables: patch.tablesOf
        ? { ...current.tables, [patch.tablesOf.company]: patch.tablesOf.tables }
        : current.tables,
      locations: patch.locationsOf
        ? {
            ...current.locations,
            [patch.locationsOf.company]: patch.locationsOf.locations,
          }
        : current.locations,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage bloqueado o lleno: la interfaz simplemente espera a la red.
  }
}

export function clearSessionSnapshot() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ídem.
  }
}
