"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams } from "next/navigation";
import { useGetCargoManifestById } from "@/hooks/operaciones/cargo/useGetCargoManifestById";
import { useReprintCargoManifest } from "@/actions/cargo/manifestActions";
import { format, parseISO, isValid } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FileText,
  Loader2,
  ArrowLeft,
  Printer,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import { useState } from "react";

export default function ManifestDetailPage() {
  const params = useParams();
  const company = params.company as string;
  const id = params.id as string;

  const {
    data: manifest,
    isLoading,
    isError,
  } = useGetCargoManifestById(company, id);
  const { reprintCargoManifest } = useReprintCargoManifest(company);

  if (isLoading) {
    return (
      <ContentLayout title="Detalle de Manifiesto">
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin size-12 text-primary" />
        </div>
      </ContentLayout>
    );
  }

  if (isError || !manifest) {
    return (
      <ContentLayout title="Error">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-xl text-red-500 font-semibold">
            No se pudo encontrar el manifiesto especificado.
          </p>
          <Button asChild variant="outline">
            <Link href={`/${company}/operaciones/cargo/manifiestos`}>
              Volver
            </Link>
          </Button>
        </div>
      </ContentLayout>
    );
  }

  const totalWeight = manifest.items.reduce(
    (acc, i) => acc + Number(i.weight_in_manifest),
    0,
  );
  const totalUnits = manifest.items.reduce(
    (acc, i) => acc + Number(i.units_in_manifest),
    0,
  );

  const aircraftLabel =
    (manifest as any).aircraft?.acronym ??
    (manifest as any).external_aircraft ??
    "Varias";

  return (
    <ContentLayout title="Detalle del Manifiesto">
      <div className="flex flex-col gap-6 p-1 max-w-6xl mx-auto w-full pb-10">
        {/* Header */}
        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="h-9 w-9">
              <Link
                href={`/${company}/operaciones/cargo/manifiestos?month=${manifest.month}&year=${manifest.year}`}
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Manifiesto
                </p>
                <p className="text-lg font-bold text-primary">
                  {manifest.manifest_number}
                </p>
              </div>
              <div className="border-l border-border pl-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Aeronave
                </p>
                <p className="text-lg font-semibold">{aircraftLabel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" /> Datos Generales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Mes / Año
                  </p>
                  <p className="font-medium text-sm">
                    {manifest.month}/{manifest.year}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Nº Manifiesto
                  </p>
                  <p className="font-medium text-sm">
                    {manifest.manifest_number}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" /> Información del
                manifiesto
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Creado por
                  </p>
                  <p className="font-medium text-sm">
                    {manifest.created_by || "Desconocido"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Actualizado por
                  </p>
                  <p className="font-medium text-sm">
                    {manifest.updated_by ? manifest.updated_by : "Sin cambios"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Última actualización
                  </p>
                  <p className="font-medium text-sm">
                    {manifest.updated_at &&
                    isValid(parseISO(manifest.updated_at))
                      ? format(parseISO(manifest.updated_at), "dd/MM/yyyy")
                      : "No registrada"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card className="shadow-sm mt-4">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg">
              Guías incluidas en el manifiesto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="text-center font-semibold">
                      Nº Guía
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Cliente
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Aeronave
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Peso total enviado
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Unidades enviadas
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(
                    manifest.items.reduce((acc: any, item: any) => {
                      const shipmentId = item.cargo_shipment_id;
                      if (!acc[shipmentId]) {
                        acc[shipmentId] = {
                          shipment: item.shipment,
                          total_weight: 0,
                          total_units: 0,
                          items: [],
                        };
                      }
                      acc[shipmentId].total_weight += Number(
                        item.weight_in_manifest,
                      );
                      acc[shipmentId].total_units += Number(
                        item.units_in_manifest,
                      );
                      acc[shipmentId].items.push(item);
                      return acc;
                    }, {}),
                  ).map((group: any, idx: number) => (
                    <ShipmentGroupRow key={idx} group={group} />
                  ))}
                </TableBody>
                <TableFooter className="bg-muted/50 font-bold border-t">
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center uppercase text-muted-foreground"
                    >
                      Total del Manifiesto
                    </TableCell>
                    <TableCell className="text-center text-primary text-base">
                      {totalWeight.toFixed(2)} kg
                    </TableCell>
                    <TableCell className="text-center text-primary text-base">
                      {totalUnits}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}

function ShipmentGroupRow({ group }: { group: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
      <>
        <TableRow
          className="cursor-pointer hover:bg-muted/10 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <TableCell>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </TableCell>
          <TableCell className="text-center font-semibold text-primary text-base">
            {group.shipment?.guide_number || "N/A"}
          </TableCell>
          <TableCell className="text-center">
            {group.shipment?.client?.name || "N/A"}
          </TableCell>
          <TableCell className="text-center">
            <span className="text-xs border rounded px-2 py-1 bg-muted/20">
              {group.shipment?.aircraft?.acronym ||
                group.shipment?.external_aircraft ||
                "N/A"}
            </span>
          </TableCell>
          <TableCell className="text-center font-medium">
            {group.total_weight.toFixed(2)} kg
          </TableCell>
          <TableCell className="text-center font-medium">
            {group.total_units}
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <TableRow className="bg-muted/5 border-b hover:bg-muted/5">
            <TableCell colSpan={6} className="p-0">
              <div className="px-14 py-4">
                <div className="rounded-lg border bg-background shadow-sm overflow-hidden">
                  <div className="bg-muted/40 px-4 py-2 border-b flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      Detalle de Productos
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-8 text-xs font-semibold">
                          Producto
                        </TableHead>
                        <TableHead className="h-8 text-center text-xs font-semibold w-32">
                          Peso
                        </TableHead>
                        <TableHead className="h-8 text-center text-xs font-semibold w-32">
                          Unidades
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.items.map((item: any) => (
                        <TableRow key={item.id} className="hover:bg-muted/20">
                          <TableCell className="py-2 text-sm">
                            {item.shipment_item?.product_description ||
                              item.shipmentItem?.product_description ||
                              `Ítem #${item.cargo_shipment_item_id}`}
                          </TableCell>
                          <TableCell className="py-2 text-center text-sm font-medium">
                            {Number(item.weight_in_manifest).toFixed(2)} kg
                          </TableCell>
                          <TableCell className="py-2 text-center text-sm">
                            {item.units_in_manifest}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
}
