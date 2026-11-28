"use client";

import { memo } from "react";
import { Folder } from "lucide-react";
import { useEffect } from "react";
import type { MenuAction } from "@/components/library/menu-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { TagBadge } from "@/components/misc/TagBadge";
import DocumentThumbnail from "@/components/library/DocumentThumbnail";
import DocumentActionsMenu from "@/components/library/DocumentActionsMenu";
import FavoriteButton from "@/components/library/FavoriteButton";
import ReplicaTag from "@/components/library/ReplicaTag";
import RestrictedTag from "@/components/library/RestrictedTag";
import {
  ActionsContextMenu,
  useContextMenu,
} from "@/components/library/ActionsContextMenu";
import { useDocumentActions } from "@/components/library/useDocumentActions";
import { useDocumentDrag } from "@/components/library/useDocumentDrag";
import {
  departmentNameOf,
  describeDocument,
  withVersionData,
  type LibraryDocument,
} from "@/lib/Library/document-info";
import { isOwnEvent } from "@/lib/Library/shortcuts";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  company: string;
  doc: LibraryDocument;
  onView: (id: number) => void;
  onRefresh: () => Promise<void>;
  /** Mueve este documento, o la selección donde esté incluido, a otra carpeta. */
  onMove?: (id: number) => void;
  onCopy?: (id: number) => void;
  /** El cursor del teclado está en este documento. */
  active?: boolean;
  /** Un clic sobre el documento lleva allí el cursor del teclado. */
  onActivate?: (id: number) => void;
  /** Entrega las acciones del menú para que el teclado las use. */
  registerActions?: (id: number, actions: MenuAction[] | null) => void;
  /** Marca o desmarca el favorito; sin él no hay estrella ni acción. */
  onToggleFavorite?: (id: number, favorite: boolean) => void;
  /** Con varios departamentos a la vista (favoritos, recientes) se indica el de cada uno. */
  showDepartment?: boolean;
  canManage: boolean;
  isDipDirector: boolean;
  user: any;
  selected?: boolean;
  /** Hay algo seleccionado: las casillas dejan de esconderse. */
  selectionActive?: boolean;
  onToggleSelect?: (id: number) => void;
  getDragIds?: (id: number) => number[];
  folderPath?: string;
  showFolderPath?: boolean;
}

// Controles que flotan sobre la miniatura: aparecen al apuntar la tarjeta o al
// enfocarla con el teclado, y siempre en pantallas táctiles, donde no hay hover.
const REVEAL =
  "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100";

/** Un documento en la vista de cuadrícula: su primera página y lo esencial. */
function DocumentCard({
  company,
  doc,
  onView,
  onRefresh,
  onMove,
  onCopy,
  active = false,
  onActivate,
  registerActions,
  onToggleFavorite,
  showDepartment = false,
  canManage,
  isDipDirector,
  user,
  selected = false,
  selectionActive = false,
  onToggleSelect,
  getDragIds,
  folderPath,
  showFolderPath = false,
}: DocumentCardProps) {
  const info = describeDocument(doc, folderPath);
  const { actions, dialogs, loadingVersions } = useDocumentActions({
    company,
    doc: withVersionData(doc, info),
    user,
    canManage,
    isDipDirector,
    onView,
    onRefresh,
    folderPath,
    onMove,
    onCopy,
    onToggleFavorite,
  });
  const contextMenu = useContextMenu();

  useEffect(() => {
    registerActions?.(doc.id, actions);
    return () => registerActions?.(doc.id, null);
  });
  const drag = useDocumentDrag(
    doc.id,
    departmentNameOf(doc),
    getDragIds,
    canManage,
  );

  return (
    <article
      {...drag}
      data-doc-id={doc.id}
      aria-current={active || undefined}
      onClick={(event) => {
        if (isOwnEvent(event)) onActivate?.(doc.id);
      }}
      onContextMenu={contextMenu.onContextMenu}
      data-tour="biblioteca-doc-row"
      className={cn(
        active && "ring-2 ring-primary/50",
        "group relative flex flex-col overflow-hidden rounded-xl border bg-white motion-safe:transition-colors dark:bg-slate-900/60",
        selected
          ? "border-primary/60 ring-1 ring-primary/40"
          : "border-slate-200 hover:border-primary/40 dark:border-slate-700/60",
      )}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => onView(doc.id)}
          aria-label={`Abrir ${doc.title || "documento"}`}
          className="block w-full outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
        >
          <DocumentThumbnail
            company={company}
            doc={doc}
            info={info}
            className="h-44 w-full border-b border-slate-200 dark:border-slate-700/60"
          />
        </button>

        {onToggleSelect && (
          <div
            className={cn(
              "absolute left-2 top-2 grid size-7 place-items-center rounded-lg bg-background/90 shadow-xs",
              selected || selectionActive ? "opacity-100" : REVEAL,
            )}
          >
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggleSelect(doc.id)}
              aria-label={`Seleccionar ${doc.title || "documento"}`}
            />
          </div>
        )}

        {onToggleFavorite && (
          <div className="absolute bottom-2 right-2">
            <FavoriteButton
              favorite={!!doc.is_favorite}
              onToggle={() => onToggleFavorite(doc.id, !doc.is_favorite)}
              className="size-7 rounded-lg bg-background/90 shadow-xs hover:bg-background max-md:size-9"
            />
          </div>
        )}

        <div
          className="absolute right-2 top-2"
          data-tour="biblioteca-doc-actions"
        >
          <DocumentActionsMenu
            actions={actions}
            loading={loadingVersions}
            className={cn(
              "size-7 rounded-lg bg-background/90 shadow-xs hover:bg-background max-md:size-9",
              REVEAL,
            )}
          />
        </div>
      </div>

      <div
        className="flex flex-1 flex-col gap-2 p-3"
        data-tour="biblioteca-doc-title"
      >
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-700 wrap-anywhere dark:text-slate-200">
          {doc.title || "Sin título"}
        </h3>

        {showFolderPath && (
          <p className="flex min-w-0 items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            <Folder className="size-3 shrink-0" />
            <span className="truncate">
              {showDepartment && departmentNameOf(doc)
                ? `${departmentNameOf(doc)} · ${info.locationText}`
                : info.locationText}
            </span>
          </p>
        )}

        <div
          className="mt-auto flex flex-wrap items-center gap-1.5"
          data-tour="biblioteca-doc-status"
        >
          <TagBadge tone={info.status.tone}>{info.status.label}</TagBadge>
          {info.versionLabel && (
            <span className="text-xs tabular-nums text-slate-600 dark:text-slate-400">
              {info.versionLabel}
            </span>
          )}
          {info.hasReplicas && (
            <ReplicaTag isPrimaryHere={info.isPrimaryHere} />
          )}
          {doc.restricted && <RestrictedTag memberCount={doc.member_count} />}
        </div>
      </div>

      <ActionsContextMenu
        point={contextMenu.point}
        onClose={contextMenu.close}
        actions={actions}
      />
      {dialogs}
    </article>
  );
}

export default memo(DocumentCard);
