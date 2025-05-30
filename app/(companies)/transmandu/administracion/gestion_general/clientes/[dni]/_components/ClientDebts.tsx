"use client"

import { useParams, useRouter } from "next/navigation"
import { useMemo, } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, DollarSign, Plane, AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useGetFlightsByClient } from "@/hooks/general/clientes/useGetFlightByClients"
import { SummaryCard } from "@/components/cards/SummaryCard"
import { useGetClientByDni } from "@/hooks/general/clientes/useGetClientByDni"

const ClientDebts = () => {
  const params = useParams()
  const dni = params.dni as string
  const router = useRouter()
  const { data: clientDetails, isLoading, error } = useGetClientByDni(dni)
  const { data: clientStats, isLoading: isLoadingFlights } = useGetFlightsByClient(dni)
  const allDebtFlights = useMemo(() => {
    if (!clientStats?.total_debt_flights) return []
    // Ordenar los vuelos por fecha (más recientes primero)
    return [...clientStats.total_debt_flights].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [clientStats])

  const totalDebt = clientStats?.statistics?.total_debt || 0
  const totalFlights = allDebtFlights.length || 0
  const averageDebtPerFlight = totalFlights > 0 ? totalDebt / totalFlights : 0

  if (isLoading || isLoadingFlights) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !clientDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">Error al cargar los datos del cliente</p>
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
      <div className="space-y-3 mb-6">
        <h1 className="text-3xl font-bold text-center">Reporte de Deudas</h1>
        <p className="text-2xl text-muted-foreground text-center font-medium">{clientDetails?.name}</p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Deuda Total Acumulada"
          value={formatCurrency(totalDebt)}
          description="Deuda total del cliente"
          icon={<DollarSign className="h-5 w-5 text-red-700" />}
        />
        <SummaryCard
          title="Vuelos con Deuda"
          value={totalFlights.toString()}
          description="Número de vuelos con pagos pendientes"
          icon={<Plane className="h-5 w-5 text-amber-500" />}
        />
        <SummaryCard
          title="Deuda Promedio"
          value={formatCurrency(averageDebtPerFlight)}
          description="Deuda promedio por vuelo"
          icon={<AlertCircle className="h-5 w-5 text-purple-500" />}
        />
      </div>

      {/* Tabla de todos los vuelos con deuda */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="bg-muted/30 py-4">
          <div className="flex items-center justify-between">
            <CardTitle>Detalle de Vuelos con Pagos Pendientes</CardTitle>
            <Badge variant="destructive" className="text-sm py-1.5 px-3">
              {allDebtFlights.length} vuelos
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {allDebtFlights.length > 0 ? (
            <div className="rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Nº Vuelo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Aeronave</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Monto Total</TableHead>
                    <TableHead>Deuda Pendiente</TableHead>
                    <TableHead>Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDebtFlights.map((flight) => (
                    <TableRow key={flight.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{flight.flight_number}</TableCell>
                      <TableCell>{formatDate(flight.date)}</TableCell>
                      <TableCell>{flight.route ? `${flight.route.from} → ${flight.route.to}` : "-"}</TableCell>
                      <TableCell>{flight.aircraft?.acronym || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            flight.type === "PAX"
                              ? "bg-blue-100 text-blue-800"
                              : flight.type === "CHART"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-amber-100 text-amber-800"
                          }
                        >
                          {flight.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(Number(flight.total_amount))}</TableCell>
                      <TableCell>{formatCurrency(Number(flight.debt))}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={flight.details}>
                        {flight.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay vuelos con deuda registrados para este cliente.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default ClientDebts
