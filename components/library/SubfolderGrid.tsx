"use client";

import { memo, useState } from "react";
import { ArrowUpLeft, Folder, Lock } from "lucide-react";
import type { FolderNode } from "@/lib/libraryService";
import {
  hasDraggedDocuments,
  readDraggedDocumentIds,
} from "@/lib/Library/drag";
import {
  ActionsContextMenu,
  useContextMenu,
} from "@/components/library/ActionsContextMenu";
import type { MenuAction } from "@/components/library/menu-actions";
import { cn } from "@/lib/utils";

interface SubfolderGridProps {
  folders: FolderNode[];
  /** Hay una carpeta abierta: se ofrece subir un nivel. */
  onOpenParent?: () => void;
  onOpen: (path: string) => void;
  /** Documentos que hay en cada carpeta, por ruta. */
  counts?: Record<string, number>;
  /**
   * Si se da, las carpetas aceptan documentos arrastrados encima (mover). Recibe
   * los ids de los documentos y la ruta de la carpeta que los recibe.
   */
  onDropDocument?: (documentIds: number[], folderPath: string) => void;
  /** Ruta de la carpeta superior, destino de lo que se suelta en «Subir un nivel». */
  parentPath?: string | null;
  /** Acciones del menú de clic derecho de cada carpeta; sin ellas no hay menú. */
  getActions?: (folder: FolderNode) => MenuAction[];
}

interface FolderCardProps {
  folder: FolderNode;
  count: number;
  isDrop: boolean;
  dropProps: React.HTMLAttributes<HTMLElement>;
  onOpen: (path: string) => void;
  actions: MenuAction[];
}

function FolderCard({
  folder,
  count,
  isDrop,
  dropProps,
  onOpen,
  actions,
}: FolderCardProps) {
  const contextMenu = useContextMenu();
  const subfolders = folder.children.length;

  return (
    <>
      <button
        type="button"
        onClick={() => onOpen(folder.path)}
        onContextMenu={
          actions.length > 0 ? contextMenu.onContextMenu : undefined
        }
        {...dropProps}
        className={cn(
          CARD,
          isDrop
            ? "border-primary bg-primary/5 ring-2 ring-primary/30"
            : "border-slate-200 bg-white hover:border-primary/40 dark:border-slate-700/60 dark:bg-slate-900/60",
        )}
      >
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg",
            folder.navigation_only
              ? "bg-slate-500/10 text-slate-400"
              : "bg-primary/10 text-primary",
          )}
        >
          <Folder className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-sm font-semibold",
              folder.navigation_only
                ? "text-slate-400"
                : "text-slate-700 dark:text-slate-200",
            )}
          >
            {folder.name}
          </span>
          <span className="block truncate text-xs text-slate-600 dark:text-slate-400">
            {[
              count > 0 ? `${count} documento${count === 1 ? "" : "s"}` : null,
              subfolders > 0
                ? `${subfolders} subcarpeta${subfolders === 1 ? "" : "s"}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ") || "Vacía"}
          </span>
        </span>
        {folder.restricted && (
          <Lock
            className="size-4 shrink-0 text-amber-500"
            aria-label="Acceso restringido"
          />
        )}
      </button>

      <ActionsContextMenu
        point={contextMenu.point}
        onClose={contextMenu.close}
        actions={actions}
      />
    </>
  );
}

const CARD =
  "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left outline-hidden motion-safe:transition-colors focus-visible:ring-2 focus-visible:ring-primary/30";

/** Carpetas contenidas en la que se está viendo, al estilo de un explorador de archivos. */
function SubfolderGrid({
  folders,
  onOpenParent,
  onOpen,
  counts = {},
  onDropDocument,
  parentPath,
  getActions,
}: SubfolderGridProps) {
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  if (folders.length === 0 && !onOpenParent) return null;

  // Solo reacciona a documentos de la biblioteca; los archivos del escritorio
  // se atienden en el panel entero, para subirlos.
  const dropProps = (path: string, droppable: boolean) =>
    droppable && onDropDocument
      ? {
          onDragOver: (e: React.DragEvent) => {
            if (!hasDraggedDocuments(e.dataTransfer)) return;
            e.preventDefault();
            e.stopPropagation();
            setDropTarget(path);
          },
          onDragLeave: (e: React.DragEvent) => {
            // Pasar a un hijo de la tarjeta (icono, texto) no es salir de ella.
            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
            setDropTarget((current) => (current === path ? null : current));
          },
          onDrop: (e: React.DragEvent) => {
            const ids = readDraggedDocumentIds(e.dataTransfer);
            setDropTarget(null);
            if (ids.length === 0) return;
            e.preventDefault();
            e.stopPropagation();
            onDropDocument(ids, path);
          },
        }
      : {};

  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3 max-sm:grid-cols-1"
      data-tour="biblioteca-subcarpetas"
    >
      {onOpenParent && (
        <button
          type="button"
          onClick={onOpenParent}
          {...dropProps(parentPath ?? "/", parentPath != null)}
          className={cn(
            CARD,
            "border-dashed",
            dropTarget === (parentPath ?? "/")
              ? "border-primary bg-primary/5 text-primary"
              : "border-slate-300 text-slate-600 hover:bg-muted/40 dark:border-slate-700 dark:text-slate-300",
          )}
        >
          <ArrowUpLeft className="size-5 shrink-0" />
          <span className="text-sm font-semibold">Subir un nivel</span>
        </button>
      )}

      {folders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          count={counts[folder.path] ?? 0}
          isDrop={dropTarget === folder.path}
          dropProps={dropProps(folder.path, !folder.navigation_only)}
          onOpen={onOpen}
          actions={getActions?.(folder) ?? []}
        />
      ))}
    </div>
  );
}

export default memo(SubfolderGrid);
