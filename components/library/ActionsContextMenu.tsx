"use client";

import { useCallback, useState, type MouseEvent } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionMenuItems } from "@/components/library/ActionMenuItems";
import type { MenuAction } from "@/components/library/menu-actions";
import { isOwnEvent } from "@/lib/Library/shortcuts";

interface Point {
  x: number;
  y: number;
}

/**
 * Estado de un menú de clic derecho: dónde se abrió y el manejador que lo
 * abre. El evento se detiene para que el menú de una fila no abra también el
 * del panel que la contiene. Con el teclado (tecla de menú o Mays+F10) el
 * navegador manda coordenadas 0,0: ahí se ancla al centro del elemento.
 */
export function useContextMenu() {
  const [point, setPoint] = useState<Point | null>(null);

  const onContextMenu = useCallback((event: MouseEvent<HTMLElement>) => {
    // Un clic derecho dentro de un diálogo o menú montado por este elemento
    // (portal) no es del elemento.
    if (!isOwnEvent(event)) return;
    event.preventDefault();
    event.stopPropagation();

    let { clientX: x, clientY: y } = event;
    if (x === 0 && y === 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      x = rect.left + Math.min(rect.width / 2, 48);
      y = rect.top + rect.height / 2;
    }
    setPoint({ x, y });
  }, []);

  const close = useCallback(() => setPoint(null), []);

  return { point, onContextMenu, close };
}

interface ActionsContextMenuProps {
  point: Point | null;
  onClose: () => void;
  actions: MenuAction[];
}

/**
 * Menú de clic derecho: el mismo menú desplegable del sistema, anclado en el
 * punto donde se pulsó. No es modal, así que un segundo clic derecho en otro
 * elemento cierra este y abre el de ese elemento de una vez.
 */
export function ActionsContextMenu({
  point,
  onClose,
  actions,
}: ActionsContextMenuProps) {
  // Montado solo mientras está abierto: cada documento, tarjeta y carpeta
  // tiene uno, y cientos de menús cerrados no aportan nada.
  if (point === null || actions.length === 0) return null;

  return (
    <DropdownMenu
      open
      onOpenChange={(open) => !open && onClose()}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <span
          aria-hidden
          className="pointer-events-none fixed size-0"
          style={{ left: point.x, top: point.y }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={2}
        collisionPadding={8}
        className="min-w-52"
        // El foco vuelve al elemento donde se abrió, no al ancla invisible.
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <ActionMenuItems actions={actions} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
