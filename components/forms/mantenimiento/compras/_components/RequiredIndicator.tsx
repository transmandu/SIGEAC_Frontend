"use client"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface RequiredIndicatorProps {
  show?: boolean;
}

export function RequiredIndicator({ show = true }: RequiredIndicatorProps) {
  if (!show) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="ml-0.5 text-destructive cursor-default select-none"
          aria-hidden="true"
        >
          *
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs px-2 py-1">
        <p>Campo obligatorio</p>
      </TooltipContent>
    </Tooltip>
  )
}