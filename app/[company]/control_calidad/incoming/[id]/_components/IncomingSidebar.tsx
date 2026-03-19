"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CalendarIcon,
  CheckCircle2,
  ChevronRight,
  CircleSlash,
  ClipboardCheck,
  ClipboardList,
  Dot,
  HelpCircle,
  PackageCheck,
  ShieldX,
  XCircle,
} from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { ChecklistGroup, ChecklistValue } from "../../IncomingTypes";
import {
  IncomingPayload,
  IncomingCheck,
  useConfirmIncomingArticle,
  useSendToQuarantine,
} from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { useCompanyStore } from "@/stores/CompanyStore";

type ReviewDecision = "STORE" | "QUARANTINE" | null;

function getStateIcon(v: ChecklistValue) {
  if (v === true) return <CheckCircle2 className="h-4 w-4" />;
  if (v === false) return <XCircle className="h-4 w-4" />;
  if (v === "NA") return <CircleSlash className="h-4 w-4" />;
  return <HelpCircle className="h-4 w-4" />;
}

function getStateLabel(v: ChecklistValue) {
  if (v === true) return "OK";
  if (v === false) return "NO";
  if (v === "NA") return "N/A";
  return "Pendiente";
}

function getStateClass(v: ChecklistValue) {
  if (v === true) return "border-emerald-500/30 bg-emerald-500/5";
  if (v === false) return "border-red-500/30 bg-red-500/5";
  if (v === "NA") return "border-muted bg-muted/30";
  return "border-border bg-background";
}

function DecisionCard({
  title,
  description,
  icon,
  active,
  tone,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  tone: "store" | "quarantine";
  onClick: () => void;
}) {
  const activeClass =
    tone === "store"
      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
      : "border-red-300 bg-red-50 text-red-950";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border px-4 py-4 text-left transition-colors",
        active ? activeClass : "border-slate-200 bg-background hover:border-slate-300"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 rounded-xl p-2",
            tone === "store" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}

