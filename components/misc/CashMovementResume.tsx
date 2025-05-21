import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CashMovement } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

type MovementTypeBadgeProps = {
  type: string;
};

const MovementTypeBadge = ({ type }: MovementTypeBadgeProps) => {
  const isIncome = type === "INCOME";
  return (
    <Badge
      className={`text-xs ${isIncome
        ? "bg-green-600 hover:bg-green-700"
        : "bg-red-600 hover:bg-red-700"
        }`}
    >
      {type}
    </Badge>
  );
};

const CashMovementResume = ({ movement }: { movement: CashMovement }) => {
  const userInitials = movement.employee_responsible.first_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-center items-start">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-semibold">Movimiento de Caja</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {format(movement.date, "PPP", { locale: es })}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                {movement.employee_responsible.first_name} <br />
                {movement.employee_responsible.last_name}</p>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          <div className="space-y-1 flex flex-col items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Caja</h3>
            <p className="font-medium">{movement.cash.name}</p>
          </div>
          <div className="space-y-1 flex flex-col items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Tipo de Mov.</h3>
            <Badge className={cn("font-bold", movement.type === "INCOME" ? "bg-green-500" : "bg-red-500")}>{movement.type === "INCOME" ? "INGRESO" : "EGRESO"}</Badge>
          </div>
          <div className="space-y-1 flex flex-col items-center">
            <h3 className="text-sm font-medium text-muted-foreground">
              {movement.bank_account ? "Cuenta de Banco" : "Tipo de Pago"}
            </h3>
            <p className="font-medium">
              {movement.bank_account ? movement.bank_account.name : "Efectivo"}
            </p>
          </div>
          <div className="space-y-1 flex flex-col items-center col-span-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Detalles
            </h3>
            <p className="font-medium">{movement.details}</p>
            <h3 className="text-sm font-medium text-muted-foreground">
              Referencia
            </h3>
            <p className="font-medium">{movement.reference_cod}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-base font-medium text-muted-foreground">
            Detalles del Movimiento - <span className={cn("font-bold", movement.type === "INCOME" ? "text-green-500" : "text-red-500")}>${movement.total_amount}</span>
          </h3>
          <Separator />
          <div className="flex flex-col gap-4">
            {
              movement.cash_movement_details.length > 0 ? movement.cash_movement_details.map((detail) => (
                <Card key={detail.id}>
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">
                      {detail.accountant.name} - {detail.category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-around items-center">
                    <p className="font-medium">
                      {detail.details}
                    </p>
                    <Badge className={cn("font-bold", movement.type === "INCOME" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600")}>Monto: ${detail.amount}</Badge>
                  </CardContent>
                </Card>
              )) : <span className="text-muted-foreground text-xs italic">No existen detalles para este movimiento...</span>
            }
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default CashMovementResume;
