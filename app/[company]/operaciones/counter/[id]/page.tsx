"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  usePaxFlight,
  useMarkInFlight,
  useFinalizeFlight,
  downloadPaxFlightPdf,
} from "@/actions/counter/actions";
import { useAuth } from "@/contexts/AuthContext";
import { PdfEndpointPreviewDialog } from "@/components/dialogs/shared/PdfEndpointPreviewDialog";
import { PassengerSummaryCard } from "@/components/forms/operaciones/counter/PassengerSummaryCard";
import {
  Loader2,
  FileDown,
  Eye,
  Edit,
  ArrowLeft,
  Plane,
  Package,
  Layers,
  Calendar,
  UserCheck,
  Clock,
  Send,
  CheckCircle2,
} from "lucide-react";

const PaxFlightDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const id = Number(params.id);
  const { user } = useAuth();

  const { data: flight, isLoading, isError } = usePaxFlight(company, id);
  const markInFlightMutation = useMarkInFlight(company);
  const finalizeMutation = useFinalizeFlight(company);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const userRoles = user?.roles?.map((r) => r.name) || [];
  const canWrite = userRoles.some((r) =>
    ["OPERADOR_COUNTER", "OPERADOR_CARGA", "SUPERUSER"].includes(r),
  );
  const isCounter = userRoles.some((r) =>
    ["OPERADOR_COUNTER", "SUPERUSER"].includes(r),
  );

  if (isLoading) {
    return (
      <ContentLayout title="Detalle del Manifiesto">
        <div className="flex justify-center items-center py-24">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </ContentLayout>
    );
  }

  if (isError || !flight) {
    return (
      <ContentLayout title="Detalle del Manifiesto">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No se pudo cargar el manifiesto de vuelo.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push(`/${company}/operaciones/counter`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver al listado
          </Button>
        </div>
      </ContentLayout>
    );
  }

  const handleDownload = () => {
    downloadPaxFlightPdf(company, flight.id, flight.flight_code);
  };

  return (
    <ContentLayout title={`Vuelo ${flight.flight_code}`}>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
        <PageHeader className="mb-2" />

        {/* Cabecera y acciones */}
        <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push(`/${company}/operaciones/counter`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold font-mono tracking-tight text-primary">
                  {flight.flight_code}
                </h1>
                {flight.flight_type === "PAX" && (
                  <Badge className="bg-sky-500/10 text-sky-600 border-sky-300">
                    <Plane className="h-3 w-3 mr-1" /> Pasajeros (PAX)
                  </Badge>
                )}
                {flight.flight_type === "CARGO_ONLY" && (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-300">
                    <Package className="h-3 w-3 mr-1" /> Solo Carga
                  </Badge>
                )}
                {flight.flight_type === "HYBRID" && (
                  <Badge className="bg-purple-500/10 text-purple-600 border-purple-300">
                    <Layers className="h-3 w-3 mr-1" /> Híbrido
                  </Badge>
                )}
                {flight.status === "BORRADOR" && (
                  <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-300 dark:border-yellow-800">
                    <Clock className="h-3 w-3 mr-1" /> Borrador
                  </Badge>
                )}
                {flight.status === "EN_VUELO" && (
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-300 dark:border-blue-800">
                    <Send className="h-3 w-3 mr-1" /> En Vuelo
                  </Badge>
                )}
                {flight.status === "FINALIZADO" && (
                  <Badge className="bg-green-500/10 text-green-700 border-green-300 dark:border-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Finalizado
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Emitido por {flight.created_by}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canWrite && flight.status === "BORRADOR" && (
              <Button
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => markInFlightMutation.mutate(flight.id)}
                disabled={markInFlightMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" /> Marcar En Vuelo
              </Button>
            )}

            {canWrite && flight.status === "EN_VUELO" && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => finalizeMutation.mutate(flight.id)}
                disabled={finalizeMutation.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Finalizar Manifiesto
              </Button>
            )}

            {/* Previsualizar PDF en modal sin descargar */}
            <Button
              variant="outline"
              onClick={() => setIsPreviewOpen(true)}
              title="Previsualizar el manifiesto de vuelo en pantalla"
            >
              <Eye className="h-4 w-4 mr-2" /> Previsualizar PDF
            </Button>

            {flight.status === "FINALIZADO" && (
              <Button variant="outline" onClick={handleDownload}>
                <FileDown className="h-4 w-4 mr-2" /> Descargar PDF
              </Button>
            )}

            {canWrite && flight.status === "BORRADOR" && (
              <Button
                onClick={() =>
                  router.push(
                    `/${company}/operaciones/counter/${flight.id}/update`,
                  )
                }
              >
                <Edit className="h-4 w-4 mr-2" /> Editar Vuelo
              </Button>
            )}
          </div>
        </div>

        {/* Información Técnica */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Fecha del Vuelo
              </CardDescription>
              <CardTitle className="text-lg">{flight.flight_date}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ruta</CardDescription>
              <CardTitle className="text-lg font-mono">
                {flight.route}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Aeronave</CardDescription>
              <CardTitle className="text-lg font-semibold">
                {flight.aircraft_label}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {flight.aircraft_model}
              </span>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <UserCheck className="h-4 w-4" /> Tripulación
              </CardDescription>
              <div className="text-xs flex flex-col gap-0.5 mt-1">
                <div>
                  <span className="font-semibold">CAP:</span>{" "}
                  {flight.captain_label}
                </div>
                <div>
                  <span className="font-semibold">F/O:</span>{" "}
                  {flight.first_officer_label}
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Carga Asociada */}
        {flight.cargo_manifest_id && (
          <Card className="border-amber-200 dark:border-amber-900 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Package className="h-4 w-4" /> Manifiesto de Carga Asociado:{" "}
                {flight.cargo_manifest_number}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flight.cargo_breakdown &&
              Object.keys(flight.cargo_breakdown).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                  {Object.entries(flight.cargo_breakdown).map(
                    ([client, weight]) => (
                      <div
                        key={client}
                        className="bg-background/80 p-2 rounded border flex justify-between"
                      >
                        <span className="font-semibold">{client}</span>
                        <span className="font-mono text-muted-foreground">
                          {weight} KG
                        </span>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Sin desglose registrado.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pasajeros */}
        {flight.flight_type !== "CARGO_ONLY" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plane className="h-4 w-4 text-sky-500" /> Lista de Pasajeros
                Registrados ({flight.passengers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Móvil: ficha de solo lectura por pasajero. */}
              <div className="flex flex-col gap-3 md:hidden">
                {flight.passengers.length === 0 ? (
                  <p className="text-sm italic text-muted-foreground">
                    Sin pasajeros registrados.
                  </p>
                ) : (
                  flight.passengers.map((pax) => (
                    <PassengerSummaryCard
                      key={pax.id ?? pax.seat_number}
                      pax={pax}
                      isCounter={isCounter}
                    />
                  ))
                )}
              </div>

              {/* Tablet / escritorio: tabla original con soporte para Counter */}
              <div className="hidden rounded-md border overflow-x-auto md:block">
                <table
                  className={`w-full text-sm ${isCounter ? "min-w-[1250px]" : "min-w-[850px]"}`}
                >
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12 font-semibold whitespace-nowrap">
                        #
                      </th>
                      <th className="py-2.5 px-3 text-left font-semibold whitespace-nowrap">
                        Nombre Completo
                      </th>
                      <th className="py-2.5 px-3 text-center w-36 font-semibold whitespace-nowrap">
                        Nacionalidad
                      </th>
                      <th className="py-2.5 px-3 text-center w-36 font-semibold whitespace-nowrap">
                        Cédula / ID
                      </th>
                      {isCounter && (
                        <>
                          <th className="py-2.5 px-3 text-center w-32 font-semibold whitespace-nowrap">
                            Luggage
                          </th>
                          <th className="py-2.5 px-3 text-center w-24 font-semibold whitespace-nowrap">
                            W (Kg)
                          </th>
                        </>
                      )}
                      <th className="py-2.5 px-3 text-center w-32 font-semibold whitespace-nowrap">
                        Tipo
                      </th>
                      <th className="py-2.5 px-3 text-left w-48 font-semibold whitespace-nowrap">
                        Agencia
                      </th>
                      {isCounter && (
                        <>
                          <th className="py-2.5 px-3 text-center w-28 font-semibold whitespace-nowrap">
                            FP
                          </th>
                          <th className="py-2.5 px-3 text-center w-28 font-semibold whitespace-nowrap">
                            Monto
                          </th>
                          <th className="py-2.5 px-3 text-center w-20 font-semibold whitespace-nowrap">
                            Return
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {flight.passengers.map((pax) => (
                      <tr key={pax.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">
                          {pax.seat_number}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">
                          {pax.full_name}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {pax.nationality}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {pax.id_number}
                        </td>
                        {isCounter && (
                          <>
                            <td className="py-2.5 px-3 text-center uppercase font-medium">
                              {pax.luggage_weight || "—"}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono">
                              {pax.body_weight != null
                                ? `${pax.body_weight} kg`
                                : "—"}
                            </td>
                          </>
                        )}
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant="outline" className="text-xs">
                            {pax.lodge_type}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {pax.agency || "—"}
                        </td>
                        {isCounter && (
                          <>
                            <td className="py-2.5 px-3 text-center font-mono">
                              {pax.payment_method || "—"}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-medium">
                              {pax.amount_paid != null
                                ? `$${Number(pax.amount_paid).toFixed(2)}`
                                : "—"}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {pax.return_flight ? (
                                <Badge className="bg-sky-500/10 text-sky-600 border-sky-300 text-xs">
                                  SÍ
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  NO
                                </span>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="py-8 text-center text-muted-foreground">
              <p className="font-semibold text-foreground">
                Vuelo sin pasajeros registrados (SOLO CARGA)
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {flight && (
        <PdfEndpointPreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          endpoint={`/${company}/pax-flights/${flight.id}/pdf`}
          fileName={`MANIFIESTO_PAX_${flight.flight_code}`}
          title={`Vista Previa — Manifiesto de Vuelo ${flight.flight_code}`}
          description="Previsualización en tiempo real del manifiesto de pasajeros y carga generado por el sistema."
        />
      )}
    </ContentLayout>
  );
};

export default PaxFlightDetailPage;
