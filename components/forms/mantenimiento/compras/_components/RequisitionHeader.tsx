"use client";
import { flattenDepartments } from "@/lib/departments";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, ClipboardList } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type {
  Employee,
  WorkOrder,
  AeronauticalAircraft,
  Department,
  ThirdParty,
} from "@/types";
import type { ExternalEmployee } from "@/hooks/ajustes/convenios/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/misc/SegmentedTabs";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  FieldLabel,
  RequisitionSection,
  requisitionTriggerClass,
} from "./RequisitionSection";
import { PriorityChoice } from "./PriorityChoice";

// Los empleados propios y los autorizados de otra empresa viven en tablas
// distintas con ids que pueden coincidir, así que el selector se parte en dos
// pestañas en vez de mezclarlos en una lista ambigua.
type RequesterTab = "employee" | "authorized";

interface RequisitionHeaderProps {
  form: UseFormReturn<any>;
  employees?: Employee[];
  employeesLoading: boolean;
  filteredEmployees: Employee[];
  employeeSearch: string;
  setEmployeeSearch: (v: string) => void;
  authorizedEmployees?: ExternalEmployee[];
  isAuthorizedEmployeesLoading?: boolean;
  allowAuthorizedEmployees?: boolean;
  workOrders?: WorkOrder[];
  isWorkOrdersLoading?: boolean;
  isWorkOrdersError?: boolean;
  filteredWorkOrders?: WorkOrder[];
  workOrderSearch?: string;
  setWorkOrderSearch?: (v: string) => void;
  aircrafts?: AeronauticalAircraft[];
  isAircraftsLoading?: boolean;
  filteredAircrafts?: AeronauticalAircraft[];
  aircraftSearch?: string;
  setAircraftSearch?: (v: string) => void;
  aircraftPlaceholder?: string;
  aircraftRequired?: boolean;
  workOrderRequired?: boolean;
  showAircraftWorkOrder?: boolean;
  departments?: Department[];
  isDepartmentsLoading?: boolean;
  thirdParties?: ThirdParty[];
  isThirdPartiesLoading?: boolean;
}

