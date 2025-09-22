import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Eye, Package, MapPin, FileText } from "lucide-react";
import { ModifiedArticle } from "@/app/[company]/almacen/gestion_cantidades/_components/hooks/useArticleChanges";
import { IWarehouseArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseConsumableArticles";

interface ChangesPanelProps {
  modifiedArticles: ModifiedArticle[];
  isExpanded: boolean;
  onToggleExpanded: (expanded: boolean) => void;
  batches: IWarehouseArticle[];
}

export const ChangesPanel = React.memo(({ 
  modifiedArticles, 
  isExpanded, 
  onToggleExpanded,
  batches
}: ChangesPanelProps) => {
  // Función para obtener información del artículo
  const getArticleInfo = (articleId: number) => {
    for (const batch of batches) {
      const article = batch.articles?.find((a) => a.id === articleId);
      if (article) {
        return {
          description: article.description,
          partNumber: article.part_number,
          originalQuantity: article.quantity,
          originalZone: article.zone,
          batchName: batch.name,
          meditionUnit: batch.medition_unit
        };
      }
    }
    return null;
  };

  if (modifiedArticles.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
            <Eye className="h-5 w-5" />
            Cambios Realizados
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {modifiedArticles.length}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpanded(!isExpanded)}
            className="flex items-center gap-1 text-orange-700 hover:bg-orange-100"
          >
            <span>{isExpanded ? "Contraer" : "Expandir"}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </Button>
        </div>
        {!isExpanded && (
          <div className="text-sm text-orange-600 mt-1">
            {modifiedArticles.filter(a => a.quantityChanged).length} cambios de cantidad • {" "}
            {modifiedArticles.filter(a => a.zoneChanged).length} cambios de zona • {" "}
            {modifiedArticles.filter(a => a.hasValidJustification).length} justificados
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3">
          {modifiedArticles.map((change) => {
            const articleInfo = getArticleInfo(change.articleId);
            if (!articleInfo) return null;

            return (
              <div 
                key={change.articleId}
                className="p-3 bg-white rounded-lg border border-orange-200 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Article Info */}
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {articleInfo.description}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {articleInfo.partNumber}
                      </Badge>
                    </div>

                    {/* Changes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {change.quantityChanged && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-blue-600">
                            <Package className="h-3 w-3" />
                            <span className="font-medium">Cantidad:</span>
                          </div>
                          <span className="text-gray-500">
                            {articleInfo.originalQuantity} {articleInfo.meditionUnit}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium text-blue-700">
                            {change.newQuantity} {articleInfo.meditionUnit}
                          </span>
                        </div>
                      )}

                      {change.zoneChanged && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-purple-600">
                            <MapPin className="h-3 w-3" />
                            <span className="font-medium">Zona:</span>
                          </div>
                          <span className="text-gray-500">
                            {articleInfo.originalZone}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium text-purple-700">
                            {change.newZone}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Justification */}
                    {change.justification && (
                      <div className="mt-2 flex items-start gap-2">
                        <FileText className="h-3 w-3 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-xs font-medium text-green-600">Justificación:</span>
                          <p className="text-sm text-gray-700 mt-0.5">
                            {change.justification}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col gap-1">
                    <Badge 
                      variant={change.hasValidJustification ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {change.hasValidJustification ? "Justificado" : "Sin justificar"}
                    </Badge>
                    <div className="text-xs text-gray-500 text-center">
                      {articleInfo.batchName}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary */}
          <div className="pt-3 border-t border-orange-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-700">
                  {modifiedArticles.filter(a => a.quantityChanged).length}
                </div>
                <div className="text-xs text-blue-600">Cantidades</div>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-700">
                  {modifiedArticles.filter(a => a.zoneChanged).length}
                </div>
                <div className="text-xs text-purple-600">Zonas</div>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-700">
                  {modifiedArticles.filter(a => a.hasValidJustification).length}
                </div>
                <div className="text-xs text-green-600">Justificados</div>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-700">
                  {modifiedArticles.length}
                </div>
                <div className="text-xs text-orange-600">Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
});

ChangesPanel.displayName = "ChangesPanel";
