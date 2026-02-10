"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, CircleSlash, ClipboardList, Dot } from "lucide-react";
import { Dispatch, SetStateAction, useMemo } from "react";
import { ChecklistGroup, ChecklistValue } from "../IncomingTypes";
import { useConfirmIncomingArticle } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { useCompanyStore } from "@/stores/CompanyStore";

export function IncomingSidebar({
  article_id,
  groups,
  checklist,
  setChecklist,
  requiredPassed,
  progress,
  setInspectorNotes,
  inspectorNotes,
  allOk,
  allDecided,
}: {
  article_id: number;
  groups: ChecklistGroup[];
  checklist: Record<string, ChecklistValue>;
  setChecklist: Dispatch<SetStateAction<Record<string, ChecklistValue>>>;
  requiredPassed: boolean;
  progress: number;
  inspectorNotes: string;
  setInspectorNotes: (v: string) => void;
  allOk: boolean;
  allDecided: boolean;
}) {
  const {selectedCompany} = useCompanyStore();
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const done = flat.filter((i) => checklist[i.key] !== undefined).length;
  const total = flat.length;
  const requiredTotal = flat.filter((i) => i.requiredForAccept).length;
  const requiredDone = flat.filter(
    (i) => i.requiredForAccept && (checklist[i.key] === true || checklist[i.key] === "NA")
  ).length;
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [incomingDate, setIncomingDate] = useState<Date>(new Date());
  const router = useRouter();
  const {confirmIncoming} = useConfirmIncomingArticle()
  const {user} = useAuth()

  const setValue = (key: string, val: ChecklistValue) => {
    setChecklist((prev) => ({ ...prev, [key]: val }));
  };

  const onAccept = () => {
    if (!allOk) return;
    setAcceptOpen(true);
  };


  const confirmAccept = async () => {
  if (!user) return;

  const payload = {
    article_id,
    inspector: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
    incoming_date: format(incomingDate, "yyyy/MM/dd"),
  };

  await confirmIncoming.mutateAsync({ values: payload });
  setAcceptOpen(false);
  router.push(`/${selectedCompany?.slug}/control_calidad/incoming`);
};


  const onQuarantine = () => {
    console.log("quarantine")
  }

  return (
    <aside className="lg:sticky lg:top-6">
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/40">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Checklist
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Complete lo requerido antes de confirmar.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant="secondary">
              {done}/{total}
            </Badge>
            {requiredTotal > 0 && (
              <span className="text-[11px] text-muted-foreground">
                Requeridos: {requiredDone}/{requiredTotal}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Dot className="h-4 w-4" />
          Progreso: <span className="font-medium text-foreground">{progress}%</span>
          {!requiredPassed && requiredTotal > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              Faltan requeridos
            </span>
          )}
        </div>
      </CardHeader>

      {/* Scroll interno */}
      <CardContent className="p-0">
        <div className="max-h-[calc(66vh-210px)] overflow-auto">
          <div className="p-4 space-y-5">
            {groups.map((g) => (
              <div key={g.title} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="text-muted-foreground">{g.icon}</span>
                  <span>{g.title}</span>
                </div>
                <div className="space-y-2">
                  {g.items.map((item) => {
                    const v = checklist[item.key];
                    return (
                      <div
                        key={item.key}
                        className={cn(
                          "rounded-xl border p-3 transition-colors",
                          v === true && "bg-muted/25"
                        )}
                      >
                        <div className="flex flex-col items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-start gap-2">
                              <p className="text-sm font-medium leading-snug">
                                {item.label}
                              </p>
                              {item.requiredForAccept && (
                                <Badge variant="outline" className="text-[10px] h-5">
                                  Requerido
                                </Badge>
                              )}
                            </div>
                            {item.hint && (
                              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                                {item.hint}
                              </p>
                            )}
                          </div>
                          <div className="w-full flex justify-center items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={v === true ? "default" : "outline"}
                              className="h-8 px-3"
                              onClick={() => setValue(item.key, true)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              OK
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant={v === "NA" ? "secondary" : "outline"}
                              className="h-8 px-3"
                              onClick={() => setValue(item.key, "NA")}
                            >
                              <CircleSlash className="h-4 w-4 mr-1" />
                              N/A
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="px-4 pb-4">
              <Label className="text-xs text-muted-foreground">Notas del inspector</Label>
              <Textarea
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                placeholder="Describe la discrepancia, daño, falta de documentación, o motivo de cuarentena."
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
        </div>
      </CardContent>

      {/* Footer fijo */}
      <CardFooter className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="w-full grid grid-cols-1 gap-2 mt-4">
        <Button
          className="w-full"
          disabled={!allOk}
          onClick={onAccept}
        >
          Confirmar ingreso
        </Button>

        <Button
          className="w-full"
          variant="secondary"
          disabled={allOk || !allDecided || inspectorNotes.trim().length < 5}
          onClick={onQuarantine}
        >
          Enviar a cuarentena
        </Button>

        <p className="text-[11px] text-muted-foreground">
          Para cuarentena: completa el checklist y deja una razón.
        </p>
      </div>
    </CardFooter>
    </Card>

    <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Confirmar ingreso</DialogTitle>
          <DialogDescription>
            Vas a confirmar el ingreso administrativo. Verifica la fecha antes de continuar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl border p-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Inspector</span>
              <span className="font-medium">
                {user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3 mt-2">
              <span className="text-muted-foreground">Artículo</span>
              <span className="font-medium">#{article_id}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fecha de ingreso</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {incomingDate ? format(incomingDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                  <CalendarIcon className="h-4 w-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={incomingDate}
                  onSelect={(d) => d && setIncomingDate(d)}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Usa la fecha en la que el artículo entra formalmente a Incoming.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setAcceptOpen(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={confirmAccept}
            disabled={confirmIncoming.isPending}
          >
            {confirmIncoming.isPending ? "Confirmando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </aside>
  );
}
