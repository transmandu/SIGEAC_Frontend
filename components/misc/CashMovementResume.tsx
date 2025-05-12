import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CashMovement } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";

type MovementTypeBadgeProps = {
  type: string;
};

const MovementTypeBadge = ({ type }: MovementTypeBadgeProps) => {
  const isIncome = type === "INCOME";
  return (
    <Badge
      className={`text-sm py-1 px-3 ${
        isIncome
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
        <CardTitle className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">Movimiento de caja</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {format(movement.date, "PPP", { locale: es })}
            </p>
          </div>
          <MovementTypeBadge type={movement.type} />
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Caja</h3>
            <p className="font-medium">{movement.cash.name}</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              Cuenta
            </h3>
            <p className="font-medium">{movement.accountant.name}</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              Categoría
            </h3>
            <p className="font-medium">{movement.category.name}</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              Detalles
            </h3>
            <p className="font-medium">{movement.details}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Responsable
            </h3>
            <p className="font-medium">{movement.employee_responsible.first_name}</p>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">
            {movement.bank_account ? "Cuenta de Banco" : ""}
          </h3>
          <p className="font-medium">
            {movement.bank_account ? movement.bank_account.name : "Efectivo"}
          </p>
        </div>

        <Card className="bg-primary/5 mt-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Monto Total</span>
              <span
                className={`font-bold text-2xl ${
                  movement.type === "INCOME" ? "text-green-600" : "text-red-600"
                }`}
              >
                $ {movement.total_amount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default CashMovementResume;
