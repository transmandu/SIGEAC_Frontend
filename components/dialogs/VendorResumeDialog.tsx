import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogTrigger, } from "../ui/dialog";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { AdministrationVendor } from "@/types";

const VendorResumeDialog = ({ vendor }: { vendor: AdministrationVendor }) => {
  const [openVendor, setOpenVendor] = useState(false);

  return (
    <Dialog open={openVendor} onOpenChange={setOpenVendor}>
      <DialogTrigger>{vendor.name}</DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className="relative">
          {/* Header con gradiente según tipo */}
          <div
            className={`p-6 text-white rounded-t-lg ${
              vendor.type === "PROVEEDOR"
                ? "bg-gradient-to-r from-blue-600 to-blue-500"
                : "bg-gradient-to-r from-green-600 to-green-500"
            }`}
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-white">
                <AvatarFallback
                  className={`font-semibold ${
                    vendor.type === "PROVEEDOR"
                      ? "bg-white text-blue-600"
                      : "bg-white text-green-600"
                  }`}
                >
                  {vendor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{vendor.name}</h2>
                <Badge
                  className={`mt-1 text-white ${
                    vendor.type === "PROVEEDOR"
                      ? "bg-blue-700 hover:bg-blue-800"
                      : "bg-green-700 hover:bg-green-800"
                  }`}
                >
                  {vendor.type === "PROVEEDOR" ? "PROVEEDOR" : "BENEFICIARIO"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-6 grid gap-6">
            {/* Grid de información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1 ">
                  Email
                </h3>
                <p className="font-medium">
                  {vendor.email || "No especificado"}
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Teléfono
                </h3>
                <p className="font-medium">
                  {vendor.phone || "No especificado"}
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Dirección
                </h3>
                <p className="font-medium">
                  {vendor.address || "No especificada"}
                </p>
              </div>
            </div>

            {/* Sección de información adicional */}
            <Card
              className={`${
                vendor.type === "PROVEEDOR"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-green-50 border-green-200"
              }`}
            ></Card>
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button
              onClick={() => setOpenVendor(false)}
              variant="outline"
              className="w-full"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </div>
        
      </DialogContent>
    </Dialog>
  );
};

export default VendorResumeDialog;
