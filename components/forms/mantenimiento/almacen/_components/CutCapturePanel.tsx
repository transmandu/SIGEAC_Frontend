"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type {
  CaptureUnit,
  DimensionPiece,
  DimensionProfile,
} from "@/hooks/mantenimiento/almacen/articulos/useGetArticleDimension"
import { AlertCircle, Scissors } from "lucide-react"

// Mismo cristal que el LoginForm, para que la captura no desentone con el
// resto de la aplicación.
const numericFieldClass = cn(
  "h-10 rounded-lg text-sm tabular-nums",
  "bg-gradient-to-br from-background/70 to-background/40 backdrop-blur-md",
  "border border-slate-400/60 dark:border-slate-600/60 shadow-sm",
  "hover:border-blue-400/30 hover:shadow-md hover:shadow-blue-500/10",
  "transition-all duration-200",
)

const selectTriggerClass = cn(
  "h-10 rounded-lg text-sm",
  "bg-gradient-to-br from-background/70 to-background/40 backdrop-blur-md",
  "border border-slate-400/60 dark:border-slate-600/60 shadow-sm",
  "hover:border-blue-400/30 transition-all duration-200",
)

const labelClass = "text-[13px] font-medium text-foreground/80"

function sanitizeDecimal(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "")
  const parts = cleaned.split(".")
  if (parts.length <= 1) return cleaned
  return `${parts[0]}.${parts.slice(1).join("")}`
}

export type CutDraft = {
  piece_id: number | null
  input_mode: "MEASURES" | "MAGNITUDE"
  length: string
  width: string
  magnitude: string
  /** Unidad en que se escribieron las medidas; null = la del perfil. */
  unit_id: number | null
  /**
   * Ejes del perfil, copiados al draft: quien valida el formulario no tiene el
   * perfil a mano y necesita saber si el ancho es obligatorio.
   */
  axes?: number
}

export const EMPTY_CUT: CutDraft = {
  piece_id: null,
  input_mode: "MEASURES",
  length: "",
  width: "",
  magnitude: "",
  unit_id: null,
}

/**
 * Un trazo está listo para guardarse cuando se sabe de qué pieza sale y con
 * qué medidas. El ancho solo se exige en artículos de área, y eso lo decide el
 * perfil — por eso `axes` es opcional aquí: sin él se asume área, que es el
 * caso más estricto.
 */
export function isCutComplete(draft: CutDraft): boolean {
  if (draft.piece_id === null) return false

  if (draft.input_mode === "MAGNITUDE") {
    return parseFloat(draft.magnitude) > 0
  }

  if (!(parseFloat(draft.length) > 0)) return false

  return draft.axes === 1 || parseFloat(draft.width) > 0
}

/**
 * Magnitud del trazo en la unidad del perfil; null si aún no es válida.
 *
 * El factor se aplica a cada medida antes de multiplicarlas: es lineal y el
 * área es cuadrática, así que 30×50 cm son 0.30×0.50 m = 0.15 m², no 15.
 */
export function cutMagnitude(
  draft: CutDraft,
  profile: DimensionProfile,
  factor = 1,
): number | null {
  if (draft.input_mode === "MAGNITUDE") {
    const m = parseFloat(draft.magnitude)
    return m > 0 ? m : null
  }
  const l = parseFloat(draft.length)
  if (!(l > 0)) return null
  if (profile.axes === 1) return l * factor
  const w = parseFloat(draft.width)
  return w > 0 ? l * factor * (w * factor) : null
}

interface CutCapturePanelProps {
  profile: DimensionProfile
  pieces: DimensionPiece[]
  /** Unidades en que se puede escribir; la del perfil siempre va primero. */
  measureUnits?: CaptureUnit[]
  draft: CutDraft
  disabled?: boolean
  onChange: (next: CutDraft) => void
}

/**
 * Captura de un trazo: de qué pieza sale y qué medidas tiene.
 *
 * Reemplaza al input de cantidad porque en un artículo dimensionado no existe
 * "cantidad": existe un corte de una hoja concreta. El saldo de la pieza
 * elegida se muestra siempre, y el trazo que no cabe se avisa aquí mismo — el
 * backend lo vuelve a validar, pero enterarse al guardar sería tarde.
 */
