"use client";

import { PanelSection } from "@/components/forms/PanelSection";
import { flattenDepartments } from "@/lib/departments";
import { useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  Handshake,
  Info,
  Loader2,
  MapPin,
  PackageCheck,
  Package,
  User,
  UserCog,
  Warehouse as WarehouseIcon,
} from "lucide-react";

import {
  useRegisterGeneralArticlesDelivery,
  type GeneralArticlesDeliveryDestination,
} from "@/actions/mantenimiento/compras/ordenes_compras/actions";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { CheckboxCard } from "@/components/forms/mantenimiento/almacen/_components/CheckboxCard";
import { selectTriggerClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { DateTimeField } from "@/components/misc/DateTimeField";
import {
  SearchableSelect,
  type SearchableOption,
} from "@/components/misc/SearchableSelect";
import { TagBadge } from "@/components/misc/TagBadge";
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
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { useCompanyStore } from "@/stores/CompanyStore";
import { toZonedWallClock, zonedWallClockToUtcIso } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useResettingState } from "@/hooks/useResettingState";
import type { PurchaseOrder } from "@/types/purchase";

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

const pickerClass = cn(
  selectTriggerClass,
  "h-10 px-3 text-sm max-sm:text-base",
);

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
  const timeZone = useCompanyTimezone();

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

  // La llegada es la hora de pared de la compañía: el valor por defecto es
  // "ahora" en esa zona y lo que se manda es el instante UTC equivalente. Si la
  // zona llega después de abrir el diálogo, el valor por defecto se rehace con
  // ella: dejarlo calculado con la zona provisional lo mandaría desfasado.
  const [arrivedAt, setArrivedAt] = useResettingState<Date | null>(
    () => toZonedWallClock(new Date(), timeZone),
    [timeZone],
  );
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

  // Los departamentos llegan como árbol (cada uno con `descendants` anidados):
  // se aplanan para poder elegir cualquiera, no solo los de primer nivel.
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

  const selectedIds = pendingItems
    .filter((item) => selected[item.id])
    .map((item) => item.id);
  const selectedCount = selectedIds.length;
  const allSelected =
    selectedCount === pendingItems.length && pendingItems.length > 0;

  const toggleAll = () =>
    setSelected(
      Object.fromEntries(pendingItems.map((item) => [item.id, !allSelected])),
    );

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

  const blocker =
    selectedCount === 0
      ? "Marque al menos un artículo."
      : resolvedDestinationId === ""
        ? "Elija el destino de la entrega."
        : !arrivedAt
          ? "Indique la fecha de llegada."
          : null;

  const canSubmit =
    blocker === null && !registerGeneralArticlesDelivery.isPending;

  const handleSubmit = () => {
    if (!arrivedAt) return;

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
        arrivedAt: new Date(zonedWallClockToUtcIso(arrivedAt, timeZone)),
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
            llegaron físicamente. Los que desmarque quedarán pendientes para una
            entrega posterior.
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
                <PackageCheck className="size-4" />
              )}
              Confirmar entrega
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <PanelSection
            icon={Package}
            title="Artículos pendientes de entrega"
            hint={`${selectedCount} de ${pendingItems.length} seleccionado${pendingItems.length === 1 ? "" : "s"}`}
            compact
            action={
              pendingItems.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={toggleAll}
                  className="h-9 px-3 text-sm max-sm:h-10"
                >
                  {allSelected ? "Quitar todos" : "Marcar todos"}
                </Button>
              ) : undefined
            }
          >
            <div className="space-y-2">
              {pendingItems.map((item) => {
                const req =
                  item.general_article_quote_order
                    ?.general_article_requisition_order;
                const quantity = item.general_article_quote_order?.quantity;

                return (
                  <CheckboxCard
                    key={item.id}
                    id={`delivery-item-${item.id}`}
                    checked={selected[item.id] ?? false}
                    onCheckedChange={(checked) =>
                      setSelected((prev) => ({ ...prev, [item.id]: checked }))
                    }
                    label={req?.description ?? "Artículo"}
                    description={
                      quantity != null ? `${quantity} unid.` : undefined
                    }
                  />
                );
              })}

              {pendingItems.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground italic">
                  No hay artículos generales pendientes de entrega.
                </p>
              )}
            </div>
          </PanelSection>

          <PanelSection
            icon={MapPin}
            title="Destino de la entrega"
            hint="Al almacén, o directo a quien lo solicitó."
            compact
          >
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select
                  value={destinationType}
                  onValueChange={(value) => {
                    setDestinationType(value as DestinationType);
                    setDestinationId("");
                  }}
                >
                  <SelectTrigger
                    className={cn(pickerClass, "sm:w-52 sm:shrink-0")}
                  >
                    <SelectValue placeholder="Tipo de destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {DESTINATION_OPTIONS.map(({ value, label, Icon }) => (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <Icon className="size-4 opacity-70" />
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
                  triggerClassName={cn(pickerClass, "flex-1")}
                />
              </div>

              {isDirectDelivery && (
                <div className="flex items-start gap-2.5 rounded-xl border border-sky-300/70 bg-sky-50 p-3.5 text-[13px] leading-relaxed text-sky-900 motion-safe:animate-reveal dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-200">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  <p>
                    Entrega directa: los artículos no entrarán al inventario del
                    almacén ni requieren confirmación. El registro quedará en
                    Recepción General y podrá descargar su{" "}
                    <span className="font-medium">Nota de Entrega</span>.
                  </p>
                </div>
              )}
            </div>
          </PanelSection>

          <PanelSection
            icon={CalendarClock}
            title="Fecha y hora de llegada"
            hint="Hora de la compañía."
            compact
          >
            <DateTimeField
              label="Llegada"
              value={arrivedAt}
              onChange={setArrivedAt}
            />
          </PanelSection>

          {blocker && pendingItems.length > 0 && (
            <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Info className="size-3.5 shrink-0" />
              {blocker}
            </p>
          )}
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
