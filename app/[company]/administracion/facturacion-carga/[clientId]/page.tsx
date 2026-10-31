"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  DollarSign,
  AlertCircle,
  Loader2,
  Search,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetCargoCharges } from "@/hooks/administracion/facturacion_carga/useGetCargoCharges";
import { useGetCargoChargePayments } from "@/hooks/administracion/facturacion_carga/useGetCargoChargePayments";
import { CargoChargesTable } from "./_components/CargoChargesTable";

const ClientCargoBillingPage = () => {
  const { selectedCompany } = useCompanyStore();
  const params = useParams();
  const clientId = Number(params.clientId);
  const router = useRouter();

  const { data, isLoading, isError } = useGetCargoCharges(
    selectedCompany?.slug,
    clientId,
  );
  const { data: payments } = useGetCargoChargePayments(
    selectedCompany?.slug,
    clientId,
  );
  const [paymentsSearch, setPaymentsSearch] = useState("");
  const [onlyUnreconciled, setOnlyUnreconciled] = useState(false);

  // Cobros cuyo saldo guardado no coincide con los abonos registrados.
  const unreconciledCount = data?.summary?.unreconciled_count ?? 0;
  const unreconciledAmount = data?.summary?.unreconciled_amount ?? 0;

  // Filtro en el navegador: el historial de un cliente ya llega completo en
  // una sola respuesta, así que no hace falta ir al backend para buscar.
  const filteredPayments = useMemo(() => {
    const term = paymentsSearch.trim().toLowerCase();
    if (!term) return payments ?? [];

    return (payments ?? []).filter((payment) =>
      [
        payment.charge?.guide_number,
        String(payment.amount),
        payment.concept,
        payment.registered_by,
        payment.payment_method?.name,
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(term)),
    );
  }, [payments, paymentsSearch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">
          Error al cargar los cobros del cliente
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <ContentLayout title="Facturación de Carga">
      <PageHeader currentLabel={data.client.name} className="mb-4" />

      <div className="space-y-1 mb-6">
        <h1 className="text-3xl font-bold text-center">Facturación de Carga</h1>
        <p className="text-2xl text-muted-foreground text-center font-medium">
          {data.client.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SummaryCard
          title="Monto Total de Servicios"
          value={formatCurrency(data.summary.total_services)}
          description="Suma de todos los cobros del cliente"
          icon={<DollarSign className="h-5 w-5 text-green-700" />}
        />
        <SummaryCard
          title="Pendiente por Pagar"
          value={formatCurrency(data.summary.total_pending)}
          description="Diferencia entre lo facturado y lo pagado"
          icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
        />
      </div>

      {unreconciledCount > 0 && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {unreconciledCount}{" "}
            {unreconciledCount === 1 ? "cobro no cuadra" : "cobros no cuadran"}
          </AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            <span>
              El saldo guardado no coincide con los abonos registrados.
              Diferencia total:{" "}
              <strong className="tabular-nums">
                {formatCurrency(unreconciledAmount)}
              </strong>
              .
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px]"
              onClick={() => setOnlyUnreconciled((prev) => !prev)}
            >
              {onlyUnreconciled
                ? "Ver todos los cobros"
                : "Ver solo los que no cuadran"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <CargoChargesTable
        company={selectedCompany!.slug}
        clientId={clientId}
        charges={data.charges}
        onlyUnreconciled={onlyUnreconciled}
      />

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="bg-muted/30 py-4 flex flex-row items-center justify-between gap-4">
          <CardTitle>Historial de Abonos</CardTitle>
          {payments && payments.length > 0 && (
            <div className="relative w-full max-w-65">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={paymentsSearch}
                onChange={(e) => setPaymentsSearch(e.target.value)}
                placeholder="Buscar por guía, monto, usuario..."
                className="h-8 pl-8 text-sm"
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {payments && payments.length > 0 ? (
            filteredPayments.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Guía</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead>Concepto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/30">
                      <TableCell>{formatDate(payment.created_at)}</TableCell>
                      <TableCell className="font-medium">
                        {payment.charge?.guide_number ?? "-"}
                      </TableCell>
                      <TableCell>{payment.registered_by}</TableCell>
                      <TableCell
                        className={cn(
                          "tabular-nums font-medium",
                          Number(payment.amount) < 0 && "text-destructive",
                        )}
                      >
                        {formatCurrency(Number(payment.amount))}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.payment_method?.name ?? "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {Number(payment.amount) < 0 && (
                            <Badge
                              variant="outline"
                              className="border-destructive/40 bg-destructive/5 text-[10px] px-1.5 py-0 font-medium text-destructive"
                            >
                              Devolución
                            </Badge>
                          )}
                          <span>{payment.concept ?? "-"}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Ningún abono coincide con &quot;{paymentsSearch}&quot;.
              </div>
            )
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aún no hay abonos registrados para este cliente.
            </div>
          )}
        </CardContent>
      </Card>
    </ContentLayout>
  );
};

export default ClientCargoBillingPage;
