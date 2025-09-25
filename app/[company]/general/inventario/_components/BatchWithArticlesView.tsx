"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BatchWithArticles } from "@/hooks/mantenimiento/almacen/renglones/useSearchBatchesWithArticles";
import { ChevronDown, ChevronRight, Package, MapPin, Hash, FileText, Settings, Building, Wrench } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface BatchWithArticlesViewProps {
  batches: BatchWithArticles[];
  companySlug?: string;
}

export function BatchWithArticlesView({ batches, companySlug }: BatchWithArticlesViewProps) {
  const [expandedBatches, setExpandedBatches] = useState<Record<number, boolean>>({});

  const toggleExpand = (batchId: number) => {
    setExpandedBatches(prev => ({ ...prev, [batchId]: !prev[batchId] }));
  };

  if (batches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No se encontraron batches con artículos que coincidan con la búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {batches.map((batchData) => {
        const isExpanded = expandedBatches[batchData.batch.id];
        const totalArticles = batchData.articles.length;
        const totalQuantity = batchData.articles.reduce((sum, article) => sum + article.quantity, 0);

        return (
          <Card key={batchData.batch.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(batchData.batch.id)}
                    className="p-1"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      <Link 
                        href={`/${companySlug || 'hangar74'}/almacen/inventario/gestion/${batchData.batch.slug}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {batchData.batch.name}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {batchData.batch.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <Badge variant="outline" className="bg-blue-50">
                    {totalArticles} artículo{totalArticles !== 1 ? 's' : ''} encontrado{totalArticles !== 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="secondary">
                    Total: {totalQuantity} {batchData.batch.medition_unit.toLowerCase()}
                  </Badge>
                </div>
              </div>

              {/* Información del batch siempre visible */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t">
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Código ATA</p>
                    <p className="text-sm font-medium">{batchData.batch.ata_code}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Categoría</p>
                    <Badge variant="default" className="text-xs">
                      {batchData.batch.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Almacén</p>
                    <p className="text-sm font-medium">{batchData.batch.warehouse_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cantidad Mínima</p>
                    <p className="text-sm font-medium">
                      {batchData.batch.min_quantity} {batchData.batch.medition_unit.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Nro. de Parte</TableHead>
                        <TableHead>Serial</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Zona</TableHead>
                        <TableHead>Condición</TableHead>
                        <TableHead>Fabricante</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batchData.articles.map((article) => (
                        <TableRow key={article.id} className="hover:bg-muted/30">
                          <TableCell>
                            <span className="font-medium text-blue-600">{article.part_number}</span>
                            {article.alternative_part_number.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Alt: {article.alternative_part_number.join(", ")}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm text-muted-foreground">
                              {article.serial || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{article.description}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-bold">
                              {article.quantity} {article.unit_secondary || "UN"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <Badge variant="outline" className="text-xs">
                                {article.zone || "N/A"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{article.condition}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground italic text-sm">
                              {article.manufacturer}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
