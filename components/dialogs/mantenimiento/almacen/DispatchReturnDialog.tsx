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
import {
  AlertTriangle,
  Barcode,
  Hash,
  Layers,
  Loader2,
  PackageOpen,
} from "lucide-react";
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
type Selection = Record<
  number,
  { checked: boolean; quantity: string; altered: boolean }
>;

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

/**
 * Part numbers alternos, siempre como array.
 *
 * El campo se declara `string[] | null`, pero filas antiguas quedaron
 * guardadas como string suelto por un bug de guardado ya corregido en el
 * backend (CreateArticleAction/UpdateArticleAction): un artículo editado
 * antes de ese arreglo puede seguir llegando como string plano, no como
 * array de un elemento. Sin normalizar aquí, un solo artículo con datos
 * viejos tumbaba el diálogo entero con "map is not a function".
 */
function alternatePartNumbersOf(article: DispatchArticle): string[] {
  // El tipo declarado es string[] | null y por eso no admite el caso string
  // suelto que sí llega en runtime; el cast es el propio punto de esta
  // función, que existe para blindar contra ese desfase.
  const raw = article.alternative_part_number as string[] | string | null | undefined;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") return [raw];
  return [];
}

/** Redondeo de presentación: evita colas como 0.6666666667 en pantalla. */
function formatQty(value: number): string {
  return Number(value.toFixed(4)).toLocaleString("es-VE", {
    maximumFractionDigits: 4,
  });
}

/**
 * Texto presentable, o null si no hay dato que mostrar.
 *
 * El backend rellena con "N/A" lo que no tiene, y un badge con "N/A" ocupa el
 * mismo sitio que uno con información sin aportar nada: si el campo falta, el
 * badge no se dibuja.
 */
function shown(value?: string | null): string | null {
  const text = value?.trim();

  return text && text.toUpperCase() !== "N/A" ? text : null;
}

/**
 * Cómo se nombra el artículo en la lista.
 *
 * El aeronáutico se identifica por su número de parte y nunca por la
 * descripción. El general no tiene parte: su identidad ES la descripción, y lo
 * que separa dos que la comparten son la variante y el modelo.
 */
