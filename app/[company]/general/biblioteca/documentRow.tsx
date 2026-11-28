"use client";

import { memo } from "react";
import { Clock, Folder } from "lucide-react";
import { useEffect } from "react";
import type { MenuAction } from "@/components/library/menu-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { TagBadge } from "@/components/misc/TagBadge";
import ReplicaTag from "@/components/library/ReplicaTag";
import RestrictedTag from "@/components/library/RestrictedTag";
import DocumentActionsMenu from "@/components/library/DocumentActionsMenu";
import FavoriteButton from "@/components/library/FavoriteButton";
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

interface DocumentRowProps {
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
  onToggleSelect?: (id: number) => void;
  /** Ids que viajan al arrastrar esta fila (la selección, si ella está dentro). */
  getDragIds?: (id: number) => number[];
  folderPath?: string;
  /** En una búsqueda: muestra en qué carpeta vive cada resultado. */
  showFolderPath?: boolean;
}

function DocumentRow({
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
  onToggleSelect,
  getDragIds,
  folderPath,
  showFolderPath = false,
}: DocumentRowProps) {
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

  const Icon = info.kind.icon;

  return (
    <div
      {...drag}
      data-doc-id={doc.id}
      aria-current={active || undefined}
      onClick={(event) => {
        if (isOwnEvent(event)) onActivate?.(doc.id);
      }}
      onContextMenu={contextMenu.onContextMenu}
      // Doble clic abre el documento, como en un explorador de archivos.
      onDoubleClick={(event) => {
        if (!isOwnEvent(event)) return;
        if (
          (event.target as HTMLElement).closest(
            "button, input, [role='checkbox'], [role='menuitem']",
          )
        )
          return;
        onView(doc.id);
      }}
      data-tour="biblioteca-doc-row"
      className={cn(
        active && "ring-2 ring-inset ring-primary/40",
        "group relative flex items-center gap-3 px-4 py-3 motion-safe:transition-colors max-sm:px-3",
        selected
          ? "bg-primary/5 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary"
          : "hover:bg-muted/40",
      )}
    >
      {onToggleSelect && (
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggleSelect(doc.id)}
          aria-label={`Seleccionar ${doc.title || "documento"}`}
          className="shrink-0"
        />
      )}

      <div
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-lg",
          info.kind.iconClass,
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </div>

      <div
        className="flex min-w-0 flex-1 flex-col gap-1"
        data-tour="biblioteca-doc-title"
      >
        <button
          type="button"
          onClick={() => onView(doc.id)}
          className="w-fit max-w-full truncate rounded-sm text-left text-sm font-semibold text-slate-700 outline-hidden hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30 dark:text-slate-200"
        >
          {doc.title || "Sin título"}
        </button>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
          <span>{info.kind.label}</span>
          {info.versionLabel && (
            <>
              <span aria-hidden>·</span>
              <span className="tabular-nums">{info.versionLabel}</span>
            </>
          )}
          {info.expirationDate && (
            <span className="tabular-nums @2xl:hidden">
              <span aria-hidden>· </span>
              Vence {info.expirationText}
            </span>
          )}
          {showFolderPath && (
            <>
              <span aria-hidden>·</span>
              <span className="flex min-w-0 items-center gap-1">
                <Folder className="size-3 shrink-0" />
                <span className="truncate">
                  {showDepartment && departmentNameOf(doc)
                    ? `${departmentNameOf(doc)} · ${info.locationText}`
                    : info.locationText}
                </span>
              </span>
            </>
          )}
          {info.hasReplicas && (
            <ReplicaTag isPrimaryHere={info.isPrimaryHere} className="h-5" />
          )}
          {doc.restricted && (
            <RestrictedTag memberCount={doc.member_count} className="h-5" />
          )}
          <TagBadge
            tone={info.status.tone}
            className="h-5 @xl:hidden"
            data-tour="biblioteca-doc-status-mobile"
          >
            {info.status.label}
          </TagBadge>
        </div>
      </div>

      <div className="hidden w-36 shrink-0 items-center gap-2 text-sm text-slate-600 @2xl:flex dark:text-slate-300">
        <Clock className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate tabular-nums">{info.expirationText}</span>
      </div>

      <div
        className="hidden w-36 shrink-0 justify-center @xl:flex"
        data-tour="biblioteca-doc-status"
      >
        <TagBadge tone={info.status.tone}>{info.status.label}</TagBadge>
      </div>

      {onToggleFavorite && (
        <FavoriteButton
          favorite={!!doc.is_favorite}
          onToggle={() => onToggleFavorite(doc.id, !doc.is_favorite)}
        />
      )}

      <div className="shrink-0" data-tour="biblioteca-doc-actions">
        <DocumentActionsMenu actions={actions} loading={loadingVersions} />
      </div>

      <ActionsContextMenu
        point={contextMenu.point}
        onClose={contextMenu.close}
        actions={actions}
      />
      {dialogs}
    </div>
  );
}

// Con 200 documentos en pantalla, escribir en el buscador no debe repintar las
// 200 filas: solo se repinta la que cambia (su `doc`, su selección o su carpeta).
export default memo(DocumentRow);
