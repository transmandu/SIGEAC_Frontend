"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, FileText, Plane, Tag, User, ArrowUp, ArrowDown, Minus, ArrowBigDown, Building2, Briefcase } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import type { Employee, WorkOrder, Aircraft, Department, ThirdParty } from "@/types"
import type { AuthorizedEmployeeResponse } from "@/hooks/sistema/autorizados/useGetAuthorizedEmployees"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RequiredIndicator } from "./RequiredIndicator"

// Regular employees and authorized (cross-company) employees live in two
// separate tables/id spaces, so the requester combobox is split into two
// tabs rather than one merged, ambiguous list.
type RequesterTab = "employee" | "authorized";

interface RequisitionHeaderProps {
  form: UseFormReturn<any>;
  employees?: Employee[];
  employeesLoading: boolean;
  filteredEmployees: Employee[];
  employeeSearch: string;
  setEmployeeSearch: (v: string) => void;
  authorizedEmployees?: AuthorizedEmployeeResponse[];
  isAuthorizedEmployeesLoading?: boolean;
  allowAuthorizedEmployees?: boolean;
  workOrders?: WorkOrder[];
  isWorkOrdersLoading?: boolean;
  isWorkOrdersError?: boolean;
  filteredWorkOrders?: WorkOrder[];
  workOrderSearch?: string;
  setWorkOrderSearch?: (v: string) => void;
  aircrafts?: Aircraft[];
  isAircraftsLoading?: boolean;
  filteredAircrafts?: Aircraft[];
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

  const filteredAuthorizedEmployees = (authorizedEmployees ?? []).filter((emp) => {
    const query = authorizedEmployeeSearch.toLowerCase().trim();
    if (!query) return true;
    return `${emp.employee_name} ${emp.dni_employee} ${emp.from_company_db}`.toLowerCase().includes(query);
  });

  const formatAuthorizedEmployeeLabel = (authorizedEmployee: AuthorizedEmployeeResponse) =>
    `${authorizedEmployee.employee_name}`;

  // Departments come back as a tree (each with nested `descendants`), so the
  // selector must flatten it to let the user pick any department, not just
  // the top-level ones.
  const flattenDepartments = (departments: Department[]): Department[] =>
    departments.flatMap((department) => [
      department,
      ...flattenDepartments(department.descendants ?? []),
    ]);

  const allDepartments = departments ? flattenDepartments(departments) : [];

