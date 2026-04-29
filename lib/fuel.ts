import {
  FuelFifoRow,
  FuelMovement,
  FuelMovementStatus,
  FuelMovementType,
  FuelTraceabilityDetail,
  FuelVehicle,
  FuelVehicleStatus,
  FuelVehicleType,
} from "@/types";

export const FUEL_ALLOWED_ROLES = ["SUPERUSER", "JEFE_ALMACEN"];

export const FUEL_QUERY_KEYS = {
  all: ["fuel"] as const,
  summary: (company?: string) => [...FUEL_QUERY_KEYS.all, "summary", company] as const,
  vehicles: (company?: string) => [...FUEL_QUERY_KEYS.all, "vehicles", company] as const,
  movements: (company?: string, filters?: unknown) =>
    [...FUEL_QUERY_KEYS.all, "movements", company, filters] as const,
  movement: (company?: string, id?: number | null) =>
    [...FUEL_QUERY_KEYS.all, "movement", company, id] as const,
  traceability: (company?: string, movementId?: number | null) =>
    [...FUEL_QUERY_KEYS.all, "traceability", company, movementId] as const,
};

export const FUEL_VEHICLE_TYPES: Array<{
  value: FuelVehicleType;
  label: string;
}> = [
  { value: "car", label: "Carro" },
  { value: "truck", label: "Camion" },
  { value: "motorcycle", label: "Moto" },
  { value: "other", label: "Otro" },
];

export const FUEL_MOVEMENT_LABELS: Record<FuelMovementType, string> = {
  warehouse_initial_balance: "Saldo inicial almacen",
  vehicle_initial_balance: "Saldo inicial vehiculo",
  external_refuel: "Surtido externo",
  warehouse_unload: "Descarga al almacen",
  warehouse_dispatch_vehicle: "Despacho a vehiculo",
  warehouse_dispatch_third_party: "Despacho a tercero",
  vehicle_daily_consumption: "Consumo diario",
  annulment: "Anulacion",
};

export const FUEL_MOVEMENT_DESCRIPTIONS: Record<FuelMovementType, string> = {
  warehouse_initial_balance: "Carga inicial auditable del inventario almacenado.",
  vehicle_initial_balance: "Carga inicial auditada al registrar un vehiculo.",
  external_refuel: "Aumenta el saldo de un vehiculo por surtido externo.",
  warehouse_unload: "Mueve combustible del vehiculo al almacen.",
  warehouse_dispatch_vehicle: "Despacha combustible del almacen a un vehiculo.",
  warehouse_dispatch_third_party: "Despacha combustible del almacen a un tercero.",
  vehicle_daily_consumption: "Registra consumo operativo diario del vehiculo.",
  annulment: "Reverso auditable de un movimiento.",
};

export const FUEL_ERROR_MESSAGES: Record<string, string> = {
  INSUFFICIENT_WAREHOUSE_STOCK:
    "No hay suficiente combustible disponible en almacen.",
  INSUFFICIENT_VEHICLE_BALANCE:
    "El vehiculo no tiene saldo suficiente para esta operacion.",
  VEHICLE_CAPACITY_EXCEEDED:
    "La operacion supera la capacidad del tanque del vehiculo.",
  MOVEMENT_ALREADY_ANNULLED: "Este movimiento ya fue anulado.",
  MOVEMENT_NOT_ANNULABLE: "Este movimiento no puede anularse.",
  FIFO_ENTRY_ALREADY_CONSUMED:
    "No se puede anular porque la entrada ya fue usada en despachos posteriores.",
  DUPLICATE_VEHICLE_PLATE: "Ya existe un vehiculo con esta placa.",
  INACTIVE_VEHICLE: "El vehiculo esta inactivo y no acepta nuevos movimientos.",
  INVALID_THIRD_PARTY: "El tercero seleccionado no es valido.",
  INVALID_LITERS: "La cantidad de litros debe ser mayor a 0.",
  INVALID_TANK_CAPACITY: "La capacidad del tanque debe ser mayor a 0.",
  CONCURRENT_STOCK_CONFLICT:
    "El saldo cambio mientras registrabas la operacion. Actualiza e intenta de nuevo.",
};

export const formatLiters = (value?: number | string | null) => {
  const numericValue = Number(value ?? 0);
  return `${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericValue)} L`;
};

