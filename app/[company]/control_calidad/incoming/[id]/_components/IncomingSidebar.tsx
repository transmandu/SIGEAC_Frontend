"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  CircleSlash,
  ClipboardList,
  Dot,
} from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { ChecklistGroup, ChecklistValue } from "../IncomingTypes";
import { useConfirmIncomingArticle } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { useCompanyStore } from "@/stores/CompanyStore";

export function IncomingSidebar({
  article_id,
  groups,
  checklist,
  setChecklist,
  inspectorNotes,
  setInspectorNotes,
}: {
  article_id: number;
  groups: ChecklistGroup[];
  checklist: Record<string, ChecklistValue>;
  setChecklist: Dispatch<SetStateAction<Record<string, ChecklistValue>>>;
  inspectorNotes: string;
  setInspectorNotes: (v: string) => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();
  const { confirmIncoming } = useConfirmIncomingArticle();
  const { user } = useAuth();

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const done = flat.filter((i) => checklist[i.key] !== undefined).length;
  const total = flat.length;

  const requiredTotal = flat.filter((i) => i.requiredForAccept).length;
  const requiredDone = flat.filter(
    (i) =>
      i.requiredForAccept &&
      (checklist[i.key] === true || checklist[i.key] === "NA"),
  ).length;

  // 🔥 DERIVED STATE LOCAL (anti-bugs)
  const hasNo = useMemo(
    () => flat.some((i) => checklist[i.key] === false),
    [flat, checklist],
  );

  const allDecided = useMemo(
    () => flat.every((i) => checklist[i.key] !== undefined),
    [flat, checklist],
  );

  const allOk = useMemo(
    () =>
      flat.every((i) => checklist[i.key] === true || checklist[i.key] === "NA"),
    [flat, checklist],
  );

  const requiredPassed = requiredDone === requiredTotal;

  const [acceptOpen, setAcceptOpen] = useState(false);
  const [incomingDate, setIncomingDate] = useState<Date>(new Date());

  const setValue = (key: string, val: ChecklistValue) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // 🚨 Bloquea ingreso si hay NO
  const onAccept = () => {
    if (!allOk || hasNo) return;
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
    console.log("SEND TO QUARANTINE");
  };

  return (
    <aside className="lg:sticky lg:top-6">
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/40">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Checklist
              </CardTitle>

              <p className="text-xs text-muted-foreground mt-1">
                Complete lo requerido antes de confirmar.
              </p>
            </div>

            <Badge variant="secondary">
              {done}/{total}
            </Badge>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs">
            <Dot className="h-4 w-4" />
            Progreso:
            <span className="font-medium">
              {Math.round((done / total) * 100)}%
            </span>
            {hasNo && (
              <span className="ml-auto text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Hay fallas
              </span>
            )}
            {!requiredPassed && !hasNo && (
              <span className="ml-auto text-amber-600 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Faltan requeridos
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 max-h-[65vh] overflow-auto">
          {groups.map((g) => (
            <div key={g.title}>
              <div className="font-semibold mb-2">{g.title}</div>

              <div className="space-y-2">
                {g.items.map((item) => {
                  const v = checklist[item.key];

                  return (
                    <div
                      key={item.key}
                      className={cn(
                        "rounded-xl border p-3",
                        v === true && "bg-muted/25",
                        v === false && "border-red-500 bg-red-50",
                      )}
                    >
                      <p className="text-sm font-medium">{item.label}</p>

                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant={v === true ? "default" : "outline"}
                          onClick={() => setValue(item.key, true)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          OK
                        </Button>

                        <Button
                          size="sm"
                          variant={v === "NA" ? "secondary" : "outline"}
                          onClick={() => setValue(item.key, "NA")}
                        >
                          <CircleSlash className="h-4 w-4 mr-1" />
                          N/A
                        </Button>

                        <Button
                          size="sm"
                          variant={v === false ? "destructive" : "outline"}
                          onClick={() => setValue(item.key, false)}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          NO
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <Label className="text-xs text-muted-foreground">
              Notas del inspector
            </Label>

            <Textarea
              value={inspectorNotes}
              onChange={(e) => setInspectorNotes(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            disabled={!allOk || hasNo}
            onClick={onAccept}
          >
            Confirmar ingreso
          </Button>

          <Button
            className="w-full"
            variant="destructive"
            disabled={!hasNo || !allDecided || inspectorNotes.trim().length < 5}
            onClick={onQuarantine}
          >
            Enviar a cuarentena
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ingreso</DialogTitle>
            <DialogDescription>
              Verifica la fecha antes de continuar.
            </DialogDescription>
          </DialogHeader>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {format(incomingDate, "PPP", { locale: es })}
                <CalendarIcon className="h-4 w-4 opacity-60" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
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

            <Button onClick={confirmAccept}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
