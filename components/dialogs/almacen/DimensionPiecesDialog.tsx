"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  Scissors,
  Ban,
  Ruler,
  Package,
  Layers,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetArticleDimension } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleDimension";
import {
  useGetPieceCuts,
  useScrapPiece,
} from "@/hooks/mantenimiento/almacen/articulos/useDimensionPieces";
import type { GeneralArticle } from "@/types";
import { cn } from "@/lib/utils";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";

// Mismo lenguaje visual que el formulario de artículo y el LoginForm.
const glassCard = cn(
  "rounded-xl",
  "bg-gradient-to-br from-background/70 to-background/40",
  "backdrop-blur-md",
  "border border-slate-400/50 dark:border-slate-600/50",
  "shadow-sm",
);

/** Cifra grande con su rótulo, para la franja de resumen. */
const Stat = ({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof Package;
  label: string;
  value: string | number;
  unit?: string;
}) => (
  <div className="flex items-center gap-2.5">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold tabular-nums leading-tight">
        {value}
        {unit && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </p>
    </div>
  </div>
);

interface Props {
  article: GeneralArticle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Estado real de un artículo dimensionado: cada pieza con su saldo y sus
 * cortes. La tabla solo puede mostrar el agregado, y el agregado no dice cuál
 * pieza sirve para un trazo concreto — que es justamente lo que hay que decidir.
 */
const DimensionPiecesDialog = ({ article, open, onOpenChange }: Props) => {
  const timeZone = useCompanyTimezone();
  const { selectedCompany } = useCompanyStore();
  const [expandedPiece, setExpandedPiece] = useState<number | null>(null);
  const [confirmScrap, setConfirmScrap] = useState<number | null>(null);

  const { data, isLoading } = useGetArticleDimension(
    open ? article.id : null,
    selectedCompany?.slug,
  );
  const { data: cuts, isLoading: cutsLoading } = useGetPieceCuts(
    expandedPiece,
    selectedCompany?.slug,
  );
  const { scrapPiece } = useScrapPiece();

  const handleScrap = async (pieceId: number) => {
    await scrapPiece.mutateAsync({
      pieceId,
      company: selectedCompany!.slug,
      articleId: article.id,
    });
    setConfirmScrap(null);
  };

  const profile = data?.dimensional ? data.profile : null;
  const pieces = data?.dimensional ? data.pieces : [];
  const totalRemaining = data?.dimensional ? data.total_remaining : 0;
  const wholePieces = profile
    ? pieces.filter((p) => p.remaining >= profile.piece_magnitude).length
    : 0;

  const pieceSize = profile
    ? profile.axes === 2
      ? `${profile.piece_length} × ${profile.piece_width} ${profile.measure_unit_label ?? ""}`
      : `${profile.piece_length} ${profile.measure_unit_label ?? ""}`
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* El scroll va en la lista, no en el diálogo: así encabezado y pie
          quedan fijos y nada se desplaza por detrás de ellos. */}
      <DialogContent className="flex max-h-[88vh] flex-col overflow-hidden p-0 sm:max-w-[680px]">
        <DialogHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
          <DialogTitle className="text-lg tracking-tight">
            {article.description}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {article.brand_model && article.brand_model !== "N/A" && (
              <span>{article.brand_model}</span>
            )}
            {profile && (
              <span className="flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5" />
                Piezas de {pieceSize}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : !profile || pieces.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
            <Package className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No hay piezas disponibles de este artículo.
            </p>
          </div>
        ) : (
          <>
            {/* Resumen: responde de un vistazo qué hay antes de recorrer la
                lista pieza por pieza. */}
            <div className="shrink-0 px-6 pt-4">
              <div className={cn(glassCard, "grid grid-cols-3 gap-3 p-3")}>
                <Stat
                  icon={Layers}
                  label="Disponibles"
                  value={pieces.length}
                  unit="pza."
                />
                <Stat
                  icon={Package}
                  label="Sin empezar"
                  value={wholePieces}
                  unit={`de ${pieces.length}`}
                />
                <Stat
                  icon={Ruler}
                  label="Saldo total"
                  value={Number(totalRemaining.toFixed(4))}
                  unit={profile.magnitude_label}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-6 py-4">
              {pieces.map((piece) => {
                const consumed = piece.initial - piece.remaining;
                const pct =
                  piece.initial > 0 ? (piece.remaining / piece.initial) * 100 : 0;
                const isExpanded = expandedPiece === piece.id;
                const isWhole = piece.remaining >= profile.piece_magnitude;
                const isConfirming = confirmScrap === piece.id;

                return (
                  <div
                    key={piece.id}
                    className={cn(
                      glassCard,
                      "overflow-hidden transition-colors",
                      isConfirming && "border-destructive/50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 p-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tracking-tight">
                            {piece.code}
                          </span>
                          {isWhole ? (
                            <Badge
                              variant="secondary"
                              className="px-1.5 py-0 text-[10px] font-medium"
                            >
                              Sin empezar
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 text-[10px] font-medium"
                            >
                              Empezada
                            </Badge>
                          )}
                        </div>

                        {/* Saldo y consumo en la misma línea: lo que queda es
                            la cifra que decide, lo cortado es el contexto. */}
                        <p className="mt-1 text-sm tabular-nums">
                          <span className="font-medium">
                            {Number(piece.remaining.toFixed(4))}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            de {Number(piece.initial.toFixed(4))}{" "}
                            {profile.magnitude_label}
                          </span>
                          {consumed > 0 && (
                            <span className="text-muted-foreground">
                              {" · "}cortado {Number(consumed.toFixed(4))}
                            </span>
                          )}
                        </p>

                        {/* Barra de saldo: relleno sólido sobre un canal
                            neutro. Sin mínimo forzado en el ancho, para que una
                            pieza intacta y una casi agotada no se vean iguales. */}
                        <div className="relative mt-2.5 h-[18px] w-full overflow-hidden rounded-md bg-foreground/[0.07]">
                          <div
                            className={cn(
                              "absolute inset-y-0 left-0 rounded-md transition-[width] duration-500 ease-out",
                              // Azul con un toque de celeste al final: la parada
                              // intermedia al 70% mantiene el cuerpo de la
                              // barra en azul y deja el celeste como remate.
                              isWhole || pct > 50
                                ? "bg-gradient-to-r from-blue-600 via-blue-600 via-70% to-sky-500"
                                : pct > 20
                                  ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                  : "bg-gradient-to-r from-red-600 to-red-500",
                            )}
                            style={{ width: `${pct}%` }}
                          />

                          {/* El porcentaje sigue al nivel: dentro del relleno
                              mientras quepa, fuera cuando queda poco. */}
                          <span
                            className={cn(
                              "absolute inset-y-0 flex items-center text-[10px] font-semibold tabular-nums",
                              "transition-[left] duration-500 ease-out",
                              // Blanco fijo, no primary-foreground: el relleno
                              // es azul en ambos temas y el token se invierte.
                              pct >= 22 ? "text-white" : "text-muted-foreground",
                            )}
                            style={
                              pct >= 22
                                ? { left: `calc(${pct}% - 2.25rem)` }
                                : { left: `calc(${pct}% + 0.375rem)` }
                            }
                          >
                            {pct >= 99.99 && pct < 100
                              ? "99.9"
                              : Number(pct.toFixed(pct < 10 ? 1 : 0))}
                            %
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                setExpandedPiece(isExpanded ? null : piece.id)
                              }
                            >
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform duration-200",
                                  isExpanded && "rotate-180",
                                )}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isExpanded ? "Ocultar cortes" : "Ver cortes"}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setConfirmScrap(piece.id)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Dar de baja</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-400/30 bg-muted/20 px-3.5 py-3 dark:border-slate-600/30">
                        {cutsLoading ? (
                          <div className="flex justify-center py-3">
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                          </div>
                        ) : !cuts?.cuts.length ? (
                          <p className="py-1 text-center text-xs text-muted-foreground">
                            Esta pieza no tiene cortes registrados.
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {cuts.cuts.map((cut) => (
                              <li
                                key={cut.id}
                                className="flex items-center justify-between gap-3 text-xs"
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <Scissors className="h-3 w-3 shrink-0 text-muted-foreground" />
                                  <span className="tabular-nums">
                                    {cut.input_mode === "MEASURES" &&
                                    cut.cut_length
                                      ? `${cut.cut_length}${cut.cut_width ? ` × ${cut.cut_width}` : ""}`
                                      : "Irregular"}
                                    <span className="text-muted-foreground">
                                      {" = "}
                                      {cut.magnitude} {profile.magnitude_label}
                                    </span>
                                  </span>
                                  {cut.reason === "SCRAP" && (
                                    <Badge
                                      variant="destructive"
                                      className="px-1 py-0 text-[10px]"
                                    >
                                      Baja
                                    </Badge>
                                  )}
                                </span>
                                <span className="shrink-0 text-muted-foreground tabular-nums">
                                  {formatInstant(cut.created_at, timeZone, "dd/MM/yy", "")}
                                  {cut.registered_by && ` · ${cut.registered_by}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {isConfirming && (
                      <div className="border-t border-destructive/30 bg-destructive/5 px-3.5 py-3">
                        <div className="flex gap-2.5">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                          <div className="min-w-0 space-y-2.5">
                            <p className="text-xs leading-relaxed">
                              Se perderán{" "}
                              <span className="font-semibold tabular-nums">
                                {Number(piece.remaining.toFixed(4))}{" "}
                                {profile.magnitude_label}
                              </span>{" "}
                              de saldo y quedará registrado como merma. La pieza
                              no se podrá reabrir.
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs"
                                disabled={scrapPiece.isPending}
                                onClick={() => handleScrap(piece.id)}
                              >
                                {scrapPiece.isPending ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  `Dar de baja ${piece.code}`
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={() => setConfirmScrap(null)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Fuera de la lista: el equivalente en piezas no debe irse con el
                scroll, es la cifra que cuadra contra el inventario. */}
            <div className="shrink-0 flex items-center justify-between border-t bg-background px-6 py-3 text-xs text-muted-foreground">
              <span>
                Equivale a{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {data?.dimensional
                    ? Number(data.equivalent_pieces.toFixed(4))
                    : 0}
                </span>{" "}
                pieza(s) entera(s)
              </span>
              <span className="tabular-nums">
                {Number(totalRemaining.toFixed(4))} {profile.magnitude_label}
              </span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DimensionPiecesDialog;
