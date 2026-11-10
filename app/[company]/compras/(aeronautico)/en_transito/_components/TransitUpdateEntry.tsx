"use client";

import { useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";

import {
  useDeleteTransitUpdate,
  useUpdateTransitUpdate,
} from "@/actions/mantenimiento/compras/transit-updates/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { formatInstant } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { TransitUpdate } from "@/types/purchase";
import { TransitNoteField } from "./TransitNoteField";

interface Props {
  update: TransitUpdate;
  articleId: number;
  timeZone: string;
  /** La más reciente: su nodo en la línea de tiempo se marca con el color del sistema. */
  isLatest?: boolean;
}

/** Iniciales de quien registró: dos letras, para reconocer al autor de un vistazo. */
const initialsOf = (name?: string | null) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "?";

/**
 * Una novedad en la línea de tiempo: el nodo (iniciales de quien la registró)
 * sobre la línea, y al lado quién, a qué hora y lo que dijo. La fecha la da el
 * día que la agrupa (ver `TransitTimeline`), así que aquí solo va la hora. Se
 * corrige en el sitio y se borra con confirmación.
 *
 * Devuelve el contenido de una fila de la lista: el contenedor pone la línea y
 * el margen donde cae el nodo.
 */
export function TransitUpdateEntry({
  update,
  articleId,
  timeZone,
  isLatest = false,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [note, setNote] = useState(update.note);

  const edit = useUpdateTransitUpdate();
  const remove = useDeleteTransitUpdate();

  const trimmed = note.trim();
  const canSave = trimmed !== "" && trimmed !== update.note;

  const startEditing = () => {
    setNote(update.note);
    setEditing(true);
  };

  const save = async () => {
    try {
      await edit.mutateAsync({
        articleId,
        updateId: update.id,
        data: { note: trimmed },
      });
      setEditing(false);
    } catch {
      // El aviso lo muestra la mutación; la corrección queda abierta.
    }
  };

  return (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-0 z-10 flex size-8 items-center justify-center rounded-full text-xs font-semibold ring-4 ring-white dark:ring-slate-900",
          isLatest
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {initialsOf(update.registered_by)}
      </span>

      <div className="min-w-0">
        <div className="flex min-h-8 items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="text-sm font-medium wrap-anywhere">
              {update.registered_by}
            </p>
            <p className="text-[13px] text-muted-foreground tabular-nums">
              {formatInstant(update.occurred_at, timeZone, "time")}
            </p>
            {update.edited_at && !editing && (
              <TagBadge tone="slate" className="h-5 px-2">
                Editada
              </TagBadge>
            )}
          </div>

          {update.can_modify && !editing && (
            <div className="-mr-1.5 flex shrink-0 items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Corregir novedad"
                onClick={startEditing}
                className="size-8 text-muted-foreground max-sm:size-10"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Eliminar novedad"
                onClick={() => setDeleting(true)}
                className="size-8 text-muted-foreground hover:text-destructive max-sm:size-10"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-2 space-y-3">
            <TransitNoteField
              id={`edit-note-${update.id}`}
              value={note}
              onChange={setNote}
              disabled={edit.isPending}
              suggestions={false}
            />
            <div className="flex justify-end gap-2 max-sm:[&>button]:flex-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={edit.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={save}
                disabled={!canSave || edit.isPending}
                className="min-w-35 gap-2"
              >
                {edit.isPending && <Loader2 className="size-4 animate-spin" />}
                Guardar cambios
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-1 rounded-xl rounded-tl-sm bg-muted/50 px-3.5 py-2.5">
            <p className="whitespace-pre-wrap text-sm wrap-anywhere">
              {update.note}
            </p>

            {update.edited_at && (
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                Corregida
                {update.edited_by ? ` por ${update.edited_by}` : ""} el{" "}
                {formatInstant(update.edited_at, timeZone, "dateTime")}
              </p>
            )}
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Eliminar novedad"
        warning="La novedad dejará de mostrarse, pero quedará constancia de quién la eliminó y qué decía en el registro de cambios."
        isPending={remove.isPending}
        onConfirm={() => remove.mutateAsync({ articleId, updateId: update.id })}
      />
    </>
  );
}
