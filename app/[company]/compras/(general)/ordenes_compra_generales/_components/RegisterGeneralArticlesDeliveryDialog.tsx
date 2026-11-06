"use client";

import { flattenDepartments } from "@/lib/departments";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Building2,
  Calendar as CalendarIcon,
  Check,
  Handshake,
  Loader2,
  PackageCheck,
  User,
  UserCog,
  Warehouse as WarehouseIcon,
} from "lucide-react";

import {
  useRegisterGeneralArticlesDelivery,
  type GeneralArticlesDeliveryDestination,
} from "@/actions/mantenimiento/compras/ordenes_compras/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Input } from "@/components/ui/input";
import {
  SearchableSelect,
  type SearchableOption,
} from "@/components/misc/SearchableSelect";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetWarehousesByLocation } from "@/hooks/administracion/useGetWarehousesByUser";
import { useGetDepartments } from "@/hooks/ajustes/departamento/useGetDepartment";
import { useGetEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetEmployees";
import { useGetExternalEmployees } from "@/hooks/ajustes/convenios/useGetExternalEmployees";
import { useGetThirdParties } from "@/hooks/general/terceros/useGetThirdParties";
import { useCompanyStore } from "@/stores/CompanyStore";
import { cn } from "@/lib/utils";
import type { Department } from "@/types";
import type {
  PurchaseOrder,
  PurchaseOrderGeneralArticle,
} from "@/types/purchase";

// Departments come back as a tree (each with nested `descendants`), so the
// selector must flatten it to let the user pick any department, not just
// the top-level ones.
// Destino de la entrega: el almacén (flujo normal, intake PENDING que el
// almacén confirma) o una entrega directa afiliada a un departamento,
// empleado, autorizado o tercero — mismas entidades que la requisición
// general — que nace DELIVERED, no pasa por inventario y genera Nota de Entrega.
type DestinationType =
  "WAREHOUSE" | "DEPARTMENT" | "EMPLOYEE" | "AUTHORIZED" | "THIRD_PARTY";

const DESTINATION_OPTIONS: {
  value: DestinationType;
  label: string;
  Icon: typeof WarehouseIcon;
}[] = [
  { value: "WAREHOUSE", label: "Almacén", Icon: WarehouseIcon },
  { value: "DEPARTMENT", label: "Departamento", Icon: Building2 },
  { value: "EMPLOYEE", label: "Empleado", Icon: User },
  { value: "AUTHORIZED", label: "Solicitante externo", Icon: UserCog },
  { value: "THIRD_PARTY", label: "Tercero", Icon: Handshake },
];

export default function RegisterGeneralArticlesDeliveryDialog({
  po,
  company,
  open,
  onOpenChange,
}: {
  po: PurchaseOrder;
  company: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { registerGeneralArticlesDelivery } =
    useRegisterGeneralArticlesDelivery();
  const { selectedStation } = useCompanyStore();

  // Elegible para (re)registrar entrega si nunca se registró una, o si la
  // última entrada fue rechazada por almacén (discrepancia física) y debe
  // volver a entregarse sobre la misma línea de la orden.
  const pendingItems = useMemo(
    () =>
      (po.general_article_purchase_order ?? []).filter(
        (item) =>
          !item.general_article_intake ||
          item.general_article_intake.status === "REJECTED",
      ),
    [po.general_article_purchase_order],
  );

  const [arrivedAt, setArrivedAt] = useState<Date>(() => new Date());
  const [selected, setSelected] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(pendingItems.map((item) => [item.id, true])),
  );
  const [destinationType, setDestinationType] =
    useState<DestinationType>("WAREHOUSE");
  const [destinationId, setDestinationId] = useState<string>("");

  const { data: warehouses, isLoading: isWarehousesLoading } =
    useGetWarehousesByLocation({
      company,
      location_id: selectedStation ?? null,
    });
  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments(open ? company : undefined);
  const { data: employees, isLoading: isEmployeesLoading } =
    useGetEmployeesByCompany(open ? company : undefined);
  const { data: authorizedEmployees, isLoading: isAuthorizedLoading } =
    useGetExternalEmployees(
      open ? company : undefined,
      "purchases.requisition",
    );
  const { data: thirdParties, isLoading: isThirdPartiesLoading } =
    useGetThirdParties();

  // Solo los almacenes de tipo GENERAL de la estación activa son destinos
  // válidos para artículos generales.
  const generalWarehouses = useMemo(
    () =>
      (warehouses ?? []).filter(
        (warehouse) => warehouse.type?.toUpperCase() === "GENERAL",
      ),
    [warehouses],
  );

  const allDepartments = useMemo(
    () => flattenDepartments(departments ?? []),
    [departments],
  );

  // Por defecto la entrega va al primer almacén GENERAL de la estación. Los
  // almacenes llegan por fetch, así que el default se resuelve al renderizar
  // en vez de fijarse en el estado inicial.
  const resolvedDestinationId =
    destinationId ||
    (destinationType === "WAREHOUSE" && generalWarehouses.length > 0
      ? generalWarehouses[0].id.toString()
      : "");

  const toggleItem = (id: number) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectedIds = pendingItems
    .filter((item) => selected[item.id])
    .map((item) => item.id);
  const selectedCount = selectedIds.length;
  const allSelected =
    selectedCount === pendingItems.length && pendingItems.length > 0;

  const toggleAll = () => {
    const next = !allSelected;
    setSelected(
      Object.fromEntries(pendingItems.map((item) => [item.id, next])),
    );
  };

  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return;
    setArrivedAt((prev) => {
      const next = new Date(day);
      next.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
      return next;
    });
  };

  const handleTimeChange = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;
    setArrivedAt((prev) => {
      const next = new Date(prev);
      next.setHours(hours, minutes, 0, 0);
      return next;
    });
  };

  const isDirectDelivery = destinationType !== "WAREHOUSE";

  const destinationOptions: SearchableOption[] = (() => {
    switch (destinationType) {
      case "WAREHOUSE":
        return generalWarehouses.map((warehouse) => ({
          value: warehouse.id.toString(),
          label: warehouse.name,
        }));
      case "DEPARTMENT":
        return allDepartments.map((department) => ({
          value: department.id.toString(),
          label: department.name,
        }));
      case "EMPLOYEE":
        return (employees ?? []).map((employee) => ({
          value: employee.id.toString(),
          label: `${employee.first_name} ${employee.last_name}`,
          description: employee.dni || undefined,
        }));
      case "AUTHORIZED":
        return (authorizedEmployees ?? []).map((authorized) => ({
          value: authorized.id.toString(),
          label: authorized.employee_name,
        }));
      default:
        return (thirdParties ?? []).map((thirdParty) => ({
          value: thirdParty.id.toString(),
          label: thirdParty.name,
        }));
    }
  })();

  const destinationLoading = {
    WAREHOUSE: isWarehousesLoading,
    DEPARTMENT: isDepartmentsLoading,
    EMPLOYEE: isEmployeesLoading,
    AUTHORIZED: isAuthorizedLoading,
    THIRD_PARTY: isThirdPartiesLoading,
  }[destinationType];

  const destinationPlaceholder = {
    WAREHOUSE: "Seleccione el almacén",
    DEPARTMENT: "Seleccione el departamento",
    EMPLOYEE: "Seleccione el empleado",
    AUTHORIZED: "Seleccione el autorizado",
    THIRD_PARTY: "Seleccione el tercero",
  }[destinationType];

  const canSubmit =
    selectedCount > 0 &&
    resolvedDestinationId !== "" &&
    !registerGeneralArticlesDelivery.isPending;

  const handleSubmit = () => {
    const id = Number(resolvedDestinationId);

    const destination: GeneralArticlesDeliveryDestination = {
      locationId: selectedStation ?? undefined,
      ...(destinationType === "WAREHOUSE" ? { warehouseId: id } : {}),
      ...(destinationType === "DEPARTMENT" ? { departmentId: id } : {}),
      ...(destinationType === "EMPLOYEE" ? { employeeId: id } : {}),
      ...(destinationType === "AUTHORIZED" ? { authorizedEmployeeId: id } : {}),
      ...(destinationType === "THIRD_PARTY" ? { thirdPartyId: id } : {}),
    };

    registerGeneralArticlesDelivery.mutate(
      {
        id: po.id,
        company,
        arrivedAt,
        generalArticlePurchaseOrderIds: selectedIds,
        destination,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-140"
        icon={PackageCheck}
        title="Registrar entrega de artículos"
        description={
          <>
            Confirme qué artículos generales de{" "}
            <span className="font-medium text-foreground">
              {po.order_number}
            </span>{" "}
            llegaron físicamente. Los que desmarque quedarán pendientes para
            una entrega posterior.
          </>
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={registerGeneralArticlesDelivery.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="min-w-35 gap-2"
            >
              {registerGeneralArticlesDelivery.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <PackageCheck className="size-4" />
                  Confirmar entrega
                </>
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm font-medium text-foreground select-none"
            >
              <div
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                  allSelected
                    ? "border-primary bg-primary text-white"
                    : "border-muted-foreground/30",
                )}
              >
                {allSelected && <Check className="size-3" />}
              </div>
              Artículos pendientes de entrega
            </button>

            <span className="text-xs text-muted-foreground tabular-nums select-none">
              {selectedCount} de {pendingItems.length} seleccionado
              {pendingItems.length === 1 ? "" : "s"}
            </span>
          </div>

          <ScrollArea
            className={cn("w-full", pendingItems.length > 6 && "h-70")}
          >
            <div className="space-y-1.5 pr-1">
              {pendingItems.map((item) => (
                <ArticleRow
                  key={item.id}
                  item={item}
                  checked={selected[item.id] ?? false}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}

              {pendingItems.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground italic">
                  No hay artículos generales pendientes de entrega.
                </p>
              )}
            </div>
          </ScrollArea>

          {/* Destino de la entrega */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Destino de la entrega
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={destinationType}
                onValueChange={(value) => {
                  setDestinationType(value as DestinationType);
                  setDestinationId("");
                }}
              >
                <SelectTrigger className="h-9 bg-background/70 text-sm sm:w-44 sm:shrink-0">
                  <SelectValue placeholder="Tipo de destino" />
                </SelectTrigger>
                <SelectContent>
                  {DESTINATION_OPTIONS.map(({ value, label, Icon }) => (
                    <SelectItem key={value} value={value}>
                      <span className="flex items-center gap-2">
                        <Icon className="size-3.5 opacity-70" />
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <SearchableSelect
                value={resolvedDestinationId}
                onChange={setDestinationId}
                loading={destinationLoading}
                options={destinationOptions}
                placeholder={destinationPlaceholder}
                searchPlaceholder="Buscar..."
                emptyText={
                  destinationType === "WAREHOUSE"
                    ? "No hay almacenes de tipo General en esta estación."
                    : "Sin resultados"
                }
                triggerClassName="h-9 flex-1 text-sm"
              />
            </div>

            {isDirectDelivery && (
              <p className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs leading-relaxed text-blue-700 dark:text-blue-300">
                Entrega directa: los artículos no entrarán al inventario del
                almacén ni requieren confirmación. El registro quedará en
                Recepción General y podrá descargar su{" "}
                <span className="font-medium">Nota de Entrega</span>.
              </p>
            )}
          </div>

          {/* Fecha y hora de llegada */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Fecha y hora de llegada
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 flex-1 justify-start text-sm bg-background/70",
                      !arrivedAt && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3 opacity-60" />
                    {format(arrivedAt, "dd MMM yyyy", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={arrivedAt}
                    onSelect={handleDateSelect}
                    locale={es}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>

              <Input
                type="time"
                value={format(arrivedAt, "HH:mm")}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="h-9 w-28 bg-background/70 text-sm"
              />
            </div>
          </div>
        </div>
      </FormDialogContent>
    </Dialog>
  );
}

const ArticleRow = ({
  item,
  checked,
  onToggle,
}: {
  item: PurchaseOrderGeneralArticle;
  checked: boolean;
  onToggle: () => void;
}) => {
  const req =
    item.general_article_quote_order?.general_article_requisition_order;
  const description = req?.description ?? "Artículo";
  const quantity = item.general_article_quote_order?.quantity;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
        checked
          ? "border-primary/40 bg-primary/4"
          : "border-border/60 bg-background/60 opacity-60",
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
            checked
              ? "border-primary bg-primary text-white"
              : "border-muted-foreground/30",
          )}
        >
          {checked && <Check className="size-3" />}
        </div>
        <span className="truncate text-sm font-medium text-foreground">
          {description}
        </span>
      </div>

      {quantity != null && (
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {quantity} unid.
        </span>
      )}
    </button>
  );
};
