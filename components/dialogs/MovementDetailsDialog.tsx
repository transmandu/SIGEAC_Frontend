import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { CashMovement } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

const MovementDetailsDialog = ({ movement }: { movement: CashMovement }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size={"sm"}
          className="text-xs hover:scale-110 transition-all ease-in duration-100"
        >
          Ver Detalles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Detalle de la cuenta</DialogTitle>
          <DialogDescription>
            Aqui se refleja el movimiento detallado.
          </DialogDescription>
        </DialogHeader>
        {movement.cash_movement_details.length > 0 ? (
          movement.cash_movement_details.map((detail) => (
            <Card key={detail.id}>
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  {detail.accountant.name} - {detail.category.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-around items-center">
                <p className="font-medium">{detail.details}</p>
                <Badge
                  className={cn(
                    "font-bold",
                    movement.type === "INCOME"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  )}
                >
                  Monto: ${Number(detail.amount).toFixed(2)}
                </Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          <span className="text-muted-foreground text-xs italic">
            No existen detalles para este movimiento...
          </span>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MovementDetailsDialog;