  return (
    <div className="rounded-lg border bg-card p-3 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <h4 className="text-xs font-semibold text-muted-foreground tracking-wider select-none">DATOS DE LA REQUISICIÓN</h4>
        <Separator className="flex-1" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Requester - Searchable Select (regular or authorized employee) */}
        <FormField
          control={form.control}
          name="requested_by"
          render={({ field }) => {
            const authorizedEmployeeId = allowAuthorizedEmployees
              ? form.watch("requested_by_authorized_employee_id")
              : undefined;
            const selectedEmployee = !authorizedEmployeeId
              ? employees?.find((e) => `${e.dni}` === field.value)
              : undefined;
            const selectedAuthorizedEmployee = authorizedEmployeeId
              ? authorizedEmployees?.find((a) => `${a.id}` === authorizedEmployeeId)
              : undefined;

            const selectEmployee = (dni: string) => {
              form.setValue("requested_by", dni);
              if (allowAuthorizedEmployees) {
                form.setValue("requested_by_authorized_employee_id", undefined);
              }
            };

            const selectAuthorizedEmployee = (authorizedEmployee: AuthorizedEmployeeResponse) => {
              form.setValue("requested_by", authorizedEmployee.dni_employee);
              form.setValue("requested_by_authorized_employee_id", `${authorizedEmployee.id}`);
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
                    {employeeSearch ? "No se ha encontrado ningún empleado." : "Escriba para buscar..."}
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
                            `${employee.dni}` === field.value && !authorizedEmployeeId ? "opacity-100" : "opacity-0"
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
                <FormLabel
                  className="flex items-center gap-1.5 select-none"
                  onClick={(e) => e.preventDefault()}
                >
                  <User className="size-3.5 text-muted-foreground" />
                  Solicitante
                  <RequiredIndicator />
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={employeesLoading}
                      variant="outline"
                      role="combobox"
                      className={cn("justify-between w-full", !field.value && "text-muted-foreground")}
                    >
                      {selectedEmployee
                        ? <span>{selectedEmployee.first_name} {selectedEmployee.last_name}</span>
                        : selectedAuthorizedEmployee
                          ? <span>{formatAuthorizedEmployeeLabel(selectedAuthorizedEmployee)}</span>
                          : <span>Elige al solicitante...</span>}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" matchTriggerWidth>
                    {!allowAuthorizedEmployees ? (
                      employeeList
                    ) : (
                      <>
                        <Tabs value={requesterTab} onValueChange={(v) => setRequesterTab(v as RequesterTab)}>
                          <TabsList className="grid w-full grid-cols-2 h-9 rounded-none">
                            <TabsTrigger value="employee" className="text-xs">Empleado</TabsTrigger>
                            <TabsTrigger value="authorized" className="text-xs">Autorizado externo</TabsTrigger>
                          </TabsList>
                        </Tabs>
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
                                {filteredAuthorizedEmployees.map((authorizedEmployee) => (
                                  <CommandItem
                                    value={`${authorizedEmployee.id} ${formatAuthorizedEmployeeLabel(authorizedEmployee)}`}
                                    key={authorizedEmployee.id}
                                    onSelect={() => selectAuthorizedEmployee(authorizedEmployee)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        `${authorizedEmployee.id}` === authorizedEmployeeId ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {formatAuthorizedEmployeeLabel(authorizedEmployee)}
                                  </CommandItem>
                                ))}
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
          render={({ field }) => {
            const priorityOptions = [
              { value: "HIGH", label: "Alta", icon: ArrowUp, className: "text-red-500" },
              { value: "MEDIUM", label: "Media", icon: Minus, className: "text-amber-500" },
              { value: "LOW", label: "Baja", icon: ArrowDown, className: "text-green-500"},
            ];
            const selectedPriority = priorityOptions.find((p) => p.value === field.value);
            return (
              <FormItem className="w-full">
                <FormLabel
                  className="flex items-center gap-1.5 select-none"
                  onClick={(e) => e.preventDefault()}
                >
                  <Tag className="size-3.5 text-muted-foreground" />
                  Prioridad
                  <RequiredIndicator />
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      <span className="truncate flex items-center gap-2">
                        {selectedPriority ? (
                          <>
                            <selectedPriority.icon className={cn("size-4", selectedPriority.className)} />
                            {selectedPriority.label}
                          </>
                        ) : (
                          "Seleccione prioridad..."
                        )}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" matchTriggerWidth>
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {priorityOptions.map((option) => {
                            const Icon = option.icon;

                            return (
                              <CommandItem
                                value={`${option.value} ${option.label}`}
                                key={option.value}
                                onSelect={() => {
                                  form.setValue("priority", option.value);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    option.value === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />

                                <Icon className={cn("mr-2 size-4", option.className)} />

                                {option.label}
                              </CommandItem>
                            );
                          })}
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

        {/* Aircraft - Searchable Select */}
        {showAircraftWorkOrder && <FormField
          control={form.control}
          name="aircraft_id"
          render={({ field }) => {
            const selectedAircraft = aircrafts?.find((a) => a.id.toString() === field.value);
            return (
              <FormItem className="w-full">
                <FormLabel
                  className="flex items-center gap-1.5 select-none"
                  onClick={(e) => e.preventDefault()}
                >
                  <Plane className="size-3.5 text-muted-foreground" />
                  Aeronave
                  <RequiredIndicator show={aircraftRequired} />
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={isAircraftsLoading}
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
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
                          {aircraftSearch ? "No se ha encontrado ninguna aeronave." : "Escriba para buscar..."}
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
                                  aircraft.id.toString() === field.value ? "opacity-100" : "opacity-0"
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
        />}

        {/* Work Order - Searchable Select */}
        {showAircraftWorkOrder && <FormField
          control={form.control}
          name="work_order_id"
          render={({ field }) => {
            const selectedWO = workOrders?.find((wo) => wo.id.toString() === field.value);
            return (
              <FormItem className="w-full">
                <FormLabel
                  className="flex items-center gap-1.5 select-none"
                  onClick={(e) => e.preventDefault()}
                >
                  <FileText className="size-3.5 text-muted-foreground" />
                  Ord. de Trabajo
                  <RequiredIndicator show={workOrderRequired} />
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={isWorkOrdersLoading}
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      <span className="truncate">
                        {selectedWO ? selectedWO.order_number : "Opcional..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" matchTriggerWidth>
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Busque una orden..."
                        value={workOrderSearch}
                        onValueChange={setWorkOrderSearch}
                      />
                      <CommandList>
                        <CommandEmpty className="text-sm p-2 text-center">
                          {workOrderSearch
                            ? "No se ha encontrado ninguna orden."
                            : "No hay órdenes de trabajo disponibles"}
                        </CommandEmpty>
                        {field.value && (
                          <CommandGroup>
                            <CommandItem
                              value="clear"
                              onSelect={() => {
                                form.setValue("work_order_id", undefined);
                                form.clearErrors("work_order_id");
                              }}
                            >
                              Sin orden de trabajo
                            </CommandItem>
                          </CommandGroup>
                        )}
                        <CommandGroup>
                          {filteredWorkOrders?.map((wo) => (
                            <CommandItem
                              value={`${wo.id} ${wo.order_number}`}
                              key={wo.id}
                              onSelect={(currentValue: string) => {
                                const id = currentValue.split(" ")[0];
                                form.setValue("work_order_id", id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  wo.id.toString() === field.value ? "opacity-100" : "opacity-0"
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
        />}

        {/* Department - Searchable Select */}
        {!showAircraftWorkOrder && <FormField
          control={form.control}
          name="department_id"
          render={({ field }) => {
            const selectedDepartment = allDepartments.find((d) => d.id.toString() === field.value);
            return (
              <FormItem className="w-full">
                <FormLabel
                  className="flex items-center gap-1.5 select-none"
                  onClick={(e) => e.preventDefault()}
                >
                  <Building2 className="size-3.5 text-muted-foreground" />
                  Departamento
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={isDepartmentsLoading}
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      <span className="truncate">
                        {selectedDepartment ? selectedDepartment.name : "Opcional..."}
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
                                  department.id.toString() === field.value ? "opacity-100" : "opacity-0"
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
        />}

        {/* Third Party - Searchable Select */}
        {!showAircraftWorkOrder && <FormField
          control={form.control}
          name="third_party_id"
          render={({ field }) => {
            const selectedThirdParty = thirdParties?.find((t) => t.id.toString() === field.value);
            return (
              <FormItem className="w-full">
                <FormLabel
                  className="flex items-center gap-1.5 select-none"
                  onClick={(e) => e.preventDefault()}
                >
                  <Briefcase className="size-3.5 text-muted-foreground" />
                  Tercero
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={isThirdPartiesLoading}
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      <span className="truncate">
                        {selectedThirdParty ? selectedThirdParty.name : "Opcional..."}
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
                                  thirdParty.id.toString() === field.value ? "opacity-100" : "opacity-0"
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
        />}

      </div>
    </div>
  );
}