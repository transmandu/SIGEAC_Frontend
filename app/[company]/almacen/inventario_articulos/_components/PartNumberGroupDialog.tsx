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
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  FileText,
  History,
  Loader2,
  MoreVertical,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
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
import {
  getStatusBadge,
  type IArticleSimple,
} from "@/app/[company]/almacen/inventario_articulos/_tables/warehouse-columns";
import { toCalendarPayload } from "@/lib/date";

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
  const desc = r.batch_name || "";
  const status = (r.status || "").toUpperCase();
  const zone = r.zone || "";

  const shelf =
    r.component?.expiration_date ||
    (typeof r.consumable?.expiration_date === "string"
      ? r.consumable.expiration_date
      : r.consumable?.expiration_date instanceof Date
        ? (toCalendarPayload(r.consumable.expiration_date) ?? "")
        : "");

  // La cantidad entra al blob solo cuando se muestra, para que buscar "5" no
  // conserve filas por un 1 implícito que la tabla nunca pintó.
  const { quantity, unit } = formatQuantity(r);
  const shownQuantity = isConsumable(r) ? `${quantity} ${unit}` : "";

  return {
    blob: `${serialOrLot} ${desc} ${status} ${zone} ${shelf} ${shownQuantity}`.toLowerCase(),
  };
}