export function IncomingSidebar({
  article_id,
  serial = "SN-UNKNOWN",
  warehouse_id = 1,
  groups,
  checklist,
  setChecklist,
  inspectorNotes,
  setInspectorNotes,
}: {
  article_id: number;
  serial?: string;
  warehouse_id?: number;
  groups: ChecklistGroup[];
  checklist: Record<string, ChecklistValue>;
  setChecklist: Dispatch<SetStateAction<Record<string, ChecklistValue>>>;
  inspectorNotes: string;
  setInspectorNotes: (v: string) => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();
  const { confirmIncoming } = useConfirmIncomingArticle();
  const { sendToQuarantine } = useSendToQuarantine();
  const { user } = useAuth();

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const total = flat.length;
  const done = flat.filter((i) => checklist[i.key] !== undefined).length;
  const okCount = flat.filter((i) => checklist[i.key] === true).length;
  const naCount = flat.filter((i) => checklist[i.key] === "NA").length;
  const noCount = flat.filter((i) => checklist[i.key] === false).length;
  const pendingCount = total - done;
  const progress = total ? Math.round((done / total) * 100) : 0;

  const [decision, setDecision] = useState<ReviewDecision>("STORE");
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [quarantineOpen, setQuarantineOpen] = useState(false);
  const [incomingDate, setIncomingDate] = useState<Date>(new Date());
  const [quarantineEntryDate, setQuarantineEntryDate] = useState<Date>(new Date());

  const quarantineEnabled = inspectorNotes.trim().length >= 5;

  const setValue = (key: string, val: ChecklistValue) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const buildPayload = (): IncomingPayload => {
    const checks: IncomingCheck[] = flat
      .filter((item) => checklist[item.key] !== undefined)
      .map((item) => {
        const value = checklist[item.key];
        const result: "PASS" | "FAIL" = value === false ? "FAIL" : "PASS";

        return {
          check_id: Number(item.id),
          result,
          observation: value === false ? inspectorNotes || "Falla detectada en inspección" : null,
        };
      });

    return {
      warehouse_id,
      purchase_order_code: "N/A",
      purchase_order_id: null,
      inspection_date: format(incomingDate, "yyyy-MM-dd"),
      items: [
        {
          article_id,
          serial,
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
      article_id,
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
      return;
    }

    setAcceptOpen(true);
  };

  const actionDisabled = decision === "QUARANTINE" ? !quarantineEnabled : false;
  const actionLabel = decision === "QUARANTINE" ? "Enviar a cuarentena" : "Enviar a almacén";

  return (
    <aside className="xl:sticky xl:top-6">
      <div className="space-y-4 xl:max-h-[calc(100vh-96px)] xl:overflow-y-auto xl:pr-1">
        <Card className="overflow-hidden rounded-[28px] border-slate-200/80 shadow-sm">
          <CardHeader className="border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(30,41,59,0.96))] text-slate-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Panel fijo</p>
                <CardTitle className="mt-2 flex items-center gap-2 text-base">
                  <ClipboardCheck className="h-4 w-4" />
                  Decisión del inspector
                </CardTitle>
              </div>

              <Badge variant="secondary" className="shrink-0 border-white/10 bg-white/10 text-white">
                {done}/{total}
              </Badge>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Avance del checklist</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-200">
                <span className="rounded-full border border-white/10 px-2 py-0.5">OK: {okCount}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">NO: {noCount}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">N/A: {naCount}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">Pend: {pendingCount}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-5">
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Destino final</p>
                <h3 className="mt-1 text-sm font-semibold text-slate-950">La decisión ya no depende del checklist</h3>
              </div>

              <DecisionCard
                title="Enviar a almacén"
                description="Confirma el ingreso del artículo y registra solo los checks que el inspector haya marcado."
                icon={<PackageCheck className="h-4 w-4" />}
                active={decision === "STORE"}
                tone="store"
                onClick={() => setDecision("STORE")}
              />

              <DecisionCard
                title="Enviar a cuarentena"
                description="Contiene el artículo y exige una justificación breve del inspector."
                icon={<ShieldX className="h-4 w-4" />}
                active={decision === "QUARANTINE"}
                tone="quarantine"
                onClick={() => setDecision("QUARANTINE")}
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-slate-700">
                <ClipboardList className="h-4 w-4" />
                <p className="text-sm font-semibold">Notas del inspector</p>
              </div>

              <Textarea
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                rows={4}
                className={cn(
                  "resize-none bg-background",
                  decision === "QUARANTINE" && inspectorNotes.trim().length > 0 && "border-red-300"
                )}
                placeholder="Describe hallazgos, observaciones o el criterio usado para la decisión."
              />

              {decision === "QUARANTINE" && inspectorNotes.trim().length < 5 ? (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Para cuarentena necesitamos al menos 5 caracteres en la justificación.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Las notas acompañan la decisión final y también se usan como observación en checks fallidos.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                <Dot className="h-4 w-4" />
                Checklist manual
              </div>

              <div className="max-h-[40vh] space-y-4 overflow-auto pr-1">
                {groups.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-muted-foreground">
                    No hay checks configurados para este incoming.
                  </div>
                ) : (
                  groups.map((g) => {
                    const IconComp = g.icon;
                    const groupDone = g.items.filter((i) => checklist[i.key] !== undefined).length;

                    return (
                      <div key={g.title} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <span className="text-slate-500">
                              <IconComp className="h-4 w-4" />
                            </span>
                            {g.title}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {groupDone}/{g.items.length}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {g.items.map((item) => {
                            const v = checklist[item.key];
                            const stateLabel = getStateLabel(v);

                            return (
                              <div key={item.key} className={cn("rounded-2xl border p-3 transition-colors", getStateClass(v))}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={cn(
                                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
                                          v === true && "border-emerald-500/30 text-emerald-700",
                                          v === false && "border-red-500/30 text-red-700",
                                          v === "NA" && "text-muted-foreground",
                                          v === undefined && "text-muted-foreground"
                                        )}
                                      >
                                        {getStateIcon(v)}
                                        {stateLabel}
                                      </span>

                                      {item.requiredForAccept ? (
                                        <span className="inline-flex items-center rounded-full border border-amber-300/60 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                          referencia crítica
                                        </span>
                                      ) : null}
                                    </div>

                                    <p className="mt-2 text-sm font-medium leading-5 text-slate-900">{item.label}</p>
                                    {item.hint ? <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p> : null}
                                  </div>
                                </div>

                                <div className="mt-3 inline-flex rounded-lg border bg-background p-1">
                                  <Button
                                    size="sm"
                                    className="h-8 px-3"
                                    variant={v === true ? "default" : "ghost"}
                                    aria-pressed={v === true}
                                    onClick={() => setValue(item.key, true)}
                                  >
                                    OK
                                  </Button>

                                  <Button
                                    size="sm"
                                    className="h-8 px-3"
                                    variant={v === "NA" ? "secondary" : "ghost"}
                                    aria-pressed={v === "NA"}
                                    onClick={() => setValue(item.key, "NA")}
                                  >
                                    N/A
                                  </Button>

                                  <Button
                                    size="sm"
                                    className="h-8 px-3"
                                    variant={v === false ? "destructive" : "ghost"}
                                    aria-pressed={v === false}
                                    onClick={() => setValue(item.key, false)}
                                  >
                                    NO
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t border-slate-200/80 bg-slate-50/70 p-5">
            <Button className="w-full justify-between" onClick={openDecisionDialog} disabled={actionDisabled}>
              {actionLabel}
              <ChevronRight className="h-4 w-4" />
            </Button>
            <p className="w-full text-xs leading-5 text-muted-foreground">
              {decision === "QUARANTINE"
                ? "La nota del inspector viaja como motivo de cuarentena."
                : "Se registrarán únicamente los checks que ya estén marcados."}
            </p>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ingreso a almacén</DialogTitle>
            <DialogDescription>Selecciona la fecha operativa antes de registrar el incoming.</DialogDescription>
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
            <Button onClick={confirmAccept} disabled={confirmIncoming.isPending}>
              Confirmar ingreso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={quarantineOpen} onOpenChange={setQuarantineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cuarentena</DialogTitle>
            <DialogDescription>La justificación del inspector será usada como motivo del envío.</DialogDescription>
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
            <Button variant="outline" onClick={() => setQuarantineOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmQuarantine} disabled={!quarantineEnabled || sendToQuarantine.isPending}>
              Confirmar cuarentena
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
