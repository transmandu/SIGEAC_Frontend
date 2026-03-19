"use client";

import {
  type IncomingCheck,
  type IncomingPayload,
  useConfirmIncomingArticle,
  useSendToQuarantine,
} from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useGetIncomingChecks } from "@/hooks/mantenimiento/control_calidad/useGetIncomingInspectionChecks";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  CalendarDays,
  CalendarIcon,
  Check,
  ChevronDown,
  ClipboardCheck,
  Factory,
  Flame,
  Hash,
  Layers,
  Loader2,
  MapPin,
  MessageSquare,
  Minus,
  Package,
  PackageCheck,
  Ruler,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Tag,
  Warehouse,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { type ChecklistValue } from "../../IncomingTypes";
import { StatusBadge } from "./StatusBadge";

/* ─── Types ─── */

type ReviewDecision = "STORE" | "QUARANTINE";

/* ─── Helpers ─── */

function isValidDate(d?: string | null) {
  if (!d) return false;
  const year = new Date(d).getFullYear();
  return year > 1900;
}

function formatDateSafe(d?: string | null) {
  if (!isValidDate(d)) return null;
  return format(new Date(d!), "dd MMM yyyy", { locale: es });
}

/* ─── Segmented inspection strip ─── */

function InspectionStrip({
  items,
  checklist,
}: {
  items: { key: string }[];
  checklist: Record<string, ChecklistValue>;
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex gap-px overflow-hidden rounded-md p-2">
      {items.map((item) => {
        const v = checklist[item.key];
        return (
          <div
            key={item.key}
            className={cn(
              "h-2 flex-1 transition-colors duration-200",
              v === true && "bg-emerald-500",
              v === false && "bg-red-500",
              v === "NA" && "bg-slate-400 dark:bg-slate-500",
              v === undefined && "bg-slate-200 dark:bg-slate-700"
            )}
          />
        );
      })}
    </div>
  );
}

/* ─── Info field with icon ─── */

function InfoField({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 p-3 dark:bg-muted/10">
      <div className="mt-0.5 shrink-0 rounded-md bg-muted p-1.5 text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 text-sm font-medium text-foreground",
            mono && "font-mono"
          )}
        >
          {value ?? <span className="text-muted-foreground">—</span>}
        </p>
      </div>
    </div>
  );
}

/* ─── Compact check row (sidebar) — stacked layout for long text ─── */

function CompactCheckRow({
  label,
  hint,
  critical,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  critical?: boolean;
  value: ChecklistValue | undefined;
  onChange: (v: ChecklistValue) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border-[2px] p-3 transition-colors",
        value === true &&
          "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20",
        value === false &&
          "border-red-500 bg-red-50/50 dark:bg-red-950/20",
        value === "NA" &&
          "border-slate-400 bg-slate-50/50 dark:border-l-slate-500 dark:bg-slate-800/20",
        value === undefined && "border-l-slate-200 dark:border-l-slate-700"
      )}
    >
      <div className="flex items-start gap-1.5">
        <p className="flex-1 text-xs font-medium leading-[1.4] text-foreground">
          {label}
        </p>
        {critical && (
          <span className="mt-px shrink-0 rounded-full border border-amber-300/60 bg-amber-500/10 px-1.5 py-px text-[9px] font-semibold uppercase text-amber-700 dark:text-amber-400">
            req
          </span>
        )}
      </div>
      {hint && (
        <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
          {hint}
        </p>
      )}

      <div className="mt-2 inline-flex overflow-hidden rounded-md border border-border">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "h-7 px-3 text-[11px] font-semibold transition-colors",
            value === true
              ? "bg-emerald-500 text-white"
              : "bg-background text-muted-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          )}
          aria-pressed={value === true}
        >
          OK
        </button>
        <button
          type="button"
          onClick={() => onChange("NA")}
          className={cn(
            "h-7 border-x border-border px-3 text-[11px] font-semibold transition-colors",
            value === "NA"
              ? "bg-slate-400 text-white dark:bg-slate-500"
              : "bg-background text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
          aria-pressed={value === "NA"}
        >
          N/A
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "h-7 px-3 text-[11px] font-semibold transition-colors",
            value === false
              ? "bg-red-500 text-white"
              : "bg-background text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/30"
          )}
          aria-pressed={value === false}
        >
          NO
        </button>
      </div>
    </div>
  );
}

