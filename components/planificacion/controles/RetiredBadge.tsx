"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Retirable } from "@/types";
import { Archive } from "lucide-react";

export function RetiredBadge({
  record,
  className,
}: {
  record: Retirable;
  className?: string;
}) {
  const timeZone = useCompanyTimezone();

  if (!record.retired_at) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex cursor-default items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300",
            className,
          )}
        >
          <Archive className="size-3" />
          Dado de baja
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {formatInstant(record.retired_at, timeZone)}
        {record.retired_by ? ` por ${record.retired_by}` : ""}
      </TooltipContent>
    </Tooltip>
  );
}