export function CutCapturePanel({
  profile,
  pieces,
  measureUnits,
  draft,
  disabled,
  onChange,
}: CutCapturePanelProps) {
  const selected = pieces.find((p) => p.id === draft.piece_id) ?? null
  const isArea = profile.axes === 2

  const units = measureUnits ?? []
  const activeUnit =
    units.find((u) => u.id === (draft.unit_id ?? profile.measure_unit_id)) ??
    units.find((u) => u.id === profile.measure_unit_id)
  const factor = activeUnit?.factor ?? 1
  const unit = activeUnit?.label ?? profile.measure_unit_label ?? ""

  const magnitude = cutMagnitude(draft, profile, factor)
  // Solo tiene sentido ofrecer el selector si hay algo que elegir.
  const canPickUnit = units.length > 1

  const overflows =
    selected !== null && magnitude !== null && magnitude > selected.remaining

  return (
    <div className="mt-3 space-y-3 rounded-md border bg-muted/30 p-3">
      <div className="flex items-center gap-2">
        <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Se corta de una pieza:{" "}
          <span className="font-medium text-foreground">
            {isArea
              ? `${profile.piece_length} × ${profile.piece_width} ${unit}`
              : `${profile.piece_length} ${unit}`}
          </span>{" "}
          por pieza entera
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className={labelClass}>Pieza</Label>
        <Select
          disabled={disabled || pieces.length === 0}
          value={draft.piece_id ? String(draft.piece_id) : ""}
          onValueChange={(v) => onChange({ ...draft, piece_id: Number(v) })}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue
              placeholder={
                pieces.length === 0
                  ? "No hay piezas disponibles"
                  : "Seleccione de cuál pieza se corta"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {pieces.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.code} — quedan {p.remaining} {profile.magnitude_label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs
        value={draft.input_mode}
        onValueChange={(v) =>
          onChange({ ...draft, input_mode: v as CutDraft["input_mode"] })
        }
      >
        {/* Sin h-8: el trigger crece con su padding y se salía del fondo. */}
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="MEASURES" className="text-xs">
            Por medidas
          </TabsTrigger>
          {/* El trazo irregular no es un rectángulo: el operario estima su área. */}
          <TabsTrigger value="MAGNITUDE" className="text-xs">
            Área directa
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {draft.input_mode === "MEASURES" && canPickUnit && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Medidas expresadas en
          </Label>
          <Select
            disabled={disabled}
            value={String(draft.unit_id ?? profile.measure_unit_id)}
            onValueChange={(v) => onChange({ ...draft, unit_id: Number(v) })}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.label}
                  {u.id !== profile.measure_unit_id && (
                    <span className="text-muted-foreground">
                      {" "}
                      · 1 {u.label} = {u.factor} {profile.measure_unit_label}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {draft.input_mode === "MEASURES" ? (
        <div className={cn("grid gap-2", isArea ? "grid-cols-2" : "grid-cols-1")}>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {isArea ? "Largo" : "Longitud"} ({unit})
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              disabled={disabled}
              value={draft.length}
              onChange={(e) =>
                onChange({ ...draft, length: sanitizeDecimal(e.target.value) })
              }
              placeholder="0.00"
              className={numericFieldClass}
            />
          </div>
          {isArea && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Ancho ({unit})
              </Label>
              <Input
                type="text"
              inputMode="decimal"
                disabled={disabled}
                value={draft.width}
                onChange={(e) =>
                  onChange({ ...draft, width: sanitizeDecimal(e.target.value) })
                }
                placeholder="0.00"
                className={numericFieldClass}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {profile.magnitude_label}
          </Label>
          <Input
            type="text"
              inputMode="decimal"
            disabled={disabled}
            value={draft.magnitude}
            onChange={(e) =>
              onChange({ ...draft, magnitude: sanitizeDecimal(e.target.value) })
            }
            placeholder="0.00"
            className={numericFieldClass}
          />
        </div>
      )}

      {magnitude !== null && (
        <p className="text-xs font-medium tabular-nums">
          {/* La equivalencia se muestra escrita: el usuario captura en cm pero
              lo que sale del inventario está en la unidad del perfil. */}
          {factor !== 1 && draft.input_mode === "MEASURES" && (
            <span className="text-muted-foreground font-normal">
              {draft.length}
              {isArea ? ` × ${draft.width}` : ""} {unit} ={" "}
              {Number((parseFloat(draft.length) * factor).toFixed(6))}
              {isArea
                ? ` × ${Number((parseFloat(draft.width) * factor).toFixed(6))}`
                : ""}{" "}
              {profile.measure_unit_label} ·{" "}
            </span>
          )}
          Trazo: {Number(magnitude.toFixed(6))} {profile.magnitude_label}
          {selected && !overflows && (
            <span className="text-muted-foreground font-normal">
              {" "}
              · quedarían{" "}
              {Number((selected.remaining - magnitude).toFixed(6))}{" "}
              {profile.magnitude_label} en {selected.code}
            </span>
          )}
        </p>
      )}

      {/* No se ofrece repartir entre piezas: un trazo sale de una sola hoja, y
          dividir el pedido es una decisión del usuario, no del sistema. */}
      {overflows && selected && (
        <div className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            No cabe en {selected.code}, que tiene {selected.remaining}{" "}
            {profile.magnitude_label}. Elija otra pieza o divida el pedido en
            dos trazos.
          </span>
        </div>
      )}
    </div>
  )
}
