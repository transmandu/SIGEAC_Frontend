import {
  AlertTriangle,
  BadgeCheck,
  Factory,
  FileText,
  Hash,
  Package2,
  ShieldAlert,
  Tag,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";

function HeaderStat({
  label,
  value,
  icon,
}: {
  label: string;
  value?: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-semibold text-foreground">{value ?? "-"}</div>
    </div>
  );
}

export function IncomingHeader({
  article,
  progress,
  done,
  total,
  okCount,
  docRisk,
}: {
  article: any;
  progress: number;
  done: number;
  total: number;
  okCount: number;
  docRisk: boolean;
}) {
  const hasDocs = !!article?.has_documentation;
  const serialLabel = Array.isArray(article?.serial)
    ? `${article.serial.length} seriales`
    : article?.serial;

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(248,250,252,0.94))] p-6 shadow-sm">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={article?.status} />

            <span className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-background/85 px-3 py-1 text-xs text-slate-700">
              <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
              {article?.condition?.name ?? "Sin condición"}
            </span>

            <span
              className={
                docRisk
                  ? "inline-flex items-center gap-2 rounded-full border border-red-300/70 bg-red-50 px-3 py-1 text-xs text-red-700"
                  : "inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
              }
            >
              {docRisk ? <AlertTriangle className="h-3.5 w-3.5" /> : <BadgeCheck className="h-3.5 w-3.5" />}
              {docRisk ? "Documentación pendiente" : hasDocs ? "Documentación declarada" : "Sin documentación requerida"}
            </span>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Cabina de inspección incoming</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {article?.part_number ?? "Artículo sin part number"}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Revisa evidencia, marca solo los checks que necesites y deja la decisión final en manos del inspector.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px]">
          <HeaderStat label="ATA" value={article?.ata_code} icon={<Hash className="h-3.5 w-3.5" />} />
          <HeaderStat label="Fabricante" value={article?.manufacturer?.name} icon={<Factory className="h-3.5 w-3.5" />} />
          <HeaderStat label="Lote" value={article?.batch?.name} icon={<Package2 className="h-3.5 w-3.5" />} />
          <HeaderStat label="Serial" value={serialLabel} icon={<Tag className="h-3.5 w-3.5" />} />
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-200/80 bg-slate-950 px-5 py-4 text-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cobertura del checklist</p>
              <p className="mt-1 text-lg font-semibold">
                {done}/{total} checks revisados
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Resultado manual</p>
              <p className="mt-1 text-lg font-semibold text-emerald-300">OK marcados: {okCount}</p>
            </div>
          </div>

          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-emerald-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200/80 bg-amber-50 px-5 py-4">
          <div className="flex items-center gap-2 text-amber-800">
            <FileText className="h-4 w-4" />
            <p className="text-sm font-semibold">Lectura operativa</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-amber-900/80">
            El checklist acompaña la inspección, pero ya no decide automáticamente el destino del artículo.
          </p>
        </div>
      </div>
    </div>
  );
}
