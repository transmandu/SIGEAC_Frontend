"use client";

import { useState } from "react";
import {
  Ban,
  Boxes,
  Check,
  History,
  Layers,
  Loader2,
  Pencil,
  Plus,
  ScanBarcode,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  EMPTY_INDIVIDUALS_DRAFT,
  IndividualIdentifiersField,
  individualsDraftError,
  individualsPayload,
  type IndividualIdentifiersDraft,
} from "@/components/forms/mantenimiento/almacen/_components/IndividualIdentifiersField";
import { IndividualHistoryDialog } from "@/components/dialogs/almacen/MovementHistoryDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCorrectIndividualIdentifier,
  useDisposeIndividual,
  useGetGeneralArticleIndividuals,
  useIndividualizeGeneralArticle,
} from "@/hooks/mantenimiento/almacen/almacen_general/useGeneralArticleIndividuals";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  INDIVIDUAL_STATUS_LABEL,
  INDIVIDUAL_TYPE_LABEL,
  isStockedIndividual,
  type GeneralArticleIndividual,
  type IndividualStatus,
} from "@/types/general-article-individual";

interface Props {
  articleId: number;
  description: string;
  /** Unidad base, para rotular los que no tienen identificador. */
  unit?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MIN_REASON = 5;

const STATUS_VARIANT: Record<
  IndividualStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  STORED: "default",
  INTOOLBOX: "secondary",
  DISPATCHED: "secondary",
  MAINTENANCE: "outline",
  IN_TRANSFER: "outline",
  DISPOSED: "destructive",
};

// Identificador | Estado | Acciones
const GRID =
  "grid grid-cols-[minmax(0,1fr)_minmax(110px,auto)_96px] items-center";

const FIGURE_TONES = {
  slate: "text-slate-500",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
} as const;

function Figure({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: keyof typeof FIGURE_TONES;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className={cn("size-3.5", FIGURE_TONES[tone])} />
      {label}
      <span className="text-sm font-bold tabular-nums text-foreground">
        {value}
      </span>
    </span>
  );
}
/**
 * Artículos individuales de un artículo general: los identificados primero y,
 * en la última fila, los que no tienen identificador.
 *
 * El artículo sigue siendo existencia agregada; esto solo le da nombre a parte
 * de ella. Por eso los "sin identificar" son lo que queda de restar los identificados
 * que siguen en el almacén. Usa el estilo del resto del inventario de almacén.
 */
