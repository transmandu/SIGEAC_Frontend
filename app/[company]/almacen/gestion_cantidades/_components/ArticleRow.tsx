import React from "react";
import { Input } from "@/components/ui/input";
import { IWarehouseArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseConsumableArticles";

// Tipo para artículos individuales
export type Article = IWarehouseArticle["articles"][0];

interface ArticleRowProps {
  article: Article;
  quantity: number;
  meditionUnit: string;
  onQuantityChange: (articleId: number, newQuantity: string) => void;
}
// Componente memozado para artículos individuales
export const ArticleRow = React.memo(
  ({ article, quantity, meditionUnit, onQuantityChange }: ArticleRowProps) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
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
            Serial: {article.serial || "N/A"} • Zona: {article.zone}
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

      {/* New Quantity */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">
          Nueva Cantidad
        </label>
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
        <div className="text-xs text-muted-foreground text-center mt-0.5">
          {meditionUnit.charAt(0).toUpperCase() +
            meditionUnit.slice(1).toLowerCase()}
        </div>
      </div>
    </div>
  )
);

ArticleRow.displayName = "ArticleRow";
