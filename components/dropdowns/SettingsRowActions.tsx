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

export interface RowAction {
  key: string;
  label: string;
  icon: LucideIcon;
  tone?: "blue" | "red" | "default";
  onSelect: () => void;
}

const TONES: Record<NonNullable<RowAction["tone"]>, string> = {
  blue: "text-blue-600",
  red: "text-red-600",
  default: "text-foreground",
};

interface SettingsRowActionsProps {
  actions: RowAction[];
  /** `data-tour` del disparador del menú. */
  tourId?: string;
}

/**
 * Menú de acciones por fila de los listados de ajustes: disparador `…` que
 * despliega una barra de iconos con tooltip. Los diálogos los monta quien lo
 * usa; aquí solo se elige qué acción se pidió.
 */
export function SettingsRowActions({
  actions,
  tourId,
}: SettingsRowActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={120}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-xl border border-transparent transition-all duration-200 hover:bg-muted/70 hover:border-border/50 hover:shadow-xs data-[state=open]:bg-muted"
            data-tour={tourId}
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="center"
          sideOffset={3}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-border/50 bg-background/90 backdrop-blur-xl shadow-xl p-1.5 overflow-visible animate-in fade-in zoom-in-95 duration-200"
        >
          {actions.map(
            ({ key, label, icon: Icon, tone = "default", onSelect }) => (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <span>
                    <DropdownMenuItem
                      asChild
                      className="p-0 focus:bg-transparent"
                    >
                      <button
                        type="button"
                        aria-label={label}
                        onClick={() => {
                          setOpen(false);
                          onSelect();
                        }}
                        className={cn(
                          "group relative flex items-center justify-center size-9 rounded-xl transition-all duration-200 ease-out hover:bg-muted hover:shadow-xs active:scale-95",
                          TONES[tone],
                        )}
                      >
                        <Icon className="size-[18px] transition-all duration-200 ease-out group-hover:scale-110" />
                      </button>
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
