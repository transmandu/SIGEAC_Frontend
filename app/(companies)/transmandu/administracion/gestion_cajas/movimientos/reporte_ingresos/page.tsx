"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, DollarSign, BarChartIcon, Calendar, } from "lucide-react";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, } from "recharts";
import { Badge } from "@/components/ui/badge";
import type { CashMovement } from "@/types";
import { useGetIncomeStatistics } from "@/hooks/administracion/movimientos/useGetIncomeStatistics";
import { SummaryCard } from "@/components/cards/SummaryCard";
import months from "@/components/cards/ConfigMonths";

type MonthlyData = {
  name: string;
  shortName: string;
  income: number;
  movements: number;
  monthNumber: string;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: MonthlyData;
  }>;
  label?: string;
}

const IncomeDashboard = () => {
  const router = useRouter();
  const { data, isLoading, isError } = useGetIncomeStatistics();

  // Obtener años disponibles
  const availableYears = useMemo(() => {
    if (!data?.statistics?.monthly)
      return [new Date().getFullYear().toString()];
    return Object.keys(data.statistics.monthly).sort(
      (a, b) => Number.parseInt(b) - Number.parseInt(a)
    );
  }, [data]);

  // Estado con valor inicial seguro
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return availableYears[0] || new Date().getFullYear().toString();
  });
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>("all");

  // Mostrar la estructura completa de cash_movements cuando cambia data
  useEffect(() => {
    if (data) {
      // Mostrar los meses disponibles para el año seleccionado
      const yearData = data.cash_movements?.[selectedYear] || {};
    }
  }, [data, selectedYear, selectedClient]);

  // Preparar datos mensuales
  const monthlyData = useMemo<MonthlyData[]>(() => {
    if (!data?.statistics?.monthly?.[selectedYear]) return [];

    return months.map((m) => {
      // Acceso directo usando month.name
      let monthIncome = data.statistics.monthly[selectedYear][m.name] || 0;
      // Filtrar por cliente si se ha seleccionado uno específico
      if (
        selectedClient &&
        selectedClient !== "all" &&
        data?.cash_movements?.[selectedYear]?.[m.name]
      ) {
        const clientMovements = data.cash_movements[selectedYear][
          m.name
        ].filter(
          (mov: CashMovement) =>
            mov.type === "INCOME" && String(mov.client?.id) === selectedClient
        );

        // Calcular el total de ingresos para este cliente en este mes
        monthIncome = clientMovements.reduce(
          (sum: number, mov: CashMovement) =>
            sum +
            (typeof mov.total_amount === "string"
              ? Number.parseFloat(mov.total_amount)
              : mov.total_amount),
          0
        );
      }

      // Acceso a movimientos (también filtrados por cliente si es necesario)
      let monthMovements =
        data?.cash_movements?.[selectedYear]?.[m.name]?.length || 0;

      if (
        selectedClient &&
        selectedClient !== "all" &&
        data?.cash_movements?.[selectedYear]?.[m.name]
      ) {
        monthMovements = data.cash_movements[selectedYear][m.name].filter(
          (mov: CashMovement) =>
            mov.type === "INCOME" && String(mov.client?.id) === selectedClient
        ).length;
      }

      return {
        name: m.name,
        shortName: m.short,
        income: monthIncome,
        movements: monthMovements,
        monthNumber: m.number,
      };
    });
  }, [data, selectedYear, selectedClient]);

  // Obtener movimientos del mes seleccionado solo Ingresos
  const monthMovements = useMemo(() => {
    if (!selectedMonth || !data?.cash_movements) return [];

    const monthData = data.cash_movements[selectedYear]?.[selectedMonth] || [];

    // Filtrar solo los movimientos de tipo INCOME EESTA TERMINALMENTE PROHIBIDO USAER LET
    let incomeMovements = Array.isArray(monthData)
      ? monthData.filter((m: CashMovement) => m.type === "INCOME")
      : [];

    // Filtrar por cliente si se ha seleccionado uno específico
    if (selectedClient && selectedClient !== "all") {
      incomeMovements = incomeMovements.filter(
        (m: CashMovement) => String(m.client?.id) === selectedClient
      );
    }

    return incomeMovements;
  }, [data, selectedYear, selectedMonth, selectedClient]);

  // Calcular estadísticas
  const totalAnnualIncome = useMemo(() => {
    if (!data?.statistics?.monthly?.[selectedYear]) return 0;
    
    // Si no hay cliente seleccionado o es "all", usa las estadísticas directas
    if (!selectedClient || selectedClient === "all") {
      return months.reduce((sum, month) => {
        return sum + (data.statistics.monthly[selectedYear][month.name] || 0);
      }, 0);
    }
    
    // Si hay un cliente seleccionado, calcula manualmente
    return monthlyData.reduce((sum, month) => sum + month.income, 0);
  }, [data, selectedYear, selectedClient, monthlyData]);

  const totalMovements = useMemo(() => {
    return monthlyData.reduce((sum, month) => sum + month.movements, 0);
  }, [monthlyData]);

  const bestMonth = useMemo(() => {
    if (monthlyData.length === 0) return { name: "N/A", income: 0 };
    return monthlyData.reduce((prev, current) =>
      current.income > prev.income ? current : prev
    );
  }, [monthlyData]);

  // Manejadores de eventos
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedMonth(null);
  };

  const handleBarClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload) {
      const clickedMonth = data.activePayload[0].payload.name;
      setSelectedMonth(clickedMonth);
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
  };

  // Obtener clientes disponibles
  const availableClients = useMemo(() => {
    if (!data?.cash_movements) return [];

    // Extraer todos los clientes únicos de los movimientos
    const clientsSet = new Set<string>();
    const clientsMap = new Map<string, { id: string; name: string }>();

    // Recorrer todos los años y meses para encontrar clientes únicos
    Object.values(data.cash_movements).forEach((yearData) => {
      Object.values(yearData).forEach((monthData) => {
        if (Array.isArray(monthData)) {
          monthData.forEach((movement: CashMovement) => {
            if (
              movement.type === "INCOME" &&
              movement.client?.id &&
              movement.client?.name
            ) {
              // Convertir el ID a string
              const clientId = String(movement.client.id);
              clientsSet.add(clientId);
              clientsMap.set(clientId, {
                id: clientId,
                name: movement.client.name,
              });
            }
          });
        }
      });
    });

    // Convertir a array para el selector
    return Array.from(clientsMap.values());
  }, [data]);

  // Componente Tooltip personalizado
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded shadow-lg ">
        <p className="font-semibold">{data.name}</p>
        <p className="text-green-600">
          Ingresos: ${data.income.toLocaleString()}
        </p>
        <p className="text-gray-600">Movimientos: {data.movements}</p>
      </div>
    );
  };

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">Error al cargar los datos</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Encabezado */}
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          className="mr-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Reporte de Ingresos Anuales</h1>
          <p className="text-muted-foreground">
            Análisis detallado de ingresos
          </p>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title={`Total Ingresos ${selectedYear}`}
          value={`$${totalAnnualIncome.toLocaleString()}`}
          description="Suma total del año"
          icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
        />

        <SummaryCard
          title="Total Movimientos"
          value={totalMovements.toString()}
          description="Cantidad de transacciones"
          icon={<BarChartIcon className="h-5 w-5 text-indigo-500" />}
        />

        <SummaryCard
          title="Mejor Mes"
          value={bestMonth.name || "-"}
          description={`$${bestMonth.income.toLocaleString()}`}
          icon={<Calendar className="h-5 w-5 text-purple-500" />}
        />
      </div>

      <div className="flex justify-end mb-4 gap-4">
        {/* Selector de cliente */}
        <Select
          value={selectedClient || "all"}
          onValueChange={handleClientChange}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Todos los clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los clientes</SelectItem>
            {availableClients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Selector de año */}
        <Select
          value={selectedYear}
          onValueChange={handleYearChange}
          disabled={availableYears.length === 0}
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">
            Ingresos Mensuales - {selectedYear}
            {selectedClient &&
              selectedClient !== "all" &&
              ` - ${
                availableClients.find((c) => c.id === selectedClient)?.name ||
                ""
              }`}
          </CardTitle>
          <CardDescription className="text-center">
            Haz clic en un mes para ver los detalles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                onClick={handleBarClick}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="shortName"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tickFormatter={(value) => `$${value}`} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Ingresos">
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === selectedMonth ? "#8884d8" : "#82ca9d"
                      }
                      className="cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de movimientos del mes seleccionado */}
      {selectedMonth && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Movimientos de {selectedMonth} {selectedYear}
                </CardTitle>
                <CardDescription>
                  Detalle de los movimientos realizados durante el mes
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm py-1.5 px-3">
                {monthMovements.length} movimientos
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {monthMovements && monthMovements.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                       {/*    <TableHead>Cuenta</TableHead>
                      <TableHead>Categoría</TableHead> */}
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthMovements.map((movement) => (
                      <TableRow key={movement.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          {format(addDays(movement.date, 1), "dd MMM yyyy", {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell>{movement.client?.name || "N/A"}</TableCell>
                     {/*    <TableCell>{movement.accountant.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/5">
                            {movement.category.name}
                          </Badge>
                        </TableCell>  */}
                        <TableCell className="text-right font-medium text-emerald-600">
                          $
                          {(typeof movement.total_amount === "string"
                            ? Number.parseFloat(movement.total_amount)
                            : movement.total_amount
                          ).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay movimientos registrados para este mes
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IncomeDashboard;
