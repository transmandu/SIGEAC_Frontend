"use client"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { AlertCircle, Calculator, X } from "lucide-react"

function sanitizeDecimal(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "")
  const parts = cleaned.split(".")
  if (parts.length <= 1) return cleaned
  return `${parts[0]}.${parts.slice(1).join("")}`
}

type MsgLevel = "error" | "warn"
type RowMsg = { msg: string; level: MsgLevel } | undefined

const MSG_CLASS: Record<MsgLevel, string> = {
  error: "text-destructive",
  warn: "text-amber-600",
}

interface ArticleRowCardProps {
  title: string
  subtitle: string
  qty: string
  max: number
  rowMsg: RowMsg
  disabled: boolean
  canConvert: boolean
  showConversionPanel: boolean
  conversionPanelNode: React.ReactNode
  accentClass: string
  onQtyChange: (val: string) => void
  onCommit: () => void
  onSetMax: () => void
  onOpenConversion: () => void
  onRemove: () => void
}

export const ArticleRowCard = memo(function ArticleRowCard({
  title,
  subtitle,
  qty,
  max,
  rowMsg,
  disabled,
  canConvert,
  showConversionPanel,
  conversionPanelNode,
  accentClass,
  onQtyChange,
  onCommit,
  onSetMax,
  onOpenConversion,
  onRemove,
}: ArticleRowCardProps) {
  return (
    <div className={cn("border rounded-md p-3 border-l-4", accentClass)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm font-medium">Cantidad</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button" variant="ghost" size="sm"
              onClick={onSetMax}
              className="h-7 text-xs text-primary hover:text-primary"
              disabled={disabled}
            >
              Usar máximo
            </Button>
            {canConvert && (
              <Button type="button" variant="outline" size="sm" className="h-7 px-2" onClick={onOpenConversion} disabled={disabled}>
                <Calculator className="h-3.5 w-3.5 mr-1.5" />
                Conversión
              </Button>
            )}
          </div>
        </div>

        <Input
          type="text"
          disabled={disabled}
          value={qty}
          onChange={(e) => onQtyChange(sanitizeDecimal(e.target.value))}
          onBlur={onCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onCommit()
              ;(e.currentTarget as HTMLInputElement).blur()
            }
          }}
          placeholder={!disabled ? `Máx: ${max}` : "Ingrese la cantidad..."}
          className={cn(
            "h-10",
            rowMsg?.level === "error" && "border-destructive focus-visible:ring-destructive",
            rowMsg?.level === "warn" && "border-amber-500 focus-visible:ring-amber-500"
          )}
        />

        {rowMsg?.msg && (
          <div className={cn("flex items-center gap-1 text-xs", MSG_CLASS[rowMsg.level])}>
            <AlertCircle className="h-3 w-3 shrink-0" />
            {rowMsg.msg}
          </div>
        )}

        {max > 0 && <p className="text-[11px] text-muted-foreground">Disponible actual: {max}</p>}
      </div>

      {showConversionPanel && conversionPanelNode}
    </div>
  )
})
