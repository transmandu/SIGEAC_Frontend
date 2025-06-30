"use client";
import { useRouter } from "next/navigation";
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
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import type { PurchaseOrder } from "@/types";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetStatisticsPurchaseOrders } from "@/hooks/administracion/useGetStatisticsPurchaseOrders";
import months from "@/components/cards/ConfigMonths";
import { useCompanyStore } from "@/stores/CompanyStore";

type MonthlyData = {
  name: string;
  shortName: string;
  monthNumber: string;
  total: number;
  monthly_transport_to_venezuela: number;
  monthly_transport_usa: number;
  monthly_taxes: number;
  monthly_wire_fee: number;
  monthly_handling_fee: number;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: MonthlyData;
  }>;
  label?: string;
}

const StatisticsPurchaseOrdersDashboard = () => {
  const router = useRouter();
  const { selectedStation } = useCompanyStore();
  const { data, isLoading, isError } =
    useGetStatisticsPurchaseOrders(selectedStation);
  const availableYears = useMemo(() => {
    if (!data?.statistics?.monthly_total)
      return [new Date().getFullYear().toString()];
    return Object.keys(data.statistics.monthly_total).sort(
      (a, b) => Number.parseInt(b) - Number.parseInt(a)
    );
  }, [data]);
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return availableYears[0] || new Date().getFullYear().toString();
  });
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedMonthOrders, setSelectedMonthOrders] = useState<
    PurchaseOrder[]
  >([]);

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const chartData = useMemo(() => {
    if (!data?.statistics?.monthly_total?.[selectedYear]) return [];
    const monthlyData: MonthlyData[] = [];
    const monthsInYear = data.statistics.monthly_total[selectedYear];
    // Ordenar los meses cronológicamente
    const orderedMonths = Object.keys(monthsInYear).sort((a, b) => {
      const monthOrder = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });

    orderedMonths.forEach((month) => {
      const total = data.statistics.monthly_total[selectedYear][month] || 0;
      const monthly_transport_to_venezuela =
        data.statistics.monthly_transport_to_venezuela[selectedYear]?.[month] ||
        0;
      const monthly_transport_usa =
        data.statistics.monthly_transport_usa[selectedYear]?.[month] || 0;
      const monthly_taxes =
        data.statistics.monthly_taxes[selectedYear]?.[month] || 0;
      const monthly_wire_fee =
        data.statistics.monthly_wire_fee[selectedYear]?.[month] || 0;
      const monthly_handling_fee =
        data.statistics.monthly_handling_fee[selectedYear]?.[month] || 0;

      // Encontrar el objeto de mes correspondiente en el array de meses
      const monthObj = months.find((m) => m.name === month);

      monthlyData.push({
        name: month,
        shortName: monthObj?.short || month.substring(0, 3),
        monthNumber: month,
        total,
        monthly_transport_to_venezuela,
        monthly_transport_usa,
        monthly_taxes,
        monthly_wire_fee,
        monthly_handling_fee,
      });
    });

    return monthlyData;
  }, [data, selectedYear]);

  // Calcular el total anual
  const totalAnnual = useMemo(() => {
    if (!data?.statistics?.total_payed_annual) return 0;

    // Verificar si el año seleccionado existe en total_payed_annual
    const totalForYear =
      data.statistics.total_payed_annual[
        selectedYear as keyof typeof data.statistics.total_payed_annual
      ];
    return typeof totalForYear === "number" ? totalForYear : 0;
  }, [data, selectedYear]);

  // Calcular el total de órdenes de compra
  const totalOrders = useMemo(() => {
    if (!data?.statistics.monthly_completed_purchase_orders?.[selectedYear])
      return 0;

    let count = 0;
    Object.values(
      data.statistics.monthly_completed_purchase_orders[selectedYear]
    ).forEach((orders) => {
      count += orders.length;
    });

    return count;
  }, [data, selectedYear]);

  // Encontrar el mes con más gastos
  const monthWithHighestExpenses = useMemo(() => {
    if (!chartData.length) return null;

    let highestMonth = chartData[0];
    chartData.forEach((month) => {
      if (month.total > highestMonth.total) {
        highestMonth = month;
      }
    });

    return highestMonth;
  }, [chartData]);

  // Manejar el clic en una barra del gráfico
  const handleBarClick = (dataPoint: MonthlyData) => {
    setSelectedMonth(dataPoint.monthNumber);
    // Obtener las órdenes de compra del mes seleccionado
    if (
      data &&
      data.statistics.monthly_completed_purchase_orders &&
      data.statistics.monthly_completed_purchase_orders[selectedYear] &&
      data.statistics.monthly_completed_purchase_orders[selectedYear][
        dataPoint.monthNumber
      ]
    ) {
      setSelectedMonthOrders(
        data.statistics.monthly_completed_purchase_orders[selectedYear][
          dataPoint.monthNumber
        ]
      );
    } else {
      setSelectedMonthOrders([]);
    }
  };

  // Componente Tooltip
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-background p-4 border rounded-lg shadow-lg">
        <p className="font-semibold text-lg mb-1">{data.name}</p>
        <div className="space-y-1 text-xs">
          <p className="flex justify-between">
            <span className="text-muted-foreground mr-2">Total:</span>
            <span className="font-semibold">
              ${data.total.toLocaleString()}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted-foreground mr-2">
              Transporte Venezuela:
            </span>
            <span className="font-semibold">
              ${data.monthly_transport_to_venezuela.toLocaleString()}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted-foreground mr-2">Transporte USA:</span>
            <span className="font-semibold">
              ${data.monthly_transport_usa.toLocaleString()}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted-foreground mr-2">Impuestos:</span>
            <span className="font-semibold">
              ${data.monthly_taxes.toLocaleString()}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted-foreground mr-2">
              Comisión bancaria:
            </span>
            <span className="font-semibold">
              ${data.monthly_wire_fee.toLocaleString()}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted-foreground mr-2">
              Comisión de manejo:
            </span>
            <span className="font-semibold">
              ${data.monthly_handling_fee.toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    );
  };

  // Formatear fecha
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: es });
  };

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
    <ContentLayout title="Reporte de Ordenes de Compra">
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
          <h1 className="text-2xl font-bold">
            Reporte de Ordenes de Compras Completados
          </h1>
          <p className="text-muted-foreground">
            Análisis detallado de las ordenes de compras que han sido
            completados.
          </p>
        </div>
        <div className="ml-auto">
          <Select
            value={selectedYear}
            onValueChange={(value) => {
              setSelectedYear(value);
              setSelectedMonth(null);
              setSelectedMonthOrders([]);
            }}
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
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Gastos Anuales
            </CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalAnnual.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Año {selectedYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Órdenes de Compra
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-purple-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Órdenes completadas en {selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Mes con Mayores Gastos
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthWithHighestExpenses ? monthWithHighestExpenses.name : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {monthWithHighestExpenses
                ? `$${monthWithHighestExpenses.total.toLocaleString()} en gastos`
                : "Sin datos"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de gastos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gastos Mensuales {selectedYear}</CardTitle>
          <CardDescription>
            Haz clic en una barra para ver los detalles de las órdenes de compra
            de ese mes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                  tickMargin={8}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                />
                <Bar
                  dataKey="total"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                  onClick={(data) => handleBarClick(data)}
                  cursor="pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.monthNumber === selectedMonth
                          ? "#0369a1"
                          : "#0ea5e9"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de órdenes de compra del mes seleccionado */}
      {selectedMonth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Órdenes de Compra - {selectedMonth} {selectedYear}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedMonth(null);
                  setSelectedMonthOrders([]);
                }}
              >
                Cerrar
              </Button>
            </CardTitle>
            <CardDescription>
              {selectedMonthOrders.length
                ? `${selectedMonthOrders.length} órdenes encontradas`
                : "No hay órdenes para este mes"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedMonthOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número de Orden</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedMonthOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>{formatDate(order.purchase_date)}</TableCell>
                      <TableCell>{order.vendor?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            order.status === "APROBADA"
                              ? "bg-green-100 text-green-800"
                              : order.status === "PENDIENTE"
                                ? "bg-yellow-100 text-yellow-800"
                                : ""
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(order.total).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay órdenes de compra para mostrar en este mes
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </ContentLayout>
  );
};

export default StatisticsPurchaseOrdersDashboard;
