import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StockAdjustmentBatch } from "@/types/inventory";
import { ArticleRow } from "./ArticleRow";

interface BatchCardProps {
  batch: StockAdjustmentBatch;
  /** Solo lo editado; lo que no está aquí conserva su valor original. */
  quantities: Record<number, number>;
  zones: Record<number, string>;
  availableZones: string[];
  onQuantityChange: (articleId: number, newQuantity: string) => void;
  onZoneChange: (articleId: number, newZone: string) => void;
}

export const BatchCard = React.memo(
  ({
    batch,
    quantities,
    zones,
    availableZones,
    onQuantityChange,
    onZoneChange,
  }: BatchCardProps) => {
    const meditionUnit = batch.medition_unit ?? "N/A";

    return (
      <Card className="mb-5" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="pb-2 pt-2.5">
          <CardTitle className="text-lg">{batch.name}</CardTitle>
          <CardDescription className="text-sm">
            {batch.articles.length} artículo
            {batch.articles.length !== 1 ? "s" : ""} en este batch •{" "}
            {meditionUnit}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="space-y-3">
            {batch.articles.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                category={batch.category}
                quantity={
                  quantities[article.id] ?? Number(article.quantity ?? 0)
                }
                zone={zones[article.id] ?? article.zone ?? ""}
                meditionUnit={article.unit?.label ?? meditionUnit}
                availableZones={availableZones}
                onQuantityChange={onQuantityChange}
                onZoneChange={onZoneChange}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  },
);

BatchCard.displayName = "BatchCard";
