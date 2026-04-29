"use client";

import { FuelMovementDialog } from "@/components/dialogs/mantenimiento/almacen/combustible/FuelMovementDialog";
import { CreateFuelVehicleDialog } from "@/components/dialogs/mantenimiento/almacen/combustible/CreateFuelVehicleDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useGetThirdParties } from "@/hooks/general/terceros/useGetThirdParties";
import { useGetFuelMovements } from "@/hooks/mantenimiento/almacen/combustible/useGetFuelMovements";
import { useGetFuelSummary } from "@/hooks/mantenimiento/almacen/combustible/useGetFuelSummary";
import { useGetFuelVehicles } from "@/hooks/mantenimiento/almacen/combustible/useGetFuelVehicles";
import {
  FUEL_ALLOWED_ROLES,
  FUEL_MOVEMENT_LABELS,
  formatLiters,
} from "@/lib/fuel";
import { useCompanyStore } from "@/stores/CompanyStore";
import { FuelMovementType } from "@/types";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarMinus,
  Droplets,
  Fuel,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { FuelMovementsTable } from "./_components/FuelMovementsTable";
import { FuelSummaryCards } from "./_components/FuelSummaryCards";
import { FuelTraceabilityPanel } from "./_components/FuelTraceabilityPanel";
import { FuelVehiclesTable } from "./_components/FuelVehiclesTable";

const movementFilterOptions: Array<{
  value: FuelMovementType;
  label: string;
}> = [
  { value: "warehouse_initial_balance", label: FUEL_MOVEMENT_LABELS.warehouse_initial_balance },
  { value: "vehicle_initial_balance", label: FUEL_MOVEMENT_LABELS.vehicle_initial_balance },
  { value: "external_refuel", label: FUEL_MOVEMENT_LABELS.external_refuel },
  { value: "warehouse_unload", label: FUEL_MOVEMENT_LABELS.warehouse_unload },
  { value: "warehouse_dispatch_vehicle", label: FUEL_MOVEMENT_LABELS.warehouse_dispatch_vehicle },
  { value: "warehouse_dispatch_third_party", label: FUEL_MOVEMENT_LABELS.warehouse_dispatch_third_party },
  { value: "vehicle_daily_consumption", label: FUEL_MOVEMENT_LABELS.vehicle_daily_consumption },
  { value: "annulment", label: FUEL_MOVEMENT_LABELS.annulment },
];

export default function FuelWarehousePage() {
  const { selectedCompany } = useCompanyStore();
  const { user, loading: authLoading } = useAuth();
  const company = selectedCompany?.slug;
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [vehicleId, setVehicleId] = useState("all");
  const [thirdPartyId, setThirdPartyId] = useState("all");
  const [movementType, setMovementType] = useState<FuelMovementType | "all">(
    "all",
  );

  const userRoles = user?.roles?.map((role) => role.name) ?? [];
  const canAccess = FUEL_ALLOWED_ROLES.some((role) => userRoles.includes(role));

  const movementFilters = useMemo(
    () => ({
      date_from: dateFrom,
      date_to: dateTo,
      vehicle_id: vehicleId === "all" ? "" : vehicleId,
      third_party_id: thirdPartyId === "all" ? "" : thirdPartyId,
      type: movementType,
    }),
    [dateFrom, dateTo, movementType, thirdPartyId, vehicleId],
  );

  const { data: summary, isLoading: summaryLoading, isError: summaryError } =
    useGetFuelSummary(company);
  const { data: vehicles, isLoading: vehiclesLoading } =
    useGetFuelVehicles(company);
  const { data: movements, isLoading: movementsLoading } = useGetFuelMovements(
    company,
    movementFilters,
  );
  const { data: thirdParties } = useGetThirdParties();

  const fuelVehicles = vehicles ?? [];
  const fuelMovements = movements ?? [];

  if (authLoading || summaryLoading || vehiclesLoading) return <LoadingPage />;

  if (!canAccess) {
    return (
      <ContentLayout title="Combustible">
        <div className="flex min-h-[360px] items-center justify-center">
          <div className="max-w-md rounded-md border bg-background p-6 text-center">
            <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
            <h1 className="mt-3 text-lg font-semibold">Sin acceso</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Este modulo esta disponible solo para SUPERUSER y JEFE_ALMACEN.
            </p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Combustible">
      <div className="space-y-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${company}/dashboard`}>Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Almacen</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Combustible</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-md border bg-muted/50 p-2 text-primary">
                <Fuel className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Control de combustible
              </h1>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Gestiona inventario almacenado, saldo en vehiculos, despachos y
              consumo diario con trazabilidad FIFO.
            </p>
          </div>
          <CreateFuelVehicleDialog company={company} />
        </div>

        {summaryError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            No se pudo cargar el resumen de combustible.
          </div>
        ) : null}

        <FuelSummaryCards summary={summary} />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Acciones rapidas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <FuelMovementDialog
              company={company}
              type="warehouse_initial_balance"
              summary={summary}
              vehicles={fuelVehicles}
              icon={Droplets}
              variant="outline"
            />
            <FuelMovementDialog
              company={company}
              type="external_refuel"
              summary={summary}
              vehicles={fuelVehicles}
              icon={Fuel}
              variant="outline"
            />
            <FuelMovementDialog
              company={company}
              type="warehouse_unload"
              summary={summary}
              vehicles={fuelVehicles}
              icon={ArrowDownToLine}
              variant="outline"
            />
            <FuelMovementDialog
              company={company}
              type="warehouse_dispatch_vehicle"
              summary={summary}
              vehicles={fuelVehicles}
              icon={Truck}
              variant="outline"
            />
            <FuelMovementDialog
              company={company}
              type="warehouse_dispatch_third_party"
              summary={summary}
              vehicles={fuelVehicles}
              icon={ArrowUpFromLine}
              variant="outline"
            />
            <FuelMovementDialog
              company={company}
              type="vehicle_daily_consumption"
              summary={summary}
              vehicles={fuelVehicles}
              icon={CalendarMinus}
              variant="outline"
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="movements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="movements">Movimientos</TabsTrigger>
            <TabsTrigger value="vehicles">Vehiculos</TabsTrigger>
            <TabsTrigger value="traceability">Trazabilidad</TabsTrigger>
          </TabsList>

          <TabsContent value="movements" className="space-y-4">
            <Card>
              <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-5">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                />
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vehiculo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los vehiculos</SelectItem>
                    {fuelVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.plate} - {formatLiters(vehicle.current_balance_liters)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={thirdPartyId} onValueChange={setThirdPartyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tercero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los terceros</SelectItem>
                    {thirdParties?.map((thirdParty) => (
                      <SelectItem key={thirdParty.id} value={thirdParty.id}>
                        {thirdParty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={movementType}
                  onValueChange={(value) =>
                    setMovementType(value as FuelMovementType | "all")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {movementFilterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {movementsLoading ? (
              <LoadingPage />
            ) : (
              <FuelMovementsTable company={company} movements={fuelMovements} />
            )}
          </TabsContent>

          <TabsContent value="vehicles">
            <FuelVehiclesTable company={company} vehicles={fuelVehicles} />
          </TabsContent>

          <TabsContent value="traceability">
            <FuelTraceabilityPanel company={company} movements={fuelMovements} />
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
}
