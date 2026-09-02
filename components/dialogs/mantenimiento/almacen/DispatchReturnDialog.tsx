"use client";

import { useCreateDispatchReturn } from "@/actions/mantenimiento/almacen/solicitudes/salida/action";
import { DispatchArticle } from "@/app/[company]/almacen/solicitudes/salida/page";
import EvidenceCapture from "@/components/misc/EvidenceCapture";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AlertTriangle, Barcode, Hash, Loader2, PackageOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface DispatchReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispatchId: number | string;
  requestNumber: string;
  articles: DispatchArticle[];
}

/** Lo que el usuario marcó devolver, por línea de la salida. */
type Selection = Record<number, { checked: boolean; quantity: string }>;

// Tope de `max_file_uploads` de PHP (20 por defecto), con margen para los demás
// campos del multipart, que también cuentan contra el límite.
const MAX_EVIDENCE_FILES_PER_REQUEST = 18;

/**
 * Saldo por devolver, en la unidad en que se DESPACHÓ.
 *
 * Es la unidad que el almacenista tiene delante: si sacó 30 UNIDADES de un
 * trapo cuya base es METRO, devuelve unidades y no metros. Las salidas
 * anteriores a la devolución no traen saldo, así que todo sigue fuera.
 */
function pendingOf(article: DispatchArticle): number {
  return (
    article.pending_in_return_unit ??
    article.pending_quantity ??
    Number(article.dispatch_quantity) ??
    0
  );
}

/** Unidad en que se captura la devolución de esta línea. */
function returnUnitOf(article: DispatchArticle): string {
  return article.return_unit ?? article.unit ?? "";
}

/** Redondeo de presentación: evita colas como 0.6666666667 en pantalla. */
function formatQty(value: number): string {
  return Number(value.toFixed(4)).toLocaleString("es-VE", {
    maximumFractionDigits: 4,
  });
}

