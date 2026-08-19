"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus, Ruler, X } from "lucide-react";
import type { ArticleDimension, Unit } from "@/types";
import { cn } from "@/lib/utils";

// Mismo cristal que el LoginForm y el formulario que contiene este bloque.
const numericFieldClass = cn(
  "h-10 rounded-lg text-sm tabular-nums",
  "bg-gradient-to-br from-background/70 to-background/40 backdrop-blur-md",
  "border border-slate-400/60 dark:border-slate-600/60 shadow-sm",
  "hover:border-blue-400/30 hover:shadow-md hover:shadow-blue-500/10",
  "transition-all duration-200",
);

const selectTriggerClass = cn(
  "h-10 rounded-lg text-sm",
  "bg-gradient-to-br from-background/70 to-background/40 backdrop-blur-md",
  "border border-slate-400/60 dark:border-slate-600/60 shadow-sm",
  "hover:border-blue-400/30 transition-all duration-200",
);

const labelClass = "text-[13px] font-medium text-foreground/80";

export type MeasureConversionDraft = {
  unit_id: number;
  value: string;
};

export type DimensionDraft = {
  enabled: boolean;
  axes: 1 | 2;
  measure_unit_id: string;
  piece_length: string;
  piece_width: string;
  /** Escalas alternas para capturar trazos: "1 METRO = 100 CENTIMETRO". */
  measure_conversions: MeasureConversionDraft[];
};

export const EMPTY_DIMENSION: DimensionDraft = {
  enabled: false,
  axes: 2,
  measure_unit_id: "",
  piece_length: "",
  piece_width: "",
  measure_conversions: [],
};

/** Escalas válidas, en el formato del backend. */
function conversionsPayload(draft: DimensionDraft) {
  return draft.measure_conversions
    .filter((c) => c.unit_id > 0 && parseFloat(c.value) > 0)
    .map((c) => ({
      unit_id: c.unit_id,
      // "1 <medida> = value <alterna>": el backend la invierte a
      // "cuántas <medida> hay en 1 alterna".
      direction: "units_per_base" as const,
      value: parseFloat(c.value),
    }));
}

/**
 * Payload listo para el backend, o null si no hay nada que mandar.
 *
 * Un perfil ya existente solo manda escalas: sus medidas no se reenvían porque
 * no se pueden cambiar.
 */
export function dimensionPayload(
  draft: DimensionDraft,
  alreadyDimensional = false,
) {
  const conversions = conversionsPayload(draft);

  if (alreadyDimensional) {
    return conversions.length > 0 ? { measure_conversions: conversions } : null;
  }

  if (!draft.enabled) return null;

  const length = parseFloat(draft.piece_length);
  const width = parseFloat(draft.piece_width);
  const unitId = Number(draft.measure_unit_id);

  if (!unitId || !(length > 0)) return null;
  if (draft.axes === 2 && !(width > 0)) return null;

  return {
    axes: draft.axes,
    measure_unit_id: unitId,
    piece_length: length,
    piece_width: draft.axes === 2 ? width : undefined,
    measure_conversions: conversions,
  };
}

/**
 * Escalas alternas para escribir un trazo. Son del PERFIL y no del artículo:
 * las del artículo convierten hacia su unidad base, que cuenta piezas
 * (1 PAQUETE = 5 LAMINA), no que las mide.
 */
