"use client";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import {
  FRACTION_SHORTCUTS,
  fractionLabel,
  isFractionText,
  nearFraction,
  parseQuantity,
  sanitizeQuantityText,
} from "@/lib/fractions";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AlertCircle, Calculator, X } from "lucide-react";

type MsgLevel = "error" | "warn";
type RowMsg = { msg: string; level: MsgLevel } | undefined;

const MSG_CLASS: Record<MsgLevel, string> = {
  error: "text-destructive",
  warn: "text-amber-600",
};

type RowConversion = {
  unitId: number;
  unitLabel: string;
  factor: number;
  baseLabel: string;
};

interface ArticleRowCardProps {
  title: string;
  subtitle: string;
  qty: string;
  max: number;
  rowMsg: RowMsg;
  disabled: boolean;
  canConvert: boolean;
  showConversionPanel: boolean;
  conversionPanelNode: React.ReactNode;
  accentClass: string;
  /** Unidad base del artículo; rotula el input mientras no haya conversión. */
  baseUnitLabel?: string;
  conversion?: RowConversion;
  /**
   * Captura del trazo, para artículos que se miden por dimensiones. Sustituye
   * al input de cantidad: ahí no se despacha una cantidad fungible sino un
   * corte de una pieza concreta.
   */
  cutPanelNode?: React.ReactNode;
  /** Captura de evidencia fotográfica de la entrega. Opcional. */
  evidenceNode?: React.ReactNode;
  onQtyChange: (val: string) => void;
  onCommit: () => void;
  onSetMax: () => void;
  /**
   * Fija una cantidad en unidad base y descarta la conversión vigente. Sin
   * ella la fila no ofrece atajos de fracción ni la sugerencia «usar 1/2».
   */
  onSetQuantity?: (value: number) => void;
  onOpenConversion: () => void;
  onRemove: () => void;
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
  baseUnitLabel,
  conversion,
  cutPanelNode,
  evidenceNode,
  onQtyChange,
  onCommit,
  onSetMax,
  onSetQuantity,
  onOpenConversion,
  onRemove,
}: ArticleRowCardProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: units } = useGetUnits(selectedCompany?.slug);

  const activeUnit = conversion?.unitLabel ?? baseUnitLabel;
  const baseLabel = conversion?.baseLabel || baseUnitLabel;
  const parsedQty = parseQuantity(qty);
  const qtyInBase = conversion ? (parsedQty ?? 0) * conversion.factor : null;

  const baseAllowsFractions = !!units?.some(
    (unit) =>
      unit.allows_fractions &&
      unit.label.toUpperCase() === baseLabel?.toUpperCase(),
  );
  const showShortcuts =
    !!onSetQuantity && baseAllowsFractions && !conversion && !disabled;
  const nearest =
    onSetQuantity && baseAllowsFractions && qtyInBase
      ? nearFraction(qtyInBase)
      : null;
  const readAsFraction =
    baseAllowsFractions && !conversion && parsedQty && !isFractionText(qty)
      ? fractionLabel(parsedQty)
      : null;

  return (
    <div className={cn("border rounded-md p-3 border-l-4", accentClass)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {cutPanelNode ? (
        <>
          {cutPanelNode}
          {rowMsg?.msg && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-xs",
                MSG_CLASS[rowMsg.level],
              )}
            >
              <AlertCircle className="h-3 w-3 shrink-0" />
              {rowMsg.msg}
            </div>
          )}
          {/* El trazo sustituye al bloque de cantidad, donde viven las demás
              acciones: sin esto el dimensional se quedaría sin evidencia. */}
          {evidenceNode && (
            <div className="mt-2 flex justify-end">{evidenceNode}</div>
          )}
        </>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm font-medium">
              Cantidad{activeUnit ? ` (${activeUnit})` : ""}
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSetMax}
                className="h-7 text-xs text-primary hover:text-primary"
                disabled={disabled}
              >
                Usar máximo
              </Button>
              {canConvert && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2"
                  onClick={onOpenConversion}
                  disabled={disabled}
                >
                  <Calculator className="h-3.5 w-3.5 mr-1.5" />
                  Conversión
                </Button>
              )}
              {/* Junto a las demás acciones de la fila y no en una banda propia:
                adjuntar una foto es una acción más sobre este artículo. */}
              {evidenceNode}
            </div>
          </div>

          <Input
            type="text"
            disabled={disabled}
            value={qty}
            onChange={(e) =>
              onQtyChange(
                baseAllowsFractions
                  ? sanitizeQuantityText(e.target.value)
                  : e.target.value.replace(/[^\d.,]/g, ""),
              )
            }
            onBlur={onCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onCommit();
                (e.currentTarget as HTMLInputElement).blur();
              }
            }}
            placeholder={
              !disabled
                ? `Máx: ${max}${baseLabel ? ` ${baseLabel}` : ""}${baseAllowsFractions ? " · admite 1/2, 1 1/4…" : ""}`
                : "Ingrese la cantidad..."
            }
            className={cn(
              "h-10",
              rowMsg?.level === "error" &&
                "border-destructive focus-visible:ring-destructive",
              rowMsg?.level === "warn" &&
                "border-amber-500 focus-visible:ring-amber-500",
            )}
          />

          {showShortcuts && (
            <div className="flex flex-wrap items-center gap-1.5">
              {FRACTION_SHORTCUTS.map((shortcut) => (
                <Button
                  key={shortcut.label}
                  type="button"
                  variant={
                    parsedQty === shortcut.value ? "secondary" : "outline"
                  }
                  size="sm"
                  className="h-7 px-2 text-xs tabular-nums"
                  onClick={() => onSetQuantity?.(shortcut.value)}
                >
                  {shortcut.label}
                </Button>
              ))}
            </div>
          )}

          {isFractionText(qty) && parsedQty && (
            <p className="text-xs font-medium tabular-nums">
              {qty} = {parsedQty}
              {baseLabel ? ` ${baseLabel}` : ""}
            </p>
          )}

          {readAsFraction && (
            <p className="text-xs font-medium tabular-nums">
              {readAsFraction}
              {baseLabel ? ` ${baseLabel}` : ""}
            </p>
          )}

          {rowMsg?.msg && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs",
                MSG_CLASS[rowMsg.level],
              )}
            >
              <AlertCircle className="h-3 w-3 shrink-0" />
              {rowMsg.msg}
            </div>
          )}

          {/* Se despacha en la unidad convertida: sin el equivalente en base, el
            número del input no se puede contrastar contra el disponible. */}
          {conversion && qtyInBase !== null && (
            <p className="text-xs font-medium tabular-nums">
              {qty || 0} {conversion.unitLabel} = {Number(qtyInBase.toFixed(6))}{" "}
              {conversion.baseLabel}
            </p>
          )}

          {/* «2 L» no es «1/2 galón» (1 galón son 3,785 L): 2 L descuentan 0,528.
            Se avisa para que no se descuadre el inventario, sin bloquear. */}
          {conversion && nearest && qtyInBase !== null && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-amber-500/40 bg-amber-500/5 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-400">
              <span>
                Equivale a {Number(qtyInBase.toFixed(4))} {conversion.baseLabel}
                , no a {nearest.label}.
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onSetQuantity?.(nearest.value)}
              >
                Usar {nearest.label} {conversion.baseLabel}
              </Button>
            </div>
          )}

          {max > 0 && (
            <p className="text-[11px] text-muted-foreground">
              Disponible actual: {max}
              {baseLabel ? ` ${baseLabel}` : ""}
            </p>
          )}
        </div>
      )}

      {!cutPanelNode && showConversionPanel && conversionPanelNode}
    </div>
  );
});