function titleOf(article: DispatchArticle): string {
  const identity =
    article.type === "general"
      ? shown(article.description)
      : shown(article.part_number);

  return identity ?? "Artículo sin identificar";
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

  // Marcado como dañado, y solo si esa línea admite inspección: el backend
  // rechaza ALTERED sobre lo que se maneja por cantidad.
  const isAltered = (article: DispatchArticle) =>
    !!article.is_inspectable &&
    !!selection[article.article_dispatch_order_id!]?.altered;

  const alteredCount = selected.filter(isAltered).length;

  /**
   * Cantidad válida para esta línea, o null si no lo es.
   *
   * Con daño físico exige devolver TODO lo pendiente: la inspección retiene el
   * artículo entero, así que un saldo parcial no tendría dónde quedarse. El
   * backend lo rechaza igual; comprobarlo aquí evita el viaje.
   */
  const quantityErrorOf = (article: DispatchArticle): string | null => {
    const pending = pendingOf(article);
    const raw = selection[article.article_dispatch_order_id!]?.quantity ?? "";
    const value = Number(raw.replace(",", "."));

    if (!Number.isFinite(value) || value <= 0 || value > pending) {
      return `Máximo ${formatQty(pending)} ${returnUnitOf(article)}`.trim();
    }

    if (isAltered(article) && Math.abs(value - pending) > 1e-9) {
      return `Con daño físico se devuelve completo: ${formatQty(pending)} ${returnUnitOf(article)}`.trim();
    }

    return null;
  };

  const isValid =
    selected.length > 0 &&
    justification.trim().length > 0 &&
    selected.every((a) => quantityErrorOf(a) === null);

  const reset = () => {
    setSelection({});
    setJustification("");
    setEvidences({});
  };

  // Parte de un registro completo y no de `...prev[lineId]`: sobre una línea
  // que aún no existe, el spread de undefined dejaría fuera los campos que el
  // tipo promete y el estado quedaría a medias.
  const patchLine = (lineId: number, patch: Partial<Selection[number]>) => {
    setSelection((prev) => ({
      ...prev,
      [lineId]: {
        ...(prev[lineId] ?? { checked: false, quantity: "", altered: false }),
        ...patch,
      },
    }));
  };

  const toggle = (article: DispatchArticle, checked: boolean) =>
    patchLine(article.article_dispatch_order_id!, {
      checked,
      // Al marcar se propone devolver todo lo pendiente, que es el caso común.
      // Se conserva lo ya escrito: desmarcar y volver a marcar no debe borrar
      // la cantidad que el usuario había corregido.
      quantity:
        selection[article.article_dispatch_order_id!]?.quantity ||
        String(pendingOf(article)),
    });

  // Bajar la cantidad por debajo de lo pendiente desmarca el daño físico: son
  // incompatibles, y desmarcarlo respeta lo último que el usuario hizo en vez
  // de dejarlo con un error que no pidió.
  const setQuantity = (article: DispatchArticle, quantity: string) => {
    const value = Number(quantity.replace(",", "."));
    const isPartial =
      Number.isFinite(value) && Math.abs(value - pendingOf(article)) > 1e-9;

    patchLine(article.article_dispatch_order_id!, {
      quantity,
      ...(isPartial ? { altered: false } : {}),
    });
  };

  // Marcar daño físico lleva la cantidad a todo lo pendiente: la inspección se
  // queda con el artículo entero, así que dejar un parcial escrito solo daría
  // un error que el usuario tendría que corregir a mano.
  const setAltered = (article: DispatchArticle, altered: boolean) =>
    patchLine(article.article_dispatch_order_id!, {
      altered,
      ...(altered ? { quantity: String(pendingOf(article)) } : {}),
    });

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
        justification: justification.trim(),
        items: selected.map((a) => ({
          article_dispatch_order_id: a.article_dispatch_order_id!,
          quantity: Number(
            selection[a.article_dispatch_order_id!].quantity.replace(",", ".")
          ),
          // isAltered vuelve a mirar is_inspectable: la casilla pudo marcarse y
          // luego dejar de mostrarse, quedando su estado en true.
          condition: isAltered(a) ? ("ALTERED" as const) : ("SEALED" as const),
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
                  const error = checked ? quantityErrorOf(article) : null;

                  // Se deriva de los dos saldos que ya manda el backend en vez
                  // de viajar aparte: así no puede quedar desfasado del factor
                  // congelado con que se despachó.
                  const baseFactor =
                    pending > 0 ? (article.pending_quantity ?? 0) / pending : 1;

                  const altered = isAltered(article);

                  return (
                    <div
                      key={lineId}
                      className={`rounded-lg border p-3 transition-colors hover:bg-muted/30 ${
                        altered ? "border-amber-500/50" : ""
                      }`}
                    >
                      <div className="flex items-stretch gap-3">
                        <Checkbox
                          id={`line-${lineId}`}
                          checked={checked}
                          onCheckedChange={(state) =>
                            toggle(article, state === true)
                          }
                          className="mt-1"
                        />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Label
                            htmlFor={`line-${lineId}`}
                            className="cursor-pointer text-sm font-medium"
                          >
                            {titleOf(article)}
                          </Label>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {shown(article.variant_type) && (
                              <Badge variant="secondary" className="font-normal">
                                {shown(article.variant_type)}
                              </Badge>
                            )}
                            {shown(article.brand_model) && (
                              <Badge variant="secondary" className="font-normal">
                                {shown(article.brand_model)}
                              </Badge>
                            )}
                            {alternatePartNumbersOf(article)
                              .map(shown)
                              .filter((alt): alt is string => alt !== null)
                              .map((alt) => (
                                <Badge
                                  key={alt}
                                  variant="secondary"
                                  className="gap-1"
                                >
                                  <Hash className="h-3.5 w-3.5" />
                                  <span className="font-normal">{alt}</span>
                                </Badge>
                              ))}
                            {shown(article.serial) && (
                              <Badge variant="secondary" className="gap-1">
                                <Barcode className="h-3.5 w-3.5" />
                                <span className="font-normal">
                                  {shown(article.serial)}
                                </span>
                              </Badge>
                            )}
                            {shown(article.lot_number) && (
                              <Badge variant="secondary" className="gap-1">
                                <Layers className="h-3.5 w-3.5" />
                                <span className="font-normal">
                                  {shown(article.lot_number)}
                                </span>
                              </Badge>
                            )}
                            {shown(article.category) && (
                              <Badge variant="secondary" className="font-normal">
                                {shown(article.category)}
                              </Badge>
                            )}
                            {shown(article.batch_name) && (
                              <Badge variant="secondary" className="font-normal">
                                {shown(article.batch_name)}
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

                          {/* mt-auto lo pega al fondo de la columna, que es
                              donde cae el check de la otra: así comparten fila
                              en vez de apilar cada una a su propio ritmo, y la
                              tarjeta no crece al marcarlo. */}
                          {altered && (
                            <p className="mt-auto flex h-6 items-center gap-1.5 pt-2 text-xs text-amber-600 dark:text-amber-500">
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                              No reingresa al stock: pasa a inspección de
                              incoming.
                            </p>
                          )}
                        </div>

                        {checked && (
                          <div className="flex w-40 shrink-0 flex-col">
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
                                label={titleOf(article)}
                              />
                            </div>
                            <div className="relative">
                              <Input
                                value={entry?.quantity ?? ""}
                                onChange={(e) =>
                                  setQuantity(article, e.target.value)
                                }
                                className={`pr-14 tabular-nums ${
                                  error ? "border-destructive" : ""
                                }`}
                                inputMode="decimal"
                              />
                              {returnUnitOf(article) && (
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                                  {returnUnitOf(article)}
                                </span>
                              )}
                            </div>
                            {error ? (
                              <p className="mt-1 text-xs text-destructive">
                                {error}
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

                            {/* La condición es de este artículo: de la misma
                                salida puede volver uno dañado y otro intacto.
                                Solo en unidades serializadas, las únicas que el
                                panel de incoming sabe inspeccionar. */}
                            {article.is_inspectable && (
                              <div className="mt-auto flex h-6 items-center gap-2 pt-2">
                                <Checkbox
                                  id={`altered-${lineId}`}
                                  checked={selection[lineId]?.altered ?? false}
                                  onCheckedChange={(state) =>
                                    setAltered(article, state === true)
                                  }
                                  className="size-3.5"
                                />
                                <Label
                                  htmlFor={`altered-${lineId}`}
                                  className={`cursor-pointer text-xs font-normal ${
                                    altered
                                      ? "text-amber-600 dark:text-amber-500"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  Con daño físico
                                </Label>
                              </div>
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
              ) : alteredCount === 0 ? (
                "Devolver al almacén"
              ) : alteredCount === selected.length ? (
                "Mandar para incoming"
              ) : (
                // Devolución mixta: el botón dice a dónde va cada parte, porque
                // el destino ya no es uno solo para toda la devolución.
                `Devolver ${selected.length - alteredCount} y mandar ${alteredCount} a incoming`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DispatchReturnDialog;
