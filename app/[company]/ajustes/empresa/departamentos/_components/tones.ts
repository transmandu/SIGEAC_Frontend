/**
 * Un color estable por tipo de departamento, para que Direcciones, Jefaturas,
 * etc. se distingan de un vistazo en el árbol. Las clases van completas (no se
 * componen) para que Tailwind las detecte.
 */
export interface Tone {
  tile: string;
  dot: string;
}

const TONES: Tone[] = [
  { tile: "bg-blue-500/12 text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  { tile: "bg-violet-500/12 text-violet-600 dark:text-violet-400", dot: "bg-violet-500" },
  { tile: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  { tile: "bg-amber-500/14 text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  { tile: "bg-rose-500/12 text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
  { tile: "bg-cyan-500/12 text-cyan-600 dark:text-cyan-400", dot: "bg-cyan-500" },
];

const NEUTRAL: Tone = {
  tile: "bg-muted text-muted-foreground",
  dot: "bg-muted-foreground/50",
};

export const toneFor = (typeId: number | null | undefined): Tone =>
  typeId ? TONES[typeId % TONES.length] : NEUTRAL;
