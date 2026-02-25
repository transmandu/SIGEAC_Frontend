import {
  BadgeCheck,
  BadgeX,
  ClipboardCheck,
  Factory,
  Hash,
  MapPin,
  ShieldAlert,
  Tag,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";

function InfoPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value ?? "—"}</span>
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
  onTake,
}: {
  article: any; // cámbialo a EditingArticle si quieres
  progress: number;
  done: number;
  total: number;
  okCount: number;
  docRisk: boolean;
  onTake?: () => void;
}) {
  const hasDocs = !!article?.has_documentation;

  return (
    <div className="mt-6 rounded-3xl border bg-gradient-to-b from-muted/40 to-background p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={article?.status} />

            {article?.condition?.name ? (
              <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs">
                <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                {article.condition.name}
              </span>
            ) : null}

            {docRisk ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs text-red-700">
                <BadgeX className="h-3.5 w-3.5" />
                Falta documentación
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" />
                Documentación {hasDocs ? "marcada" : "N/A"}
              </span>
            )}
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight truncate">
            {article?.part_number ?? "—"}
          </h1>

          <div className="mt-3 flex flex-wrap gap-2">
            <InfoPill icon={<Hash className="h-4 w-4" />} label="ATA" value={article?.ata_code} />
            <InfoPill icon={<Factory className="h-4 w-4" />} label="Fabricante" value={article?.manufacturer?.name} />
            <InfoPill icon={<MapPin className="h-4 w-4" />} label="Zona" value={article?.zone} />
            <InfoPill icon={<Tag className="h-4 w-4" />} label="Descripción" value={article?.batches?.name} />
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <div className="rounded-2xl border bg-background p-4 w-full lg:w-[360px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold">Progreso</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {done}/{total} · OK {okCount}
              </p>
            </div>

            <div className="mt-3">
              <Progress value={progress} />
              <p className="mt-2 text-xs text-muted-foreground">
                Completa el checklist para habilitar “Aceptar”.
              </p>
            </div>
          </div>

          {onTake ? (
            <Button type="button" variant="outline" onClick={onTake} className="w-full lg:w-[360px]">
              Tomar para inspección
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
