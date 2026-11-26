import type { EmployeeHistoryPeriod } from "@/types";

/**
 * Modelo de la trayectoria laboral: convierte los periodos y asignaciones en
 * carriles sobre un eje de tiempo. Es lógica pura (sin React ni fechas del
 * sistema) para poder probarla: el "hoy" lo pone quien la llama.
 */

const DAY_MS = 86_400_000;

/** Día (desde 1970) de un `yyyy-MM-dd`. */
export const dayNumber = (day: string): number => {
  const [year, month, date] = day.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, date) / DAY_MS;
};

/** `yyyy-MM-dd` de un número de día, armado con sus partes UTC (que es como se contó). */
const dayToIso = (n: number) => {
  const date = new Date(n * DAY_MS);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};

/** Ancho mínimo (en % del eje) para que un tramo de un día o menos siga siendo visible y tocable. */
const MIN_WIDTH_PCT = 1.6;

export type LaneKey = "period" | "job_title" | "department" | "location";

export interface Segment {
  /** Identificador estable para React. */
  key: string;
  lane: LaneKey;
  /** Qué valor representa (cargo, departamento o sede) o `null` si es un hueco. */
  groupKey: string | null;
  label: string;
  /** Posición y ancho en % del eje. */
  left: number;
  width: number;
  /** Primer y último día (inclusive para abiertos: llega a hoy). */
  from: string;
  to: string | null;
  open: boolean;
  /** Tramo sin relación laboral entre dos periodos. */
  gap: boolean;
  /** Asignación a la que remite al tocarlo (la más reciente del tramo). */
  assignmentId?: number;
  periodId?: number;
}

export interface Tick {
  left: number;
  label: string;
  /** Marca principal (año nuevo): se dibuja más fuerte. */
  major: boolean;
}

export interface Trajectory {
  from: string;
  to: string;
  spanDays: number;
  lanes: Record<LaneKey, Segment[]>;
  ticks: Tick[];
  /** Posición de "hoy" en % del eje, solo si hay un periodo vigente. */
  todayLeft: number | null;
  stats: {
    tenureDays: number;
    periods: number;
    changes: number;
  };
}

const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/** Marcas del eje: años si el rango es largo; trimestres o meses si es corto. */
const buildTicks = (
  from: number,
  span: number,
  pct: (n: number) => number,
): Tick[] => {
  const start = new Date(from * DAY_MS);
  const step = span > 730 ? 12 : span > 330 ? 3 : 1;
  const ticks: Tick[] = [];
  let year = start.getUTCFullYear();
  let month = start.getUTCMonth();

  // Primera marca: el inicio de mes siguiente (o el mismo, si el rango arranca el 1).
  if (start.getUTCDate() !== 1) month += 1;
  if (step === 12 && month !== 0) {
    year += 1;
    month = 0;
  } else if (step === 3) {
    month = Math.ceil(month / 3) * 3;
  }

  for (;;) {
    year += Math.floor(month / 12);
    month %= 12;

    const day = Date.UTC(year, month, 1) / DAY_MS;
    if (day > from + span) break;

    const left = pct(day);
    const major = month === 0;

    ticks.push({
      left,
      major,
      label: step === 12 || major ? String(year) : `${MONTHS[month]}`,
    });

    month += step;
  }

  // Sin dos rótulos pegados: se conserva una marca solo si hay 9 % de eje desde la última que se dejó.
  const kept: Tick[] = [];
  for (const tick of ticks) {
    if (kept.length === 0 || tick.left - kept[kept.length - 1].left >= 9) {
      kept.push(tick);
    }
  }

  return kept;
};

/**
 * ¿Hay algo que mostrar en el eje? Con un solo periodo y sin ningún cambio, el
 * gráfico sería una barra repetida: no aporta nada sobre la lista.
 */
export const hasStory = (trajectory: Trajectory): boolean =>
  trajectory.stats.periods > 1 || changedLanes(trajectory).length > 0;

/** Carriles (cargo, departamento, sede) donde el valor realmente cambió en algún momento. */
export const changedLanes = (
  trajectory: Trajectory,
): Exclude<LaneKey, "period">[] =>
  (["job_title", "department", "location"] as const).filter(
    (lane) =>
      new Set(trajectory.lanes[lane].map((segment) => segment.groupKey)).size >
      1,
  );

/** Antigüedad como texto: "2 años y 3 meses", "5 meses", "12 días". */
export const formatTenure = (days: number): string => {
  if (days < 1) return "Menos de un día";

  const years = Math.floor(days / 365.25);
  const months = Math.floor((days - years * 365.25) / 30.4375);

  const y = `${years} ${years === 1 ? "año" : "años"}`;
  const m = `${months} ${months === 1 ? "mes" : "meses"}`;

  if (years > 0) return months > 0 ? `${y} y ${m}` : y;
  if (months > 0) return m;

  return `${Math.round(days)} ${Math.round(days) === 1 ? "día" : "días"}`;
};

/** Cuántos tramos de la lista son cambios reales (no la asignación inicial). */
const isRealChange = (changeType: string) => changeType !== "INITIAL";

/**
 * Lo que hay que dibujar. `periods` viene del más reciente al más antiguo
 * (como lo devuelve el backend); `today` es `yyyy-MM-dd` en la zona de la empresa.
 */
