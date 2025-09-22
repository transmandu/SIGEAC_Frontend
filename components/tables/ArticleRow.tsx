import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchableZoneSelect } from "../selects/SearchableZoneSelect";
import { BaseArticleProps, ArticleChangeHandlers } from "@/hooks/helpers/useFilters";
import { CHANGE_COLORS, VALIDATION, ARTICLE_GRID } from "@/app/[company]/almacen/gestion_cantidades/_components/constants";

type ArticleRowProps = BaseArticleProps & ArticleChangeHandlers;

export const ArticleRow = React.memo(({ 
  article, quantity, zone, justification, meditionUnit, availableZones, 
  onQuantityChange, onZoneChange, onJustificationChange 
}: ArticleRowProps) => {
  const isComponent = article.article_type === 'componente';
  
  // Change detection
  const quantityChanged = quantity !== (article.quantity || 0);
  const zoneChanged = zone !== article.zone;
  const hasChanges = quantityChanged || zoneChanged;
  const hasValidJustification = justification.trim().length >= VALIDATION.MIN_JUSTIFICATION_LENGTH;
  const needsJustification = hasChanges && !hasValidJustification;
  
  // Prepare zones (include current zone if not in list)
  const zones = React.useMemo(() => {
    const zoneSet = new Set(availableZones.filter(Boolean));
    if (article.zone) zoneSet.add(article.zone);
    if (zone) zoneSet.add(zone);
    return Array.from(zoneSet).sort();
  }, [availableZones, article.zone, zone]);
  
  return (
    <div className={`grid grid-cols-${ARTICLE_GRID.MOBILE_COLS} md:grid-cols-${ARTICLE_GRID.TABLET_COLS} lg:grid-cols-${ARTICLE_GRID.DESKTOP_COLS} gap-3 p-3 border rounded-lg transition-colors relative ${
      hasChanges 
        ? `${CHANGE_COLORS.MODIFIED_ARTICLE.border} ${CHANGE_COLORS.MODIFIED_ARTICLE.background} ${CHANGE_COLORS.MODIFIED_ARTICLE.hover}` 
        : "border-border bg-card hover:bg-muted/50"
    }`}>
      {/* Change Indicator */}
      {hasChanges && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Modificado
          </div>
        </div>
      )}
      
      {/* Article Info */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">Artículo</label>
        <div className="p-2 bg-muted rounded-md">
          <div className="font-medium text-sm">{article.description}</div>
          <div className="text-xs text-muted-foreground">{article.part_number}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Serial: {article.serial || "N/A"}
          </div>
        </div>
      </div>

      {/* Current Stock */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">Cantidad Actual</label>
        <div className="p-2 bg-muted rounded-md text-center">
          <div className="text-xl font-bold text-primary">{article.quantity || 0}</div>
          <div className="text-xs text-muted-foreground">
            {meditionUnit.charAt(0).toUpperCase() + meditionUnit.slice(1).toLowerCase()}
          </div>
        </div>
      </div>

      {/* Current Location */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">Ubicación Actual</label>
        <div className="p-2 bg-muted rounded-md text-center">
          <div className="text-sm font-medium text-primary">{article.zone || "Sin zona"}</div>
        </div>
        <div className="text-xs text-muted-foreground text-center mt-0.5">Zona original</div>
      </div>

      {/* New Zone */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">Nueva Ubicación</label>
        <SearchableZoneSelect
          value={zone || ""}
          onValueChange={(value) => onZoneChange?.(article.id, value)}
          availableZones={zones}
          placeholder="Seleccionar zona..."
            className={zoneChanged ? `${CHANGE_COLORS.ZONE.border} ${CHANGE_COLORS.ZONE.background}` : ""}
        />
        <div className="text-xs text-muted-foreground text-center mt-0.5">
          {zoneChanged ? "Modificada" : "Sin cambios"}
        </div>
      </div>

      {/* New Quantity */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">
          {isComponent ? "Estado" : "Nueva Cantidad"}
        </label>
        {isComponent ? (
          <div className="h-9 flex items-center justify-center border rounded-md bg-muted">
            <span className="text-sm font-medium">
              {quantity === 1 ? "Presente" : "Ausente"}
            </span>
          </div>
        ) : (
          <Input
            type="number"
            min="0"
            step="0.01"
            value={quantity || ""}
            onChange={(e) => onQuantityChange(article.id, e.target.value)}
            className={`text-center text-base font-medium h-9 ${
              quantityChanged ? `${CHANGE_COLORS.QUANTITY.border} ${CHANGE_COLORS.QUANTITY.background}` : ""
            }`}
            placeholder="0"
          />
        )}
        <div className="text-xs text-muted-foreground text-center mt-0.5">
          {isComponent ? "En almacén" : meditionUnit.charAt(0).toUpperCase() + meditionUnit.slice(1).toLowerCase()}
        </div>
      </div>

      {/* Justification */}
      <div className="flex flex-col">
        <label className={`text-xs font-medium mb-1 ${hasChanges ? "text-red-600" : "text-muted-foreground"}`}>
          Justificación {hasChanges && <span className="text-red-500">*</span>}
        </label>
        <Textarea
          value={justification}
          onChange={(e) => onJustificationChange(article.id, e.target.value)}
          className={`text-sm h-20 resize-none ${
            needsJustification
              ? `${CHANGE_COLORS.JUSTIFICATION.invalid.border} ${CHANGE_COLORS.JUSTIFICATION.invalid.background}`
              : hasValidJustification
              ? `${CHANGE_COLORS.JUSTIFICATION.valid.border} ${CHANGE_COLORS.JUSTIFICATION.valid.background}`
              : hasChanges
              ? `${CHANGE_COLORS.QUANTITY.border} ${CHANGE_COLORS.QUANTITY.background}`
              : ""
          }`}
          placeholder={hasChanges ? "Justificación obligatoria..." : "Motivo del cambio..."}
          required={hasChanges}
        />
        <div className={`text-xs text-center mt-0.5 ${
          needsJustification ? "text-red-600 font-medium" 
          : hasValidJustification ? "text-green-600"
          : hasChanges ? "text-orange-600" 
          : "text-muted-foreground"
        }`}>
          {needsJustification ? "Justificación requerida"
          : hasValidJustification ? "Justificación válida"
          : hasChanges ? "Justificación requerida"
          : "Sin cambios"}
        </div>
      </div>
    </div>
  );
});

ArticleRow.displayName = "ArticleRow";
