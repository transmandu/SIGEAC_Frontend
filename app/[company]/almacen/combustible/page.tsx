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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  FUEL_TYPES,
  formatLiters,
} from "@/lib/fuel";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { FuelMovementType, FuelType } from "@/types";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarMinus,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Fuel,
  Route,
  ShieldAlert,
  Truck,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
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
  { value: "vehicle_trip", label: FUEL_MOVEMENT_LABELS.vehicle_trip },
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
  const [movementFuelType, setMovementFuelType] = useState<FuelType | "all">(
    "all",
  );
  const [movementPage, setMovementPage] = useState(1);
  const [activeFuelTab, setActiveFuelTab] = useState("movements");

  const userRoles = user?.roles?.map((role) => role.name) ?? [];
  const canAccess = FUEL_ALLOWED_ROLES.some((role) => userRoles.includes(role));
  const isSuperUser = userRoles.includes("SUPERUSER");

  const hasActiveFilters =
    dateFrom !== "" ||
    dateTo !== "" ||
    vehicleId !== "all" ||
    thirdPartyId !== "all" ||
    movementType !== "all" ||
    movementFuelType !== "all";

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setVehicleId("all");
    setThirdPartyId("all");
    setMovementType("all");
    setMovementFuelType("all");
  };

  // Borde casi invisible en reposo; solo se tine de esmeralda cuando el
  // campo tiene un valor activo o recibe foco, para que la vista descanse
  // sobre los datos y no sobre las lineas de la cuadricula de filtros.
  const filterFieldClass = (isActive: boolean) =>
    cn(
      "border-slate-200 transition-colors duration-200 dark:border-slate-800",
      "focus:border-emerald-400 focus:ring-emerald-400/30 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/30",
      isActive && "border-emerald-400/70 ring-1 ring-emerald-400/20 dark:border-emerald-500/50",
    );

  // Se resetea a la primera pagina cada vez que cambia algun filtro (no al
  // cambiar solo de pagina).
  useEffect(() => {
    setMovementPage(1);
  }, [dateFrom, dateTo, vehicleId, thirdPartyId, movementType, movementFuelType]);

  const movementFilters = useMemo(
    () => ({
      date_from: dateFrom,
      date_to: dateTo,
      vehicle_id: vehicleId === "all" ? "" : vehicleId,
      third_party_id: thirdPartyId === "all" ? "" : thirdPartyId,
      type: movementType,
      fuel_type: movementFuelType,
      page: movementPage,
    }),
    [
      dateFrom,
      dateTo,
      movementFuelType,
      movementPage,
      movementType,
      thirdPartyId,
      vehicleId,
    ],
  );

  const { data: summary, isLoading: summaryLoading, isError: summaryError } =
    useGetFuelSummary(company);
  const { data: vehicles, isLoading: vehiclesLoading } =
    useGetFuelVehicles(company);
  const { data: movementsPage, isLoading: movementsLoading } =
    useGetFuelMovements(company, movementFilters);
  // Trazabilidad necesita ver todos los despachos, no solo la pagina actual
  // de la pestana Movimientos: se consulta aparte con un limite alto.
  const { data: traceabilityMovementsPage } = useGetFuelMovements(company, {
    per_page: 200,
  });
  const { data: thirdParties } = useGetThirdParties();

  const fuelVehicles = vehicles ?? [];
  const fuelMovements = movementsPage?.movements ?? [];
  const movementsPagination = movementsPage?.pagination;
  const traceabilityMovements = traceabilityMovementsPage?.movements ?? [];

  // El select de vehiculo del filtro solo debe ofrecer los vehiculos del
  // combustible elegido en el filtro de Combustible.
  const vehicleOptionsForFilter = useMemo(
    () =>
      movementFuelType === "all"
        ? fuelVehicles
        : fuelVehicles.filter(
            (vehicle) => vehicle.fuel_type === movementFuelType,
          ),
    [fuelVehicles, movementFuelType],
  );

  // Si el vehiculo seleccionado deja de pertenecer al combustible filtrado,
  // se limpia la seleccion para no dejar un filtro invisible/inconsistente.
  useEffect(() => {
    if (
      vehicleId !== "all" &&
      !vehicleOptionsForFilter.some(
        (vehicle) => vehicle.id.toString() === vehicleId,
      )
    ) {
      setVehicleId("all");
    }
  }, [vehicleId, vehicleOptionsForFilter]);

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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Fuel className="h-5 w-5 text-primary/70" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Control de combustible
              </h1>
              <p className="text-sm text-muted-foreground">
                Inventario, saldo en vehiculos, despachos y consumo con
                trazabilidad FIFO.
              </p>
            </div>
          </div>
          <CreateFuelVehicleDialog company={company} />
        </div>

        {summaryError ? (
          <div className="rounded-xl bg-destructive/5 p-3 text-sm text-destructive">
            No se pudo cargar el resumen de combustible.
          </div>
        ) : null}

        <FuelSummaryCards
          summary={summary}
          onViewVehicles={() => setActiveFuelTab("vehicles")}
        />

        {/* --- Acciones rapidas agrupadas por flujo: entradas -> despachos -> consumo --- */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:divide-x sm:divide-border">
          <div className="space-y-2 sm:pr-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Entradas
            </p>
            <div className="space-y-1.5">
              <FuelMovementDialog
                company={company}
                type="warehouse_initial_balance"
                summary={summary}
                vehicles={fuelVehicles}
                icon={Droplets}
                iconClassName="text-emerald-600"
                variant="outline"
                className="w-full border-border/70 border-l-4 border-l-emerald-500 hover:border-emerald-600/40 hover:border-l-emerald-500 hover:bg-emerald-600/5"
              />
              <FuelMovementDialog
                company={company}
                type="external_refuel"
                summary={summary}
                vehicles={fuelVehicles}
                icon={Fuel}
                iconClassName="text-emerald-600"
                variant="outline"
                className="w-full border-border/70 border-l-4 border-l-emerald-500 hover:border-emerald-600/40 hover:border-l-emerald-500 hover:bg-emerald-600/5"
              />
              <FuelMovementDialog
                company={company}
                type="warehouse_unload"
                summary={summary}
                vehicles={fuelVehicles}
                icon={ArrowDownToLine}
                iconClassName="text-emerald-600"
                variant="outline"
                className="w-full border-border/70 border-l-4 border-l-emerald-500 hover:border-emerald-600/40 hover:border-l-emerald-500 hover:bg-emerald-600/5"
              />
            </div>
          </div>

          <div className="space-y-2 sm:px-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Despachos
            </p>
            <div className="space-y-1.5">
              <FuelMovementDialog
                company={company}
                type="warehouse_dispatch_vehicle"
                summary={summary}
                vehicles={fuelVehicles}
                icon={Truck}
                iconClassName="text-sky-600"
                variant="outline"
                className="w-full border-border/70 border-l-4 border-l-sky-500 hover:border-sky-600/40 hover:border-l-sky-500 hover:bg-sky-600/5"
              />
              <FuelMovementDialog
                company={company}
                type="warehouse_dispatch_third_party"
                summary={summary}
                vehicles={fuelVehicles}
                icon={ArrowUpFromLine}
                iconClassName="text-sky-600"
                variant="outline"
                className="w-full border-border/70 border-l-4 border-l-sky-500 hover:border-sky-600/40 hover:border-l-sky-500 hover:bg-sky-600/5"
              />
            </div>
          </div>

          <div className="space-y-2 sm:pl-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Consumo
            </p>
            <div className="space-y-1.5">
              <FuelMovementDialog
                company={company}
                type="vehicle_daily_consumption"
                summary={summary}
                vehicles={fuelVehicles}
                icon={CalendarMinus}
                iconClassName="text-amber-600"
                variant="outline"
                className="w-full border-border/70 border-l-4 border-l-amber-500 hover:border-amber-600/40 hover:border-l-amber-500 hover:bg-amber-600/5"
              />
              <FuelMovementDialog
                company={company}
                type="vehicle_trip"
                summary={summary}
                vehicles={fuelVehicles}
                icon={Route}
                iconClassName="text-amber-600"
                variant="outline"
                className="w-full border-border/70 border-l-4 border-l-amber-500 hover:border-amber-600/40 hover:border-l-amber-500 hover:bg-amber-600/5"
              />
            </div>
          </div>
        </div>

        {/* --- Tabs con datos --- */}
        <Tabs value={activeFuelTab} onValueChange={setActiveFuelTab} className="space-y-4">
          <TabsList className="gap-1 rounded-full border border-slate-200/70 bg-slate-100/60 p-1 dark:border-slate-800 dark:bg-slate-800/40">
            <TabsTrigger
              value="movements"
              className="relative z-0 rounded-full bg-transparent px-4 shadow-none transition-colors data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {activeFuelTab === "movements" && (
                <motion.span
                  layoutId="fuel-tabs-pill"
                  className="absolute inset-0 rounded-full bg-background shadow-sm"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10 inline-flex items-center">
                Movimientos
                {(movementsPagination?.total ?? 0) > 0 && (
                  <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums leading-none">
                    {movementsPagination?.total}
                  </span>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="vehicles"
              className="relative z-0 rounded-full bg-transparent px-4 shadow-none transition-colors data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {activeFuelTab === "vehicles" && (
                <motion.span
                  layoutId="fuel-tabs-pill"
                  className="absolute inset-0 rounded-full bg-background shadow-sm"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10 inline-flex items-center">
                Vehiculos
                {fuelVehicles.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums leading-none">
                    {fuelVehicles.length}
                  </span>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="traceability"
              className="relative z-0 rounded-full bg-transparent px-4 shadow-none transition-colors data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {activeFuelTab === "traceability" && (
                <motion.span
                  layoutId="fuel-tabs-pill"
                  className="absolute inset-0 rounded-full bg-background shadow-sm"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">Trazabilidad</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movements" className="space-y-4">
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Desde
                  </Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                    className={filterFieldClass(dateFrom !== "")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Hasta
                  </Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                    className={filterFieldClass(dateTo !== "")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Combustible
                  </Label>
                  <Select
                    value={movementFuelType}
                    onValueChange={(value) =>
                      setMovementFuelType(value as FuelType | "all")
                    }
                  >
                    <SelectTrigger className={filterFieldClass(movementFuelType !== "all")}>
                      <SelectValue placeholder="Combustible" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {FUEL_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Vehiculo
                  </Label>
                  <Select value={vehicleId} onValueChange={setVehicleId}>
                    <SelectTrigger className={filterFieldClass(vehicleId !== "all")}>
                      <SelectValue placeholder="Vehiculo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {vehicleOptionsForFilter.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          {vehicle.plate || "Sin placa"} - {formatLiters(vehicle.current_balance_liters)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Tercero
                  </Label>
                  <Select value={thirdPartyId} onValueChange={setThirdPartyId}>
                    <SelectTrigger className={filterFieldClass(thirdPartyId !== "all")}>
                      <SelectValue placeholder="Tercero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {thirdParties?.map((thirdParty) => (
                        <SelectItem key={thirdParty.id} value={thirdParty.id}>
                          {thirdParty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Tipo
                  </Label>
                  <Select
                    value={movementType}
                    onValueChange={(value) =>
                      setMovementType(value as FuelMovementType | "all")
                    }
                  >
                    <SelectTrigger className={filterFieldClass(movementType !== "all")}>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {movementFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
                    onClick={clearFilters}
                  >
                    <X className="h-3.5 w-3.5" />
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>

            {movementsLoading ? (
              <LoadingPage />
            ) : (
              <>
                <FuelMovementsTable
                  company={company}
                  movements={fuelMovements}
                  vehicles={fuelVehicles}
                  isSuperUser={isSuperUser}
                />
                {movementsPagination && movementsPagination.last_page > 1 && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {movementsPagination.from ?? 0}-{movementsPagination.to ?? 0}{" "}
                      de {movementsPagination.total}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 px-2"
                        onClick={() =>
                          setMovementPage((page) => Math.max(1, page - 1))
                        }
                        disabled={movementsPagination.current_page <= 1}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Anterior
                      </Button>
                      <span className="px-1 tabular-nums">
                        Pagina {movementsPagination.current_page} de{" "}
                        {movementsPagination.last_page}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 px-2"
                        onClick={() =>
                          setMovementPage((page) =>
                            Math.min(movementsPagination.last_page, page + 1),
                          )
                        }
                        disabled={
                          movementsPagination.current_page >=
                          movementsPagination.last_page
                        }
                      >
                        Siguiente
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="vehicles">
            <FuelVehiclesTable
              company={company}
              vehicles={fuelVehicles}
              isSuperUser={isSuperUser}
            />
          </TabsContent>

          <TabsContent value="traceability">
            <FuelTraceabilityPanel
              company={company}
              movements={traceabilityMovements}
              vehicles={fuelVehicles}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
}
