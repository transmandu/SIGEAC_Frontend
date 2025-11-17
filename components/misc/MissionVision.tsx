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
            Brindar servicios técnicos de mantenimiento aeronáutico de manera
            eficaz y eficiente, con la garantía de un personal altamente
            capacitado y calificado, apegado a las regulaciones aeronáuticas
            nacionales, normas técnicas internacionales y un sistema de gestión
            de la calidad que satisfaga a nuestros clientes.
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
            Convertirnos en una Organización de Mantenimiento Aeronáutico
            multidisciplinaria que sea reconocida por la calidad de sus
            servicios prestados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
