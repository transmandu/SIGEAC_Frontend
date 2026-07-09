"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useGetCompanies } from "@/hooks/sistema/useGetCompanies";
import { Loader2 } from "lucide-react";

interface CompanyMultiSelectProps {
  value: number[];
  onChange: (value: number[]) => void;
}

/**
 * Selección múltiple de compañías (checkboxes). Se usa para definir la
 * habilitación por compañía de cuentas bancarias y tarjetas — relación
 * que solo un SUPERUSER puede administrar (el listado /company ya está
 * restringido a ese rol en el backend).
 */
export function CompanyMultiSelect({ value, onChange }: CompanyMultiSelectProps) {
  const { data: companies, isLoading } = useGetCompanies();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando compañías...
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        No hay compañías disponibles.
      </p>
    );
  }

  const toggle = (companyId: number, checked: boolean) => {
    onChange(
      checked
        ? [...value, companyId]
        : value.filter((id) => id !== companyId)
    );
  };

  return (
    <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
      {companies.map((company) => (
        <label
          key={company.id}
          className="flex cursor-pointer items-center gap-2 text-sm"
        >
          <Checkbox
            checked={value.includes(company.id)}
            onCheckedChange={(checked) => toggle(company.id, !!checked)}
          />
          <span className="truncate">{company.name}</span>
        </label>
      ))}
    </div>
  );
}