export function buildTrajectory(
  periods: EmployeeHistoryPeriod[],
  today: string,
): Trajectory | null {
  if (periods.length === 0) return null;

  const ordered = [...periods].sort(
    (a, b) => dayNumber(a.started_at) - dayNumber(b.started_at) || a.id - b.id,
  );
  const todayN = dayNumber(today);

  const first = dayNumber(ordered[0].started_at);
  const lastPeriod = ordered[ordered.length - 1];
  const hasOpen = lastPeriod.ended_at === null;
  const last = hasOpen
    ? Math.max(todayN, dayNumber(lastPeriod.started_at))
    : dayNumber(lastPeriod.ended_at as string);

  // Un día de aire para que un tramo de un solo día no quede sin ancho.
  const span = Math.max(last - first, 1);
  const pct = (n: number) => ((n - first) / span) * 100;

  const toEdge = (to: string | null) => (to ? dayNumber(to) : last);

  const place = (fromN: number, toN: number) => {
    const left = Math.min(pct(fromN), 100 - MIN_WIDTH_PCT);
    const width = Math.max(pct(toN) - pct(fromN), MIN_WIDTH_PCT);

    return { left, width: Math.min(width, 100 - left) };
  };

  const lanes: Record<LaneKey, Segment[]> = {
    period: [],
    job_title: [],
    department: [],
    location: [],
  };

  let changes = 0;
  let tenureDays = 0;

  ordered.forEach((period, index) => {
    const from = dayNumber(period.started_at);
    const to = toEdge(period.ended_at);

    tenureDays += Math.max(to - from, 0);

    lanes.period.push({
      key: `period-${period.id}`,
      lane: "period",
      groupKey: String(period.id),
      label: period.ended_at ? `Periodo ${index + 1}` : "Periodo actual",
      ...place(from, to),
      from: period.started_at,
      to: period.ended_at,
      open: period.ended_at === null,
      gap: false,
      periodId: period.id,
    });

    const next = ordered[index + 1];
    if (next) {
      const gapFrom = dayNumber(period.ended_at ?? today);
      const gapTo = dayNumber(next.started_at);

      if (gapTo > gapFrom) {
        lanes.period.push({
          key: `gap-${period.id}`,
          lane: "period",
          groupKey: null,
          label: "Fuera de la empresa",
          ...place(gapFrom, gapTo),
          from: dayToIso(gapFrom),
          to: dayToIso(gapTo),
          open: false,
          gap: true,
        });
      }
    }

    const assignments = [...period.assignments].sort(
      (a, b) =>
        dayNumber(a.started_at) - dayNumber(b.started_at) || a.id - b.id,
    );

    const dimensions: [
      Exclude<LaneKey, "period">,
      (a: (typeof assignments)[number]) => { id: number; label: string },
    ][] = [
      [
        "job_title",
        (a) => ({
          id: a.job_title_id,
          label: a.job_title?.name ?? "Cargo eliminado",
        }),
      ],
      [
        "department",
        (a) => ({
          id: a.department_id,
          label: a.department?.name ?? "Departamento eliminado",
        }),
      ],
      [
        "location",
        (a) => ({
          id: a.location_id,
          label: a.location?.cod_iata || a.location?.name || "Sede",
        }),
      ],
    ];

    assignments.forEach((assignment) => {
      if (isRealChange(assignment.change_type)) changes += 1;
    });

    for (const [lane, read] of dimensions) {
      let current: Segment | null = null;

      assignments.forEach((assignment, position) => {
        const value = read(assignment);
        const aFrom = dayNumber(assignment.started_at);
        const aTo = toEdge(assignment.ended_at);

        // Una asignación que empezó y terminó el mismo día y fue seguida por
        // otra no ocupó tiempo en el eje: el cambio consta en el detalle, pero
        // dibujarla solo agrega una astilla entre dos barras.
        if (
          assignment.ended_at !== null &&
          aTo === aFrom &&
          position < assignments.length - 1
        ) {
          return;
        }

        // Mismo valor y tramo contiguo: la barra sigue (el cargo no cambió
        // aunque sí el departamento).
        if (current && current.groupKey === String(value.id)) {
          const merged = place(dayNumber(current.from), aTo);
          current.left = merged.left;
          current.width = merged.width;
          current.to = assignment.ended_at;
          current.open = assignment.ended_at === null;
          current.assignmentId = assignment.id;
          return;
        }

        current = {
          key: `${lane}-${assignment.id}`,
          lane,
          groupKey: String(value.id),
          label: value.label,
          ...place(aFrom, aTo),
          from: assignment.started_at,
          to: assignment.ended_at,
          open: assignment.ended_at === null,
          gap: false,
          assignmentId: assignment.id,
          periodId: period.id,
        };
        lanes[lane].push(current);
      });
    }
  });

  return {
    from: dayToIso(first),
    to: dayToIso(last),
    spanDays: span,
    lanes,
    ticks: buildTicks(first, span, pct),
    todayLeft: hasOpen ? Math.min(pct(todayN), 100) : null,
    stats: { tenureDays, periods: ordered.length, changes },
  };
}
