"use client";

import { formatPhone } from "@/lib/phone";
import { CargoShipment } from "@/types";
import { format, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Calendar, User, Plane, Package } from "lucide-react";

/**
 * Cuerpo de solo lectura del detalle de una guía de carga.
 *
 * Presentacional a propósito: recibe el shipment ya resuelto y no conoce
 * layouts, guardas ni tours, para poder reusarse tanto en la vista del
 * personal de carga como en la vista de solo lectura de Administración.
 */
export function CargoShipmentDetail({ shipment }: { shipment: CargoShipment }) {
  const totalUnits = shipment.items.reduce(
    (acc, curr) => acc + Number(curr.units),
    0,
  );
  const registrationDate = shipment.registration_date
    ? parseISO(shipment.registration_date)
    : null;
  const totalWeight = shipment.items.reduce(
    (acc, curr) => acc + Number(curr.weight),
    0,
  );

  return (
    <>
      {/* Sección de Tarjetas de Información */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta 1: Detalles Generales */}
        <Card className="shadow-xs" data-tour="cargo-detalle-card-generales">
          <CardHeader className="pb-3 border-b bg-muted/10">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Datos Generales
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Fecha de Registro
              </p>
              <p className="font-medium text-sm">
                {registrationDate && isValid(registrationDate)
                  ? format(registrationDate, "dd 'de' MMMM, yyyy", {
                      locale: es,
                    })
                  : "—"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Emisor
                </p>
                <p className="font-medium text-sm uppercase">
                  {shipment.issuer_user
                    ? `${shipment.issuer_user.first_name} ${shipment.issuer_user.last_name}`
                    : shipment.issuer}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Transportista
                </p>
                <p className="font-medium text-sm">
                  {shipment.carrier
                    ? `${shipment.carrier.name} ${shipment.carrier.last_name}`
                    : "Sin asignar"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta 2: Cliente */}
        <Card className="shadow-xs" data-tour="cargo-detalle-card-cliente">
          <CardHeader className="pb-3 border-b bg-muted/10">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-green-500" />
              Remitente / Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Nombre / Razón Social
              </p>
              <p className="font-medium text-sm">
                {shipment.client?.name || "Sin registrar"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Correo
                </p>
                <p className="text-sm truncate" title={shipment.client?.email}>
                  {shipment.client?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Teléfono
                </p>
                <p className="text-sm">
                  {formatPhone(shipment.client?.phone) || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta 3: Logística / Vuelo */}
        <Card className="shadow-xs" data-tour="cargo-detalle-card-vuelo">
          <CardHeader className="pb-3 border-b bg-muted/10">
            <CardTitle className="text-base flex items-center gap-2">
              <Plane className="h-4 w-4 text-orange-500" />
              Detalles del Vuelo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Aeronave Asignada
              </p>
              <p className="font-medium text-sm">
                {shipment.aircraft
                  ? `${shipment.aircraft.acronym} / ${shipment.aircraft.model}`
                  : shipment.external_aircraft
                    ? `${shipment.external_aircraft} (Externa)`
                    : "Sin Aeronave"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Piloto
                </p>
                <p className="text-sm">
                  {shipment.pilot?.employee
                    ? `${shipment.pilot.employee.first_name} ${shipment.pilot.employee.last_name}`
                    : "No disponible"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Copiloto
                </p>
                <p className="text-sm">
                  {shipment.copilot?.employee
                    ? `${shipment.copilot.employee.first_name} ${shipment.copilot.employee.last_name}`
                    : "No aplica"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Manifiesto de Carga (Items) */}
      <Card className="shadow-xs mt-4" data-tour="cargo-detalle-manifiesto">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-500" />
            Manifiesto de Mercancía
          </CardTitle>
          <CardDescription>
            Listado detallado de los productos incluídos en la guía.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-center">N°</TableHead>
                <TableHead className="text-center">
                  Descripción del Producto
                </TableHead>
                <TableHead className="text-center">Unidades / Piezas</TableHead>
                <TableHead className="text-center pr-6">Peso (Kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipment.items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-center">
                    {item.product_description}
                  </TableCell>
                  <TableCell className="text-center">{item.units}</TableCell>
                  <TableCell className="text-center font-semibold pr-6">
                    {item.weight} kg
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-muted/50 font-bold border-t">
              <TableRow>
                <TableCell className="text-center" />
                <TableCell className="text-center uppercase">
                  Total Declarado
                </TableCell>
                <TableCell className="text-center text-base text-primary">
                  {totalUnits}
                </TableCell>
                <TableCell className="text-center text-base text-primary pr-6">
                  {totalWeight.toFixed(2)} kg
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
