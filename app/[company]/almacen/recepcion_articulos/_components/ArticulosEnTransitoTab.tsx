"use client";

import {
  useReportIncomingBlocked,
  useUpdateArticleStatus,
} from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useTransitQueue } from "@/hooks/mantenimiento/almacen/inventario/useArticleQueues";
import {
  INCOMING_REASON_ACTIONS,
  INCOMING_REASON_LABELS,
  isReadyForIncoming,
} from "@/lib/incoming-readiness";
import { cn, toAltPartNumbers } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  ArrowRight,
  BellRing,
  ChevronRight,
  CircleAlert,
  FileWarning,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import Link from "next/link";
import { memo, useMemo, useState } from "react";
import type { TransitArticle } from "@/types/purchase/in-transit";
import { ArticleDetailDialog } from "./ArticleDetailDialog";
import { DownloadReportDialog } from "./DownloadReportDialog";
import { StoreDirectlyDialog } from "./StoreDirectlyDialog";

type StatusFilter = "ALL" | "TRANSIT" | "RECEPTION";

const TRANSIT_STATUS_LABELS: Record<string, string> = {
  TRANSIT: "EN TRÁNSITO",
  RECEPTION: "EN RECEPCIÓN",
};

// ── Fila de artículo ───────────────────────────────────────────────────
const ArticleRow = memo(function ArticleRow({
  article,
}: {
  article: TransitArticle;
}) {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const { updateArticleStatus } = useUpdateArticleStatus();
  const { reportIncomingBlocked } = useReportIncomingBlocked();
  const [pending, setPending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const status = article.status?.toUpperCase();
  const isReception = status === "RECEPTION";

  const readiness = article.incoming_readiness;
  const canPassToIncoming = isReadyForIncoming(readiness);
  const blockingReasons = readiness?.reasons ?? [];

  // De todos los motivos, este es el que almacén puede resolver sin esperar a
  // nadie, y por eso se destaca: mientras nadie declare qué documentos exige el
  // artículo, compras no tiene ni qué conseguir. No es competencia exclusiva de
  // almacén, pero por conocimiento técnico son quienes mejor saben cuáles son.
  const needsDocumentsDeclared = blockingReasons.includes(
    "MISSING_DOCUMENT_REQUIREMENTS",
  );

  const handleMoveToIncoming = async () => {
    setPending(true);
    try {
      await updateArticleStatus.mutateAsync({
        id: article.id,
        status: "INCOMING",
      });
    } catch {
      // El toast de error lo emite la mutación; aquí solo hay que soltar
      // el botón, que si no se quedaba girando para siempre.
    } finally {
      setPending(false);
    }
  };

  const handleReportBlocked = async () => {
    const reportedBy =
      [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
      user?.username ||
      null;

    try {
      await reportIncomingBlocked.mutateAsync({
        id: article.id,
        reported_by: reportedBy,
      });

      setReportDialogOpen(false);
    } catch {
      // El toast de error lo emite la mutación. El diálogo se queda abierto
      // para poder reintentar sin volver a buscar la fila.
    }
  };

  const location = article.batch?.warehouse?.location;

  const isBlocked = isReception && !canPassToIncoming;

  const hasExtra =
    article.condition ||
    article.manufacturer ||
    article.quantity != null ||
    article.unit ||
    isBlocked;

  return (
    <>
      <TableRow
        className={cn(
          "hover:bg-muted/30 transition-colors",
          hasExtra && "cursor-pointer",
        )}
        onClick={hasExtra ? () => setExpanded((v) => !v) : undefined}
      >
        {/* Expand toggle */}
        <TableCell className="w-6 p-0 text-center">
          {hasExtra && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="flex items-center justify-center rounded p-0.5 text-muted-foreground/50 hover:text-foreground transition-colors mx-auto"
            >
              <ChevronRight
                className={cn(
                  "size-3.5 transition-transform duration-150",
                  expanded && "rotate-90 text-amber-600 dark:text-amber-500",
                )}
              />
            </button>
          )}
        </TableCell>

        {/* Parte / Alterno */}
        <TableCell className="text-center">
          <div className="space-y-1 flex flex-col items-center">
            <div className="font-mono text-[12px] font-semibold bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 w-fit tracking-wide">
              {article.part_number}
            </div>
            {toAltPartNumbers(article.alternative_part_number).length > 0 ? (
              <div className="flex items-center gap-1">
                <span className="shrink-0 text-[9px] font-mono font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-1 py-0.5 rounded tracking-widest select-none">
                  ALT
                </span>
                <span className="font-mono text-[11px] text-muted-foreground truncate">
                  {toAltPartNumbers(article.alternative_part_number).join(
                    " / ",
                  )}
                </span>
              </div>
            ) : (
              <span className="text-[10px] font-mono text-muted-foreground/30 border border-dashed border-border/30 px-1 py-0.5 rounded">
                ALT N/A
              </span>
            )}
          </div>
        </TableCell>

        {/* Descripción (batch) */}
        <TableCell className="text-center">
          <span className="text-sm font-medium">
            {article.batch?.name ?? "N/A"}
          </span>
        </TableCell>

        {/* N° de requisición */}
        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
          {article.requisition_order_number ? (
            <Link
              href={`/${selectedCompany?.slug}/general/requisiciones/${article.requisition_order_number}`}
              className="text-sm font-medium hover:underline"
            >
              {article.requisition_order_number}
            </Link>
          ) : (
            <span className="text-sm font-medium">N/A</span>
          )}
        </TableCell>

        <TableCell className="text-center">
          <span className="text-sm font-medium">
            {article.reception_date ?? "N/A"}
          </span>
        </TableCell>

        {/* Ubicación */}
        <TableCell className="text-center">
          {location ? (
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span className="text-xs">{location.address}</span>
              {location.cod_iata && (
                <span className="font-mono text-[10px] bg-muted/60 px-1 py-0.5 rounded border border-border/40">
                  {location.cod_iata}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground/40">N/A</span>
          )}
        </TableCell>

        {/* Estado */}
        <TableCell className="text-center">
          <div className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "select-none inline-block whitespace-nowrap text-[10px] font-medium px-1.5 py-0.5 rounded border tracking-wide",
                isReception
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60"
                  : "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/60",
              )}
            >
              {TRANSIT_STATUS_LABELS[status ?? ""] ?? "Sin estado"}
            </span>

            {isBlocked &&
              (needsDocumentsDeclared ? (
                <span className="select-none inline-flex animate-pulse items-center gap-1 whitespace-nowrap rounded border border-orange-300 bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-orange-800 dark:border-orange-700/60 dark:bg-orange-950/50 dark:text-orange-300">
                  <CircleAlert className="size-2.5" />
                  INDICA DOCUMENTOS
                </span>
              ) : (
                <span className="select-none inline-flex items-center gap-1 whitespace-nowrap rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-400">
                  <FileWarning className="size-2.5" />
                  RETENIDO
                </span>
              ))}
          </div>
        </TableCell>

        {/* Detalle */}
        <TableCell
          className="w-10 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <ArticleDetailDialog article={article} />
        </TableCell>

        {/* Acciones */}
        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
          {isReception && (
            <div className="flex items-center justify-center gap-1">
              {canPassToIncoming ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                  disabled={pending}
                  onClick={handleMoveToIncoming}
                >
                  {pending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <>
                      <ArrowRight className="size-3" />
                      Incoming
                    </>
                  )}
                </Button>
              ) : (
                // No va deshabilitado de verdad: sigue siendo pulsable para que
                // el clic sirva de reclamo a compras. Lo que no hace es pasar el
                // artículo, que es lo que la ley impide sin orden ni documentos.
                //
                // El aviso pasa por confirmación porque llega a diez o quince
                // personas por correo: un doble clic distraído sobre un botón
                // que parece deshabilitado llenaría sus bandejas.
                <TooltipProvider>
                  <Tooltip>
                    <AlertDialog
                      open={reportDialogOpen}
                      // Mientras el aviso sale no se cierra por Escape ni por el
                      // fondo: el botón ya está bloqueado, y cerrarlo a medias
                      // dejaba la fila sin señal de que el envío sigue en curso.
                      onOpenChange={(next) => {
                        if (!next && reportIncomingBlocked.isPending) return;
                        setReportDialogOpen(next);
                      }}
                    >
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-7 px-2 text-xs gap-1",
                              needsDocumentsDeclared
                                ? "border-orange-400 font-semibold text-orange-800 hover:bg-orange-50 dark:border-orange-600/70 dark:text-orange-300 dark:hover:bg-orange-950/40"
                                : "border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800/60 dark:text-amber-400 dark:hover:bg-amber-950/40",
                            )}
                            disabled={reportIncomingBlocked.isPending}
                          >
                            {reportIncomingBlocked.isPending ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : needsDocumentsDeclared ? (
                              <>
                                <CircleAlert className="size-3" />
                                Incoming
                              </>
                            ) : (
                              <>
                                <FileWarning className="size-3" />
                                Incoming
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <BellRing className="size-5 text-amber-500" />
                            Notificar que el artículo está detenido
                          </AlertDialogTitle>
                          <AlertDialogDescription asChild>
                            <div className="space-y-3">
                              <p>
                                Se enviará una notificación y un correo sobre el
                                artículo{" "}
                                <span className="font-mono font-semibold text-foreground">
                                  {article.part_number}
                                </span>{" "}
                                a <strong>compras</strong> —para que aporten lo
                                que falta— y al personal de{" "}
                                <strong>
                                  almacén, mantenimiento y control de calidad
                                </strong>
                                , explicando por qué queda retenido.
                              </p>

                              <div className="rounded-md border border-border/60 bg-muted/40 px-3 py-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Información faltante
                                </p>
                                <ul className="mt-1 space-y-0.5">
                                  {blockingReasons.map((reason) => (
                                    <li key={reason} className="text-xs">
                                      •{" "}
                                      {INCOMING_REASON_LABELS[reason] ?? reason}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {needsDocumentsDeclared && (
                                <p className="text-xs">
                                  Si ya sabes qué documentos exige, indicarlos
                                  tú desde el detalle del artículo desatasca el
                                  flujo sin esperar respuesta.
                                </p>
                              )}
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel
                            disabled={reportIncomingBlocked.isPending}
                          >
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            disabled={reportIncomingBlocked.isPending}
                            onClick={(e) => {
                              // Radix cierra el diálogo con el clic de la acción:
                              // se frena para que el cierre lo haga la mutación
                              // al terminar, y el botón pueda mostrar su estado.
                              e.preventDefault();
                              handleReportBlocked();
                            }}
                            className="gap-1.5"
                          >
                            {reportIncomingBlocked.isPending ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <BellRing className="size-3.5" />
                            )}
                            Enviar notificación
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      <p className="font-semibold">
                        No puede pasar a incoming todavía
                      </p>

                      {needsDocumentsDeclared && (
                        <p className="mt-1.5 flex gap-1.5 rounded border border-orange-300/70 bg-orange-100/70 px-2 py-1.5 font-semibold text-orange-900 dark:border-orange-700/60 dark:bg-orange-950/50 dark:text-orange-200">
                          <CircleAlert className="mt-px size-3.5 shrink-0" />
                          <span>
                            Indica qué documentos exige este artículo para que
                            compras pueda conseguirlos. Por conocimiento técnico
                            ustedes son quienes mejor saben cuáles corresponden.
                          </span>
                        </p>
                      )}

                      <ul className="mt-1.5 space-y-0.5">
                        {blockingReasons.map((reason) => (
                          <li key={reason}>
                            • {INCOMING_REASON_LABELS[reason] ?? reason}
                            <span className="block pl-3 text-muted-foreground">
                              {INCOMING_REASON_ACTIONS[reason]?.warehouse}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <p className="mt-2 flex items-center gap-1 font-medium">
                        <BellRing className="size-3" />
                        Presiona para avisar a compras y al personal competente.
                        Se pedirá confirmación.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <StoreDirectlyDialog article={article} />
            </div>
          )}
        </TableCell>
      </TableRow>

      {/* Sub-fila expandible */}
      {expanded && hasExtra && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={9} className="p-0 border-b border-border/40">
            <div className="pl-10 pr-4 py-3 bg-muted/20 border-l-2 border-amber-300 dark:border-amber-700/60">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                {article.manufacturer && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">
                      Fabricante:
                    </span>
                    <span className="font-semibold">
                      {article.manufacturer.name}
                    </span>
                  </div>
                )}
                {article.condition && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">
                      Condición:
                    </span>
                    <span className="font-semibold">
                      {article.condition.name}
                    </span>
                  </div>
                )}
                {article.quantity != null && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">
                      Cantidad:
                    </span>
                    <span className="font-semibold tabular-nums">
                      {article.quantity}
                      {article.unit && (
                        <span className="ml-1 font-mono text-[10px] bg-muted/60 px-1 py-0.5 rounded border border-border/40">
                          {article.unit}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {needsDocumentsDeclared && (
                <div className="mt-3 flex gap-2 rounded-md border-l-4 border-orange-400 bg-orange-50 px-3 py-2.5 dark:border-orange-600 dark:bg-orange-950/30">
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="text-xs font-bold text-orange-900 dark:text-orange-200">
                      Ayuda a compras: indica qué documentación requiere este
                      artículo
                    </p>
                    <p className="mt-1 text-xs text-orange-900/80 dark:text-orange-200/80">
                      Indica qué documentos exige este artículo para que compras
                      pueda conseguirlos. Por conocimiento técnico ustedes son
                      quienes mejor saben cuáles corresponden: márcalos desde el
                      detalle del artículo.
                    </p>
                  </div>
                </div>
              )}

              {isBlocked && (
                <div className="mt-3 rounded-md border border-red-200 bg-red-50/60 px-3 py-2 dark:border-red-800/50 dark:bg-red-950/20">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400">
                    <FileWarning className="size-3" />
                    Falta información obligatoria para el incoming
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {blockingReasons.map((reason) => (
                      <li key={reason} className="text-xs">
                        <span className="font-medium">
                          {INCOMING_REASON_LABELS[reason] ?? reason}
                        </span>
                        <span className="ml-1 text-muted-foreground">
                          — {INCOMING_REASON_ACTIONS[reason]?.warehouse}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {readiness?.pending_documents?.length ? (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Documentos sin cargar:{" "}
                      {readiness.pending_documents
                        .map((doc) => doc.document_type?.name)
                        .filter(Boolean)
                        .join(", ")}
                      .
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
});

// ── Tab ──────────────────────────────────────────────────────────────
export function ArticulosEnTransitoTab() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");

  const { data: transitArticles, isLoading: loadingTransit } =
    useTransitQueue("TRANSIT");
  const { data: receptionArticles, isLoading: loadingReception } =
    useTransitQueue("RECEPTION");

  const isLoading = loadingTransit || loadingReception;

  const articles = useMemo<TransitArticle[]>(() => {
    const transit = (transitArticles as TransitArticle[]) ?? [];
    const reception = (receptionArticles as TransitArticle[]) ?? [];

    let combined: TransitArticle[];
    if (statusFilter === "TRANSIT") combined = transit;
    else if (statusFilter === "RECEPTION") combined = reception;
    else combined = [...transit, ...reception];

    if (!search.trim()) return combined;

    const q = search.trim().toLowerCase();
    return combined.filter(
      (a) =>
        a.part_number?.toLowerCase().includes(q) ||
        toAltPartNumbers(a.alternative_part_number).some((alt) =>
          alt.toLowerCase().includes(q),
        ) ||
        a.batch?.name?.toLowerCase().includes(q) ||
        a.batch?.warehouse?.location?.address?.toLowerCase().includes(q),
    );
  }, [transitArticles, receptionArticles, statusFilter, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  const totalTransit = (transitArticles as TransitArticle[])?.length ?? 0;
  const totalReception = (receptionArticles as TransitArticle[])?.length ?? 0;

  // Se cuenta sobre toda la cola de recepción y no sobre lo filtrado: es una
  // llamada a la acción, y ocultarla al buscar o cambiar de pestaña haría que
  // pareciera resuelta.
  const awaitingDocuments = (
    (receptionArticles as TransitArticle[]) ?? []
  ).filter((a) =>
    a.incoming_readiness?.reasons?.includes("MISSING_DOCUMENT_REQUIREMENTS"),
  ).length;

  return (
    <div className="flex flex-col gap-y-3">
      {/* Encabezado */}
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Artículos en Tránsito</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {articles.length} {articles.length === 1 ? "artículo" : "artículos"}
          </span>
          <DownloadReportDialog
            endpoint="{location_id}/articles-reception-pdf"
            requiresLocation
            title="Descargar Reporte de Artículos en Recepción"
            description="Selecciona el rango de fechas de recepción para filtrar los artículos."
            dateRangeLabel="Rango de Fechas de Recepción"
            fileNamePrefix="articulos_en_recepcion"
          />
        </div>
      </div>

      {awaitingDocuments > 0 && (
        <div className="flex items-start gap-2.5 rounded-md border-l-4 border-orange-400 bg-orange-50 px-4 py-3 dark:border-orange-600 dark:bg-orange-950/30">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-orange-600 dark:text-orange-400" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-orange-900 dark:text-orange-200">
              {awaitingDocuments === 1
                ? "1 artículo espera que indiques su documentación requerida"
                : `${awaitingDocuments} artículos esperan que indiques su documentación requerida`}
            </p>
            <p className="mt-0.5 text-xs text-orange-900/80 dark:text-orange-200/80">
              Indica qué documentos exige cada artículo para que compras pueda
              conseguirlos. Por conocimiento técnico ustedes son quienes mejor
              saben cuáles corresponden: márcalos desde el detalle del artículo.
            </p>
          </div>
        </div>
      )}

      {/* Filtros + búsqueda */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-md border border-border overflow-hidden">
          {(
            [
              {
                value: "ALL",
                label: "Todos",
                count: totalTransit + totalReception,
              },
              { value: "TRANSIT", label: "Tránsito", count: totalTransit },
              { value: "RECEPTION", label: "Recepción", count: totalReception },
            ] as { value: StatusFilter; label: string; count: number }[]
          ).map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors border-r last:border-r-0",
                statusFilter === value
                  ? value === "TRANSIT"
                    ? "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400"
                    : value === "RECEPTION"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                      : "bg-muted text-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted/50",
              )}
            >
              {label}
              <span
                className={cn(
                  "ml-1.5 px-1 py-0 rounded text-[10px] font-semibold",
                  statusFilter === value ? "bg-background/60" : "bg-muted",
                )}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar parte, nombre, ubicación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs w-64"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-6 p-0" />
              <TableHead className="text-xs text-center">
                N° de Parte / Alterno
              </TableHead>
              <TableHead className="text-xs text-center">Descripción</TableHead>
              <TableHead className="text-xs text-center">
                Solicitud de Compra
              </TableHead>
              <TableHead className="text-xs text-center">
                Fecha de Recepción
              </TableHead>
              <TableHead className="text-xs text-center">Ubicación</TableHead>
              <TableHead className="text-xs text-center">Estado</TableHead>
              <TableHead className="w-10 text-center" />
              <TableHead className="text-xs text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length > 0 ? (
              articles.map((article) => (
                <ArticleRow key={article.id} article={article} />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground text-sm"
                >
                  No se encontraron artículos
                  {statusFilter !== "ALL" && ` con estado ${statusFilter}`}
                  {search && ` que coincidan con "${search}"`}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
