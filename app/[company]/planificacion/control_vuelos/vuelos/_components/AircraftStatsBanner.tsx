import { Plane, Clock, Repeat2, Loader } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AircraftStatsBannerProps {
  title: string;
  flights: number;
  hours: number;
  cycles: number;
  isLoading?: boolean;
  isVisible: boolean;
}

export const AircraftStatsBanner = ({
  title,
  flights,
  hours,
  cycles,
  isLoading = false,
  isVisible,
}: AircraftStatsBannerProps) => {
  if (!isVisible) return null;

  return (
    <Card className="border-none shadow-none w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">
            {title}
          </h3>

          {/* Lógica de carga */}
          {isLoading ? (
            <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-sm transition-opacity opacity-100">
              {/* Vuelos */}
              <Badge
                variant="secondary"
                className="gap-1.5 px-2.5 py-1 font-medium text-foreground"
              >
                <Plane className="h-3.5 w-3.5" />
                {flights}
              </Badge>

              {/* Horas */}
              <Badge
                variant="secondary"
                className="gap-1.5 px-2.5 py-1 font-medium text-foreground"
              >
                <Clock className="h-3.5 w-3.5" />
                {hours.toLocaleString()} h
              </Badge>

              {/* Ciclos */}
              <Badge
                variant="secondary"
                className="gap-1.5 px-2.5 py-1 font-medium text-foreground"
              >
                <Repeat2 className="h-3.5 w-3.5" />
                {cycles.toLocaleString()} ciclos
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};