function MeasureScales({
  value,
  onChange,
  measureLabel,
  units,
  measureUnitId,
  disabled,
}: {
  value: MeasureConversionDraft[];
  onChange: (rows: MeasureConversionDraft[]) => void;
  measureLabel: string;
  units: Unit[];
  measureUnitId: number;
  disabled?: boolean;
}) {
  const available = units.filter(
    (u) =>
      u.id !== measureUnitId && !value.some((r) => r.unit_id === u.id),
  );

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">
        Otras escalas para medir los trazos
      </Label>

      {value.map((row, index) => {
        const unit = units.find((u) => u.id === row.unit_id);
        return (
          <div key={row.unit_id} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              1 {measureLabel || "medida"} =
            </span>
            <Input
              type="text"
              inputMode="decimal"
              disabled={disabled}
              value={row.value}
              onChange={(e) => {
                const next = [...value];
                next[index] = { ...row, value: sanitizeDecimal(e.target.value) };
                onChange(next);
              }}
              placeholder="100"
              className={`${numericFieldClass} w-24`}
            />
            <span className="text-xs font-medium flex-1 truncate">
              {unit?.label ?? `#${row.unit_id}`}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={disabled}
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      {available.length > 0 && (
        <Select
          disabled={disabled}
          value=""
          onValueChange={(v) =>
            onChange([...value, { unit_id: Number(v), value: "" }])
          }
        >
          <SelectTrigger className={selectTriggerClass}>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Plus className="h-3.5 w-3.5" />
              Agregar escala
            </span>
          </SelectTrigger>
          <SelectContent>
            {available.map((u) => (
              <SelectItem key={u.id} value={String(u.id)}>
                {u.label} ({u.value})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {value.length > 0 && (
        <p className="text-[11px] text-muted-foreground">
          Aparecerán como opción al capturar el trazo en una salida.
        </p>
      )}
    </div>
  );
}

function sanitizeDecimal(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

interface DimensionFieldsProps {
  value: DimensionDraft;
  onChange: (next: DimensionDraft) => void;
  /** Cantidad declarada: son las piezas físicas con que nace el artículo. */
  quantity?: number;
  /**
   * Perfil ya existente. Su presencia bloquea la edición de medidas y permite
   * mostrarlas en el aviso, en vez de solo decir que no se pueden cambiar.
   */
  existingProfile?: ArticleDimension | null;
  disabled?: boolean;
}

/**
 * Activación del modo dimensional al crear o editar un artículo.
 *
 * Es la misma decisión que ofrece la confirmación de una entrada de compra,
 * disponible aquí para el artículo que se carga a mano. Las unidades que puede
 * elegir salen de las marcadas en Ajustes › Unidades.
 */
export function DimensionFields({
  value,
  onChange,
  quantity,
  existingProfile,
  disabled,
}: DimensionFieldsProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: units } = useGetUnits(selectedCompany?.slug);

  const alreadyDimensional = !!existingProfile;
  const measureUnitLabel = existingProfile?.measure_unit_label ?? null;
  const profileSummary = existingProfile
    ? existingProfile.axes === 2
      ? `${existingProfile.piece_length} × ${existingProfile.piece_width} ${measureUnitLabel ?? ""}`
      : `${existingProfile.piece_length} ${measureUnitLabel ?? ""}`
    : null;

  const measureUnits = (units ?? []).filter((u: Unit) => u.is_dimensional);
  const selectedUnit = measureUnits.find(
    (u: Unit) => String(u.id) === value.measure_unit_id,
  );

  // La unidad de medida vigente: la del perfil si ya existe, o la que se está
  // eligiendo. Es la que MeasureScales excluye de las escalas ofrecidas, para
  // que no pueda declararse una equivalencia consigo misma.
  const activeMeasureUnitId =
    existingProfile?.measure_unit_id ?? selectedUnit?.id ?? 0;
  const unitLabel = existingProfile
    ? (existingProfile.measure_unit_label ?? "")
    : (selectedUnit?.label ?? "");

  const length = parseFloat(value.piece_length);
  const width = parseFloat(value.piece_width);
  const magnitude =
    value.axes === 2
      ? length > 0 && width > 0
        ? length * width
        : null
      : length > 0
        ? length
        : null;

  // Un artículo ya dimensionado no se re-dimensiona: cambiar las medidas
  // corrompería el saldo de las piezas ya cortadas. Lo que sí se puede hacer
  // es declarar equivalencias, y el aviso debe decirlo — si no, parece que no
  // hay nada que hacer aquí.
  if (alreadyDimensional) {
    return (
      <div className="rounded-md border bg-muted/30 p-3 space-y-2">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Ruler className="h-4 w-4" />
          Este artículo se mide por dimensiones
          {profileSummary && (
            <span className="font-normal text-muted-foreground">
              · piezas de {profileSummary}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          Las medidas de la pieza no se editan: cambiarlas alteraría el saldo de
          las piezas ya cortadas. Una pieza de otro tamaño es otro artículo.
        </p>
        <div className="border-t pt-3">
          <MeasureScales
            value={value.measure_conversions}
            onChange={(rows) => onChange({ ...value, measure_conversions: rows })}
            measureLabel={unitLabel}
            units={measureUnits}
            measureUnitId={activeMeasureUnitId}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }

  const piecesLabel =
    quantity !== undefined && Number.isFinite(quantity)
      ? Number.isInteger(quantity)
        ? `${quantity} pieza(s)`
        : null
      : null;

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex flex-row items-start gap-3">
        <Checkbox
          checked={value.enabled}
          disabled={disabled}
          onCheckedChange={(checked) =>
            onChange({ ...value, enabled: checked === true })
          }
          className="mt-0.5"
        />
        <div className="space-y-1 leading-none">
          <Label className={`${labelClass} cursor-pointer`}>Se despacha en trazos</Label>
          <p className="text-xs text-muted-foreground">
            Para material que se corta a la medida (láminas, telas, rollos): la
            salida descuenta el área cortada de una pieza concreta, no unidades
            enteras.
          </p>
          {/* La confusión más común: creer que la unidad base debe ser METRO.
              La base cuenta piezas; las medidas van en otra unidad. */}
          <p className="text-xs text-muted-foreground">
            La <span className="font-medium">unidad base</span> del artículo
            debe contar piezas (LÁMINA, ROLLO, PLANCHA) y la cantidad es{" "}
            <span className="font-medium">cuántas hay</span>. Las medidas de
            cada pieza se declaran aquí abajo, en la unidad que elija.
          </p>
        </div>
      </div>

      {value.enabled && (
        <div className="space-y-3 border-t pt-3">
          <Tabs
            value={String(value.axes)}
            onValueChange={(v) =>
              onChange({ ...value, axes: Number(v) as 1 | 2 })
            }
          >
            {/* Sin altura forzada: el trigger crece con su propio padding y
                al recortar la lista a h-8 se desbordaba del fondo. */}
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="2" className="text-xs">
                Por área (lámina, tela)
              </TabsTrigger>
              <TabsTrigger value="1" className="text-xs">
                A lo largo (cable, rollo)
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Unidad de medida
            </Label>
            <Select
              disabled={disabled || measureUnits.length === 0}
              value={value.measure_unit_id}
              onValueChange={(v) => onChange({ ...value, measure_unit_id: v })}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue
                  placeholder={
                    measureUnits.length === 0
                      ? "Ninguna unidad habilitada"
                      : "Seleccione la unidad"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {measureUnits.map((u: Unit) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.label} ({u.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {measureUnits.length === 0 && (
              <p className="flex items-start gap-1.5 text-xs text-amber-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                Marque al menos una unidad como apta para medidas en Ajustes ›
                Unidades.
              </p>
            )}
          </div>

          <div
            className={
              value.axes === 2 ? "grid grid-cols-2 gap-2" : "grid grid-cols-1"
            }
          >
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {value.axes === 2 ? "Largo" : "Longitud"} de la pieza
                {unitLabel ? ` (${unitLabel})` : ""}
              </Label>
              <Input
                type="text"
              inputMode="decimal"
                disabled={disabled}
                value={value.piece_length}
                onChange={(e) =>
                  onChange({
                    ...value,
                    piece_length: sanitizeDecimal(e.target.value),
                  })
                }
                placeholder="0.00"
                className={numericFieldClass}
              />
            </div>
            {value.axes === 2 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Ancho de la pieza{unitLabel ? ` (${unitLabel})` : ""}
                </Label>
                <Input
                  type="text"
              inputMode="decimal"
                  disabled={disabled}
                  value={value.piece_width}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      piece_width: sanitizeDecimal(e.target.value),
                    })
                  }
                  placeholder="0.00"
                  className={numericFieldClass}
                />
              </div>
            )}
          </div>

          {magnitude !== null && (
            <p className="text-xs font-medium tabular-nums">
              Cada pieza rinde {Number(magnitude.toFixed(6))} {unitLabel}
              {value.axes === 2 ? "²" : ""}
              {piecesLabel && (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · se crearán {piecesLabel}
                </span>
              )}
            </p>
          )}

          {selectedUnit && (
            <div className="border-t pt-3">
              <MeasureScales
                value={value.measure_conversions}
                onChange={(rows) =>
                  onChange({ ...value, measure_conversions: rows })
                }
                measureLabel={unitLabel}
                units={measureUnits}
                measureUnitId={activeMeasureUnitId}
                disabled={disabled}
              />
            </div>
          )}

          {/* La cantidad son piezas físicas: media hoja no es cortable. */}
          {quantity !== undefined &&
            Number.isFinite(quantity) &&
            !Number.isInteger(quantity) && (
              <p className="flex items-start gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                La cantidad ({quantity}) debe ser un número entero de piezas
                para poder dimensionar el artículo.
              </p>
            )}
        </div>
      )}
    </div>
  );
}
