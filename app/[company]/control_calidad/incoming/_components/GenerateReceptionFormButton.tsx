"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGenerateIncomingFormat,
  type IssuedIncomingFormat,
} from "@/actions/mantenimiento/control_calidad/actions";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { IncomingArticle } from "../IncomingTypes";

export function GenerateReceptionFormButton({
  selected,
  onDone,
  correcting,
  open: controlledOpen,
  onOpenChange,
}: {
  selected: IncomingArticle[];
  onDone?: () => void;
  /** Presente = reemisión: al confirmar, el backend anula este formato. */
  correcting?: IssuedIncomingFormat;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [inspectionDate, setInspectionDate] = useState<Date>(new Date());
  const [purchaseOrderCode, setPurchaseOrderCode] = useState("");
  const [client, setClient] = useState("");
  const [others, setOthers] = useState("");
  const [voidReason, setVoidReason] = useState("");
  const [downloadFormat, setDownloadFormat] = useState(true);
  const [showChecklist, setShowChecklist] = useState(true);

  const isCorrection = !!correcting;
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (v: boolean) => {
    onOpenChange ? onOpenChange(v) : setUncontrolledOpen(v);
  };

  const generatePdf = useGenerateIncomingFormat();

  const canGenerate = selected.length > 0;

  /** Los seleccionados pueden venir de varias OC: solo sugerimos si todos comparten la misma. */
  const systemOrderNumbers = useMemo(
    () => Array.from(new Set(selected.map((a) => a.order_number).filter(Boolean))) as string[],
    [selected]
  );
  const suggestedOrderNumber = systemOrderNumbers.length === 1 ? systemOrderNumbers[0] : "";

  const validation = useMemo(() => {
    if (!canGenerate) return { ok: false, reason: "Selecciona al menos un artículo." };
    if (!purchaseOrderCode.trim())
      return { ok: false, reason: "Indica el número de orden que debe imprimirse en el formato." };
    if (isCorrection && !voidReason.trim())
      return { ok: false, reason: "Indica por qué se anula el formato anterior." };
    return { ok: true, reason: "" };
  }, [canGenerate, purchaseOrderCode, isCorrection, voidReason]);

  /**
   * Al corregir se parte de lo que decía el formato errado, no de cero. Depende
   * del id y no del objeto: `correcting` se recrea en cada render del padre y
   * volvería a pisar lo que el usuario ya escribió.
   */
  const correctingId = correcting?.id;
  useEffect(() => {
    if (!open) return;
    setPurchaseOrderCode(correcting?.purchase_order_code ?? suggestedOrderNumber);
    setClient(correcting?.printed_client ?? "");
    setOthers(correcting?.printed_others ?? "");
    setVoidReason("");
    if (correcting?.inspection_date) setInspectionDate(new Date(correcting.inspection_date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, correctingId, suggestedOrderNumber]);

    const confirm = async () => {
      if (!validation.ok) return;

      const payload = {
        inspection_date: format(inspectionDate, "yyyy-MM-dd"),
        purchase_order_code: purchaseOrderCode.trim() || null,
        client: client.trim() || null,
        others: others.trim() || null,
        article_ids: selected.map((a) => a.id),
        download: isCorrection ? true : downloadFormat,
        corrects_inspection_id: correcting?.id ?? null,
        void_reason: isCorrection ? voidReason.trim() : null,
        show_checklist: showChecklist,
      };

      try {
        await generatePdf.mutateAsync(payload);
        toast.success(
          isCorrection
            ? "Formato reemitido. El anterior quedó anulado."
            : downloadFormat
              ? "PDF generado y descargado."
              : "Artículos actualizados correctamente."
        );
        setOpen(false);
        onDone?.();
      } catch (e: any) {
        toast.error(e?.message ?? "No se pudo generar el formato.");
      }
    };

  const reset = () => {
    setInspectionDate(new Date());
    setPurchaseOrderCode("");
    setClient("");
    setOthers("");
    setVoidReason("");
    setDownloadFormat(true);
    setShowChecklist(true);
  };

  return (
    <>
      {controlledOpen === undefined ? (
        <Button
          disabled={!canGenerate}
          onClick={() => {
            setPurchaseOrderCode(suggestedOrderNumber);
            setOpen(true);
          }}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Generar H74-036
        </Button>
      ) : null}

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isCorrection ? "Corregir formato H74-036" : "Generar formato H74-036"}
            </DialogTitle>
            <DialogDescription>
              {isCorrection ? (
                <>
                  Se emitirá un formato nuevo para <b>{selected.length}</b> artículo(s) y el
                  anterior (<b>{correcting?.purchase_order_code ?? "N/A"}</b>) quedará{" "}
                  <b>anulado</b>, conservándose en el historial.
                </>
              ) : (
                <>
                  Se generará el formato para <b>{selected.length}</b> artículo(s). Al
                  confirmar, pasarán a <b>En espera por ubicar</b>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
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
              <Label htmlFor="purchase-order-code">
                N° de orden a imprimir <span className="text-red-600">*</span>
              </Label>
              <Input
                id="purchase-order-code"
                value={purchaseOrderCode}
                onChange={(e) => setPurchaseOrderCode(e.target.value)}
                placeholder="Ej: OC-2026-00123"
                autoFocus
              />
              {systemOrderNumbers.length > 1 ? (
                <p className="text-xs text-muted-foreground">
                  Los artículos seleccionados provienen de varias órdenes del sistema (
                  {systemOrderNumbers.join(", ")}). Escribe el número que debe aparecer en el
                  formato físico.
                </p>
              ) : suggestedOrderNumber ? (
                <p className="text-xs text-muted-foreground">
                  En el sistema es <b>{suggestedOrderNumber}</b>. Edítalo si el formato físico usa
                  otro número.
                  {purchaseOrderCode !== suggestedOrderNumber ? (
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto px-1 py-0 text-xs"
                      onClick={() => setPurchaseOrderCode(suggestedOrderNumber)}
                    >
                      Usar el del sistema
                    </Button>
                  ) : null}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Escribe el número que debe aparecer en el formato físico.
                </p>
              )}
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

            {/* Motivo de anulación */}
            {isCorrection ? (
              <div className="space-y-2">
                <Label htmlFor="void-reason">
                  Motivo de la corrección <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="void-reason"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Ej: se imprimió con la OC de otra recepción."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Queda registrado junto al formato anulado como evidencia.
                </p>
              </div>
            ) : null}

            {/* Descargar formato: al corregir siempre se emite el PDF, porque el
                registro de la reemisión nace de él. */}
            {!isCorrection ? (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="download-format"
                  checked={downloadFormat}
                  onCheckedChange={(checked) => setDownloadFormat(checked === true)}
                />
                <Label htmlFor="download-format" className="cursor-pointer">
                  Descargar formato
                </Label>
              </div>
            ) : null}

            {/* Si no se marca, la columna Vo/Bo del checklist sale en blanco
                en el PDF; el ITEM y la DESCRIPCION son texto fijo de la
                plantilla y siempre se imprimen. */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-checklist"
                checked={showChecklist}
                onCheckedChange={(checked) => setShowChecklist(checked === true)}
              />
              <Label htmlFor="show-checklist" className="cursor-pointer">
                Mostrar resultados del checklist (Vo/Bo) en el formato
              </Label>
            </div>

            {!validation.ok ? (
              <p className="text-sm text-red-600">{validation.reason}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={generatePdf.isPending}
            >
              Cancelar
            </Button>
            <Button
              disabled={!validation.ok || generatePdf.isPending}
              onClick={confirm}
              className="gap-2"
            >
              {generatePdf.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isCorrection ? "Reemitir" : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
