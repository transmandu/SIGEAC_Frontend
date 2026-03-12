"use client"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, X } from "lucide-react"

function sanitizeDecimal(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "")
  const parts = cleaned.split(".")
  if (parts.length <= 1) return cleaned
  return `${parts[0]}.${parts.slice(1).join("")}`
}

interface ConversionPanelProps {
  conversions: any[] | undefined
  isLoading: boolean
  selectedConversion: any
  conversionInput: string
  onConversionChange: (conv: any) => void
  onInputChange: (val: string) => void
  onApply: () => void
  onClose: () => void
}

export const ConversionPanel = memo(function ConversionPanel({
  conversions,
  isLoading,
  selectedConversion,
  conversionInput,
  onConversionChange,
  onInputChange,
  onApply,
  onClose,
}: ConversionPanelProps) {
  return (
    <div className="mt-3 rounded-md border border-dashed bg-muted/20 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-1.5">
          <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
          Conversión de Unidades
        </span>
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onClose}>
          <X className="h-3 w-3" />
          Cerrar
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <Select
          value={selectedConversion?.id?.toString() || ""}
          onValueChange={(value) => {
            const conv = conversions?.find((c: any) => c.id.toString() === value)
            onConversionChange(conv ?? null)
            onInputChange("")
          }}
          disabled={isLoading}
        >
          <SelectTrigger className="h-10 flex-1">
            <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccione unidad origen"} />
          </SelectTrigger>
          <SelectContent>
            {conversions?.map((conv: any) => (
              <SelectItem key={conv.id} value={conv.id.toString()}>
                {conv.unit_primary.label} ({conv.unit_primary.value})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="text"
          inputMode="decimal"
          placeholder="Cantidad"
          value={conversionInput}
          onChange={(e) => onInputChange(sanitizeDecimal(e.target.value))}
          className="h-10 w-full md:w-28"
          disabled={!selectedConversion}
        />

        <Button type="button" className="h-10 shrink-0" onClick={onApply} disabled={!selectedConversion || !conversionInput}>
          Aplicar
        </Button>
      </div>

      {selectedConversion && conversionInput && (
        <p className="text-xs text-muted-foreground">
          {conversionInput} {selectedConversion.unit_primary.label} ={" "}
          {((parseFloat(conversionInput) || 0) / selectedConversion.equivalence).toFixed(6)}{" "}
          {conversions?.[0]?.unit_secondary?.label ?? "unidades"}
        </p>
      )}

      {!isLoading && (!conversions || conversions.length === 0) && (
        <p className="text-xs text-muted-foreground">No hay conversiones disponibles para este artículo.</p>
      )}
    </div>
  )
})