export function RequisitionHeader({
  form,
  employees,
  employeesLoading,
  filteredEmployees,
  employeeSearch,
  setEmployeeSearch,
  authorizedEmployees,
  isAuthorizedEmployeesLoading = false,
  allowAuthorizedEmployees = false,
  workOrders,
  isWorkOrdersLoading,
  isWorkOrdersError,
  filteredWorkOrders,
  workOrderSearch,
  setWorkOrderSearch,
  aircrafts,
  isAircraftsLoading,
  filteredAircrafts,
  aircraftSearch,
  setAircraftSearch,
  aircraftPlaceholder = "Opcional...",
  aircraftRequired = false,
  workOrderRequired = false,
  showAircraftWorkOrder = true,
  departments,
  isDepartmentsLoading,
  thirdParties,
  isThirdPartiesLoading,
}: RequisitionHeaderProps) {
  const [requesterTab, setRequesterTab] = useState<RequesterTab>("employee");
  const [authorizedEmployeeSearch, setAuthorizedEmployeeSearch] = useState("");
  const [workOrderInputOpen, setWorkOrderInputOpen] = useState(false);

  const watchedAuthorizedEmployeeId = useWatch({
    control: form.control,
    name: "requested_by_authorized_employee_id",
  });
  const freeTextWorkOrder: string | undefined = useWatch({
    control: form.control,
    name: "work_order",
  });

  const filteredAuthorizedEmployees = (authorizedEmployees ?? []).filter(
    (emp) => {
      const query = authorizedEmployeeSearch.toLowerCase().trim();
      if (!query) return true;
      return `${emp.employee_name} ${emp.dni_employee} ${emp.from_company_db}`
        .toLowerCase()
        .includes(query);
    },
  );

  const formatAuthorizedEmployeeLabel = (
    authorizedEmployee: ExternalEmployee,
  ) => `${authorizedEmployee.employee_name}`;

  // Los departamentos llegan como árbol (con `descendants` anidados); se
  // aplanan para poder elegir cualquiera, no solo los de primer nivel.
  const allDepartments = departments ? flattenDepartments(departments) : [];

  return (
    <RequisitionSection
      icon={ClipboardList}
      title="Datos de la requisición"
      description="Quién solicita, con qué prioridad y para qué aeronave."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Requester - Searchable Select (regular or authorized employee) */}
        <FormField
          control={form.control}
          name="requested_by"
          render={({ field }) => {
            const authorizedEmployeeId = allowAuthorizedEmployees
              ? watchedAuthorizedEmployeeId
              : undefined;
            const selectedEmployee = !authorizedEmployeeId
              ? employees?.find((e) => `${e.dni}` === field.value)
              : undefined;
            const selectedAuthorizedEmployee = authorizedEmployeeId
              ? authorizedEmployees?.find(
                  (a) => `${a.id}` === authorizedEmployeeId,
                )
              : undefined;

            const selectEmployee = (dni: string) => {
              form.setValue("requested_by", dni);
              if (allowAuthorizedEmployees) {
                form.setValue("requested_by_authorized_employee_id", undefined);
              }
            };

            const selectAuthorizedEmployee = (
              authorizedEmployee: ExternalEmployee,
            ) => {
              form.setValue("requested_by", authorizedEmployee.dni_employee);
              form.setValue(
                "requested_by_authorized_employee_id",
                `${authorizedEmployee.id}`,
              );
            };

            const employeeList = (
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Busque un empleado..."
                  value={employeeSearch}
                  onValueChange={setEmployeeSearch}
                />
                <CommandList>
                  <CommandEmpty className="text-sm p-2 text-center">
                    {employeeSearch
                      ? "No se ha encontrado ningún empleado."
                      : "Escriba para buscar..."}
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredEmployees.map((employee) => (
                      <CommandItem
                        value={`${employee.dni} ${employee.first_name} ${employee.last_name}`}
                        key={employee.id}
                        onSelect={() => selectEmployee(`${employee.dni}`)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            `${employee.dni}` === field.value &&
                              !authorizedEmployeeId
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {employee.first_name} {employee.last_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            );

            return (
              <FormItem className="w-full">
                <FieldLabel preventClick>
                  Solicitante <RequiredIndicator />
                </FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={employeesLoading}
                      variant="outline"
                      role="combobox"
                      className={cn(
                        requisitionTriggerClass,
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {selectedEmployee ? (
                        <span>
                          {selectedEmployee.first_name}{" "}
                          {selectedEmployee.last_name}
                        </span>
                      ) : selectedAuthorizedEmployee ? (
                        <span>
                          {formatAuthorizedEmployeeLabel(
                            selectedAuthorizedEmployee,
                          )}
                        </span>
                      ) : (
                        <span>Elige al solicitante...</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" matchTriggerWidth>
                    {!allowAuthorizedEmployees ? (
                      employeeList
                    ) : (
                      <>
                        <SegmentedTabs
                          value={requesterTab}
                          onValueChange={(v) =>
                            setRequesterTab(v as RequesterTab)
                          }
                        >
                          <SegmentedTabsList
                            size="sm"
                            className="w-full rounded-none border-x-0 border-t-0"
                          >
                            <SegmentedTabsTrigger value="employee">
                              Empleado
                            </SegmentedTabsTrigger>
                            {/* Abreviado: el label completo no cabe en la mitad del popover */}
                            <SegmentedTabsTrigger value="authorized">
                              Empleado Ext.
                            </SegmentedTabsTrigger>
                          </SegmentedTabsList>
                        </SegmentedTabs>
                        {requesterTab === "employee" ? (
                          employeeList
                        ) : (
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Busque un empleado autorizado..."
                              value={authorizedEmployeeSearch}
                              onValueChange={setAuthorizedEmployeeSearch}
                            />
                            <CommandList>
                              <CommandEmpty className="text-sm p-2 text-center">
                                {isAuthorizedEmployeesLoading
                                  ? "Cargando..."
                                  : authorizedEmployeeSearch
                                    ? "No se ha encontrado ningún empleado autorizado."
                                    : authorizedEmployees?.length
                                      ? "Escriba para buscar..."
                                      : "No hay empleados autorizados para esta compañía."}
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredAuthorizedEmployees.map(
                                  (authorizedEmployee) => (
                                    <CommandItem
                                      value={`${authorizedEmployee.id} ${formatAuthorizedEmployeeLabel(authorizedEmployee)}`}
                                      key={authorizedEmployee.id}
                                      onSelect={() =>
                                        selectAuthorizedEmployee(
                                          authorizedEmployee,
                                        )
                                      }
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          `${authorizedEmployee.id}` ===
                                            authorizedEmployeeId
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      {formatAuthorizedEmployeeLabel(
                                        authorizedEmployee,
                                      )}
                                    </CommandItem>
                                  ),
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        )}
                      </>
                    )}
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Priority - Searchable Select */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem className="w-full">
              <FieldLabel preventClick>
                Prioridad <RequiredIndicator />
              </FieldLabel>
              <PriorityChoice
                label="Prioridad de la requisición"
                value={field.value}
                onChange={(value) => form.setValue("priority", value)}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Aircraft - Searchable Select */}
        {showAircraftWorkOrder && (
          <FormField
            control={form.control}
            name="aircraft_id"
            render={({ field }) => {
              const selectedAircraft = aircrafts?.find(
                (a) => a.id.toString() === field.value,
              );
              return (
                <FormItem className="w-full">
                  <FieldLabel preventClick>
                    Aeronave <RequiredIndicator show={aircraftRequired} />
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        disabled={isAircraftsLoading}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          requisitionTriggerClass,
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <span className="truncate">
                          {selectedAircraft
                            ? selectedAircraft.acronym
                            : aircraftPlaceholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" matchTriggerWidth>
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Busque una aeronave..."
                          value={aircraftSearch}
                          onValueChange={setAircraftSearch}
                        />
                        <CommandList>
                          <CommandEmpty className="text-sm p-2 text-center text-muted-foreground">
                            {aircraftSearch
                              ? "No se ha encontrado ninguna aeronave."
                              : "Escriba para buscar..."}
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredAircrafts?.map((aircraft) => (
                              <CommandItem
                                value={`${aircraft.id} ${aircraft.acronym}`}
                                key={aircraft.id}
                                onSelect={(currentValue: string) => {
                                  const id = currentValue.split(" ")[0];
                                  form.setValue("aircraft_id", id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    aircraft.id.toString() === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {aircraft.acronym}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        )}

        {/* Work Order - Searchable Select that also accepts free text */}
        {showAircraftWorkOrder && (
          <FormField
            control={form.control}
            name="work_order_id"
            render={({ field }) => {
              const selectedWO = workOrders?.find(
                (wo) => wo.id.toString() === field.value,
              );
              const trimmedSearch = (workOrderSearch ?? "").trim();

              const selectWorkOrder = (wo: WorkOrder) => {
                form.setValue("work_order_id", wo.id.toString());
                form.setValue("work_order", undefined);
                form.clearErrors("work_order_id");
                setWorkOrderSearch?.("");
                setWorkOrderInputOpen(false);
              };

              // A diferencia del selector de aeronave, una orden que aún no está
              // registrada se puede dejar como texto libre (igual que en despacho).
              const selectFreeText = (value: string) => {
                form.setValue("work_order_id", undefined);
                form.setValue("work_order", value);
                form.clearErrors("work_order_id");
                setWorkOrderSearch?.("");
                setWorkOrderInputOpen(false);
              };

              return (
                <FormItem className="w-full">
                  <FieldLabel preventClick>
                    Ord. de Trabajo{" "}
                    <RequiredIndicator show={workOrderRequired} />
                  </FieldLabel>
                  <Popover
                    open={workOrderInputOpen}
                    onOpenChange={setWorkOrderInputOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        disabled={isWorkOrdersLoading}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          requisitionTriggerClass,
                          !selectedWO &&
                            !freeTextWorkOrder &&
                            "text-muted-foreground",
                        )}
                      >
                        <span className="truncate">
                          {selectedWO?.order_number ??
                            freeTextWorkOrder ??
                            "Opcional..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" matchTriggerWidth>
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Busque una orden de trabajo..."
                          value={workOrderSearch}
                          onValueChange={(v) => setWorkOrderSearch?.(v)}
                        />
                        <CommandList>
                          <CommandEmpty className="text-sm p-2 text-center text-muted-foreground">
                            {isWorkOrdersLoading
                              ? "Cargando..."
                              : isWorkOrdersError
                                ? "No se pudieron cargar las órdenes de trabajo."
                                : trimmedSearch
                                  ? "No coincide con ninguna orden registrada."
                                  : "Escriba para buscar..."}
                          </CommandEmpty>
                          {/* Lets the typed value be kept verbatim when no order matches it. */}
                          {trimmedSearch &&
                            !workOrders?.some(
                              (wo) =>
                                wo.order_number.toLowerCase() ===
                                trimmedSearch.toLowerCase(),
                            ) && (
                              <CommandGroup>
                                <CommandItem
                                  value={`free-text ${trimmedSearch}`}
                                  onSelect={() => selectFreeText(trimmedSearch)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      freeTextWorkOrder === trimmedSearch
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  &quot;{trimmedSearch}&quot;
                                </CommandItem>
                              </CommandGroup>
                            )}
                          <CommandGroup>
                            {filteredWorkOrders?.map((wo) => (
                              <CommandItem
                                value={`${wo.id} ${wo.order_number}`}
                                key={wo.id}
                                onSelect={() => selectWorkOrder(wo)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    wo.id.toString() === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {wo.order_number}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        )}

        {/* Department - Searchable Select */}
        {!showAircraftWorkOrder && (
          <FormField
            control={form.control}
            name="department_id"
            render={({ field }) => {
              const selectedDepartment = allDepartments.find(
                (d) => d.id.toString() === field.value,
              );
              return (
                <FormItem className="w-full">
                  <FieldLabel preventClick>Departamento</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        disabled={isDepartmentsLoading}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          requisitionTriggerClass,
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <span className="truncate">
                          {selectedDepartment
                            ? selectedDepartment.name
                            : "Opcional..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" matchTriggerWidth>
                      <Command>
                        <CommandInput placeholder="Busque un departamento..." />
                        <CommandList>
                          <CommandEmpty className="text-sm p-2 text-center text-muted-foreground">
                            No se ha encontrado ningún departamento.
                          </CommandEmpty>
                          {field.value && (
                            <CommandGroup>
                              <CommandItem
                                value="clear"
                                onSelect={() => {
                                  form.setValue("department_id", undefined);
                                }}
                              >
                                Sin departamento
                              </CommandItem>
                            </CommandGroup>
                          )}
                          <CommandGroup>
                            {allDepartments.map((department) => (
                              <CommandItem
                                value={`${department.id} ${department.name}`}
                                key={department.id}
                                onSelect={(currentValue: string) => {
                                  const id = currentValue.split(" ")[0];
                                  form.setValue("department_id", id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    department.id.toString() === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {department.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        )}

        {/* Third Party - Searchable Select */}
        {!showAircraftWorkOrder && (
          <FormField
            control={form.control}
            name="third_party_id"
            render={({ field }) => {
              const selectedThirdParty = thirdParties?.find(
                (t) => t.id.toString() === field.value,
              );
              return (
                <FormItem className="w-full">
                  <FieldLabel preventClick>Tercero</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        disabled={isThirdPartiesLoading}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          requisitionTriggerClass,
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <span className="truncate">
                          {selectedThirdParty
                            ? selectedThirdParty.name
                            : "Opcional..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" matchTriggerWidth>
                      <Command>
                        <CommandInput placeholder="Busque un tercero..." />
                        <CommandList>
                          <CommandEmpty className="text-sm p-2 text-center text-muted-foreground">
                            No se ha encontrado ningún tercero.
                          </CommandEmpty>
                          {field.value && (
                            <CommandGroup>
                              <CommandItem
                                value="clear"
                                onSelect={() => {
                                  form.setValue("third_party_id", undefined);
                                }}
                              >
                                Sin tercero
                              </CommandItem>
                            </CommandGroup>
                          )}
                          <CommandGroup>
                            {thirdParties?.map((thirdParty) => (
                              <CommandItem
                                value={`${thirdParty.id} ${thirdParty.name}`}
                                key={thirdParty.id}
                                onSelect={(currentValue: string) => {
                                  const id = currentValue.split(" ")[0];
                                  form.setValue("third_party_id", id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    thirdParty.id.toString() === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {thirdParty.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        )}
      </div>
    </RequisitionSection>
  );
}
