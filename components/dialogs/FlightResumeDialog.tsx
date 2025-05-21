import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  ArrowRightIcon,
  FileTextIcon,
  MapPinIcon,
  PlaneIcon,
  PlaneLanding,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Flight } from "@/types";

const FlightResumeDialog = ({ flight }: { flight: Flight }) => {
  const [openFlight, setOpenFlight] = useState(false);
  
  return (
    <Dialog open={openFlight} onOpenChange={setOpenFlight}>
      <DialogTrigger>{flight.flight_number}</DialogTrigger>
      <DialogContent className="sm:max-w-xl rounded-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <PlaneIcon className="h-5 w-5 text-primary" />
                Vuelo # {flight.flight_number}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {format(flight.date, "PPP", { locale: es })}
              </DialogDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {flight.type}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Sección de Información Principal */}
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Cliente
              </h3>
              <p className="font-semibold">{flight.client.name}</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                Ruta
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Origen</p>
                  <p className="font-semibold">{flight.route.from}</p>
                </div>
                <ArrowRightIcon className="h-4 w-4 mx-4" />
                <div>
                  <p className="text-sm text-muted-foreground">Destino</p>
                  <p className="font-semibold">{flight.route.to}</p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <PlaneLanding className="h-4 w-4" />
                Aeronave
              </h3>
              <p className="font-semibold">{flight.aircraft.acronym}</p>
            </div>
          </div>

          {/* Sección Financiera */}
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Detalles Financieros</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Tarifa:</span>
                  <span className="font-medium">{flight.fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Costo Total:</span>
                  <span className="font-bold">{flight.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pagado:</span>
                  <span
                    className={cn(
                      "font-medium",
                      flight.payed_amount === flight.total_amount
                        ? "text-green-600"
                        : "text-yellow-600"
                    )}
                  >
                    {flight.payed_amount}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm">Estado:</span>
                  <Badge
                    variant={
                      flight.debt_status === "PAGADO"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {flight.debt_status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />
                Observaciones
              </h3>
              <p className="text-sm">{flight.details || "Sin observaciones"}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => setOpenFlight(false)}
            className="w-full"
            variant="outline"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlightResumeDialog;
