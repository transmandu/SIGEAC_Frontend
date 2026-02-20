"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGenerateIncomingFormat } from "@/hooks/mantenimiento/control_calidad/useGenerateIncomingFormat";
import { toast } from "sonner";
import { IncomingArticle } from "../IncomingTypes";

export type GenerateReceptionFormPayload = {
  inspection_date: string;
  purchase_order_code: string;
  client: string;
  others?: string | null;
  article_ids: number[];
};

export function GenerateReceptionFormButton({
  selected,
  onDone,
}: {
  selected: IncomingArticle[];
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [inspectionDate, setInspectionDate] = useState<Date>(new Date());
  const [purchaseOrderCode, setPurchaseOrderCode] = useState("");
  const [client, setClient] = useState("");
  const [others, setOthers] = useState("");

  const generatePdf = useGenerateIncomingFormat();

  const canGenerate = selected.length > 0;

  const validation = useMemo(() => {
    if (!canGenerate) return { ok: false, reason: "Selecciona al menos un artículo." };
    if (purchaseOrderCode.trim().length < 2) return { ok: false, reason: "OC es obligatoria." };
    if (client.trim().length < 2) return { ok: false, reason: "Cliente es obligatorio." };
    return { ok: true, reason: "" };
  }, [canGenerate, purchaseOrderCode, client]);

    const confirm = async () => {
      if (!validation.ok) return;

      const payload: GenerateReceptionFormPayload = {
        inspection_date: format(inspectionDate, "yyyy-MM-dd"),
        purchase_order_code: purchaseOrderCode.trim(),
        client: client.trim(),
        others: others.trim() ? others.trim() : null,
        article_ids: selected.map((a) => a.id),
      };

      try {
        await generatePdf.mutateAsync(payload);
        toast.success("PDF generado y descargado.");
        setOpen(false);
        onDone?.();
      } catch (e: any) {
        toast.error(e?.message ?? "No se pudo generar el PDF.");
      }
    };

  const reset = () => {
    setInspectionDate(new Date());
    setPurchaseOrderCode("");
    setClient("");
    setOthers("");
  };

  return (
    <>
      <Button
        disabled={!canGenerate}
        onClick={() => {
          setOpen(true);
        }}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Generar H74-036
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar formato H74-036</DialogTitle>
            <DialogDescription>
              Se generará el formato para <b>{selected.length}</b> artículo(s).
              Al confirmar, pasarán a <b>En espera por ubicar</b>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Fecha */}
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {format(inspectionDate, "PPP", { locale: es })}
                    <CalendarIcon className="h-4 w-4 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={inspectionDate}
                    onSelect={(d) => d && setInspectionDate(d)}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* OC */}
            <div className="space-y-2">
              <Label>OC (Orden de compra)</Label>
              <Input
                value={purchaseOrderCode}
                onChange={(e) => setPurchaseOrderCode(e.target.value)}
                placeholder="Ej: OC-2026-00123"
              />
            </div>

            {/* Cliente */}
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Ej: Conviasa"
              />
            </div>

            {/* Otros */}
            <div className="space-y-2">
              <Label>Otros</Label>
              <Input
                value={others}
                onChange={(e) => setOthers(e.target.value)}
                placeholder="Opcional"
              />
            </div>

            {!validation.ok ? (
              <p className="text-sm text-red-600">{validation.reason}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={!validation.ok} onClick={confirm}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
