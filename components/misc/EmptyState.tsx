import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

interface EmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export const EmptyState = React.memo(({ hasActiveFilters, onClearFilters }: EmptyStateProps) => {
  return (
    <Card>
      <CardContent className="text-center py-8">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        {hasActiveFilters ? (
          <>
            <h3 className="text-lg font-medium mb-2">
              No se encontraron artículos
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              No hay artículos que coincidan con los filtros aplicados.
            </p>
            <Button onClick={onClearFilters} variant="outline" size="sm">
              Limpiar filtros
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-2">
              No hay artículos en el almacén
            </h3>
            <p className="text-sm text-muted-foreground">
              No se encontraron artículos para mostrar en el inventario.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
});

EmptyState.displayName = "EmptyState";
