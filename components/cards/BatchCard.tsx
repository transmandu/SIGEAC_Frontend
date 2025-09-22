import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArticleRow } from "../tables/ArticleRow";
import { IWarehouseArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseConsumableArticles";

interface BatchCardProps {
  batch: IWarehouseArticle;
  quantities: Record<number, number>;
  zones: Record<number, string>;
  justifications: Record<number, string>;
  availableZones: string[];
  onQuantityChange: (articleId: number, newQuantity: string) => void;
  onZoneChange: (articleId: number, newZone: string) => void;
  onJustificationChange: (articleId: number, justification: string) => void;
}

export const BatchCard = React.memo(({ 
  batch, 
  quantities, 
  zones, 
  justifications,
  availableZones, 
  onQuantityChange, 
  onZoneChange,
  onJustificationChange
}: BatchCardProps) => {

  return (
    <Card className="mb-5" onClick={(e) => e.stopPropagation()}>
      <CardHeader className="pb-2 pt-2.5">
        <CardTitle className="text-lg">{batch.name}</CardTitle>
        <CardDescription className="text-sm">
          {batch.articles.length} artículo
          {batch.articles.length !== 1 ? "s" : ""} en este batch •{" "}
          {batch.medition_unit}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="space-y-3">
          {batch.articles.map((article) => (
            <ArticleRow
              key={article.id}
              article={article}
              quantity={quantities[article.id] || 0}
              zone={zones[article.id] || article.zone}
              justification={justifications[article.id] || ""}
              meditionUnit={batch.medition_unit}
              availableZones={availableZones}
              onQuantityChange={onQuantityChange}
              onZoneChange={onZoneChange}
              onJustificationChange={onJustificationChange}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

BatchCard.displayName = "BatchCard";
