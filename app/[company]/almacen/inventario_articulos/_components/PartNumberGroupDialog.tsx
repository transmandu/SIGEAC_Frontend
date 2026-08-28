"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FileText, History, Loader2, Pencil, Search, Trash2, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

import { useDeleteArticle } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { useAuth } from "@/contexts/AuthContext";
import { formatCondition } from "@/lib/warehouse/conditions";
import { canModifyArticle, statusOptionLabel } from "@/lib/warehouse/statuses";
import ArticleStatusSincePopover, {
  tracksStatusSince,
} from "@/components/misc/ArticleStatusSincePopover";
import ArticleStatusHistoryDialog from "@/components/misc/ArticleStatusHistoryDialog";
import ArticleDocumentsDialog from "@/components/misc/ArticleDocumentsDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { getStatusBadge, type IArticleSimple } from "../_tables/warehouse-columns";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partNumber: string;
  rows: IArticleSimple[];
};

/**
 * El resto de categorías va por batch: cada fila es una pieza única y su
 * cantidad siempre es 1. Solo el consumible maneja cantidad y unidad reales.
 */
function isConsumable(r: IArticleSimple) {
  return !!r.consumable;
}

function formatQuantity(r: IArticleSimple) {
  const quantity = r.stock != null ? Number(r.stock) : Number(r.quantity ?? 0);
  const unit = r.consumable?.unit?.value ?? r.unit?.value ?? "u";

  return { quantity, unit };
}

function toSearchable(r: IArticleSimple) {
  const serialOrLot = r.serial || r.lot_number || "";
  const desc = r.batch_name || r.description || "";
  const status = (r.status || "").toUpperCase();
  const zone = r.zone || "";

  const shelf =
    r.component?.expiration_date ||
    (typeof r.consumable?.expiration_date === "string"
      ? r.consumable.expiration_date
      : r.consumable?.expiration_date instanceof Date
        ? r.consumable.expiration_date.toISOString()
        : "");

  // La cantidad entra al blob solo cuando se muestra, para que buscar "5" no
  // conserve filas por un 1 implícito que la tabla nunca pintó.
  const { quantity, unit } = formatQuantity(r);
  const shownQuantity = isConsumable(r) ? `${quantity} ${unit}` : "";

  return {
    blob:
      `${serialOrLot} ${desc} ${status} ${zone} ${shelf} ${shownQuantity}`.toLowerCase(),
  };
}

function formatShelf(r: IArticleSimple) {
  const shelf =
    r.component?.expiration_date ||
    (typeof r.consumable?.expiration_date === "string"
      ? r.consumable.expiration_date
      : r.consumable?.expiration_date instanceof Date
        ? r.consumable.expiration_date.toISOString()
        : null);

  return shelf ? String(shelf).slice(0, 10) : null;
}

