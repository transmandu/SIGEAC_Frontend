import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableZoneSelect } from "./SearchableZoneSelect";
import { IWarehouseArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseConsumableArticles";

// Tipo para artículos individuales
export type Article = IWarehouseArticle["articles"][0];

interface ArticleRowProps {
  article: Article;
  quantity: number;
  zone: string;
  meditionUnit: string;
  availableZones: string[];
  onQuantityChange: (articleId: number, newQuantity: string) => void;
  onZoneChange: (articleId: number, newZone: string) => void;
}
// Componente memozado para artículos individuales
export const ArticleRow = React.memo(
  ({ article, quantity, zone, meditionUnit, availableZones, onQuantityChange, onZoneChange }: ArticleRowProps) => {
    const isComponent = article.article_type === 'componente';
    
    // Usar todas las zonas disponibles del inventario - con validación estricta
    const allAvailableZones = React.useMemo(() => {
      // Inicializar array vacío por defecto
      let zones = new Set<string>();
      
      // Solo procesar si availableZones es un array válido
      if (availableZones && Array.isArray(availableZones)) {
        try {
          availableZones.forEach((zone) => {
            if (zone && typeof zone === 'string') {
              zones.add(zone);
            }
          });
        } catch (error) {
          console.error("Error processing available zones:", error);
        }
      }
      
      // Asegurar que la zona actual del artículo esté incluida
      if (article.zone && typeof article.zone === 'string') {
        zones.add(article.zone);
      }
      if (zone && typeof zone === 'string') {
        zones.add(zone);
      }
      
      // Devolver todas las zonas disponibles
      return Array.from(zones).sort();
    }, [availableZones, article.zone, zone]);
    
    return (
    <div 
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Article Info */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">
          Artículo
        </label>
        <div className="p-2 bg-muted rounded-md">
          <div className="font-medium text-sm">{article.description}</div>
          <div className="text-xs text-muted-foreground">
            {article.part_number}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Serial: {article.serial || "N/A"}
          </div>
        </div>
      </div>

      {/* Current Stock */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">
          Cantidad Actual
        </label>
        <div className="p-2 bg-muted rounded-md text-center">
          <div className="text-xl font-bold text-primary">
            {article.quantity || 0}
          </div>
          <div className="text-xs text-muted-foreground">
            {meditionUnit.charAt(0).toUpperCase() +
              meditionUnit.slice(1).toLowerCase()}
          </div>
        </div>
      </div>

      {/* Current Location */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">
          Ubicación Actual
        </label>
        <div className="p-2 bg-muted rounded-md text-center">
          <div className="text-sm font-medium text-primary">
            {article.zone || "Sin zona"}
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center mt-0.5">
          Zona original
        </div>
      </div>

        {/* New Zone Selection */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-muted-foreground mb-1">
            Nueva Ubicación
          </label>
          <SearchableZoneSelect
            value={zone || ""}
            onValueChange={(value) => {
              if (value && typeof onZoneChange === 'function') {
                onZoneChange(article.id, value);
              }
            }}
            availableZones={allAvailableZones}
            placeholder="Seleccionar zona..."
            className={zone !== article.zone ? "border-blue-500 bg-blue-50" : ""}
          />
          <div className="text-xs text-muted-foreground text-center mt-0.5">
            {zone !== article.zone ? "Modificada" : "Sin cambios"}
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
              quantity !== (article.quantity || 0)
                ? "border-orange-500 bg-orange-50"
                : ""
            }`}
            placeholder="0"
          />
        )}
        <div className="text-xs text-muted-foreground text-center mt-0.5">
          {isComponent 
            ? "En almacén" 
            : meditionUnit.charAt(0).toUpperCase() + meditionUnit.slice(1).toLowerCase()
          }
        </div>
      </div>
    </div>
    );
  }
);

ArticleRow.displayName = "ArticleRow";
