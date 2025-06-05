import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Client } from "@/types";

const ClientResumeDialog = ({ client }: { client: Client }) => {
  const [openClient, setOpenClient] = useState(false);

  return (
    <Dialog open={openClient} onOpenChange={setOpenClient}>
      <DialogTrigger>{client.name}</DialogTrigger>
      <DialogContent className="sm:max-w-md"
          onInteractOutside={(e) => {
          e.preventDefault();
        }}>
        <DialogHeader className="text-center font-bold">
          Resumen del Cliente
        </DialogHeader>
        <Card className="border-none shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {client.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{client.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{client.dni_type}-{client.dni}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Teléfono
                </h3>
                <p className="font-medium">
                  {client.phone || "No especificado"}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Días Crédito
                </h3>
                <p className="font-medium">
                  {client.pay_credit_days || "0"} días
                </p>
              </div>

              <div className="space-y-1 col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Dirección
                </h3>
                <p className="font-medium">
                  {client.address || "No especificada"}
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Saldo Actual</span>
                  <span
                    className={`font-bold text-2xl ${
                      client.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {client.balance >= 0 ? "+" : "-"} ${" "}
                    {Math.abs(client.balance).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {client.balance < 0 && (
              <Badge variant="destructive" className="w-fit">
                Cliente con deuda
              </Badge>
            )}
          </CardContent>
        </Card>

        <DialogFooter className="sm:justify-start">
          <Button
            onClick={() => setOpenClient(false)}
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

export default ClientResumeDialog;
