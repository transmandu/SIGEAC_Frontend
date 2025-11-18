// components/misc/MissionVision.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MissionVisionProps {
  className?: string;
  missionTitle?: string;
  visionTitle?: string;
}

export function MissionVision({
  className,
  missionTitle = "Misión",
  visionTitle = "Visión",
}: MissionVisionProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", className)}>
      {/* Misión */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">
            {missionTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p
            className="text-sm text-justify
 text-muted-foreground leading-relaxed"
          >
            Proveer servicios de transporte aéreo de alta calidad, garantizando
            la seguridad, puntualidad y excelencia operativa; ofreciendo
            experiencias de transporte responsable en el Estado Bolívar, con
            proyección nacional e internacional, contribuyendo al desarrollo
            económico y sostenible de la nación.
          </p>
        </CardContent>
      </Card>

      {/* Visión */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">
            {visionTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p
            className="text-sm text-justify
 text-muted-foreground leading-relaxed"
          >
            Constituirse como la empresa líder en la prestación de servicios de
            transporte aéreo del estado Bolívar, con presencia nacional e
            internacional, siendo reconocidos como un referente de calidad y
            contribución al crecimiento y desarrollo económico del país,
            garantizando servicios de excelencia e innovación operativa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