/* ─── Large stamp check row (drawer / tablet) ─── */

function StampCheckRow({
  label,
  hint,
  critical,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  critical?: boolean;
  value: ChecklistValue | undefined;
  onChange: (v: ChecklistValue) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border-l-[3px] p-4 transition-colors",
        value === true &&
          "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20",
        value === false &&
          "border-l-red-500 bg-red-50/50 dark:bg-red-950/20",
        value === "NA" &&
          "border-l-slate-400 bg-slate-50/50 dark:border-l-slate-500 dark:bg-slate-800/20",
        value === undefined && "border-l-slate-200 dark:border-l-slate-700"
      )}
    >
      <div className="flex items-start gap-2">
        <p className="flex-1 text-sm font-medium leading-5 text-foreground">
          {label}
        </p>
        {critical && (
          <span className="mt-px shrink-0 rounded-full border border-amber-300/60 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            crítico
          </span>
        )}
      </div>
      {hint && (
        <p className="mt-1 text-xs leading-4 text-muted-foreground">{hint}</p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex h-12 w-16 flex-col items-center justify-center rounded-lg border text-xs font-semibold transition-all",
            value === true
              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
              : "border-border bg-background text-muted-foreground hover:border-emerald-400 hover:bg-emerald-50 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/30"
          )}
          aria-pressed={value === true}
        >
          <Check className="mb-0.5 h-4 w-4" />
          OK
        </button>
        <button
          type="button"
          onClick={() => onChange("NA")}
          className={cn(
            "flex h-12 w-16 flex-col items-center justify-center rounded-lg border text-xs font-semibold transition-all",
            value === "NA"
              ? "border-slate-400 bg-slate-400 text-white shadow-sm dark:border-slate-500 dark:bg-slate-500"
              : "border-border bg-background text-muted-foreground hover:border-slate-400 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          )}
          aria-pressed={value === "NA"}
        >
          <Minus className="mb-0.5 h-4 w-4" />
          N/A
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "flex h-12 w-16 flex-col items-center justify-center rounded-lg border text-xs font-semibold transition-all",
            value === false
              ? "border-red-500 bg-red-500 text-white shadow-sm"
              : "border-border bg-background text-muted-foreground hover:border-red-400 hover:bg-red-50 dark:hover:border-red-600 dark:hover:bg-red-950/30"
          )}
          aria-pressed={value === false}
        >
          <X className="mb-0.5 h-4 w-4" />
          NO
        </button>
      </div>
    </div>
  );
}

/* ─── Document pill ─── */

function DocPill({ label, ready }: { label: string; ready: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        ready
          ? "border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/30 dark:text-emerald-400"
          : "border-border bg-muted/50 text-muted-foreground"
      )}
    >
      {ready ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      {label}
    </span>
  );
}

/* ─── Checklist sidebar content (progress + checks only) ─── */

