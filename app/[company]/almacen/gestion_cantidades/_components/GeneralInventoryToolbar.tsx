"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Save, X } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  /** Total bajo la búsqueda vigente, contado por el servidor. */
  total?: number;
  modifiedCount: number;
  hasChanges: boolean;
  onSave: () => void;
  isSaving: boolean;
};

export function GeneralInventoryToolbar({
  search,
  onSearchChange,
  total,
  modifiedCount,
  hasChanges,
  onSave,
  isSaving,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex justify-center md:justify-start">
          <div className="relative w-full max-w-140">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por descripción, marca/modelo o tipo…"
              className="pl-9 text-center"
            />
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-end gap-2">
          {total !== undefined && (
            <Badge variant="outline" className="tabular-nums">
              {total.toLocaleString("es-VE")}
            </Badge>
          )}

          {search.trim() !== "" && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}

          <Button
            onClick={onSave}
            disabled={!hasChanges || isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar
            {modifiedCount > 0 && (
              <Badge variant="secondary" className="ml-2 tabular-nums">
                {modifiedCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