const DispatchReturnDialog = ({
  open,
  onOpenChange,
  dispatchId,
  requestNumber,
  articles,
}: DispatchReturnDialogProps) => {
  const { selectedCompany } = useCompanyStore();
  const { createDispatchReturn } = useCreateDispatchReturn();

  const [selection, setSelection] = useState<Selection>({});
  const [justification, setJustification] = useState("");
  const [isAltered, setIsAltered] = useState(false);
  // Fotos de cómo volvió cada artículo, por línea. Opcionales.
  const [evidences, setEvidences] = useState<Record<number, File[]>>({});

  // Solo puede devolverse lo que sigue fuera del almacén.
  const returnable = useMemo(
    () => articles.filter((a) => a.article_dispatch_order_id && pendingOf(a) > 0),
    [articles]
  );

  const selected = useMemo(
    () =>
      returnable.filter(
        (a) => selection[a.article_dispatch_order_id!]?.checked
      ),
    [returnable, selection]
  );

  // Enviar a incoming solo tiene sentido sobre unidades serializadas: el
  // backend rechaza la combinación, así que la casilla no se ofrece si lo
  // seleccionado no la admite.
  const canInspect = selected.length > 0 && selected.every((a) => a.is_inspectable);

  const isValid =
    selected.length > 0 &&
    justification.trim().length > 0 &&
    selected.every((a) => {
      const raw = selection[a.article_dispatch_order_id!]?.quantity ?? "";
      const value = Number(raw.replace(",", "."));
      return Number.isFinite(value) && value > 0 && value <= pendingOf(a);
    });

  const reset = () => {
    setSelection({});
    setJustification("");
    setIsAltered(false);
    setEvidences({});
  };

  const toggle = (article: DispatchArticle, checked: boolean) => {
    const lineId = article.article_dispatch_order_id!;
    setSelection((prev) => ({
      ...prev,
      [lineId]: {
        checked,
        // Al marcar se propone devolver todo lo pendiente, que es el caso común.
        quantity: prev[lineId]?.quantity || String(pendingOf(article)),
      },
    }));
  };

  const setQuantity = (lineId: number, quantity: string) => {
    setSelection((prev) => ({
      ...prev,
      [lineId]: { checked: prev[lineId]?.checked ?? false, quantity },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedCompany?.slug || !isValid) return;

    // PHP descarta en silencio lo que pase de `max_file_uploads` (20 por
    // defecto): se cortaría sin error y faltarían fotos sin que nadie lo sepa.
    const totalFiles = selected.reduce(
      (sum, a) => sum + (evidences[a.article_dispatch_order_id!]?.length ?? 0),
      0
    );

    if (totalFiles > MAX_EVIDENCE_FILES_PER_REQUEST) {
      toast.error("Demasiadas evidencias", {
        description: `Adjuntó ${totalFiles} imágenes y el servidor admite ${MAX_EVIDENCE_FILES_PER_REQUEST} por envío. Quite algunas y vuelva a intentar.`,
      });
      return;
    }

    await createDispatchReturn.mutateAsync({
      id: dispatchId,
      company: selectedCompany.slug,
      data: {
        // canInspect manda: si la selección cambió y dejó de admitir incoming,
        // la casilla ya no se muestra pero su estado podría seguir en true.
        condition: isAltered && canInspect ? "ALTERED" : "SEALED",
        justification: justification.trim(),
        items: selected.map((a) => ({
          article_dispatch_order_id: a.article_dispatch_order_id!,
          quantity: Number(
            selection[a.article_dispatch_order_id!].quantity.replace(",", ".")
          ),
        })),
        // Solo las fotos de artículos que realmente se devuelven: si el usuario
        // adjuntó y luego deseleccionó la línea, no hay a qué colgarlas.
        evidences: Object.fromEntries(
          selected
            .map((a) => [
              a.article_dispatch_order_id!,
              evidences[a.article_dispatch_order_id!] ?? [],
            ])
            .filter(([, files]) => (files as File[]).length > 0)
        ),
      },
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Registrar devolución</DialogTitle>
          <DialogDescription>
            Salida {requestNumber}. Indique qué volvió al almacén y por qué. Lo
            devuelto deja de contarse como consumido en los reportes de costos.
          </DialogDescription>
        </DialogHeader>

        {/* El scroll va en el cuerpo, no en el DialogContent: así el footer
            queda siempre visible sin recurrir a sticky. */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {returnable.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="rounded-full border bg-muted/40 p-3">
                <PackageOpen className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">No queda nada por devolver</p>
              <p className="text-sm text-muted-foreground">
                Todos los artículos de esta salida ya fueron devueltos.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {returnable.map((article) => {
                  const lineId = article.article_dispatch_order_id!;
                  const pending = pendingOf(article);
                  const entry = selection[lineId];
                  const checked = entry?.checked ?? false;
                  const value = Number((entry?.quantity ?? "").replace(",", "."));
                  const invalid =
                    checked && (!Number.isFinite(value) || value <= 0 || value > pending);

                  // Se deriva de los dos saldos que ya manda el backend en vez
                  // de viajar aparte: así no puede quedar desfasado del factor
                  // congelado con que se despachó.
                  const baseFactor =
                    pending > 0 ? (article.pending_quantity ?? 0) / pending : 1;

                  return (
                    <div
                      key={lineId}
                      className="rounded-lg border p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`line-${lineId}`}
                          checked={checked}
                          onCheckedChange={(state) =>
                            toggle(article, state === true)
                          }
                          className="mt-1"
                        />
                        <div className="min-w-0 flex-1">
                          <Label
                            htmlFor={`line-${lineId}`}
                            className="cursor-pointer text-sm font-medium"
                          >
                            {article.description?.trim() ||
                              article.part_number?.trim() ||
                              "Artículo sin identificar"}
                          </Label>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {article.part_number &&
                              article.part_number !== "N/A" && (
                                <Badge variant="secondary" className="gap-1">
                                  <Hash className="h-3.5 w-3.5" />
                                  <span className="font-normal">
                                    {article.part_number}
                                  </span>
                                </Badge>
                              )}
                            {article.serial && article.serial !== "N/A" && (
                              <Badge variant="secondary" className="gap-1">
                                <Barcode className="h-3.5 w-3.5" />
                                <span className="font-normal">
                                  {article.serial}
                                </span>
                              </Badge>
                            )}
                            <Badge variant="outline" className="tabular-nums">
                              {(article.returned_quantity ?? 0) > 0
                                ? "Sin devolver: "
                                : "Despachado: "}
                              {formatQty(pending)}
                              {returnUnitOf(article)
                                ? ` ${returnUnitOf(article)}`
                                : ""}
                            </Badge>
                          </div>
                        </div>

                        {checked && (
                          <div className="w-40 shrink-0">
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <Label className="text-xs text-muted-foreground">
                                Devolver
                              </Label>
                              <EvidenceCapture
                                files={evidences[lineId] ?? []}
                                onChange={(next) =>
                                  setEvidences((prev) => ({
                                    ...prev,
                                    [lineId]: next,
                                  }))
                                }
                                label={
                                  article.description?.trim() ||
                                  article.part_number?.trim() ||
                                  "el artículo"
                                }
                              />
                            </div>
                            <div className="relative">
                              <Input
                                value={entry?.quantity ?? ""}
                                onChange={(e) =>
                                  setQuantity(lineId, e.target.value)
                                }
                                className={`pr-14 tabular-nums ${
                                  invalid ? "border-destructive" : ""
                                }`}
                                inputMode="decimal"
                              />
                              {returnUnitOf(article) && (
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                                  {returnUnitOf(article)}
                                </span>
                              )}
                            </div>
                            {invalid ? (
                              <p className="mt-1 text-xs text-destructive">
                                Máximo {formatQty(pending)}{" "}
                                {returnUnitOf(article)}
                              </p>
                            ) : (
                              // Equivale a X en la unidad base: es la cifra que
                              // realmente reingresa al inventario, y sin ella el
                              // usuario no puede contrastar contra el stock.
                              article.uses_alternate_unit &&
                              Number.isFinite(value) &&
                              value > 0 && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  ≈ {formatQty(value * baseFactor)}{" "}
                                  {article.base_unit}
                                </p>
                              )
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="justification">Justificación</Label>
                {/* maxLength espeja el `max:1000` del backend: sin él, el
                    usuario escribe de más y recibe un 422 tras haberlo
                    rellenado todo. */}
                <Textarea
                  id="justification"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Motivo por el que el artículo regresa al almacén..."
                  rows={3}
                  maxLength={1000}
                />
              </div>

              {canInspect && (
                <div
                  className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                    isAltered ? "border-amber-500/50 bg-amber-500/5" : ""
                  }`}
                >
                  <Checkbox
                    id="altered"
                    checked={isAltered}
                    onCheckedChange={(state) => setIsAltered(state === true)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="altered" className="cursor-pointer text-sm font-medium">
                      Presenta desviación de su condición de despacho
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Sello violado, empaque abierto, evidencia de instalación o
                      cualquier alteración respecto a como salió del almacén.
                    </p>
                    {isAltered && (
                      <p className="flex items-start gap-1.5 pt-1 text-xs font-medium text-amber-600 dark:text-amber-500">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        No reingresa al stock: pasa a inspección de incoming y
                        será el inspector quien determine su destino.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Cancelar
          </Button>
          {returnable.length > 0 && (
            <Button
              onClick={handleSubmit}
              disabled={!isValid || createDispatchReturn.isPending}
              type="button"
            >
              {createDispatchReturn.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isAltered && canInspect ? (
                "Mandar para incoming"
              ) : (
                "Devolver al almacén"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DispatchReturnDialog;
