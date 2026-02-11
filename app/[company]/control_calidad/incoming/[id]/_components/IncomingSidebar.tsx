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
  CalendarIcon,
} from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { ChecklistGroup, ChecklistValue } from "../IncomingTypes";
import {
  useConfirmIncomingArticle,
  IncomingPayload,
  IncomingCheck,
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
  const { user } = useAuth();

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const done = flat.filter((i) => checklist[i.key] !== undefined).length;
  const total = flat.length;

  const hasNo = flat.some((i) => checklist[i.key] === false);
  const allDecided = flat.every((i) => checklist[i.key] !== undefined);
  const allOk = flat.every(
    (i) => checklist[i.key] === true || checklist[i.key] === "NA",
  );

  const quarantineEnabled =
    hasNo && allDecided && inspectorNotes.trim().length >= 5;

  const [acceptOpen, setAcceptOpen] = useState(false);
  const [incomingDate, setIncomingDate] = useState<Date>(new Date());

  const setValue = (key: string, val: ChecklistValue) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // 🔥 PAYLOAD BUILDER (TIPADO = NO MÁS ERRORES TS)
  const buildPayload = (): IncomingPayload => {
    const checks: IncomingCheck[] = flat.map((item, index) => {
      const value = checklist[item.key];

      const result: "PASS" | "FAIL" = value === false ? "FAIL" : "PASS";

      return {
        check_id: Number(item.id),
        result,
        observation:
          value === false
            ? inspectorNotes || "Falla detectada en inspección"
            : null,
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

  const onQuarantine = async () => {
    if (!user || !selectedCompany) return;

    await confirmIncoming.mutateAsync(buildPayload());

    router.push(`/${selectedCompany.slug}/control_calidad/incoming`);
  };

  return (
    <aside className="lg:sticky lg:top-6">
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/40">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Checklist
            </CardTitle>

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
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 max-h-[65vh] overflow-auto">
          {groups.map((g) => (
            <div key={g.title}>
              <div className="font-semibold mb-2">{g.title}</div>

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
                        OK
                      </Button>

                      <Button
                        size="sm"
                        variant={v === "NA" ? "secondary" : "outline"}
                        onClick={() => setValue(item.key, "NA")}
                      >
                        N/A
                      </Button>

                      <Button
                        size="sm"
                        variant={v === false ? "destructive" : "outline"}
                        onClick={() => setValue(item.key, false)}
                      >
                        NO
                      </Button>
                    </div>
                  </div>
                );
              })}
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
            onClick={() => setAcceptOpen(true)}
          >
            Confirmar ingreso
          </Button>

          <Button
            className="w-full"
            variant="destructive"
            disabled={!quarantineEnabled}
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
