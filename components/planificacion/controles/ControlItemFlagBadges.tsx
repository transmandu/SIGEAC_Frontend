"use client";

import { AlertTriangle, LifeBuoy } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CONTROL_ITEM_FLAG_LABELS } from "@/lib/controlItemFlags";
import { ControlItemFlag } from "@/types";

const FLAG_BADGE: Record<
  ControlItemFlag,
  { short: string; icon: typeof AlertTriangle; className: string }
> = {
  HAZARDOUS: {
    short: "MP",
    icon: AlertTriangle,
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  EMERGENCY_EQUIPMENT: {
    short: "EE",
    icon: LifeBuoy,
    className: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

/** Una insignia por bandera del ítem; sin banderas no pinta nada. */
export function ControlItemFlagBadges({
  flags,
}: {
  flags?: ControlItemFlag[];
}) {
  return (
    <>
      {(flags ?? []).map((flag) => {
        const { short, icon: Icon, className } = FLAG_BADGE[flag];

        return (
          <Tooltip key={flag}>
            <TooltipTrigger asChild>
              <span
                className={`inline-flex items-center rounded border px-1 text-[10px] ${className}`}
              >
                <Icon className="mr-0.5 size-3" />
                {short}
              </span>
            </TooltipTrigger>
            <TooltipContent>{CONTROL_ITEM_FLAG_LABELS[flag]}</TooltipContent>
          </Tooltip>
        );
      })}
    </>
  );
}