export const getFuelVehicleTypeLabel = (type?: FuelVehicleType | string) =>
  FUEL_VEHICLE_TYPES.find((item) => item.value === type)?.label ?? "Otro";

export const getFuelMovementLabel = (type?: FuelMovementType | string) =>
  type && type in FUEL_MOVEMENT_LABELS
    ? FUEL_MOVEMENT_LABELS[type as FuelMovementType]
    : "Movimiento";

export const getFuelStatusLabel = (
  status?: FuelMovementStatus | FuelVehicleStatus | string,
) => {
  if (status === "active") return "Activo";
  if (status === "inactive") return "Inactivo";
  if (status === "annulled") return "Anulado";
  return "Sin estado";
};

export const getFuelErrorMessage = (error: unknown) => {
  const maybeAxiosError = error as {
    response?: { data?: { code?: string; message?: string } };
    message?: string;
  };
  const code = maybeAxiosError.response?.data?.code;
  if (code && FUEL_ERROR_MESSAGES[code]) return FUEL_ERROR_MESSAGES[code];
  return (
    maybeAxiosError.response?.data?.message ||
    maybeAxiosError.message ||
    "No se pudo completar la operacion."
  );
};

export const normalizeFuelVehicleType = (
  value?: string | null,
): FuelVehicleType => {
  const normalized = value?.toLowerCase();
  if (normalized === "car") return "car";
  if (normalized === "truck") return "truck";
  if (normalized === "motorcycle") return "motorcycle";
  return "other";
};

export const normalizeFuelVehicleStatus = (
  value?: string | null,
): FuelVehicleStatus => {
  return value?.toLowerCase() === "inactive" ? "inactive" : "active";
};

export const normalizeFuelMovementStatus = (
  value?: string | null,
): FuelMovementStatus => {
  return value?.toLowerCase() === "annulled" ? "annulled" : "active";
};

export const normalizeFuelMovementType = (
  value?: string | null,
): FuelMovementType => {
  const normalized = value?.toLowerCase();
  if (normalized === "warehouse_initial_balance")
    return "warehouse_initial_balance";
  if (normalized === "vehicle_initial_balance") return "vehicle_initial_balance";
  if (normalized === "external_refuel") return "external_refuel";
  if (normalized === "warehouse_unload") return "warehouse_unload";
  if (normalized === "warehouse_dispatch_vehicle")
    return "warehouse_dispatch_vehicle";
  if (normalized === "warehouse_dispatch_third_party")
    return "warehouse_dispatch_third_party";
  if (normalized === "vehicle_daily_consumption")
    return "vehicle_daily_consumption";
  return "annulment";
};

export const normalizeFuelVehicle = (vehicle: any): FuelVehicle => ({
  ...vehicle,
  type: normalizeFuelVehicleType(vehicle?.type),
  status: normalizeFuelVehicleStatus(vehicle?.status),
  tank_capacity_liters: Number(vehicle?.tank_capacity_liters ?? 0),
  current_balance_liters: Number(vehicle?.current_balance_liters ?? 0),
});

export const normalizeFuelMovement = (movement: any): FuelMovement => ({
  ...movement,
  type: normalizeFuelMovementType(movement?.type),
  status: normalizeFuelMovementStatus(movement?.status),
  liters: Number(movement?.liters ?? 0),
  vehicle: movement?.vehicle ? normalizeFuelVehicle(movement.vehicle) : null,
});

export const normalizeFuelFifoRow = (row: any): FuelFifoRow => ({
  ...row,
  entry_type: normalizeFuelMovementType(row?.entry_type),
  source_vehicle: row?.source_vehicle
    ? normalizeFuelVehicle(row.source_vehicle)
    : null,
  liters_taken: Number(row?.liters_taken ?? 0),
  remaining_liters_after_dispatch: Number(
    row?.remaining_liters_after_dispatch ?? 0,
  ),
});

export const normalizeFuelTraceability = (
  detail: any,
): FuelTraceabilityDetail => ({
  ...detail,
  total_liters: Number(detail?.total_liters ?? 0),
  fifo_rows: Array.isArray(detail?.fifo_rows)
    ? detail.fifo_rows.map(normalizeFuelFifoRow)
    : [],
});
