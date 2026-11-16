"use client";

import { locationLabel } from "@/lib/locations";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Building2,
  Check,
  ChevronsUpDown,
  Loader2,
  Plane,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";
import { AircraftCombobox } from "./AircraftCombobox";
import { BackdatedDispatchField } from "./BackdatedDispatchField";
import { DispatchTypeHelp } from "./DispatchTypeHelp";
import { OptionCombobox } from "./OptionCombobox";
import { SectionHeader } from "./SectionHeader";
import type { useDispatchForm } from "@/components/forms/mantenimiento/almacen/_hooks/useDispatchForm";

/** Lo que el hook de salidas le entrega a las secciones compartidas. */
export type DispatchFormContext = ReturnType<typeof useDispatchForm>;

const departmentOption = (d: { id: number; name: string }) => ({
  value: d.id.toString(),
  label: d.name,
});

export const DISPATCH_TYPES = [
  { value: "aircraft" as const, label: "Aeronave", icon: Plane },
  { value: "department" as const, label: "Departamento", icon: Building2 },
  { value: "other_company" as const, label: "Otra empresa", icon: UserCheck },
  // El material no sale de la compañía: viaja a otra sede propia y queda
  // esperando que allá acusen recibo.
  { value: "location" as const, label: "Otra sede", icon: Truck },
  { value: "third_party" as const, label: "Terceros", icon: Users },
];

export type DispatchTypeValue = (typeof DISPATCH_TYPES)[number]["value"];

/**
 * Destinos de un componente o una parte: se instalan en una aeronave, viajan a
 * otra sede o salen a un tercero. Departamento y otra empresa son para lo que
 * se consume o se presta.
 */
export const WAREHOUSE_ASSET_DESTINATIONS: readonly DispatchTypeValue[] = [
  "aircraft",
  "location",
  "third_party",
];

// Despachar a un departamento o a otra empresa no pasa por una orden de trabajo.
const TYPES_WITHOUT_WORK_ORDER = ["department", "other_company"];

