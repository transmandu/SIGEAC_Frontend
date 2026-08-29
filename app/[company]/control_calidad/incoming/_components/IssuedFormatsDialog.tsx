"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, History, PencilLine, Loader2 } from "lucide-react";
import { format as formatDate } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  useGetIssuedIncomingFormats,
  useReprintIncomingFormat,
  type IssuedIncomingFormat,
} from "@/actions/mantenimiento/control_calidad/actions";
import { GenerateReceptionFormButton } from "./GenerateReceptionFormButton";
import { IncomingArticle } from "../IncomingTypes";

/**
 * Identifica al formato por su fecha de emisión, no por la OC: esa se teclea a
 * mano y puede repetirse o venir en N/A. Cuando hay varios del mismo día se
 * numeran en orden de emisión para poder citarlos sin ambigüedad.
 *
 * Provisional hasta que el formato tenga su propio correlativo de recepción.
 */
function formatoLabel(f: IssuedIncomingFormat, todos: IssuedIncomingFormat[]) {
  const dia = f.inspection_date.slice(0, 10);
  const mismoDia = todos
    .filter((o) => o.inspection_date.slice(0, 10) === dia)
    .sort((a, b) => a.id - b.id);

  const fecha = formatDate(new Date(f.inspection_date), "dd/MM/yyyy", { locale: es });

  if (mismoDia.length < 2) return fecha;

  return `${fecha}-${mismoDia.findIndex((o) => o.id === f.id) + 1}`;
}

export function IssuedFormatsDialog() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [correcting, setCorrecting] = useState<IssuedIncomingFormat | null>(null);
  // Cuál fila está descargando: isPending es del hook y pondría spinner en todas.
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const { data: formats, isLoading } = useGetIssuedIncomingFormats(search);
  const reprint = useReprintIncomingFormat();

  const handleReprint = async (f: IssuedIncomingFormat) => {
    setDownloadingId(f.id);
    try {
      await reprint.mutateAsync(f);
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo descargar el formato.");
    } finally {
      setDownloadingId(null);
    }
  };

  /**
   * Corregir reemite sobre los mismos artículos del formato anulado, así que se
   * reconstruyen desde sus items. Solo se usa el id: es lo único que el payload
   * necesita, el resto del formato lo precarga `correcting`.
   */
  const articlesOf = (f: IssuedIncomingFormat): IncomingArticle[] =>
    (f.items ?? []).map((i) => ({
      id: i.article_id,
      order_number: f.purchase_order_code,
    })) as IncomingArticle[];

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <History className="h-4 w-4" />
        Formatos emitidos
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Formatos H74-036 emitidos</DialogTitle>
            <DialogDescription>
              Vuelve a descargar el PDF tal como se emitió, o corrígelo si lleva datos
              equivocados. Al corregir se emite uno nuevo y el anterior queda anulado.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por la OC impresa en el formato…"
          />

          <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Cargando…</p>
            ) : !formats?.length ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Aún no hay formatos emitidos.
              </p>
            ) : (
              formats.map((f) => {
                const anulado = f.issuance_status === "VOIDED";

                return (
                  <div
                    key={f.id}
                    className="flex items-start justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">H74-036 · {formatoLabel(f, formats)}</span>
                        {anulado ? (
                          <Badge variant="destructive">Anulado</Badge>
                        ) : (
                          <Badge variant="secondary">Vigente</Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        OC impresa: <b>{f.purchase_order_code ?? "N/A"}</b> ·{" "}
                        {f.items?.length ?? 0} artículo(s)
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Emitido por {f.verified_by}
                      </p>

                      {anulado && f.void_reason ? (
                        <p className="text-xs text-red-600">
                          Anulado por {f.voided_by}: {f.void_reason}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReprint(f)}
                            disabled={downloadingId !== null}
                          >
                            {downloadingId === f.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Descargar de nuevo</TooltipContent>
                      </Tooltip>

                      {/* Sin artículos ligados no hay qué reemitir: el backend
                          exige article_ids con al menos un elemento. */}
                      {!anulado && (f.items?.length ?? 0) > 0 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setCorrecting(f)}
                            >
                              <PencilLine className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Corregir y reemitir</TooltipContent>
                        </Tooltip>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {correcting ? (
        <GenerateReceptionFormButton
          selected={articlesOf(correcting)}
          correcting={correcting}
          open={!!correcting}
          onOpenChange={(v) => !v && setCorrecting(null)}
          onDone={() => setCorrecting(null)}
        />
      ) : null}
    </>
  );
}
