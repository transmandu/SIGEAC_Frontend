"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams } from "next/navigation";
import { useGetCargoShipmentById } from "@/hooks/operaciones/cargo/useGetCargoShipmentById";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import {
  FileText,
  Loader2,
  ArrowLeft,
  Calendar,
  User,
  Plane,
  Package,
} from "lucide-react";

export default function CargoDetailsPage() {
  const params = useParams();
  const company = params.company as string;
  const id = params.id as string;

  const {
    data: shipment,
    isLoading,
    isError,
  } = useGetCargoShipmentById(company, id);

  if (isLoading) {
    return (
      <ContentLayout title="Detalles de carga">
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin size-12 text-primary" />
        </div>
      </ContentLayout>
    );
  }

  if (isError || !shipment) {
    return (
      <ContentLayout title="Error">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-xl text-red-500 font-semibold">
            No se pudo encontrar el registro de carga especificado.
          </p>
          <Button asChild variant="outline">
            <Link href={`/${company}/operaciones/cargo`}>
              Volver al listado
            </Link>
          </Button>
        </div>
      </ContentLayout>
    );
  }

  const totalUnits = shipment.items.reduce(
    (acc, curr) => acc + Number(curr.units),
    0,
  );
  const totalWeight = shipment.items.reduce(
    (acc, curr) => acc + Number(curr.weight),
    0,
  );

  return (
    <ContentLayout title="Detalles de la Carga">
      <div className="flex flex-col gap-6 p-1 max-w-6xl mx-auto w-full pb-10">
        {/* Cabecera de Acciones Rápidas */}
        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="h-9 w-9">
              <Link
                href={
                  shipment.aircraft
                    ? `/${company}/operaciones/cargo/${shipment.aircraft.id}?month=${shipment.month}&year=${shipment.year}`
                    : `/${company}/operaciones/cargo/externa/${encodeURIComponent(shipment.external_aircraft || "")}?month=${shipment.month}&year=${shipment.year}`
                }
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Guía N°{" "}
                <span className="text-primary">{shipment.guide_number}</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Sección de Tarjetas de Información */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta 1: Detalles Generales */}
          <Card className="shadow-sm">
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
                  {format(
                    new Date(shipment.registration_date + "T00:00:00"),
                    "dd 'de' MMMM, yyyy",
                    { locale: es },
                  )}
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
          <Card className="shadow-sm">
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
                  <p
                    className="text-sm truncate"
                    title={shipment.client?.email}
                  >
                    {shipment.client?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Teléfono
                  </p>
                  <p className="text-sm">{shipment.client?.phone || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta 3: Logística / Vuelo */}
          <Card className="shadow-sm">
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
        <Card className="shadow-sm mt-4">
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
                  <TableHead className="text-center">
                    Unidades / Piezas
                  </TableHead>
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
      </div>
    </ContentLayout>
  );
}
