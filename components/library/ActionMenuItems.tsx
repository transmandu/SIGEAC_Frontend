"use client";

import { Fragment } from "react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { MenuAction } from "@/components/library/menu-actions";
import { cn } from "@/lib/utils";

const TONES: Record<MenuAction["tone"], string> = {
  blue: "text-blue-600 dark:text-blue-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  red: "text-red-600 dark:text-red-400",
};

/** Las filas de un menú de acciones: icono con su color, texto y, si toca, un separador. */
export function ActionMenuItems({ actions }: { actions: MenuAction[] }) {
  return (
    <>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Fragment key={action.key}>
            {action.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              data-tour={action.tour}
              onSelect={action.onSelect}
              className="cursor-pointer gap-2.5 text-sm max-md:py-2.5"
            >
              <Icon className={cn("size-4", TONES[action.tone])} />
              {action.label}
            </DropdownMenuItem>
          </Fragment>
        );
      })}
    </>
  );
}