export function GeneralArticleIndividualsDialog({
  articleId,
  description,
  unit,
  open,
  onOpenChange,
}: Props) {
  const timeZone = useCompanyTimezone();
  const { data, isLoading, isError, refetch } = useGetGeneralArticleIndividuals(
    articleId,
    open,
  );
  const individualize = useIndividualizeGeneralArticle(articleId);
  const correct = useCorrectIndividualIdentifier(articleId);
  const dispose = useDisposeIndividual(articleId);

  const [draft, setDraft] = useState<IndividualIdentifiersDraft>(
    EMPTY_INDIVIDUALS_DRAFT,
  );
  const [search, setSearch] = useState("");
  const [historyId, setHistoryId] = useState<number | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [editing, setEditing] = useState<{ id: number; value: string } | null>(
    null,
  );
  const [disposing, setDisposing] = useState<GeneralArticleIndividual | null>(
    null,
  );
  const [reason, setReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);

  const summary = data?.summary;
  const individuals = data?.individuals ?? [];
  const max = summary?.anonymous ?? 0;
  const effectiveDraft: IndividualIdentifiersDraft = {
    ...draft,
    type: summary?.type ?? draft.type,
  };
  const draftPayload = individualsPayload(effectiveDraft);
  const draftError = individualsDraftError(effectiveDraft, max);

  // Primero los identificados vigentes y, al final de ese bloque, los dados de
  // baja; los sin identificar van en la última fila.
  const visible = individuals
    .filter((item) =>
      item.identifier.toLowerCase().includes(search.trim().toLowerCase()),
    )
    .sort(
      (a, b) =>
        Number(a.status === "DISPOSED") - Number(b.status === "DISPOSED"),
    );

  const handleIdentify = async () => {
    if (!draftPayload) return;

    await individualize.mutateAsync(draftPayload).then(
      () => {
        setDraft(EMPTY_INDIVIDUALS_DRAFT);
        setIdentifying(false);
      },
      () => undefined,
    );
  };

  const handleCorrect = async () => {
    if (!editing) return;

    await correct
      .mutateAsync({ id: editing.id, identifier: editing.value })
      .then(
        () => setEditing(null),
        () => undefined,
      );
  };

  const reasonTooShort = reason.trim().length < MIN_REASON;

  const closeDispose = () => {
    setDisposing(null);
    setReason("");
    setReasonTouched(false);
  };

  const handleDispose = async () => {
    if (!disposing) return;

    if (reasonTooShort) {
      setReasonTouched(true);
      return;
    }

    await dispose
      .mutateAsync({ id: disposing.id, reason: reason.trim() })
      .then(closeDispose, () => undefined);
  };

  // Al cerrarse, el diálogo olvida búsqueda, edición y borrador durante el
  // render al detectar el cambio de `open`, sin un render intermedio viejo.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      setSearch("");
      setIdentifying(false);
      setHistoryId(null);
      setEditing(null);
      setDraft(EMPTY_INDIVIDUALS_DRAFT);
      closeDispose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-[min(760px,96vw)] flex-col overflow-hidden bg-background p-0 sm:max-w-none">
        <DialogHeader className="border-b px-6 py-5">
          <div className="w-full space-y-3">
            <DialogTitle className="flex w-full flex-wrap justify-center gap-x-2 text-center text-2xl leading-tight">
              Artículos individuales
              <span className="font-bold text-blue-800">{description}</span>
            </DialogTitle>
            <DialogDescription className="text-center">
              {summary?.type
                ? INDIVIDUAL_TYPE_LABEL[summary.type]
                : "Identifique los que quiera controlar por separado."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-10 animate-spin" />
            </div>
          ) : isError || !summary ? (
            <div className="space-y-3 py-10 text-center">
              <p className="text-sm font-medium">
                No se pudieron cargar los artículos individuales.
              </p>
              <Button type="button" variant="outline" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <Figure
                  label="Existencia"
                  value={summary.quantity}
                  icon={Layers}
                  tone="slate"
                />
                <Figure
                  label="Identificados"
                  value={summary.stocked}
                  icon={ScanBarcode}
                  tone="emerald"
                />
                <Figure
                  label="Sin identificar"
                  value={summary.anonymous}
                  icon={Boxes}
                  tone="amber"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">
                  Listado
                  <span className="ml-2 font-normal text-muted-foreground">
                    {individuals.length} identificado
                    {individuals.length === 1 ? "" : "s"}
                  </span>
                </p>

                {summary.individualizable && summary.anonymous > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant={identifying ? "secondary" : "default"}
                    className="gap-1.5"
                    onClick={() => setIdentifying((value) => !value)}
                  >
                    <Plus
                      className={cn(
                        "size-4 transition-transform",
                        identifying && "rotate-45",
                      )}
                    />
                    <ScanBarcode className="size-4" />
                    Identificar
                  </Button>
                )}
              </div>

              {!summary.individualizable && (
                <p className="rounded-md border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                  {summary.blocker}
                </p>
              )}

              {identifying &&
                summary.individualizable &&
                summary.anonymous > 0 && (
                  <div className="space-y-4 rounded-lg border border-blue-300/70 border-l-4 border-l-blue-600 bg-blue-50/60 p-4 dark:border-blue-900 dark:border-l-blue-500 dark:bg-blue-950/20">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-white">
                        <ScanBarcode className="size-4" />
                      </span>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                        Identificar artículos
                      </p>
                    </div>

                    <IndividualIdentifiersField
                      draft={draft}
                      onChange={setDraft}
                      types={data.types}
                      lockedType={summary.type}
                      max={max}
                      disabled={individualize.isPending}
                    />

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={individualize.isPending}
                        onClick={() => {
                          setIdentifying(false);
                          setDraft(EMPTY_INDIVIDUALS_DRAFT);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        className="min-w-35"
                        disabled={
                          !draftPayload ||
                          !!draftError ||
                          individualize.isPending
                        }
                        onClick={handleIdentify}
                      >
                        {individualize.isPending ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <ScanBarcode className="mr-2 size-4" />
                        )}
                        Identificar
                      </Button>
                    </div>
                  </div>
                )}

              {individuals.length > 8 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por identificador..."
                    className="h-10 pl-9 max-sm:text-base"
                  />
                </div>
              )}

              <div className="overflow-x-auto overscroll-x-contain">
                <div className="min-w-120 rounded-md border">
                  <div
                    className={cn(
                      GRID,
                      "rounded-t-md bg-muted/40 text-xs font-semibold text-muted-foreground",
                    )}
                  >
                    <div className="px-3 py-2">Identificador</div>
                    <div className="px-3 py-2 text-center">Estado</div>
                    <div className="px-3 py-2 text-center">Acciones</div>
                  </div>

                  <div className="divide-y">
                    {visible.map((item) => {
                      const isEditing = editing?.id === item.id;
                      const stocked = isStockedIndividual(item.status);

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            GRID,
                            "hover:bg-muted/30 [&>div]:min-w-0",
                          )}
                        >
                          <div className="flex items-center gap-2 px-3 py-2">
                            <ScanBarcode
                              className={cn(
                                "size-4 shrink-0",
                                item.status === "DISPOSED"
                                  ? "text-muted-foreground"
                                  : "text-emerald-600 dark:text-emerald-400",
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              {isEditing ? (
                                <Input
                                  autoFocus
                                  value={editing.value}
                                  disabled={correct.isPending}
                                  onChange={(event) =>
                                    setEditing({
                                      id: item.id,
                                      value: event.target.value,
                                    })
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault();
                                      handleCorrect();
                                    }
                                    if (event.key === "Escape")
                                      setEditing(null);
                                  }}
                                  className="h-9 text-sm max-sm:text-base"
                                />
                              ) : (
                                <p
                                  className={cn(
                                    "break-all text-sm font-medium",
                                    item.status === "DISPOSED" &&
                                      "text-muted-foreground line-through",
                                  )}
                                >
                                  {item.identifier}
                                </p>
                              )}
                              {item.status === "DISPOSED" &&
                                item.disposed_reason && (
                                  <p className="text-xs text-muted-foreground">
                                    {item.disposed_reason}
                                    {item.disposed_at &&
                                      ` (${formatInstant(item.disposed_at, timeZone, "dateTime")})`}
                                  </p>
                                )}
                            </div>
                          </div>

                          <div className="flex justify-center px-3 py-2">
                            <Badge
                              variant={STATUS_VARIANT[item.status]}
                              className="w-fit uppercase"
                            >
                              {INDIVIDUAL_STATUS_LABEL[item.status]}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-center px-2 py-2">
                            {isEditing ? (
                              <>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="size-8"
                                  aria-label="Guardar identificador"
                                  disabled={
                                    correct.isPending ||
                                    !editing.value.trim() ||
                                    editing.value.trim() === item.identifier
                                  }
                                  onClick={handleCorrect}
                                >
                                  {correct.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    <Check className="size-4" />
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="size-8"
                                  aria-label="Cancelar"
                                  disabled={correct.isPending}
                                  onClick={() => setEditing(null)}
                                >
                                  <X className="size-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="size-8"
                                  aria-label="Historial"
                                  title="Historial"
                                  onClick={() => setHistoryId(item.id)}
                                >
                                  <History className="size-4" />
                                </Button>
                                {item.status !== "DISPOSED" && (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-8"
                                    aria-label="Corregir identificador"
                                    title="Corregir identificador"
                                    onClick={() =>
                                      setEditing({
                                        id: item.id,
                                        value: item.identifier,
                                      })
                                    }
                                  >
                                    <Pencil className="size-4" />
                                  </Button>
                                )}
                                {stocked && (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-8"
                                    aria-label="Dar de baja"
                                    title="Dar de baja"
                                    onClick={() => setDisposing(item)}
                                  >
                                    <Ban className="size-4 text-red-500" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {individuals.length > 0 && visible.length === 0 && (
                      <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                        Ningún identificador coincide.
                      </p>
                    )}

                    {summary.anonymous > 0 && (
                      <div
                        className={cn(
                          GRID,
                          "bg-amber-50/70 dark:bg-amber-950/20",
                        )}
                      >
                        <div className="flex items-center gap-2 px-3 py-2">
                          <Boxes className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              Sin identificar
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Sin identificador único
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-center px-3 py-2">
                          <Badge
                            variant="secondary"
                            className="px-3 py-1 text-xs font-bold tabular-nums"
                          >
                            {summary.anonymous}
                            {unit ? ` ${unit}` : ""}
                          </Badge>
                        </div>
                        <div />
                      </div>
                    )}

                    {individuals.length === 0 && summary.anonymous === 0 && (
                      <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                        Este artículo no tiene existencia.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t bg-background px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>

        <IndividualHistoryDialog
          individualId={historyId}
          onOpenChange={(next) => !next && setHistoryId(null)}
        />

        {/* Baja: mismo diálogo de confirmación que el resto del inventario */}
        <Dialog
          open={!!disposing}
          onOpenChange={(next) => !next && closeDispose()}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                ¿Dar de baja {disposing?.identifier}?
              </DialogTitle>
              <DialogDescription className="p-2 pb-0 text-center">
                Sale de la existencia y conserva su identificador y el motivo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <label
                className="text-[13px] font-medium"
                htmlFor="dispose-reason"
              >
                Motivo de la baja
              </label>
              <Textarea
                id="dispose-reason"
                rows={3}
                value={reason}
                disabled={dispose.isPending}
                onChange={(event) => setReason(event.target.value)}
                aria-invalid={reasonTouched && reasonTooShort}
                placeholder="Ej: Teclado dañado, sin reparación."
                className="resize-none max-sm:text-base"
              />
              {reasonTouched && reasonTooShort && (
                <p className="text-xs text-destructive">
                  Mínimo {MIN_REASON} caracteres.
                </p>
              )}
            </div>

            <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
              <Button
                className="bg-rose-400 hover:border hover:border-black hover:bg-white hover:text-black"
                onClick={closeDispose}
                disabled={dispose.isPending}
              >
                Cancelar
              </Button>
              <Button
                disabled={dispose.isPending}
                className="transition-all hover:border hover:border-black hover:bg-white hover:text-black"
                onClick={handleDispose}
              >
                {dispose.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Confirmar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
