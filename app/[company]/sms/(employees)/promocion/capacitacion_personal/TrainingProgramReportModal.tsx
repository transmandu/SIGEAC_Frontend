"use client";

import { useMemo, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { YearPicker } from "@/components/selects/YearPicker";
import { useGetEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetEmployees";
import { useGetTrainingProgramReport } from "@/hooks/sms/useGetTrainingProgramReport";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, FileDown, Loader2, X } from "lucide-react";
import type { Employee } from "@/types";

const fullName = (employee: Employee) =>
  [
    employee.first_name,
    employee.middle_name,
    employee.last_name,
    employee.second_last_name,
  ]
    .filter(Boolean)
    .join(" ");

interface EmployeeComboboxProps {
  label: string;
  placeholder: string;
  value?: string;
  onChange: (dni: string | undefined) => void;
  employees: Employee[];
  isLoading: boolean;
}

function EmployeeCombobox({
  label,
  placeholder,
  value,
  onChange,
  employees,
  isLoading,
}: EmployeeComboboxProps) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => employees.find((employee) => employee.dni === value),
    [employees, value],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              !selected && "text-muted-foreground",
            )}
          >
            {selected ? (
              <span className="truncate">
                {fullName(selected)}
                <span className="text-muted-foreground"> · {selected.dni}</span>
              </span>
            ) : (
              <span>{isLoading ? "Cargando..." : placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar por nombre o DNI..." />
            <CommandList>
              <CommandEmpty>No se encontraron empleados.</CommandEmpty>
              <CommandGroup>
                {employees.map((employee) => (
                  <CommandItem
                    key={employee.dni}
                    value={`${fullName(employee)} ${employee.dni}`}
                    onSelect={() => {
                      onChange(employee.dni);
                      setOpen(false);
                    }}
                  >
                    <div className="flex flex-1 items-center justify-between gap-2 overflow-hidden">
                      <span className="truncate font-medium">
                        {fullName(employee)}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {employee.dni}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 shrink-0",
                        employee.dni === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Descarga el TMD-FOR-SMS-018 "Programa de Capacitación" (TMD-FOR-SMS-018).
 *
 * El año es el rango de búsqueda de los cursos recurrentes de SMS de los que
 * el backend extrae las tres fechas de la tabla; los tres firmantes se eligen
 * por DNI porque son los que viaja al backend.
 */
export function TrainingProgramReportModal({ company }: { company?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: employees, isLoading } = useGetEmployeesByCompany(company);

  const {
    year,
    setYear,
    elaboratedDni,
    setElaboratedDni,
    reviewedDni,
    setReviewedDni,
    approvedDni,
    setApprovedDni,
    isGenerating,
    handleGenerate,
    canGenerate,
  } = useGetTrainingProgramReport(() => setIsOpen(false), company);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="h-8 flex gap-2"
        >
          <FileDown className="size-4" />
          Programa de Capacitación
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="pb-2 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-500">
              <FileDown className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold leading-tight">
                Programa de Capacitación SMS
              </DialogTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                TMD-FOR-SMS-018 ·{" "}
                {company ? `Empresa: ${company}` : "Empresa: —"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Año del programa
            </span>
            <YearPicker value={year} onValueChange={setYear} />
            <p className="text-xs text-muted-foreground">
              Se buscan los cursos recurrentes de SMS de ese año para las fechas
              de 4, 8 y 20 horas.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
            <EmployeeCombobox
              label="Realizado por"
              placeholder="Seleccionar responsable..."
              value={elaboratedDni}
              onChange={setElaboratedDni}
              employees={employees ?? []}
              isLoading={isLoading}
            />
            <EmployeeCombobox
              label="Revisado por"
              placeholder="Seleccionar revisor..."
              value={reviewedDni}
              onChange={setReviewedDni}
              employees={employees ?? []}
              isLoading={isLoading}
            />
            <EmployeeCombobox
              label="Aprobado por"
              placeholder="Seleccionar aprobador..."
              value={approvedDni}
              onChange={setApprovedDni}
              employees={employees ?? []}
              isLoading={isLoading}
            />
          </div>

          <div className="border-t border-border/60 pt-4">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="h-10 w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 size-4" />
                  Generar PDF
                </>
              )}
            </Button>

            {(elaboratedDni || reviewedDni || approvedDni) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 h-8 w-full text-xs text-muted-foreground"
                onClick={() => {
                  setElaboratedDni(undefined);
                  setReviewedDni(undefined);
                  setApprovedDni(undefined);
                }}
              >
                <X className="mr-1.5 size-3" />
                Limpiar firmantes
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
