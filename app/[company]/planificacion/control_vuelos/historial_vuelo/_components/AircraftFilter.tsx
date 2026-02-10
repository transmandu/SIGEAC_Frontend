"use client";

import { Plane, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import { Aircraft } from "@/types";

interface AircraftFilterProps {
  selectedAcronym: string;
  onAcronymChange: (value: string) => void;
  aircrafts: Aircraft[];
  loading: boolean;
}

const AircraftFilter = ({
  selectedAcronym,
  onAcronymChange,
  aircrafts,
  loading,
}: AircraftFilterProps) => {
  return (
    <>
      <CardTitle>Filtrar por Aeronave</CardTitle>

      <div className="flex gap-2 items-end">
        <Select value={selectedAcronym} onValueChange={onAcronymChange}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Selecciona una aeronave..." />
          </SelectTrigger>
          <SelectContent>
            {loading ? (
              <SelectItem value="loading" disabled>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Cargando...
              </SelectItem>
            ) : (
              aircrafts?.map((a) => (
                <SelectItem key={a.id} value={a.acronym}>
                  <Plane className="h-4 w-4 mr-2 inline" />
                  {a.acronym}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {selectedAcronym && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAcronymChange("")}
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>
    </>
  );
};

export default AircraftFilter;
