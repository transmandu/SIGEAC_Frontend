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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,} from "recharts";
import { Badge } from "@/components/ui/badge";
import type { CashMovement } from "@/types";
import { useGetOutputStatistics } from "@/hooks/aerolinea/movimientos/useGetOutputStatistics";
import { SummaryCard } from "@/components/cards/SummaryCard";
import months from "@/components/cards/ConfigMonths";
import MovementDetailsDialog from "@/components/dialogs/MovementDetailsDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";
import LoadingPage from "@/components/misc/LoadingPage";

type MonthlyData = {
  name: string;
  shortName: string;
  output: number;
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

const OutputDashboard = () => {
  const {selectedCompany} = useCompanyStore();
  const router = useRouter();
  const { data, isLoading, isError } = useGetOutputStatistics(selectedCompany?.slug);

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
  const [selectedVendor, setSelectedVendor] = useState<string | null>("all");

  // Mostrar la estructura completa de cash_movements cuando cambia data
  useEffect(() => {
    if (data) {
      // Mostrar los meses disponibles para el año seleccionado
      const yearData = data.cash_movements?.[selectedYear] || {};
    }
  }, [data, selectedYear, selectedVendor]);

  // Preparar datos mensuales
  const monthlyData = useMemo<MonthlyData[]>(() => {
    if (!data?.statistics?.monthly?.[selectedYear]) return [];

    return months.map((m) => {
      // Acceso directo usando month.name
      let monthOutput = data.statistics.monthly[selectedYear][m.name] || 0;

      // Filtrar por cliente si se ha seleccionado uno específico
      if (
        selectedVendor &&
        selectedVendor !== "all" &&
        data?.cash_movements?.[selectedYear]?.[m.name]
      ) {
        const vendorMovements = data.cash_movements[selectedYear][
          m.name
        ].filter(
          (mov: CashMovement) =>
            mov.type === "OUTPUT" && String(mov.vendor?.id) === selectedVendor
        );

        // Calcular el total de ingresos para este cliente en este mes
        monthOutput = vendorMovements.reduce(
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
        selectedVendor &&
        selectedVendor !== "all" &&
        data?.cash_movements?.[selectedYear]?.[m.name]
      ) {
        monthMovements = data.cash_movements[selectedYear][m.name].filter(
          (mov: CashMovement) =>
            mov.type === "INCOME" && String(mov.client?.id) === selectedVendor
        ).length;
      }

      return {
        name: m.name,
        shortName: m.short,
        output: monthOutput,
        movements: monthMovements,
        monthNumber: m.number,
      };
    });
  }, [data, selectedYear, selectedVendor]);

  // Obtener movimientos del mes seleccionado solo Egresos
  const monthMovements = useMemo(() => {
    if (!selectedMonth || !data?.cash_movements) return [];

    const monthData = data.cash_movements[selectedYear]?.[selectedMonth] || [];

    // Filtrar solo los movimientos de tipo OUTPUT
    let outputMovements = Array.isArray(monthData)
      ? monthData.filter((m: CashMovement) => m.type === "OUTPUT")
      : [];

    // Filtrar por cliente si se ha seleccionado uno específico
    if (selectedVendor && selectedVendor !== "all") {
      outputMovements = outputMovements.filter(
        (m: CashMovement) => String(m.vendor?.id) === selectedVendor
      );
    }

    return outputMovements;
  }, [data, selectedYear, selectedMonth, selectedVendor]);

  // Calcular estadísticas
  const totalAnnualOutput = useMemo(() => {
    if (!data?.statistics?.monthly?.[selectedYear]) return 0;

    // Si no hay proveedor seleccionado o es "all", usa las estadísticas directas
    if (!selectedVendor || selectedVendor === "all") {
      return months.reduce((sum, month) => {
        return sum + (data.statistics.monthly[selectedYear][month.name] || 0);
      }, 0);
    }

    // Si hay un proveedor seleccionado, calcula manualmente
    return monthlyData.reduce((sum, month) => sum + month.output, 0);
  }, [data, selectedYear, selectedVendor, monthlyData]);

  const totalMovements = useMemo(() => {
    return monthlyData.reduce((sum, month) => sum + month.movements, 0);
  }, [monthlyData]);

  const worstMonth = useMemo(() => {
    if (monthlyData.length === 0) return { name: "N/A", output: 0 };
    return monthlyData.reduce((prev, current) =>
      current.output > prev.output ? current : prev
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

  const handleVendorChange = (vendorId: string) => {
    setSelectedVendor(vendorId);
  };

  // Obtener clientes disponibles
  const availableVendors = useMemo(() => {
    if (!data?.cash_movements) return [];

    // Extraer todos los proveedores únicos de los movimientos
    const vendorsSet = new Set<string>();
    const vendorsMap = new Map<string, { id: string; name: string }>();

    // Recorrer todos los años y meses para encontrar proveedores únicos
    Object.values(data.cash_movements).forEach((yearData) => {
      Object.values(yearData).forEach((monthData) => {
        if (Array.isArray(monthData)) {
          monthData.forEach((movement: CashMovement) => {
            if (
              movement.type === "OUTPUT" &&
              movement.vendor?.id &&
              movement.vendor?.name
            ) {
              // Convertir el ID a string
              const vendorId = String(movement.vendor.id);
              vendorsSet.add(vendorId);
              vendorsMap.set(vendorId, {
                id: vendorId,
                name: movement.vendor.name,
              });
            }
          });
        }
      });
    });

    // Convertir a array para el selector
    return Array.from(vendorsMap.values());
  }, [data]);

  // Componente Tooltip personalizado
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded shadow-lg ">
        <p className="font-semibold">{data.name}</p>
        <p className="text-red-600">Egresos: ${data.output.toLocaleString()}</p>
        <p className="text-gray-600">Movimientos: {data.movements}</p>
      </div>
    );
  };

  // Estados de carga y error
  if (isLoading) return <LoadingPage />;

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
    <ContentLayout title="Reporte de Egresos">
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
          <h1 className="text-2xl font-bold">Reporte de Egresos Anuales</h1>
          <p className="text-muted-foreground">
            Análisis detallado de egresos
          </p>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title={`Total Egresos ${selectedYear}`}
          value={`$${totalAnnualOutput.toLocaleString()}`}
          description="Suma total del año"
          icon={<DollarSign className="h-5 w-5 text-red-500" />}
        />

        <SummaryCard
          title="Total Movimientos"
          value={totalMovements.toString()}
          description="Cantidad de transacciones"
          icon={<BarChartIcon className="h-5 w-5 text-indigo-500" />}
        />

        <SummaryCard
          title="Mes con mayor gasto"
          value={worstMonth.name || "-"}
          description={`$${worstMonth.output.toLocaleString()}`}
          icon={<Calendar className="h-5 w-5 text-purple-500" />}
        />
      </div>

      <div className="flex justify-end mb-4 gap-4">
        {/* Selector de proveedor */}
        <Select
          value={selectedVendor || "all"}
          onValueChange={handleVendorChange}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Todos los clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proveedores</SelectItem>
            {availableVendors.map((vendor) => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.name}
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
            Egresos Mensuales - {selectedYear}
            {selectedVendor &&
              selectedVendor !== "all" &&
              ` - ${
                availableVendors.find((c) => c.id === selectedVendor)?.name ||
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
                <Bar dataKey="output" name="Egresos">
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === selectedMonth ? "#8884d8" : "#ef4444"
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
                  Detalle de los egresos realizados durante el mes
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
                  <TableHeader className="bg-muted/30 ">
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Caja</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Detalles</TableHead>
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
                        <TableCell>{movement.cash.name || "N/A"}</TableCell>
                        <TableCell>{movement.vendor?.name || "N/A"}</TableCell>
                        <TableCell>
                          <MovementDetailsDialog movement={movement} />
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
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
                No hay movimientos de egresos registrados para este mes
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </ContentLayout>
  );
};

export default OutputDashboard;