function formatShelf(r: IArticleSimple) {
  const shelf =
    r.component?.expiration_date ||
    (typeof r.consumable?.expiration_date === "string"
      ? r.consumable.expiration_date
      : r.consumable?.expiration_date instanceof Date
        ? toCalendarPayload(r.consumable.expiration_date)
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

  // Al cerrarse, el diálogo olvida búsqueda y subdiálogos. Se hace durante el
  // render al detectar el cambio de `open`, no en un efecto: así no hay un
  // render intermedio con el estado viejo.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      setQuery("");
      setHistoryArticleId(null);
      setDocumentsArticle(null);
    }
  }

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
        `/${company}/almacen/inventario_articulos/gestion_inventario/editar/${articleId}`,
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
    ? "grid-cols-[minmax(130px,1fr)_minmax(200px,2fr)_minmax(170px,1fr)_minmax(150px,1fr)_minmax(110px,1fr)_minmax(130px,1fr)_minmax(120px,1fr)_56px] sm:grid-cols-[minmax(130px,1fr)_minmax(200px,2fr)_minmax(170px,1fr)_minmax(150px,1fr)_minmax(110px,1fr)_minmax(130px,1fr)_minmax(120px,1fr)_140px]"
    : "grid-cols-[minmax(130px,1fr)_minmax(200px,2fr)_minmax(170px,1fr)_minmax(150px,1fr)_minmax(130px,1fr)_minmax(120px,1fr)_56px] sm:grid-cols-[minmax(130px,1fr)_minmax(200px,2fr)_minmax(170px,1fr)_minmax(150px,1fr)_minmax(130px,1fr)_minmax(120px,1fr)_140px]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden w-[min(1200px,96vw)] sm:max-w-none flex flex-col max-h-[85vh] bg-background">
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
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
                      "size-7 inline-flex items-center justify-center rounded-md",
                      "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="px-0 sm:px-6 py-4 flex-1 min-h-0 overflow-y-auto">
          {!count ? (
            <p className="px-6 sm:px-0 text-sm text-muted-foreground">
              Sin datos.
            </p>
          ) : (
            <>
              <div className="px-6 sm:px-0 mb-4">
                <Separator />
              </div>

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
                <div className="overflow-x-auto overscroll-x-contain">
                  {/* Fuerza overflow horizontal real */}
                  <div
                    className={cn(
                      "rounded-md border",
                      showQuantity
                        ? "min-w-267 sm:min-w-6xl"
                        : "min-w-239.5 sm:min-w-260.5",
                    )}
                  >
                    {/* Header tabla */}
                    <div
                      className={cn(
                        "grid",
                        gridCols,
                        "rounded-t-md bg-muted/40 text-xs font-semibold text-muted-foreground",
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
                      <div className="sticky right-0 z-10 border-l bg-background px-3 py-2 text-center before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-muted/40">
                        <span className="relative max-sm:sr-only">
                          Acciones
                        </span>
                      </div>
                    </div>

                    <div className="divide-y">
                      {filtered.map((r) => {
                        const serialOrLot = r.serial || r.lot_number || "N/A";
                        const desc = r.batch_name || "Sin descripción";
                        const shelf = formatShelf(r);
                        const canModify = canModifyArticle(
                          r.status,
                          isSuperUser,
                        );
                        const canDelete =
                          canModify &&
                          (isSuperUser ||
                            roles.includes("JEFE_ALMACEN") ||
                            roles.includes("JEFE_MANTENIMIENTO"));

                        return (
                          <div
                            key={r.id}
                            className={cn(
                              "grid",
                              gridCols,
                              "group items-center hover:bg-muted/30 [&>div]:min-w-0",
                            )}
                          >
                            <div className="px-3 py-2 text-sm font-medium break-all">
                              {serialOrLot}
                            </div>

                            <div className="px-3 py-2 text-sm text-muted-foreground wrap-break-words">
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
                                  <div className="inline-flex max-w-full flex-col items-center wrap-break-words">
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
                                  statusLabel={statusOptionLabel(
                                    r.status ?? "",
                                  )}
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
                                    const { quantity, unit } =
                                      formatQuantity(r);

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
                            <div className="sticky right-0 z-10 flex flex-wrap self-stretch items-center justify-center border-l bg-background px-2 py-2 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-muted/30 before:opacity-0 group-hover:before:opacity-100">
                              <div className="hidden sm:flex flex-wrap items-center justify-center">
                                {r.has_documentation && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 p-2"
                                        onClick={() => setDocumentsArticle(r)}
                                        aria-label="Ver documentación"
                                      >
                                        <FileText className="size-4" />
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
                                      className="size-8 p-2"
                                      onClick={() => setHistoryArticleId(r.id)}
                                      aria-label="Historial de estados"
                                    >
                                      <History className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Historial de estados
                                  </TooltipContent>
                                </Tooltip>

                                {canModify && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 p-2"
                                        onClick={() => goEdit(r.id)}
                                        aria-label="Editar artículo"
                                      >
                                        <Pencil className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Editar artículo
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                {canModifyArticle(r.status, isSuperUser) &&
                                  (isSuperUser ||
                                    roles.includes("JEFE_ALMACEN") ||
                                    roles.includes("JEFE_MANTENIMIENTO")) && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          disabled={deleteArticle.isPending}
                                          variant="ghost"
                                          size="icon"
                                          className="size-8 p-2"
                                          onClick={() => {
                                            setArticleIdToDelete(r.id);
                                            setOpenDeleteArt(true);
                                          }}
                                          aria-label="Eliminar artículo"
                                        >
                                          <Trash2 className="size-5 text-red-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Eliminar artículo
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 sm:hidden"
                                    aria-label="Acciones"
                                  >
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {r.has_documentation && (
                                    <DropdownMenuItem
                                      onSelect={() => setDocumentsArticle(r)}
                                    >
                                      <FileText className="mr-2 size-4" />
                                      Ver documentación
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onSelect={() => setHistoryArticleId(r.id)}
                                  >
                                    <History className="mr-2 size-4" />
                                    Historial de estados
                                  </DropdownMenuItem>
                                  {canModify && (
                                    <DropdownMenuItem
                                      onSelect={() => goEdit(r.id)}
                                    >
                                      <Pencil className="mr-2 size-4" />
                                      Editar artículo
                                    </DropdownMenuItem>
                                  )}
                                  {canDelete && (
                                    <DropdownMenuItem
                                      disabled={deleteArticle.isPending}
                                      className="text-red-500 focus:text-red-500"
                                      onSelect={() => {
                                        setArticleIdToDelete(r.id);
                                        setOpenDeleteArt(true);
                                      }}
                                    >
                                      <Trash2 className="mr-2 size-4" />
                                      Eliminar artículo
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                Esta acción es irreversible y eliminará por completo el
                artículo.
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
        <DialogFooter className="px-6 py-4 border-t shrink-0 bg-background">
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
