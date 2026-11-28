import {
  FolderOpen,
  Link2,
  Pencil,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { FolderNode } from "@/lib/libraryService";

/**
 * Una acción de los menús de la biblioteca. Los menús «⋯», de clic derecho y
 * los que se añadan después (teclado, barra de selección) se pintan todos
 * desde una lista de estas: los permisos se deciden una sola vez, al armarla.
 */
export interface MenuAction {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Color del icono: azul lo habitual, esmeralda descargar, ámbar accesos, rojo lo destructivo. */
  tone: "blue" | "emerald" | "amber" | "red";
  onSelect: () => void;
  /** `data-tour` que algún recorrido guiado señala. */
  tour?: string;
  /** Una línea divisoria antes de la acción (lo destructivo va aparte). */
  separatorBefore?: boolean;
}

interface FolderActionsInput {
  node: FolderNode;
  /** Quien administra el departamento: renombrar, accesos, compartir y eliminar. */
  canManage: boolean;
  onOpen?: () => void;
  onRename: () => void;
  onAccess: () => void;
  onShare: () => void;
  onDelete: () => void;
}

/**
 * Acciones de una carpeta. Una carpeta ajena que solo se recorre para llegar
 * a una compartida (`navigation_only`) se puede abrir y nada más.
 */
export function folderActions({
  node,
  canManage,
  onOpen,
  onRename,
  onAccess,
  onShare,
  onDelete,
}: FolderActionsInput): MenuAction[] {
  const actions: MenuAction[] = [];

  if (onOpen) {
    actions.push({
      key: "open",
      label: "Abrir",
      icon: FolderOpen,
      tone: "blue",
      onSelect: onOpen,
    });
  }

  if (canManage && !node.navigation_only) {
    actions.push(
      {
        key: "rename",
        label: "Renombrar",
        icon: Pencil,
        tone: "blue",
        tour: "biblioteca-folder-rename",
        separatorBefore: !!onOpen,
        onSelect: onRename,
      },
      {
        key: "access",
        label: "Accesos",
        icon: Users,
        tone: "amber",
        onSelect: onAccess,
      },
      {
        key: "share",
        label: "Compartir enlace",
        icon: Link2,
        tone: "blue",
        onSelect: onShare,
      },
      {
        key: "delete",
        label: "Eliminar",
        icon: Trash2,
        tone: "red",
        tour: "biblioteca-folder-delete",
        separatorBefore: true,
        onSelect: onDelete,
      },
    );
  }

  return actions;
}
