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
  CircleSlash,
  ClipboardList,
  Dot,
  HelpCircle,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { useCompanyStore } from "@/stores/CompanyStore";

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

  const hasNo = noCount > 0;
  const allDecided = done === total;

  // Confirmar ingreso: solo si TODO está en OK o N/A (y por ende, no hay NO ni pendientes)
  const approvable =
    allDecided &&
    flat.every((i) => {
      const v = checklist[i.key];
      return v === true || v === "NA";
    });

  const progress = total ? Math.round((done / total) * 100) : 0;

  // Cuarentena: solo si hay al menos un NO, todo está decidido y hay nota mínima
  const quarantineEnabled = hasNo && allDecided && inspectorNotes.trim().length >= 5;

  const [acceptOpen, setAcceptOpen] = useState(false);
  const [acceptQuarantine, setAcceptQuarantine] = useState(false);
  const [incomingDate, setIncomingDate] = useState<Date>(new Date());
  const [quarantineEntryDate, setQuarantineEntryDate] = useState<Date>(new Date());

  const setValue = (key: string, val: ChecklistValue) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const buildPayload = (): IncomingPayload => {
    const checks: IncomingCheck[] = flat.map((item) => {
      const value = checklist[item.key];

      // Si value es undefined, el flujo UI no debería permitir confirmar,
      // pero esto lo deja razonable igualmente.
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
    setAcceptQuarantine(false);
    router.push(`/${selectedCompany.slug}/control_calidad/incoming`);
  };

  return (
    <aside className="lg:sticky lg:top-6">
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/40">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Checklist
            </CardTitle>

            <Badge variant="secondary" className="shrink-0">
              {done}/{total}
            </Badge>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Dot className="h-4 w-4" />
              Progreso: <span className="font-medium">{progress}%</span>

              {hasNo && (
                <span className="ml-auto text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Hay fallas
                </span>
              )}
            </div>

            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className={cn("h-2 rounded-full transition-all", hasNo ? "bg-red-500/70" : "bg-emerald-500/70")}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span className="rounded-full border px-2 py-0.5">OK: {okCount}</span>
              <span className="rounded-full border px-2 py-0.5">NO: {noCount}</span>
              <span className="rounded-full border px-2 py-0.5">N/A: {naCount}</span>
              <span className="rounded-full border px-2 py-0.5">Pend: {pendingCount}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 max-h-[45vh] overflow-auto">
          {groups.map((g) => {
            const IconComp = g.icon;
            const groupDone = g.items.filter((i) => checklist[i.key] !== undefined).length;

            return (
              <div key={g.title} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <span className="text-muted-foreground">
                      <IconComp />
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
                      <div key={item.key} className={cn("rounded-xl border p-3 transition-colors", getStateClass(v))}>
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
                                  requerido
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-2 text-sm font-medium leading-5">{item.label}</p>

                            {item.hint ? <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p> : null}
                          </div>
                        </div>

                        <div className="mt-3 inline-flex rounded-lg border p-1">
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
          })}

          <div className="pt-2">
            <Label className="text-xs text-muted-foreground">Notas del inspector</Label>

            <Textarea
              value={inspectorNotes}
              onChange={(e) => setInspectorNotes(e.target.value)}
              rows={4}
              className={cn("mt-2", inspectorNotes.trim().length > 0 && hasNo && "border-red-500/30")}
              placeholder="Describe la falla y el motivo de la decisión…"
            />

            {hasNo && inspectorNotes.trim().length < 5 ? (
              <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Para enviar a cuarentena, escribe al menos 5 caracteres.
              </p>
            ) : null}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" disabled={!approvable} onClick={() => setAcceptOpen(true)}>
            Confirmar ingreso
          </Button>

          <Button className="w-full" variant="destructive" disabled={!quarantineEnabled} onClick={() => setAcceptQuarantine(true)}>
            Enviar a cuarentena
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmar ingreso */}
      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ingreso</DialogTitle>
            <DialogDescription>Verifica la fecha antes de continuar.</DialogDescription>
          </DialogHeader>

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

          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmAccept} disabled={!approvable}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar cuarentena */}
      <Dialog open={acceptQuarantine} onOpenChange={setAcceptQuarantine}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cuarentena</DialogTitle>
            <DialogDescription>Verifica la fecha antes de continuar.</DialogDescription>
          </DialogHeader>

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

          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptQuarantine(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmQuarantine} disabled={!quarantineEnabled}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