function ChecklistContent({
  groups,
  checklist,
  setValue,
  flat,
  done,
  total,
  okCount,
  noCount,
  naCount,
  progress,
  variant,
}: {
  groups: import("../../IncomingTypes").ChecklistGroup[];
  checklist: Record<string, ChecklistValue>;
  setValue: (key: string, val: ChecklistValue) => void;
  flat: import("../../IncomingTypes").ChecklistItem[];
  done: number;
  total: number;
  okCount: number;
  noCount: number;
  naCount: number;
  progress: number;
  variant: "compact" | "stamp";
}) {
  const CheckRowComponent =
    variant === "compact" ? CompactCheckRow : StampCheckRow;

  return (
    <div className="space-y-4">
      {/* Progress strip + counters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">
            {done}/{total} revisados
            {progress > 0 && (
              <span className="ml-1 opacity-60">({progress}%)</span>
            )}
          </span>
          <div className="flex gap-2.5">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" />
              {okCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm bg-red-500" />
              {noCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm bg-slate-400 dark:bg-slate-500" />
              {naCount}
            </span>
          </div>
        </div>
        <InspectionStrip items={flat} checklist={checklist} />
      </div>

      {/* Checklist groups */}
      {groups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          No hay checks configurados.
        </div>
      ) : (
        groups.map((g) => {
          const IconComp = g.icon;
          const groupDone = g.items.filter(
            (i) => checklist[i.key] !== undefined
          ).length;

          return (
            <div key={g.title}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <IconComp className="h-3.5 w-3.5 text-muted-foreground" />
                  {g.title}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {groupDone}/{g.items.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {g.items.map((item) => (
                  <CheckRowComponent
                    key={item.key}
                    label={item.label}
                    hint={item.hint}
                    critical={item.requiredForAccept}
                    value={checklist[item.key]}
                    onChange={(v) => setValue(item.key, v)}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════ */

export function IncomingReview({ article }: { article: any }) {
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();
  const { confirmIncoming } = useConfirmIncomingArticle();
  const { sendToQuarantine } = useSendToQuarantine();
  const { user } = useAuth();

  /* ── Derived article data ── */
  const hasDocs = !!article?.has_documentation;
  const anyDocUploaded = !!(
    article?.certificate_8130 ||
    article?.certificate_fabricant ||
    article?.certificate_vendor ||
    article?.image
  );
  const docRisk = hasDocs && !anyDocUploaded;
  const serialValue = Array.isArray(article?.serial)
    ? article.serial.join(", ")
    : article?.serial;

  const isHazardous = !!article?.batch?.is_hazarous;
  const consumable = article?.consumable;
  const expirationDate = formatDateSafe(consumable?.expiration_date);
  const fabricationDate = formatDateSafe(consumable?.fabrication_date);

  /* ── Checklist state ── */
  const { data: groups = [], isLoading } = useGetIncomingChecks(hasDocs);
  const [checklist, setChecklist] = useState<Record<string, ChecklistValue>>(
    {}
  );
  const [inspectorNotes, setInspectorNotes] = useState("");

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const total = flat.length;
  const done = flat.filter((i) => checklist[i.key] !== undefined).length;
  const okCount = flat.filter((i) => checklist[i.key] === true).length;
  const noCount = flat.filter((i) => checklist[i.key] === false).length;
  const naCount = flat.filter((i) => checklist[i.key] === "NA").length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  /* ── UI state ── */
  const [notesOpen, setNotesOpen] = useState(false);
  const [decision, setDecision] = useState<ReviewDecision>("STORE");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [quarantineOpen, setQuarantineOpen] = useState(false);
  const [incomingDate, setIncomingDate] = useState<Date>(new Date());
  const [quarantineEntryDate, setQuarantineEntryDate] = useState<Date>(
    new Date()
  );

  const quarantineEnabled = inspectorNotes.trim().length >= 5;
  const actionDisabled =
    decision === "QUARANTINE" ? !quarantineEnabled : false;

  /* ── Handlers ── */
  const setValue = (key: string, val: ChecklistValue) =>
    setChecklist((prev) => ({ ...prev, [key]: val }));

  const buildPayload = (): IncomingPayload => {
    const checks: IncomingCheck[] = flat
      .filter((item) => checklist[item.key] !== undefined)
      .map((item) => {
        const value = checklist[item.key];
        return {
          check_id: Number(item.id),
          result: (value === false ? "FAIL" : "PASS") as "PASS" | "FAIL",
          observation:
            value === false
              ? inspectorNotes || "Falla detectada en inspección"
              : null,
        };
      });

    return {
      warehouse_id: Number(article?.warehouse_id) || Number(article?.batch?.warehouse_id) || 1,
      purchase_order_code: "N/A",
      purchase_order_id: null,
      inspection_date: format(incomingDate, "yyyy-MM-dd"),
      items: [
        {
          article_id: article.id,
          serial: Array.isArray(article?.serial)
            ? article.serial[0]
            : article?.serial,
          quantity: 1,
          checks,
        },
      ],
    };
  };

  const confirmAccept = async () => {
    if (!user || !selectedCompany) return;
    await confirmIncoming.mutateAsync(buildPayload());
    setAcceptOpen(false);
    router.push(`/${selectedCompany.slug}/control_calidad/incoming`);
  };

  const confirmQuarantine = async () => {
    if (!user || !selectedCompany) return;
    const payload = {
      article_id: article.id,
      reason: inspectorNotes,
      quarantine_entry_date: format(quarantineEntryDate, "yyyy-MM-dd"),
      inspector: `${user.username}`,
    };
    await sendToQuarantine.mutateAsync(payload);
    setQuarantineOpen(false);
    router.push(`/${selectedCompany.slug}/control_calidad/incoming`);
  };

  const openDecisionDialog = () => {
    if (decision === "QUARANTINE") {
      setQuarantineOpen(true);
    } else {
      setAcceptOpen(true);
    }
  };

  /* ── Shared checklist props ── */
  const checklistProps = {
    groups,
    checklist,
    setValue,
    flat,
    done,
    total,
    okCount,
    noCount,
    naCount,
    progress,
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
          {/* ═══ MAIN AREA ═══ */}
          <div className="space-y-6">
            {/* ── Article header ── */}
            <section className="rounded-xl border border-border/80 bg-background p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={article?.status} />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  {article?.condition?.name ?? "Sin condición"}
                </span>
                {article?.category && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    {article.category}
                  </span>
                )}
                {isHazardous && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-600/40 dark:bg-amber-950/30 dark:text-amber-400">
                    <Flame className="h-3.5 w-3.5" />
                    Material peligroso
                  </span>
                )}
                {docRisk && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300/60 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:border-red-700/40 dark:bg-red-950/30 dark:text-red-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Documentación pendiente
                  </span>
                )}
                {!docRisk && hasDocs && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    Documentación declarada
                  </span>
                )}
              </div>

              <h1 className="mt-4 font-mono text-2xl font-semibold tracking-tight text-foreground">
                {article?.part_number ?? "Sin part number"}
              </h1>
              {article?.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {article.description}
                </p>
              )}
            </section>

            {/* ── Identification ── */}
            <section className="rounded-xl border border-border/80 bg-background p-5">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Identificación
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoField
                  icon={<Hash className="h-4 w-4" />}
                  label="Part Number"
                  value={article?.part_number}
                  mono
                />
                <InfoField
                  icon={<Tag className="h-4 w-4" />}
                  label="Serial"
                  value={serialValue}
                  mono
                />
                <InfoField
                  icon={<Factory className="h-4 w-4" />}
                  label="Fabricante"
                  value={article?.manufacturer?.name}
                />
                <InfoField
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Condición"
                  value={article?.condition?.name}
                />
              </div>
            </section>

            {/* ── Batch & Storage ── */}
            <section className="rounded-xl border border-border/80 bg-background p-5">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Descripción y detalles
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoField
                  icon={<Layers className="h-4 w-4" />}
                  label="Descripción"
                  value={article?.batch?.name}
                />
                <InfoField
                    icon={<Package className="h-4 w-4" />}
                    label="Cantidad"
                    value={consumable.quantity === null ? "1" : `${consumable.quantity}`}
                  />
                {article?.batch?.ata_code && (
                  <InfoField
                    icon={<ShieldAlert className="h-4 w-4" />}
                    label="ATA"
                    value={article.batch.ata_code}
                    mono
                  />
                )}
                {article?.ata_code && (
                  <InfoField
                    icon={<ShieldAlert className="h-4 w-4" />}
                    label="ATA"
                    value={article.ata_code}
                    mono
                  />
                )}
              </div>
            </section>

            {/* ── Documents ── */}

            <section className="rounded-xl border border-border/80 bg-background p-5">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Documentos
              </p>
              <div className="flex flex-wrap gap-2">
                <DocPill label="Certificado 8130" ready={!!article?.certificate_8130} />
                <DocPill label="Fabricante" ready={!!article?.certificate_fabricant} />
                <DocPill label="Vendedor" ready={!!article?.certificate_vendor} />
                <DocPill label="Imagen" ready={!!article?.image} />
              </div>
            </section>


            {/* ── Inspector notes ── */}
            <section className="rounded-xl border border-border/80 bg-background p-5">
              <button
                type="button"
                onClick={() => setNotesOpen(!notesOpen)}
                className="flex w-full items-center gap-2 text-left"
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Notas del inspector
                </p>
                <div className="ml-auto flex items-center gap-2">
                  {inspectorNotes.trim() && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      con notas
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                      notesOpen && "rotate-180"
                    )}
                  />
                </div>
              </button>

              {notesOpen && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    value={inspectorNotes}
                    onChange={(e) => setInspectorNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                    placeholder="Describe hallazgos, observaciones o el criterio usado para la decisión."
                  />
                  {decision === "QUARANTINE" &&
                    inspectorNotes.trim().length < 5 && (
                      <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Mínimo 5 caracteres para justificar cuarentena.
                      </p>
                    )}
                </div>
              )}
            </section>

            {/* ── Decision section (Destino del artículo) ── */}
            <section className="rounded-xl border border-border/80 bg-background p-5">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Destino del artículo
              </p>

              <div className="flex flex-col lg:flex-row gap-3">
                {/* Store card */}
                <button
                  type="button"
                  onClick={() => setDecision("STORE")}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 text-left transition-all w-full",
                    decision === "STORE"
                      ? "border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30"
                      : "border-border hover:border-emerald-300 dark:hover:border-emerald-700"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg p-2",
                      decision === "STORE"
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        decision === "STORE"
                          ? "text-emerald-900 dark:text-emerald-200"
                          : "text-foreground"
                      )}
                    >
                      Almacén
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Confirmar ingreso
                    </p>
                  </div>
                </button>

                {/* Quarantine card */}
                <button
                  type="button"
                  onClick={() => {
                    setDecision("QUARANTINE");
                    if (!notesOpen) setNotesOpen(true);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 text-left transition-all w-full",
                    decision === "QUARANTINE"
                      ? "border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-950/30"
                      : "border-border hover:border-red-300 dark:hover:border-red-700"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg p-2",
                      decision === "QUARANTINE"
                        ? "bg-red-500 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <ShieldX className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        decision === "QUARANTINE"
                          ? "text-red-900 dark:text-red-200"
                          : "text-foreground"
                      )}
                    >
                      Cuarentena
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Requiere justificación
                    </p>
                  </div>
                </button>
              </div>

              <Button
                className="mt-4 h-12 w-full text-sm font-semibold"
                onClick={openDecisionDialog}
                disabled={actionDisabled}
                variant={
                  decision === "QUARANTINE" ? "destructive" : "default"
                }
              >
                {decision === "QUARANTINE"
                  ? "Enviar a cuarentena"
                  : "Confirmar ingreso a almacén"}
              </Button>

              <p className="mt-2 text-center text-xs text-muted-foreground">
                {decision === "QUARANTINE"
                  ? "La nota del inspector será usada como motivo de cuarentena."
                  : "Se registrarán los checks que estén marcados."}
              </p>
            </section>
          </div>

          {/* ═══ SIDEBAR — Checklist only (desktop) ═══ */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-xl border border-border/80 bg-background p-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">
                  Checklist de inspección
                </p>
              </div>
              <div className="mt-3 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
                <ChecklistContent {...checklistProps} variant="compact" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ═══ FLOATING TRIGGER — tablet only ═══ */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 lg:hidden"
      >
        <ClipboardCheck className="h-4 w-4" />
        <span>Checklist</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {done}/{total}
        </span>
      </button>

      {/* ═══ SHEET — tablet drawer ═══ */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-[85vw] max-w-lg overflow-y-auto p-5 sm:max-w-md"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="h-4 w-4" />
              Checklist de inspección
            </SheetTitle>
            <SheetDescription className="sr-only">
              Checklist de inspección incoming
            </SheetDescription>
          </SheetHeader>
          <ChecklistContent {...checklistProps} variant="stamp" />
        </SheetContent>
      </Sheet>

      {/* ═══ CONFIRM STORE DIALOG ═══ */}
      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ingreso a almacén</DialogTitle>
            <DialogDescription>
              Selecciona la fecha operativa antes de registrar el incoming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Fecha de ingreso</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {format(incomingDate, "PPP", { locale: es })}
                  <CalendarIcon className="h-4 w-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={incomingDate}
                  onSelect={(d) => d && setIncomingDate(d)}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmAccept}
              disabled={confirmIncoming.isPending}
            >
              Confirmar ingreso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ CONFIRM QUARANTINE DIALOG ═══ */}
      <Dialog open={quarantineOpen} onOpenChange={setQuarantineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cuarentena</DialogTitle>
            <DialogDescription>
              La justificación del inspector será usada como motivo del envío.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Fecha de cuarentena</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {format(quarantineEntryDate, "PPP", { locale: es })}
                  <CalendarIcon className="h-4 w-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={quarantineEntryDate}
                  onSelect={(d) => d && setQuarantineEntryDate(d)}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQuarantineOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmQuarantine}
              disabled={!quarantineEnabled || sendToQuarantine.isPending}
            >
              Confirmar cuarentena
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
