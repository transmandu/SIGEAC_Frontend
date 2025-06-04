"use client";

import type React from "react";
import { useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  DollarSign,
  Plane,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useGetFlightsByClient } from "@/hooks/general/clientes/useGetFlightByClients";
import months from "@/components/cards/ConfigMonths";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { useGetClientByDni } from "@/hooks/general/clientes/useGetClientByDni";
import LoadingPage from "@/components/misc/LoadingPage";
import { useCompanyStore } from "@/stores/CompanyStore";

const getMonthByNumber = (number: string) => {
  return months.find((m) => m.number === number);
};

type MonthlyData = {
  name: string;
  shortName: string;
  montosPagados: number;
  costos: number;
  month: string;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: MonthlyData;
  }>;
  label?: string;
}

const ClientStatistics = () => {
  const params = useParams();
  const dni = params.dni as string;
  const router = useRouter();
  const {selectedCompany} = useCompanyStore();
  const { data: clientDetails, isLoading, error } = useGetClientByDni({dni, company: selectedCompany?.split(" ").join("") });
  const { data: clientStats, isLoading: isLoadingFlights } =
    useGetFlightsByClient({dni, company: selectedCompany?.split(" ").join("") });
  const availableYears = useMemo(() => {
    if (!clientStats?.statistics?.total_payed_annual) {
      return [new Date().getFullYear().toString()];
    }
    return Object.keys(clientStats.statistics.total_payed_annual).sort(
      (a, b) => Number.parseInt(b) - Number.parseInt(a)
    );
  }, [clientStats]);
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return availableYears[0] || new Date().getFullYear().toString();
  });
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [flightsData, setFlightsData] = useState<any[]>([]);

  // Procesar datos estadísticos cuando cambia el año seleccionado o los datos
  useEffect(() => {
    if (clientStats) {
      const yearNum = Number.parseInt(selectedYear);
      const monthlyPayed = clientStats.statistics.monthly_payed[yearNum] || {};
      const monthlyAmount =
        clientStats.statistics.monthly_amount[yearNum] || {};
      const processedData = months.map((month) => {
        // Busca los datos usando el nombre del mes en español
        const monthNameInSpanish = month.name;
        const monthPayed = monthlyPayed[monthNameInSpanish] || 0;
        const monthAmount = monthlyAmount[monthNameInSpanish] || 0;

        return {
          name: month.name,
          shortName: month.short,
          montosPagados: monthPayed,
          costos: monthAmount,
          month: month.number,
        };
      });

      setMonthlyData(processedData);
      setSelectedMonth(null);
      setFlightsData([]);
    }
  }, [selectedYear, clientStats]);

  // Manejar clic en una barra del gráfico
  const handleBarClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload) {
      const monthNumber = data.activePayload[0].payload.month;
      setSelectedMonth(monthNumber);

      // Encuentra el nombre del mes en español
      const monthObj = months.find((m) => m.number === monthNumber);
      const monthNameInSpanish = monthObj?.name || "";

      // Obtener vuelos usando el nombre en español
      const yearNum = Number.parseInt(selectedYear);
      const monthFlights =
        clientStats?.flights[yearNum]?.[monthNameInSpanish] || [];
      setFlightsData(monthFlights);
    }
  };

  // Calcular estadísticas totales para el año seleccionado
  const totalPayed =
    clientStats?.statistics?.total_payed_annual[
      Number.parseInt(selectedYear)
    ] || 0;
  const totalDebt =
    clientStats?.statistics?.annual_debt[Number.parseInt(selectedYear)] || 0;
  const totalAmount =
    clientStats?.statistics?.annual_amount[Number.parseInt(selectedYear)] || 0;
  const totalFlights =
    clientStats?.statistics?.total_flights[Number.parseInt(selectedYear)] || 0;

  // Función personalizada para el tooltip
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-4 border rounded-lg shadow-lg">
          <p className="font-semibold text-lg mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="mb-1">
              {entry.dataKey === "montosPagados" && (
                <p className="text-emerald-600 font-medium text-base">
                  Pagado: {formatCurrency(entry.value)}
                </p>
              )}
              {entry.dataKey === "costos" && (
                <p className="text-blue-600 font-medium">
                  Costo: {formatCurrency(entry.value)}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Función para formatear fechas
  const formatDate = (dateInput: string | Date, daysToAdd: number = 0) => {
    let date = dateInput instanceof Date ? dateInput : new Date(dateInput);

    if (daysToAdd !== 0) {
      date = new Date(date.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    }

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Estados de carga y error
  if (isLoading || isLoadingFlights) {
    return <LoadingPage />;
  }

  if (error || !clientDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">
          Error al cargar los datos del cliente
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    );
  }
  return (
    <>
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
      {/* Encabezado */}
      <div className="space-y-3 mb-6">
        <h1 className="text-5xl font-bold text-center">Reporte de Vuelos</h1>
        <p className="text-4xl text-muted-foreground text-center font-medium">
          {clientDetails?.name}
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Monto Pagado Anual"
          value={formatCurrency(totalPayed)}
          description="Total pagado en el año"
          icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
        />

        <SummaryCard
          title="Deuda Anual"
          value={formatCurrency(totalDebt)}
          description="Deuda pendiente"
          icon={<CreditCard className="h-5 w-5 text-rose-500" />}
        />

        <SummaryCard
          title="Número de Vuelos"
          value={totalFlights.toString()}
          description="Vuelos realizados en el año"
          icon={<Plane className="h-5 w-5 text-blue-500" />}
        />

        <SummaryCard
          title="Costos Totales"
          value={formatCurrency(totalAmount)}
          description="Costo total de los vuelos"
          icon={<TrendingUp className="h-5 w-5 text-indigo-500" />}
        />
      </div>

      {/* Selector de año */}
      <div className="flex justify-end mb-4">
        <Select
          value={selectedYear}
          onValueChange={setSelectedYear}
          disabled={availableYears.length <= 1}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar año" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gráfico de barras */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-center">
            Vuelos por Mes {selectedYear}
          </CardTitle>
          <CardDescription className="text-center">
            Haz clic en un mes para ver los detalles de los vuelos
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                onClick={handleBarClick}
                barGap={0}
                barCategoryGap={8}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="shortName"
                  tickLine={false}
                  axisLine={true}
                  tick={{ fontSize: 12 }}
                  height={60}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  width={80}
                  domain={[0, "auto"]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="montosPagados"
                  name="Monto Pagado"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                >
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={`cell-pagado-${index}`}
                      fill={
                        entry.month === selectedMonth ? "#047857" : "#10b981"
                      }
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
                <Bar
                  yAxisId="left"
                  dataKey="costos"
                  name="Costos"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                >
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={`cell-costos-${index}`}
                      fill={
                        entry.month === selectedMonth ? "#1d4ed8" : "#3b82f6"
                      }
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de vuelos del mes seleccionado */}
      {selectedMonth !== null && (
        <Card>
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Vuelos de {getMonthByNumber(selectedMonth)?.name}{" "}
                  {selectedYear}
                </CardTitle>
                <CardDescription>
                  Detalle de los vuelos realizados durante el mes
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm py-1.5 px-3">
                {flightsData.length} vuelos
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingFlights ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : flightsData.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Nº Vuelo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Aeronave</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Monto Total</TableHead>
                      <TableHead>Deuda</TableHead>
                      <TableHead>Detalle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flightsData.map((flight) => (
                      <TableRow key={flight.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          {flight.flight_number}
                        </TableCell>
                        <TableCell>{formatDate(flight.date, 1)}</TableCell>
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
                        <TableCell className="font-medium">
                          {formatCurrency(flight.total_amount)}
                        </TableCell>
                        <TableCell
                          className={
                            flight.debt_status === "PENDIENTE"
                              ? "text-rose-600 font-medium"
                              : "text-emerald-600 font-medium"
                          }
                        >
                          {flight.debt_status === "PENDIENTE"
                            ? formatCurrency(
                                flight.total_amount - flight.payed_amount
                              )
                            : formatCurrency(0)}
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] truncate"
                          title={flight.details}
                        >
                          {flight.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay vuelos registrados para este mes.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ClientStatistics;
