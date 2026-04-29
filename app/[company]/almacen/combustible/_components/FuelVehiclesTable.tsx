"use client";

import { useUpdateFuelVehicleStatus } from "@/actions/mantenimiento/almacen/combustible/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatLiters,
  getFuelStatusLabel,
  getFuelVehicleTypeLabel,
} from "@/lib/fuel";
import { FuelVehicle } from "@/types";
import { Loader2, Power, PowerOff } from "lucide-react";

export function FuelVehiclesTable({
  company,
  vehicles,
}: {
  company?: string;
  vehicles: FuelVehicle[];
}) {
  const updateStatus = useUpdateFuelVehicleStatus(company);

  const toggleStatus = (vehicle: FuelVehicle) => {
    updateStatus.mutate(vehicle.id);
  };

  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead className="text-right">Capacidad</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Accion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length ? (
            vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-semibold">{vehicle.plate}</TableCell>
                <TableCell>{getFuelVehicleTypeLabel(vehicle.type)}</TableCell>
                <TableCell className="max-w-[220px] truncate">
                  {vehicle.responsible || "Sin responsable"}
                </TableCell>
                <TableCell className="text-right">
                  {formatLiters(vehicle.tank_capacity_liters)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatLiters(vehicle.current_balance_liters)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={vehicle.status === "active" ? "default" : "secondary"}
                  >
                    {getFuelStatusLabel(vehicle.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => toggleStatus(vehicle)}
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : vehicle.status === "active" ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                    {vehicle.status === "active" ? "Inactivar" : "Activar"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No hay vehiculos registrados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
