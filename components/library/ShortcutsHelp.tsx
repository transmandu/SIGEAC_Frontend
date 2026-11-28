"use client";

import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Shortcut {
  keys: string[];
  action: string;
  /** Solo quien gestiona la biblioteca puede usarlo. */
  manage?: boolean;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ["↑", "↓", "←", "→"], action: "Moverse entre los documentos" },
  { keys: ["Enter"], action: "Abrir el documento" },
  { keys: ["/"], action: "Ir al buscador" },
  { keys: ["Mays", "↑ ↓"], action: "Ampliar la selección", manage: true },
  {
    keys: ["Espacio"],
    action: "Seleccionar o quitar el documento",
    manage: true,
  },
  { keys: ["Ctrl", "A"], action: "Seleccionar todos", manage: true },
  { keys: ["F2"], action: "Renombrar", manage: true },
  { keys: ["Supr"], action: "Enviar a la papelera", manage: true },
  { keys: ["Esc"], action: "Quitar la selección" },
];

function Key({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-slate-300 bg-slate-100 px-1.5 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
      {children}
    </kbd>
  );
}

/** Lista de los atajos de teclado de la biblioteca, en un botón de la barra. */
export default function ShortcutsHelp({ canManage }: { canManage: boolean }) {
  const shortcuts = SHORTCUTS.filter((item) => canManage || !item.manage);

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Atajos de teclado"
              className="relative size-8 shrink-0 rounded-md border-slate-200/60 bg-white/80 p-0 dark:border-slate-700/60 dark:bg-slate-900/60 max-md:hidden"
            >
              <Keyboard className="size-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="px-2 py-1 text-xs">
          Atajos de teclado
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="w-80 max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="border-b bg-muted/30 px-4 py-2">
          <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
            Atajos de teclado
          </p>
        </div>
        <ul className="divide-y divide-border/60">
          {shortcuts.map((item) => (
            <li
              key={item.action}
              className="flex items-center justify-between gap-3 px-4 py-2"
            >
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {item.action}
              </span>
              <span className="flex shrink-0 items-center gap-1">
                {item.keys.map((key) => (
                  <Key key={key}>{key}</Key>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
