"use client";

import { useSyncDepartmentLocations } from "@/actions/ajustes/departamento/actions";
import {
  fieldClass,
  hintClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { listRowClass } from "./theme";
import { Department } from "@/types";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";

type Row = { enabled: boolean; email: string };

export function DepartmentLocationsEditor({ department }: { department: Department }) {
  const { selectedCompany } = useCompanyStore();
  const { data: locations, isLoading } = useGetLocationsByCompany(selectedCompany?.slug);
  const { syncDepartmentLocations } = useSyncDepartmentLocations();

  const [rows, setRows] = useState<Record<number, Row>>(() => {
    const initial: Record<number, Row> = {};

    (department.locations ?? []).forEach((entry) => {
      initial[entry.location_id] = { enabled: entry.is_active, email: entry.email ?? "" };
    });

    return initial;
  });

  const update = (locationId: number, patch: Partial<Row>) =>
    setRows((current) => ({
      ...current,
      [locationId]: { ...(current[locationId] ?? { enabled: false, email: "" }), ...patch },
    }));

  const save = () => {
    if (!selectedCompany?.slug) return;

    const payload = Object.entries(rows)
      .filter(([, row]) => row.enabled)
      .map(([locationId, row]) => ({
        location_id: Number(locationId),
        email: row.email.trim() || null,
        is_active: true,
      }));

    syncDepartmentLocations.mutate({
      company: selectedCompany.slug,
      id: department.id,
      locations: payload,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className={hintClass}>
        Habilita el departamento en cada sede y define el correo al que se le escribe allí.
      </p>

      <ul className="space-y-2.5">
        {(locations ?? []).map((location) => {
          const row = rows[location.id] ?? { enabled: false, email: "" };

          return (
            <li
              key={location.id}
              className={cn(listRowClass, "p-3.5", !row.enabled && "opacity-70")}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-content-center rounded-lg font-mono text-xs font-semibold tracking-wide",
                    row.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {location.cod_iata}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{location.address}</p>
                  <p className="text-muted-foreground text-xs">
                    {row.enabled ? "Habilitado" : "No habilitado"}
                  </p>
                </div>

                <Switch
                  checked={row.enabled}
                  onCheckedChange={(checked) => update(location.id, { enabled: checked })}
                  aria-label={`Habilitar en ${location.address}`}
                />
              </div>

              {row.enabled && (
                <div className="relative mt-3">
                  <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    type="email"
                    className={cn(fieldClass, "pl-9")}
                    placeholder="correo@empresa.com"
                    value={row.email}
                    onChange={(event) => update(location.id, { email: event.target.value })}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex justify-end">
        <Button
          className="min-w-35"
          onClick={save}
          disabled={syncDepartmentLocations.isPending}
        >
          {syncDepartmentLocations.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Guardar sedes"
          )}
        </Button>
      </div>
    </div>
  );
}