/** Quién entrega y quién recibe: igual en todas las salidas. */
export function DispatchResponsibleSection({
  ctx,
}: {
  ctx: DispatchFormContext;
}) {
  const {
    form,
    user,
    openEmployee,
    setOpenEmployee,
    employees,
    employeesLoading,
    dispatchType,
    selectedCompany,
    internalReceiverRequired,
  } = ctx;

  return (
    <>
      {/* Personal Responsable */}
      <div className="space-y-4">
        <SectionHeader label="Personal Responsable" />
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 *:min-w-0">
          <div className="space-y-2">
            <label className="text-sm font-medium">Entregado por</label>
            <Input
              className="h-10"
              disabled
              value={`${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()}
            />
            <p className="text-xs text-muted-foreground">
              Usuario actual que registra la entrega.
            </p>
          </div>

          {internalReceiverRequired ? (
            <FormField
              control={form.control}
              name="requested_by"
              render={({ field }) => {
                const items = employees ?? [];
                const selected = items.find((e) => `${e.dni}` === field.value);
                return (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">
                      Recibe
                    </FormLabel>
                    <Popover open={openEmployee} onOpenChange={setOpenEmployee}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openEmployee}
                            className={cn(
                              "h-10 w-full justify-between font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {selected
                              ? `${selected.first_name} ${selected.last_name}`
                              : "Seleccione el responsable..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0"
                        align="start"
                        matchTriggerWidth
                      >
                        {employeesLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <Command>
                            <CommandInput placeholder="Buscar empleado..." />
                            <CommandList>
                              <CommandEmpty>
                                No se encontraron empleados.
                              </CommandEmpty>
                              <CommandGroup>
                                {items.map((e) => (
                                  <CommandItem
                                    key={e.id}
                                    value={`${e.first_name} ${e.last_name} ${[e.job_title?.name, e.department?.name].filter(Boolean).join(" - ")}`}
                                    onSelect={() => {
                                      field.onChange(`${e.dni}`);
                                      setOpenEmployee(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 shrink-0",
                                        field.value === `${e.dni}`
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-medium truncate">
                                        {e.first_name} {e.last_name}
                                      </span>
                                      <span className="text-xs text-muted-foreground truncate">
                                        {[e.job_title?.name, e.department?.name]
                                          .filter(Boolean)
                                          .join(" - ")}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        )}
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      {dispatchType === "aircraft"
                        ? `Personal técnico autorizado de ${selectedCompany?.name ?? "la empresa"}: técnicos, ingenieros u otro personal capacitado y habilitado.`
                        : `Listado general de empleados de ${selectedCompany?.name}.`}
                    </p>
                  </FormItem>
                );
              }}
            />
          ) : dispatchType ? (
            <div className="mt-3 text-center items-center rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Para{" "}
              <span className="font-medium">
                {dispatchType === "other_company" ? "Otra empresa" : "Terceros"}
              </span>{" "}
              no se selecciona responsable interno en esta sección.
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

/**
 * Tipo de despacho, orden de trabajo, fecha y destino (aeronave, departamento,
 * otra empresa, otra sede o tercero): lo común a todas las salidas.
 */
export function DispatchRequestSection({
  ctx,
  types = DISPATCH_TYPES.map((type) => type.value),
}: {
  ctx: DispatchFormContext;
  /** Destinos que ofrece la salida; cada categoría admite los suyos. */
  types?: readonly DispatchTypeValue[];
}) {
  const {
    form,
    openThirdParty,
    setOpenThirdParty,
    allDepartments,
    isDepartmentsLoading,
    setSelectedDepartment,
    aircrafts,
    isAircraftsLoading,
    authorizedEmployees,
    isAuthorizedEmployeesLoading,
    selectedAuthorized,
    selectedCompany,
    foreignDestinationSlug,
    destinationCompanies,
    isDestinationCompaniesLoading,
    destinationCompanyName,
    loanDepartments,
    isLoanDepartmentsLoading,
    isThirdPartiesLoading,
    transferLocations,
    isLocationsLoading,
    dispatchType,
    selectedThirdParty,
    groupedThirdParties,
    handleDispatchTypeChange,
    canBackdate,
  } = ctx;

  return (
    <>
      {/* Información de la Solicitud */}
      <div className="space-y-4">
        <SectionHeader label="Información de la Solicitud" />

        <div className="flex justify-center">
          <FormField
            control={form.control}
            name="dispatch_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex justify-center mb-2">
                  Tipo de Despacho
                </FormLabel>
                <div className="flex items-center justify-center gap-2">
                  <FormControl>
                    <div className="inline-flex max-w-full flex-wrap justify-center rounded-lg border bg-muted/30 p-1 gap-1">
                      {DISPATCH_TYPES.filter(({ value }) =>
                        types.includes(value),
                      ).map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            handleDispatchTypeChange(value, field.onChange)
                          }
                          className={cn(
                            "flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                            field.value === value
                              ? "bg-background text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <DispatchTypeHelp current={field.value} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div
          className={cn(
            "grid grid-cols-1 gap-4 *:min-w-0",
            canBackdate ? "md:grid-cols-3" : "md:grid-cols-2",
          )}
        >
          {!TYPES_WITHOUT_WORK_ORDER.includes(dispatchType) && (
            <FormField
              control={form.control}
              name="work_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Ord. de Trabajo
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 w-full"
                      placeholder="Ej: OT-000123"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <BackdatedDispatchField form={form} canBackdate={canBackdate} />

          {dispatchType === "location" && (
            <FormField
              control={form.control}
              name="destination_location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Sede destino
                  </FormLabel>
                  <OptionCombobox
                    options={transferLocations?.map((location) => ({
                      value: location.id.toString(),
                      label: locationLabel(location, " — "),
                    }))}
                    placeholder="Seleccione la sede destino..."
                    searchPlaceholder="Buscar sede..."
                    emptyText="No se encontraron sedes."
                    value={field.value}
                    loading={isLocationsLoading}
                    onChange={field.onChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    La salida quedará en tránsito hasta que esa sede confirme la
                    recepción.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {dispatchType === "department" && (
            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Departamento de {selectedCompany?.name}
                  </FormLabel>
                  <OptionCombobox
                    options={allDepartments?.map(departmentOption)}
                    placeholder="Seleccione un departamento..."
                    searchPlaceholder="Buscar departamento..."
                    emptyText="No se encontraron departamentos."
                    value={field.value}
                    loading={isDepartmentsLoading}
                    onChange={(val) => {
                      field.onChange(val);
                      const dep = allDepartments?.find(
                        (d) => d.id.toString() === val,
                      );
                      if (dep) setSelectedDepartment(dep);
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {dispatchType === "aircraft" && (
            <FormField
              control={form.control}
              name="aircraft_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Aeronave
                  </FormLabel>
                  <AircraftCombobox
                    aircrafts={aircrafts}
                    value={field.value}
                    onChange={field.onChange}
                    loading={isAircraftsLoading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {dispatchType === "other_company" && (
            <>
              <FormField
                control={form.control}
                name="authorized_employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Quién recibe
                    </FormLabel>
                    <OptionCombobox
                      options={authorizedEmployees?.map((a) => ({
                        value: a.id.toString(),
                        label: `${a.employee_name} - ${a.from_company_name}`,
                      }))}
                      placeholder="Seleccione un empleado autorizado..."
                      searchPlaceholder="Buscar persona..."
                      emptyText="No se encontraron personas."
                      value={field.value}
                      loading={isAuthorizedEmployeesLoading}
                      onChange={(val) => {
                        field.onChange(val);
                        form.setValue("destination_company_slug", "");
                        form.setValue("destination_department_id", "");
                      }}
                    />
                    {!isAuthorizedEmployeesLoading &&
                      authorizedEmployees?.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No hay empleados autorizados con convenio activo.
                          Configúrelos en Ajustes → Autorizaciones.
                        </p>
                      )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedAuthorized && (
                <>
                  <FormField
                    control={form.control}
                    name="destination_company_slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Empresa destino
                        </FormLabel>
                        <OptionCombobox
                          options={destinationCompanies?.map((c) => ({
                            value: c.slug,
                            label: c.is_own
                              ? `${c.name} (esta empresa)`
                              : c.name,
                          }))}
                          placeholder="¿A qué empresa se atribuye?"
                          searchPlaceholder="Buscar empresa..."
                          emptyText="No se encontraron empresas."
                          loading={isDestinationCompaniesLoading}
                          value={field.value}
                          onChange={(val) => {
                            field.onChange(val);
                            form.setValue("destination_department_id", "");
                          }}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("destination_company_slug") && (
                    <FormField
                      control={form.control}
                      name="destination_department_id"
                      render={({ field }) => {
                        const loading = foreignDestinationSlug
                          ? isLoanDepartmentsLoading
                          : isDepartmentsLoading;
                        const options = foreignDestinationSlug
                          ? (loanDepartments ?? [])
                          : (allDepartments ?? []);

                        return (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Destino en{" "}
                              {destinationCompanyName ?? selectedCompany?.name}
                            </FormLabel>
                            <OptionCombobox
                              options={options.map(departmentOption)}
                              placeholder="Seleccione un departamento..."
                              searchPlaceholder="Buscar departamento..."
                              emptyText="No se encontraron departamentos."
                              value={field.value}
                              loading={loading}
                              onChange={field.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  )}
                </>
              )}
            </>
          )}

          {dispatchType === "third_party" && (
            <FormField
              control={form.control}
              name="third_party_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Tercero</FormLabel>
                  <Popover
                    open={openThirdParty}
                    onOpenChange={setOpenThirdParty}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openThirdParty}
                          className={cn(
                            "h-10 w-full justify-between font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {selectedThirdParty?.name ?? "Selecc. un tercero..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0"
                      align="start"
                      matchTriggerWidth
                    >
                      {isThirdPartiesLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <Command>
                          <CommandInput placeholder="Buscar tercero..." />
                          <CommandList>
                            <CommandEmpty>
                              No se encontraron terceros.
                            </CommandEmpty>
                            {groupedThirdParties.map(([type, items]) => (
                              <CommandGroup
                                key={type}
                                heading={
                                  type === "CLIENT_COMPANY"
                                    ? "EMPRESA"
                                    : "PERSONA"
                                }
                              >
                                {items.map((party) => (
                                  <CommandItem
                                    key={party.id}
                                    value={`${party.name} ${party.type}`}
                                    onSelect={() => {
                                      field.onChange(party.id.toString());
                                      form.setValue(
                                        "requested_by",
                                        party.name,
                                        {
                                          shouldDirty: true,
                                          shouldValidate: true,
                                        },
                                      );
                                      setOpenThirdParty(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 shrink-0",
                                        field.value === party.id.toString()
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <div className="flex min-w-0 flex-col">
                                      <span className="font-medium truncate">
                                        {party.name}
                                      </span>
                                      <span className="text-xs text-muted-foreground truncate">
                                        {party.type === "CLIENT_COMPANY"
                                          ? "EMPRESA"
                                          : "PERSONA"}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            ))}
                          </CommandList>
                        </Command>
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {dispatchType === "third_party" && (
          <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-3">
            <FormField
              control={form.control}
              name="third_party_requested_by"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm font-medium">
                    Solicitado Por
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 w-full"
                      placeholder="Ej: OT-000123"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="third_party_receiver"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm font-medium">
                    Recibirá
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 w-full"
                      placeholder="Ej: OT-000123"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="third_party_authorizer"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm font-medium">
                    Autorizado Por
                  </FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Julian Rodriguez">
                        Julián Rodriguez
                      </SelectItem>
                      <SelectItem value="Ali Ugueto">Ali Ugueto</SelectItem>
                      <SelectItem value="Freddy Guerrero">
                        Freddy Guerrero
                      </SelectItem>
                      <SelectItem value="Fernanda Hernandez">
                        Fernanda Hernandez
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </>
  );
}
