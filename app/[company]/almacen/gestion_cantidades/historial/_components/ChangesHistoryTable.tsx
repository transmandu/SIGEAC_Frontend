import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  User, 
  Package, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  MapPin,
  Hash
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ArticleChange {
  id: number;
  partNumber: string;
  description: string;
  changes: {
    quantity?: { from: number; to: number; unit: string };
    zone?: { from: string; to: string };
  };
}

interface ChangeRecord {
  id: number;
  date: string;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  type: string;
  justification: string;
  articlesModified: ArticleChange[];
  totalArticles: number;
  status: string;
}

interface ChangesHistoryTableProps {
  changes: ChangeRecord[];
}

export const ChangesHistoryTable = React.memo(({ changes }: ChangesHistoryTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case "bulk_update": return "Actualización Masiva";
      case "single_update": return "Actualización Individual";
      default: return "Otro";
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case "bulk_update": return "bg-purple-100 text-purple-800";
      case "single_update": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (changes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cambios registrados</h3>
          <p className="text-gray-500">No se encontraron registros con los filtros aplicados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {changes.map((record) => {
        const isExpanded = expandedRows.has(record.id);
        
        return (
          <Card key={record.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Main Row */}
              <div className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Expand Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(record.id)}
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Date */}
                    <div className="flex items-center gap-2 min-w-0">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div className="text-sm">
                        <div className="font-medium">
                          {format(new Date(record.date), "dd/MM/yyyy", { locale: es })}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {format(new Date(record.date), "HH:mm", { locale: es })}
                        </div>
                      </div>
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {record.user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm min-w-0">
                        <div className="font-medium truncate">{record.user.name}</div>
                        <div className="text-gray-500 text-xs truncate">{record.user.email}</div>
                      </div>
                    </div>

                    {/* Articles Count */}
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <div className="text-sm">
                        <div className="font-medium">{record.totalArticles}</div>
                        <div className="text-gray-500 text-xs">
                          {record.totalArticles === 1 ? "artículo" : "artículos"}
                        </div>
                      </div>
                    </div>

                    {/* Type Badge */}
                    <Badge className={getChangeTypeColor(record.type)}>
                      {getChangeTypeLabel(record.type)}
                    </Badge>

                    {/* Status Badge */}
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      ✓ Completado
                    </Badge>
                  </div>
                </div>

                {/* Justification Preview */}
                <div className="mt-3 ml-12 flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {record.justification}
                  </p>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t bg-gray-50/50">
                  <div className="p-4">
                    {/* Full Justification */}
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Justificación</span>
                      </div>
                      <p className="text-sm text-green-700">{record.justification}</p>
                    </div>

                    {/* Articles Modified */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Artículos Modificados ({record.totalArticles})
                      </h4>
                      
                      <div className="space-y-3">
                        {record.articlesModified.map((article) => (
                          <div key={article.id} className="p-3 bg-white rounded-lg border">
                            {/* Article Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Hash className="h-3 w-3 text-gray-500" />
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {article.partNumber}
                                  </Badge>
                                  <Badge 
                                    className={article.changes.quantity && article.changes.zone 
                                      ? "bg-purple-100 text-purple-700" 
                                      : article.changes.quantity 
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-orange-100 text-orange-700"
                                    }
                                  >
                                    {article.changes.quantity && article.changes.zone 
                                      ? "Cantidad + Zona" 
                                      : article.changes.quantity 
                                      ? "Cantidad"
                                      : "Zona"
                                    }
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{article.description}</p>
                              </div>
                            </div>

                            {/* Changes Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Quantity Change */}
                              {article.changes.quantity && (
                                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <Package className="h-3 w-3" />
                                    <span className="text-xs font-medium">Cantidad:</span>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {article.changes.quantity.from} {article.changes.quantity.unit.toLowerCase()}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                  <span className="text-sm font-medium text-blue-700">
                                    {article.changes.quantity.to} {article.changes.quantity.unit.toLowerCase()}
                                  </span>
                                  {article.changes.quantity.to > article.changes.quantity.from ? (
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                  )}
                                </div>
                              )}

                              {/* Zone Change */}
                              {article.changes.zone && (
                                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                                  <div className="flex items-center gap-1 text-purple-600">
                                    <MapPin className="h-3 w-3" />
                                    <span className="text-xs font-medium">Zona:</span>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {article.changes.zone.from}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                  <span className="text-sm font-medium text-purple-700">
                                    {article.changes.zone.to}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

ChangesHistoryTable.displayName = "ChangesHistoryTable";
