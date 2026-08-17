"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type LinkableQuote = {
  quote_number: string
  vendor?: { name: string | null } | null
  retailer?: { name: string | null } | null
}

type Props = {
  company: string
  quotes: LinkableQuote[]
  /** URL segment for the quote list: 'cotizaciones' (aeronáutico) or 'cotizaciones_generales' (general). */
  segment: "cotizaciones" | "cotizaciones_generales"
  className?: string
  iconClassName?: string
}

const QuoteLinkButton = ({
  company,
  quotes,
  segment,
  className,
  iconClassName
}: Props) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const hasSingle = quotes.length === 1
  const hasMultiple = quotes.length > 1

  const goToQuote = (quoteNumber: string) => {
    setOpen(false)
    router.push(`/${company}/compras/${segment}/${quoteNumber}`)
  }

  const handleClick = () => {
    if (hasSingle) goToQuote(quotes[0].quote_number)
  }

  const trigger = (
    <Button
      variant="ghost"
      size="icon"
      disabled={!quotes.length}
      onClick={hasMultiple ? undefined : handleClick}
      className={cn(className, "text-indigo-600")}
    >
      <ExternalLink className={iconClassName} />
    </Button>
  )

  const tooltipLabel = hasMultiple
    ? "Ver cotizaciones"
    : quotes.length
    ? "Ver cotización"
    : "No existe cotización"

  if (!hasMultiple) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent>{tooltipLabel}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{tooltipLabel}</TooltipContent>
      </Tooltip>

      <PopoverContent
        align="center"
        className="w-64 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl p-1.5"
      >
        <p className="px-2.5 pt-1.5 pb-2 text-[10px] tracking-wide text-muted-foreground select-none">
          COTIZACIONES
        </p>

        <div className="flex flex-col gap-0.5">
          {quotes.map((quote) => (
            <button
              key={quote.quote_number}
              onClick={() => goToQuote(quote.quote_number)}
              className="
                flex items-center justify-between gap-2
                rounded-xl px-2.5 py-2
                text-left text-sm
                transition-colors
                hover:bg-muted
              "
            >
              <span className="flex flex-col min-w-0">
                <span className="truncate font-medium text-foreground">
                  {quote.vendor?.name ?? quote.retailer?.name ?? "Sin proveedor"}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {quote.quote_number}
                </span>
              </span>

              <ExternalLink className="size-3.5 shrink-0 text-indigo-600" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default QuoteLinkButton
