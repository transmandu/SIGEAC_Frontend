"use client"
import { memo, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Calculator, Loader2, Plus, X } from "lucide-react"
import type { Convertion, Unit } from "@/types"
import type { ConversionDirection } from "@/types/supervisor"
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits"
import {
  useCreateArticleUnitConversion,
  type ConvertibleType,
} from "@/hooks/mantenimiento/almacen/articulos/useArticleUnitConversions"
import { useCompanyStore } from "@/stores/CompanyStore"

function sanitizeDecimal(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "")
  const parts = cleaned.split(".")
  if (parts.length <= 1) return cleaned
  return `${parts[0]}.${parts.slice(1).join("")}`
}

interface ConversionPanelProps {
  conversions: Convertion[] | undefined
  isLoading: boolean
  selectedConversion: Convertion | null
  conversionInput: string
  /** Unidad base del artículo: es la unidad en que queda la cantidad aplicada. */
  baseUnitLabel?: string
  /** Artículo al que pertenecerán las conversiones que se creen aquí. */
  convertibleType?: ConvertibleType
  convertibleId?: number | null
  onConversionChange: (conv: Convertion | null) => void
  onInputChange: (val: string) => void
  onApply: () => void
  onClose: () => void
}

export const ConversionPanel = memo(function ConversionPanel({
  conversions,
  isLoading,
  selectedConversion,
  conversionInput,
  baseUnitLabel,
  convertibleType,
  convertibleId,
  onConversionChange,
  onInputChange,
  onApply,
  onClose,
}: ConversionPanelProps) {
  const [creating, setCreating] = useState(false)
  const isEmpty = !isLoading && (!conversions || conversions.length === 0)
  const canCreate = !!convertibleType && !!convertibleId

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

      {!isEmpty && (
        <div className="flex flex-col md:flex-row gap-2">
          <Select
            value={selectedConversion?.id?.toString() || ""}
            onValueChange={(value) => {
              const conv = conversions?.find((c) => c.id.toString() === value)
              onConversionChange(conv ?? null)
              onInputChange("")
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="h-10 flex-1">
              <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccione unidad origen"} />
            </SelectTrigger>
            <SelectContent>
              {conversions?.map((conv) => (
                <SelectItem key={conv.id} value={conv.id.toString()}>
                  {conv.unit.label} ({conv.unit.value})
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
      )}

      {selectedConversion && conversionInput && (
        <p className="text-xs text-muted-foreground">
          {conversionInput} {selectedConversion.unit.label} ={" "}
          {((parseFloat(conversionInput) || 0) * selectedConversion.base_per_unit).toFixed(6)}{" "}
          {baseUnitLabel ?? "unidades"}
        </p>
      )}

      {isEmpty && !creating && (
        <p className="text-xs text-muted-foreground">
          Este artículo no tiene conversiones registradas.
        </p>
      )}

      {canCreate && !creating && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setCreating(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Nueva conversión
        </Button>
      )}

      {canCreate && creating && (
        <NewConversionForm
          type={convertibleType!}
          articleId={convertibleId!}
          baseUnitLabel={baseUnitLabel}
          existing={conversions}
          onDone={() => setCreating(false)}
          onCancel={() => setCreating(false)}
        />
      )}

      {!isLoading && isEmpty && !canCreate && (
        <p className="text-xs text-muted-foreground">No hay conversiones disponibles para este artículo.</p>
      )}
    </div>
  )
})

/**
 * Alta de una conversión sin salir del despacho: si el almacenista descubre
 * a media carga que falta la equivalencia, registrarla no debería costarle
 * abandonar el formulario a medio llenar.
 *
 * La equivalencia se escribe en la frase que resulte natural y el backend la
 * normaliza; la vista previa muestra el descuento real sobre el stock para
 * que una equivalencia invertida se note antes de guardarla.
 */
const NewConversionForm = memo(function NewConversionForm({
  type,
  articleId,
  baseUnitLabel,
  existing,
  onDone,
  onCancel,
}: {
  type: ConvertibleType
  articleId: number
  baseUnitLabel?: string
  existing: Convertion[] | undefined
  onDone: () => void
  onCancel: () => void
}) {
  const { selectedCompany } = useCompanyStore()
  const { data: units, isLoading: unitsLoading } = useGetUnits(selectedCompany?.slug)
  const createConversion = useCreateArticleUnitConversion(type, articleId, selectedCompany?.slug)

  const [unitId, setUnitId] = useState<number | "">("")
  const [direction, setDirection] = useState<ConversionDirection>("base_per_unit")
  const [value, setValue] = useState("")

  // Ni la unidad base ni las ya registradas: para cambiar una existente se
  // edita desde el artículo, no se crea otra encima.
  const availableUnits = useMemo(() => {
    const taken = new Set((existing ?? []).map((row) => Number(row.unit?.id)))
    return (units ?? []).filter(
      (unit: Unit) => unit.label !== baseUnitLabel && !taken.has(unit.id),
    )
  }, [units, existing, baseUnitLabel])

  const numericValue = Number(value)
  const isValid = !!unitId && Number.isFinite(numericValue) && numericValue > 0

  const unitLabel = units?.find((unit: Unit) => unit.id === unitId)?.label ?? "unidad"
  const baseLabel = baseUnitLabel ?? "unidad base"
  const leftLabel = direction === "base_per_unit" ? unitLabel : baseLabel
  const rightLabel = direction === "base_per_unit" ? baseLabel : unitLabel

  // Cuánto descontaría del stock despachar 1 de la unidad elegida.
  const factor = direction === "base_per_unit" ? numericValue : 1 / (numericValue || 1)

  const submit = () => {
    if (!isValid) return

    createConversion.mutate(
      { unit_id: Number(unitId), direction, value: numericValue },
      { onSuccess: onDone },
    )
  }

  return (
    <div className="rounded-md border bg-background/70 p-3 space-y-2.5">
      <div className="flex flex-col md:flex-row gap-2">
        <Select
          value={unitId === "" ? "" : String(unitId)}
          onValueChange={(next) => setUnitId(Number(next))}
          disabled={unitsLoading || availableUnits.length === 0}
        >
          <SelectTrigger className="h-9 flex-1 text-xs">
            <SelectValue
              placeholder={
                unitsLoading
                  ? "Cargando unidades..."
                  : availableUnits.length === 0
                    ? "No quedan unidades por convertir"
                    : "Unidad a convertir"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableUnits.map((unit: Unit) => (
              <SelectItem key={unit.id} value={String(unit.id)} className="text-xs">
                {unit.label} ({unit.value})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={direction}
          onValueChange={(next) => setDirection(next as ConversionDirection)}
          disabled={!unitId}
        >
          <SelectTrigger className="h-9 md:w-[200px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="base_per_unit" className="text-xs">
              1 {unitLabel} = ? {baseLabel}
            </SelectItem>
            <SelectItem value="units_per_base" className="text-xs">
              1 {baseLabel} = ? {unitLabel}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!!unitId && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">1 {leftLabel} =</span>
          <Input
            autoFocus
            type="text"
            inputMode="decimal"
            placeholder="Ej: 100"
            value={value}
            onChange={(e) => setValue(sanitizeDecimal(e.target.value))}
            className="h-9 w-28"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">{rightLabel}</span>
        </div>
      )}

      {isValid && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Al despachar 1 {unitLabel}
          <ArrowRight className="h-3 w-3 shrink-0" />
          se descuentan{" "}
          <span className="font-medium text-foreground tabular-nums">
            {Number(factor.toFixed(6))} {baseLabel}
          </span>
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          className="h-8 text-xs"
          onClick={submit}
          disabled={!isValid || createConversion.isPending}
        >
          {createConversion.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          Guardar conversión
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
})
