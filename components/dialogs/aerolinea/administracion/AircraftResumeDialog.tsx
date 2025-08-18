import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger,} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Aircraft } from "@/types";
import { PlaneIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const AircraftResumeDialog = ({ aircraft }: { aircraft: Aircraft }) => {
  const [openAircraft, setOpenAircraft] = useState(false);

  const getStatusColors = () => {
    switch (aircraft.status) {
      case "EN POSESION":
        return {
          bgGradient: "bg-gradient-to-r from-green-600 to-emerald-500",
          iconColor: "text-green-600",
          badgeColor: "bg-green-700 hover:bg-green-800"
        };
      case "RENTADO":
        return {
          bgGradient: "bg-gradient-to-r from-amber-500 to-yellow-500",
          iconColor: "text-amber-500",
          badgeColor: "bg-amber-600 hover:bg-amber-700"
        };
      default:
        return {
          bgGradient: "bg-gradient-to-r from-red-600 to-red-500",
          iconColor: "text-gray-600",
          badgeColor: "bg-gray-700 hover:bg-gray-800"
        };
    }
  };

  const statusColors = getStatusColors();

  return (
    <Dialog open={openAircraft} onOpenChange={setOpenAircraft}>
      <DialogTrigger className="font-bold">{aircraft.acronym}</DialogTrigger>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center font-bold">
          Resumen de Aeronave
        </DialogHeader>

        <Card className="border-none shadow-none">
          <CardHeader className={`p-6 text-white rounded-t-lg ${statusColors.bgGradient}`}>
            <div className="flex items-center gap-4">
              <Card className="bg-white p-3 rounded-lg shadow-sm border">
                <PlaneIcon className={`h-10 w-10 ${statusColors.iconColor}`} />
              </Card>
              <div>
                <CardTitle className="text-xl">{aircraft.model}</CardTitle>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className="bg-white text-gray-800 hover:bg-gray-100">
                    {aircraft.acronym}
                  </Badge>
                  <Badge className={`text-white ${statusColors.badgeColor}`}>
                    {aircraft.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 grid gap-6">
            {/* Grid de información principal */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Serial</h3>
                  <p className="font-medium">{aircraft.serial}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Fabricante</h3>
                  <p className="font-medium">{aircraft.fabricant}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Fecha Fabricación</h3>
                  <p className="font-medium">
                    {format(new Date(aircraft.fabricant_date), "PPP", { locale: es })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Marca</h3>
                  <p className="font-medium">{aircraft.brand}</p>
                </CardContent>
              </Card>
            </div>

            {/* Información secundaria */}

            <Card>
              <CardContent className="p-4 space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Dueño</h3>
                <p className="font-medium">{aircraft.owner}</p>
              </CardContent>
            </Card>

            {aircraft.comments && (
              <Card>
                <CardContent className="p-4 space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Comentarios</h3>
                  <p className="font-medium text-justify">{aircraft.comments}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <DialogFooter className="sm:justify-start">
          <Button
            onClick={() => setOpenAircraft(false)}
            variant="outline"
            className="w-full"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AircraftResumeDialog;
