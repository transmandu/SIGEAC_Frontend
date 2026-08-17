"use client";

import { FuelMovementDetailDialog } from "@/components/dialogs/mantenimiento/almacen/combustible/FuelMovementDetailDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatLiters, getFuelMovementLabel } from "@/lib/fuel";
import { FuelMovement, FuelVehicle } from "@/types";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Route } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DISPATCHES_PER_PAGE = 15;

export function FuelTraceabilityPanel({
  company,
  movements,
  vehicles = [],
}: {
  company?: string;
  movements: FuelMovement[];
  vehicles?: FuelVehicle[];
}) {
  const dispatches = movements.filter((movement) =>
    ["warehouse_dispatch_vehicle", "warehouse_dispatch_third_party"].includes(
      movement.type,
    ),
  );

  const [page, setPage] = useState(1);
  const lastPage = Math.max(1, Math.ceil(dispatches.length / DISPATCHES_PER_PAGE));

  // Si el listado de despachos cambia (filtros, refetch) y la pagina actual
  // queda fuera de rango, se vuelve a la primera.
  useEffect(() => {
    setPage((current) => Math.min(current, lastPage));
  }, [lastPage]);

  const paginatedDispatches = dispatches.slice(
    (page - 1) * DISPATCHES_PER_PAGE,
    page * DISPATCHES_PER_PAGE,
  );

  // El vehiculo anidado en el movimiento puede venir sin brand/model/color;
  // se completa con el listado ya cargado en la pagina.
  const vehiclesById = useMemo(
    () => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Route className="h-4 w-4 text-primary/70" />
        <div>
          <p className="text-sm font-semibold">Despachos trazables</p>
          <p className="text-xs text-muted-foreground">
            Abre un despacho para consultar las entradas FIFO consumidas.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead className="text-right">Litros</TableHead>
              <TableHead className="text-right">Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDispatches.length ? (
              paginatedDispatches.map((movement) => {
                const vehicle = movement.vehicle
                  ? vehiclesById.get(movement.vehicle.id) ?? movement.vehicle
                  : null;
                return (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">
                    {format(movement.operational_date, "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{getFuelMovementLabel(movement.type)}</TableCell>
                  <TableCell>
                    {vehicle ? (
                      <div className="flex flex-col">
                        <span>{vehicle.plate || "Sin placa"}</span>
                        {(vehicle.brand || vehicle.model || vehicle.color) && (
                          <span className="text-xs text-muted-foreground">
                            {[vehicle.brand, vehicle.model, vehicle.color]
                              .filter(Boolean)
                              .join(" ")}
                          </span>
                        )}
                      </div>
                    ) : (
                      movement.third_party?.name || "Sin destino"
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatLiters(movement.liters)}
                  </TableCell>
                  <TableCell className="text-right">
                    <FuelMovementDetailDialog
                      company={company}
                      movement={movement}
                    />
                  </TableCell>
                </TableRow>
                );
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-36">
                  <div className="flex flex-col items-center justify-center gap-1 text-center">
                    <Route className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Sin despachos trazables
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Los despachos a vehiculos o terceros apareceran aqui con
                      su detalle FIFO.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {dispatches.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {(page - 1) * DISPATCHES_PER_PAGE + 1}-
            {Math.min(page * DISPATCHES_PER_PAGE, dispatches.length)} de{" "}
            {dispatches.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </Button>
            <span className="px-1 tabular-nums">
              Pagina {page} de {lastPage}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2"
              onClick={() => setPage((current) => Math.min(lastPage, current + 1))}
              disabled={page >= lastPage}
            >
              Siguiente
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
