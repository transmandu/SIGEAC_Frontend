"use client";

import { useState } from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const itemBase =
  "group relative flex items-center justify-center size-9 rounded-xl transition-all duration-200 ease-out hover:bg-muted hover:shadow-sm active:scale-95";
const iconBase =
  "size-[18px] transition-all duration-200 ease-out group-hover:scale-110";

export type ItemAction = {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  tone?: "default" | "primary" | "danger";
  /** Las acciones que el rol no puede usar no se ofrecen en vez de fallar. */
  hidden?: boolean;
};

const toneClass = {
  default: "",
  primary: "text-primary",
  danger: "text-red-600",
};

/** El mismo menú de iconos de las filas de las tablas, sobre cualquier elemento. */
export function ItemActions({
  actions,
  label,
}: {
  actions: ItemAction[];
  /** Nombre accesible del disparador: "Acciones de <elemento>". */
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const visible = actions.filter((action) => !action.hidden);

  if (visible.length === 0) return null;

  return (
    <TooltipProvider delayDuration={120}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-xl"
            aria-label={label}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={3}
          className="flex items-center justify-center gap-1.5 overflow-visible rounded-2xl border border-border/50 bg-background/90 p-1.5 shadow-xl backdrop-blur-xl"
        >
          {visible.map(({ label: actionLabel, icon: Icon, onSelect, tone }) => (
            <Tooltip key={actionLabel}>
              <TooltipTrigger asChild>
                <span>
                  <DropdownMenuItem
                    asChild
                    className="p-0 focus:bg-transparent"
                  >
                    <button
                      type="button"
                      aria-label={actionLabel}
                      onClick={() => {
                        setOpen(false);
                        onSelect();
                      }}
                      className={cn(itemBase, toneClass[tone ?? "default"])}
                    >
                      <Icon className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>{actionLabel}</TooltipContent>
            </Tooltip>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