export function PartNumberGroupDialog({
  open,
  onOpenChange,
  partNumber,
  rows,
}: Props) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const [historyArticleId, setHistoryArticleId] = useState<
    string | number | null
  >(null);
  const [documentsArticle, setDocumentsArticle] =
    useState<IArticleSimple | null>(null);

  const filtered = React.useMemo(() => {
    if (!q) return rows;
    return rows.filter((r) => toSearchable(r).blob.includes(q));
  }, [rows, q]);

  const count = rows?.length ?? 0;
  const shown = filtered?.length ?? 0;

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setHistoryArticleId(null);
      setDocumentsArticle(null);
    }
  }, [open]);

  const router = useRouter();
  const params = useParams();
  const company = String((params as any)?.company ?? "");

  const { deleteArticle } = useDeleteArticle();
  const [articleIdToDelete, setArticleIdToDelete] = useState<
    string | number | null
  >(null);
  const [openDeleteArt, setOpenDeleteArt] = useState<boolean>(false);

  const { user } = useAuth();
  const roles = user?.roles?.map((r) => r.name) ?? [];
  const isSuperUser = roles.includes("SUPERUSER");

  const handleDelete = () => {
    if (articleIdToDelete === null) return;
    deleteArticle.mutate(
      { id: articleIdToDelete, company },
      {
        onSuccess: () => setOpenDeleteArt(false), // Cierra el modal solo si la eliminación fue exitosa
      },
    );
  };

  const goEdit = React.useCallback(
    (articleId: string | number) => {
      if (!company) return;
      router.push(
        `/${company}/almacen/inventario_articulos/editar/${articleId}`,
      );
    },
    [router, company],
  );

  // El grupo puede mezclar categorías (la pestaña "Todos" agrupa solo por PN),
  // así que basta un consumible para que la columna valga la pena.
  const showQuantity = React.useMemo(() => rows.some(isConsumable), [rows]);

  /**
   * Serial | Descripción | Condición | Estado | [Cantidad] | Ubicación |
   * Vencimiento | Acciones
   *
   * Bajé el ancho de descripción para que no absorba todo.
   */
  const gridCols = showQuantity
    ? "[grid-template-columns:150px_260px_120px_140px_120px_160px_160px_64px]"
    : "[grid-template-columns:150px_260px_120px_140px_160px_160px_64px]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden w-[min(1200px,96vw)] sm:max-w-none flex flex-col max-h-[85vh]">
        <DialogHeader className="px-6 py-5 border-b">
          <div className="w-full space-y-3">
            <DialogTitle className="leading-tight text-3xl flex justify-center w-full">
              Artículos del PN #
              <span className="font-bold text-blue-800">{partNumber}</span>
            </DialogTitle>

            <DialogDescription className="flex items-center justify-between gap-3">
              <span>
                {count
                  ? `${count} unidad(es) encontradas`
                  : "No hay artículos para mostrar."}
                {count > 0 && q && (
                  <span className="text-muted-foreground">
                    {" "}
                    • Mostrando{" "}
                    <span className="font-medium text-foreground">{shown}</span>
                  </span>
                )}
              </span>
            </DialogDescription>

            {count > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por serial, lote, descripción, ubicación, estado o fecha..."
                  className="pl-9 pr-9 h-10"
                />
                {!!query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2",
                      "h-7 w-7 inline-flex items-center justify-center rounded-md",
                      "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="px-6 py-4 flex-1 min-h-0">
          {!count ? (
            <p className="text-sm text-muted-foreground">Sin datos.</p>
          ) : (
            <>
              <Separator className="mb-4" />

              {!shown ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium">Sin resultados</p>
                  <p className="text-sm text-muted-foreground">
                    Prueba con otro término de búsqueda.
                  </p>
                </div>
              ) : (
                /**
                 * ✅ Scroll nativo (X e Y) en un solo contenedor.
                 * Esto hace que SIEMPRE aparezca el scroll horizontal cuando haga falta.
                 */
                <div className="h-full max-h-[55vh] overflow-x-auto overflow-y-auto pr-2">
                  {/* Fuerza overflow horizontal real */}
                  <div
                    className={cn(
                      "rounded-md border overflow-hidden",
                      showQuantity ? "min-w-[1100px]" : "min-w-[980px]",
                    )}
                  >
                    {/* Header tabla */}
                    <div
                      className={cn(
                        "grid",
                        gridCols,
                        "bg-muted/40 text-xs font-semibold text-muted-foreground",
                      )}
                    >
                      <div className="px-3 py-2">Serial / Lote</div>
                      <div className="px-3 py-2">Descripción</div>
                      <div className="px-3 py-2 text-center">Condición</div>
                      <div className="px-3 py-2 text-center">Estado</div>
                      {showQuantity && (
                        <div className="px-3 py-2 text-center">Cantidad</div>
                      )}
                      <div className="px-3 py-2 text-center">Ubicación</div>
                      <div className="px-3 py-2 text-center">Vencimiento</div>
                      <div className="px-3 py-2 text-center">Acciones.</div>
                    </div>

                    <div className="divide-y">
                      {filtered.map((r) => {
                        const serialOrLot = r.serial || r.lot_number || "N/A";
                        const desc =
                          r.batch_name || r.description || "Sin descripción";
                        const shelf = formatShelf(r);

                        return (
                          <div
                            key={r.id}
                            className={cn(
                              "grid",
                              gridCols,
                              "items-center hover:bg-muted/30",
                            )}
                          >
                            <div className="px-3 py-2 text-sm font-medium truncate">
                              {serialOrLot}
                            </div>

                            <div className="px-3 py-2 text-sm text-muted-foreground truncate">
                              {desc}
                            </div>

                            <div className="px-3 py-2 text-center text-sm">
                              {(() => {
                                const c = formatCondition(r.condition as any);
                                if (!c)
                                  return (
                                    <span className="text-muted-foreground text-sm">
                                      N/A
                                    </span>
                                  );

                                return (
                                  <div className="inline-flex flex-col items-center">
                                    <span className="text-base font-medium">
                                      {c.es}
                                    </span>
                                    <span className="text-xs text-muted-foreground italic">
                                      ({c.en})
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>

                            <div className="px-3 py-2 flex justify-center">
                              {tracksStatusSince(r.status) ? (
                                <ArticleStatusSincePopover
                                  statusLabel={statusOptionLabel(r.status ?? "")}
                                  statusSince={r.status_since}
                                >
                                  {getStatusBadge(r.status?.toUpperCase())}
                                </ArticleStatusSincePopover>
                              ) : (
                                getStatusBadge(r.status?.toUpperCase())
                              )}
                            </div>

                            {showQuantity && (
                              <div className="px-3 py-2 flex justify-center">
                                {isConsumable(r) ? (
                                  (() => {
                                    const { quantity, unit } = formatQuantity(r);

                                    return (
                                      <Badge
                                        variant={
                                          quantity > 5
                                            ? "default"
                                            : quantity > 0
                                              ? "secondary"
                                              : "destructive"
                                        }
                                        className="text-xs font-bold px-3 py-1"
                                      >
                                        {quantity} {unit}
                                      </Badge>
                                    );
                                  })()
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    N/A
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="px-3 py-2 text-center text-sm font-medium">
                              {r.zone || (
                                <span className="text-muted-foreground">
                                  N/A
                                </span>
                              )}
                            </div>

                            <div className="px-3 py-2 flex justify-center">
                              {shelf ? (
                                <Badge variant="secondary" className="text-xs">
                                  {shelf}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  N/A
                                </span>
                              )}
                            </div>

                            {/* Acciones (solo icono) */}
                            <div className="px-3 py-2 flex justify-center">
                              {(r.has_documentation ||
                                (r.certificates?.length ?? 0) > 0) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 p-2"
                                      onClick={() => setDocumentsArticle(r)}
                                      aria-label="Ver documentación"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Ver documentación
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 p-2"
                                    onClick={() => setHistoryArticleId(r.id)}
                                    aria-label="Historial de estados"
                                  >
                                    <History className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Historial de estados
                                </TooltipContent>
                              </Tooltip>

                              {canModifyArticle(r.status, isSuperUser) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 p-2"
                                      onClick={() => goEdit(r.id)}
                                      aria-label="Editar artículo"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Editar artículo
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {canModifyArticle(r.status, isSuperUser) &&
                                (isSuperUser ||
                                  roles.includes("JEFE_ALMACEN")) && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        disabled={deleteArticle.isPending}
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 p-2"
                                        onClick={() => {
                                          setArticleIdToDelete(r.id);
                                          setOpenDeleteArt(true);
                                        }}
                                        aria-label="Eliminar artículo"
                                      >
                                        <Trash2 className="h-5 w-5 text-red-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Eliminar artículo
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {historyArticleId !== null && (
          <ArticleStatusHistoryDialog
            articleId={historyArticleId}
            open
            onOpenChange={(next) => !next && setHistoryArticleId(null)}
          />
        )}

        {documentsArticle && (
          <ArticleDocumentsDialog
            articleId={documentsArticle.id}
            partNumber={documentsArticle.part_number}
            open
            onOpenChange={(next) => !next && setDocumentsArticle(null)}
          />
        )}

        {/* Delete dialog */}
        <Dialog open={openDeleteArt} onOpenChange={setOpenDeleteArt}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                ¿Seguro que desea eliminar el artículo?
              </DialogTitle>
              <DialogDescription className="text-center p-2 mb-0 pb-0">
                Esta acción es irreversible y eliminará por completo el artículo.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
              <Button
                className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
                onClick={() => setOpenDeleteArt(false)}
                type="submit"
              >
                Cancelar
              </Button>
              <Button
                disabled={deleteArticle.isPending}
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={() => handleDelete()}
              >
                {deleteArticle.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <p>Confirmar</p>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
