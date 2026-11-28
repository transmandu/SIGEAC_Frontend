"use client";

import { memo } from "react";
import { Loader2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionMenuItems } from "@/components/library/ActionMenuItems";
import type { MenuAction } from "@/components/library/menu-actions";
import { cn } from "@/lib/utils";

interface DocumentActionsMenuProps {
  actions: MenuAction[];
  /** Hay una acción en curso (cargar versiones): el disparador lo muestra. */
  loading?: boolean;
  className?: string;
}

/**
 * Menú «⋯» de un documento: la misma lista vertical con icono y texto en
 * escritorio y en móvil (un menú solo de iconos no dice qué hace cada uno).
 * Las acciones vienen de `useDocumentActions`, igual que las del clic derecho.
 */
function DocumentActionsMenu({
  actions,
  loading = false,
  className,
}: DocumentActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Acciones del documento"
          onClick={(event) => event.stopPropagation()}
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-xl text-muted-foreground outline-hidden motion-safe:transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30 max-md:size-10",
            className,
          )}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MoreVertical className="size-4" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={4} className="min-w-52">
        <ActionMenuItems actions={actions} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default memo(DocumentActionsMenu);
