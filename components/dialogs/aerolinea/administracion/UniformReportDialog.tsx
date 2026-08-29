"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, ChevronsUpDown, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetEmployees";
import axiosInstance from "@/lib/axios";
import { DatePickerField } from "@/components/ui/DatePickerField";
import type { Employee } from "@/types";

export function UniformReportDialog() {
  const { selectedCompany } = useCompanyStore();
  const { data: employees } = useGetEmployeesByCompany(selectedCompany?.slug);

  const [open, setOpen] = useState(false);
  const [searchType, setSearchType] = useState<"employee" | "dni">("employee");
  const [employeeId, setEmployeeId] = useState("");
  const [recipientDni, setRecipientDni] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [employeePopoverOpen, setEmployeePopoverOpen] = useState(false);

  const selectedEmployee = employees?.find(
    (e) => String(e.id) === employeeId,
  );

  const employeeFullName = (e: Employee) =>
    [e.first_name, e.middle_name, e.last_name, e.second_last_name]
      .filter(Boolean)
      .join(" ");

  const canDownload =
    searchType === "employee" ? !!employeeId : !!recipientDni.trim();

  const resetForm = () => {
    setSearchType("employee");
    setEmployeeId("");
    setRecipientDni("");
    setDateFrom(null);
    setDateTo(null);
    setEmployeePopoverOpen(false);
  };

  const handleDownload = async () => {
    if (!canDownload || !selectedCompany) return;

    setDownloading(true);
    try {
      const params: Record<string, string> = {};
      if (searchType === "employee") {
        params.employee_id = employeeId;
      } else {
        params.recipient_dni = recipientDni.trim();
      }
      if (dateFrom) params.from = format(dateFrom, "yyyy-MM-dd");
      if (dateTo) params.to = format(dateTo, "yyyy-MM-dd");

      const response = await axiosInstance.get(
        `/${selectedCompany.slug}/sms/uniforms/movements/report-pdf`,
        { params, responseType: "blob" },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_uniformes_${
        searchType === "employee"
          ? `empleado_${employeeId}`
          : `dni_${recipientDni}`
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // Error handled silently
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <ActionTriggerButton>
          Generar Reporte
        </ActionTriggerButton>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reporte de Dotación de Uniformes</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <RadioGroup
            value={searchType}
            onValueChange={(v) => {
              setSearchType(v as "employee" | "dni");
              setEmployeeId("");
              setRecipientDni("");
            }}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="employee" id="r-employee" />
              <Label htmlFor="r-employee" className="cursor-pointer">
                Empleado
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="dni" id="r-dni" />
              <Label htmlFor="r-dni" className="cursor-pointer">
                Cédula / DNI
              </Label>
            </div>
          </RadioGroup>

          {searchType === "employee" ? (
            <div className="space-y-2">
              <Label>Seleccionar empleado</Label>
              <Popover
                open={employeePopoverOpen}
                onOpenChange={setEmployeePopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={employeePopoverOpen}
                    className={cn(
                      "w-full justify-between bg-background/70 font-normal",
                      !selectedEmployee && "text-muted-foreground",
                    )}
                  >
                    <span className="min-w-0 truncate">
                      {selectedEmployee
                        ? employeeFullName(selectedEmployee)
                        : "Buscar empleado..."}
                    </span>
                    <ChevronsUpDown className="ml-1 size-3.5 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[max(var(--radix-popover-trigger-width),300px)] p-0"
                  align="start"
                >
                  <Command
                    filter={(itemValue, search) =>
                      itemValue.toLowerCase().includes(search.toLowerCase())
                        ? 1
                        : 0
                    }
                  >
                    <CommandInput
                      placeholder="Buscar por nombre o DNI..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>Sin resultados</CommandEmpty>
                      <CommandGroup>
                        {employees
                          ?.filter((e) => e.isActive)
                          .map((emp) => (
                            <CommandItem
                              key={emp.id}
                              value={`${emp.first_name} ${emp.middle_name ?? ""} ${emp.last_name} ${emp.second_last_name ?? ""} ${emp.dni}`}
                              onSelect={() => {
                                setEmployeeId(String(emp.id));
                                setEmployeePopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 size-4 shrink-0",
                                  String(emp.id) === employeeId
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="text-sm">
                                  {employeeFullName(emp)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  DNI: {emp.dni}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="recipient-dni">Cédula / DNI</Label>
              <Input
                id="recipient-dni"
                placeholder="Ingrese el número de cédula"
                value={recipientDni}
                onChange={(e) => setRecipientDni(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <DatePickerField
              label="Desde"
              value={dateFrom}
              setValue={(d) => setDateFrom(d ?? null)}
            />
            <DatePickerField
              label="Hasta"
              value={dateTo}
              setValue={(d) => setDateTo(d ?? null)}
            />
          </div>

          <Button
            onClick={handleDownload}
            disabled={!canDownload || downloading}
            className="w-full gap-2"
          >
            {downloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {downloading ? "Generando PDF..." : "Descargar reporte PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
