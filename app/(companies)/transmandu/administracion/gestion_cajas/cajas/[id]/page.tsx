"use client";

import { useGetCashMovementByAccount } from "@/hooks/administracion/movimientos/useGetCashMovementByAccount";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, } from "@/components/ui/card";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Loader2, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip, } from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import DateFilter from "@/components/forms/CreateFilterDates";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MovementsByAccountPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ id: string }>();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  // Obtener parametros
  const cashId = params.id;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  // Usar el hook para obtener los datos
  const { data, isLoading, isError, error } = useGetCashMovementByAccount(
    cashId,
    {
      from,
      to,
    }
  );

  // Trabajar directamente con los datos recibidos (ya están filtrados por el backend)
  const accountsData = data || [];

  // Calculate totals
  const totals =
    accountsData.length > 0
      ? accountsData.reduce(
          (acc, accountant) => {
            acc.totalIncome += Number(accountant.INCOME || 0);
            acc.totalOutcome += Number(accountant.OUTPUT || 0);
            return acc;
          },
          { totalIncome: 0, totalOutcome: 0 }
        )
      : { totalIncome: 0, totalOutcome: 0 };

  // Prepare data for chart
  const chartData = accountsData.map((accountant) => ({
    name: accountant.accountant_name,
    Ingresos: Number(accountant.INCOME || 0),
    Egresos: Number(accountant.OUTPUT || 0),
  }));

  // Get movements for selected accountant
  const selectedAccountData = selectedAccount
    ? accountsData.find((accountant) => accountant.accountant_name === selectedAccount)
    : null;

  const selectedAccountMovements = selectedAccountData?.movements || [];

  // Handle row click to select accountant
  const handleRowClick = (accountName: string) => {
    setSelectedAccount(accountName === selectedAccount ? null : accountName);
  };

  // Handle clear selection
  const handleClearSelection = () => {
    setSelectedAccount(null);
  };

  // Handle bar click in chart
  const handleBarClick = (data: any) => {
    if (data && data.name) {
      setSelectedAccount(data.name === selectedAccount ? null : data.name);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
        <h1 className="text-xl font-semibold">Movimientos de Caja</h1>
      </div>

      {/* Alerta de error */}
      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar los datos</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Ocurrió un error al cargar los datos. Intente nuevamente."}
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta de datos vacíos */}
      {!isLoading && !isError && accountsData.length === 0 && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No hay datos disponibles</AlertTitle>
          <AlertDescription>
            No se encontraron movimientos para esta caja. Verifique los
            parámetros de búsqueda o seleccione otra caja.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-center md:text-left">
                RESUMEN FINANCIERO
              </CardTitle>
              <CardDescription className="text-center md:text-left">
                Resumen de ingresos y egresos organizados por cuentas para esta
                caja
              </CardDescription>
            </div>
            <DateFilter />
          </div>
        </CardHeader>
        <CardContent>
          {accountsData.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] text-center">
                      Cuenta
                    </TableHead>
                    <TableHead className="text-center">Ingresos</TableHead>
                    <TableHead className="text-center">Egresos</TableHead>
                    <TableHead className="text-center">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountsData.map((accountant) => {
                    const income = Number(accountant.INCOME || 0);
                    const outcome = Number(accountant.OUTPUT || 0);
                    const balance = income - outcome;
                    const isSelected = accountant.accountant_name === selectedAccount;

                    return (
                      <TableRow
                        key={accountant.accountant_name}
                        className={`cursor-pointer hover:bg-muted/50 ${isSelected ? "bg-muted" : ""}`}
                        onClick={() => handleRowClick(accountant.accountant_name)}
                      >
                        <TableCell className="font-medium text-center">
                          {accountant.accountant_name}
                        </TableCell>
                        <TableCell className="text-center text-green-700">
                          {formatCurrency(income)}
                        </TableCell>
                        <TableCell className="text-center text-red-700">
                          {formatCurrency(outcome)}
                        </TableCell>
                        <TableCell
                          className={`text-center font-bold ${balance >= 0 ? "text-green-700" : "text-red-700"}`}
                        >
                          {formatCurrency(balance)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Totals row */}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold text-center">
                      TOTALES
                    </TableCell>
                    <TableCell className="text-center font-bold text-green-500">
                      {formatCurrency(totals.totalIncome)}
                    </TableCell>
                    <TableCell className="text-center font-bold text-red-500">
                      {formatCurrency(totals.totalOutcome)}
                    </TableCell>
                    <TableCell
                      className={`text-center font-bold ${
                        totals.totalIncome - totals.totalOutcome >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {formatCurrency(totals.totalIncome - totals.totalOutcome)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Gráfico de Ingresos vs Egresos */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-center mb-4">
                  Gráfico de Ingresos VS Egresos
                </h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 80,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={30}
                        tickMargin={25}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          `${value.toLocaleString("es-VE", { minimumFractionDigits: 0 })}`
                        }
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${Number(value).toLocaleString("es-VE", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 2,
                          })}`,
                          "",
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="Ingresos"
                        fill="#22c55e"
                        name="Ingresos"
                        onClick={(data) => setSelectedAccount(data.name)}
                        cursor="pointer"
                      />
                      <Bar
                        dataKey="Egresos"
                        fill="#ef4444"
                        name="Egresos"
                        onClick={(data) => setSelectedAccount(data.name)}
                        cursor="pointer"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabla de movimientos detallados */}
              {selectedAccount && selectedAccountMovements.length > 0 && (
                <div className="mt-8">
                  <Card className="border border-muted-foreground/20 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Movimientos de: {selectedAccount}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSelection}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cerrar
                        </Button>
                      </div>
                      {selectedAccountData && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          <div className="bg-green-50 p-3 rounded-md">
                            <p className="text-sm text-muted-foreground">
                              Ingresos
                            </p>
                            <p className="text-lg font-bold text-green-700">
                              {formatCurrency(
                                Number(selectedAccountData.INCOME || 0)
                              )}
                            </p>
                          </div>
                          <div className="bg-red-50 p-3 rounded-md">
                            <p className="text-sm text-muted-foreground">
                              Egresos
                            </p>
                            <p className="text-lg font-bold text-red-700">
                              {formatCurrency(
                                Number(selectedAccountData.OUTPUT || 0)
                              )}
                            </p>
                          </div>
                          <div
                            className={`p-3 rounded-md ${
                              Number(selectedAccountData.INCOME || 0) -
                                Number(selectedAccountData.OUTPUT || 0) >=
                              0
                                ? "bg-green-50"
                                : "bg-red-50"
                            }`}
                          >
                            <p className="text-sm text-muted-foreground">
                              Balance
                            </p>
                            <p
                              className={`text-lg font-bold ${
                                Number(selectedAccountData.INCOME || 0) -
                                  Number(selectedAccountData.OUTPUT || 0) >=
                                0
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              {formatCurrency(
                                Number(selectedAccountData.INCOME || 0) -
                                  Number(selectedAccountData.OUTPUT || 0)
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Detalle</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Cuenta Bancaria</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedAccountMovements.map((movement) => (
                            <TableRow key={movement.id}>
                              <TableCell>
                                {formatDate(movement.date,1)}
                              </TableCell>
                              <TableCell>{movement.category.name}</TableCell>
                              <TableCell>{movement.details}</TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    movement.type === "INCOME"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {movement.type === "INCOME"
                                    ? "Ingreso"
                                    : "Egreso"}
                                </span>
                              </TableCell>
                              <TableCell
                                className={
                                  movement.type === "INCOME"
                                    ? "text-green-600 font-medium"
                                    : "text-red-600 font-medium"
                                }
                              >
                                {formatCurrency(movement.total_amount)}
                              </TableCell>
                              <TableCell>
                                {movement.bank_account?.name || "Efectivo"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Mensaje cuando no hay movimientos */}
              {selectedAccount && selectedAccountMovements.length === 0 && (
                <div className="mt-8">
                  <Card className="border border-muted-foreground/20 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Movimientos de: {selectedAccount}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSelection}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cerrar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-muted-foreground">
                          No hay movimientos para esta cuenta
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center">
                No hay datos disponibles para mostrar. Intente con otra caja o
                ajuste los filtros de fecha.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MovementsByAccountPage;
