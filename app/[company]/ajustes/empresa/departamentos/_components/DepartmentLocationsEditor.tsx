"use client";

import { useMemo, useState } from "react";
import { Loader2, Mail, MapPin, TriangleAlert } from "lucide-react";

import { useSyncDepartmentLocations } from "@/actions/ajustes/departamento/actions";
import {
  fieldClass,
  hintClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { PanelSection } from "@/components/forms/PanelSection";
import { EmptyState } from "@/components/misc/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { locationName } from "@/lib/locations";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department } from "@/types";

type Row = { enabled: boolean; email: string };
type Rows = Record<number, Row>;

const EMPTY_ROW: Row = { enabled: false, email: "" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialRows = (department: Department): Rows => {
  const rows: Rows = {};

  (department.locations ?? []).forEach((entry) => {
    rows[entry.location_id] = { enabled: entry.is_active, email: entry.email ?? "" };
  });

  return rows;
};

/** Lo que se enviaría: solo las sedes habilitadas, con su correo recortado. */
const toPayload = (rows: Rows) =>
  Object.entries(rows)
    .filter(([, row]) => row.enabled)
    .map(([locationId, row]) => ({
      location_id: Number(locationId),
      email: row.email.trim() || null,
      is_active: true,
    }))
    .sort((a, b) => a.location_id - b.location_id);

export function DepartmentLocationsEditor({ department }: { department: Department }) {
  const { selectedCompany } = useCompanyStore();
  const {
    data: locations,
    isLoading,
    isError,
    refetch,
  } = useGetLocationsByCompany(selectedCompany?.slug);
  const { syncDepartmentLocations } = useSyncDepartmentLocations();

  const saved = useMemo(() => JSON.stringify(toPayload(initialRows(department))), [department]);
  const [rows, setRows] = useState<Rows>(() => initialRows(department));

  const update = (locationId: number, patch: Partial<Row>) =>
    setRows((current) => ({
      ...current,
      [locationId]: { ...(current[locationId] ?? EMPTY_ROW), ...patch },
    }));

  const invalid = (row: Row) => row.enabled && row.email.trim() !== "" && !EMAIL.test(row.email.trim());
  const hasInvalid = Object.values(rows).some(invalid);
  const dirty = JSON.stringify(toPayload(rows)) !== saved;

  const save = () => {
    if (!selectedCompany?.slug || hasInvalid || !dirty) return;

    syncDepartmentLocations.mutate({
      company: selectedCompany.slug,
      id: department.id,
      locations: toPayload(rows),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={TriangleAlert}
        tone="error"
        title="No se pudieron cargar las sedes"
        description="Revise su conexión e inténtelo de nuevo."
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Reintentar
          </Button>
        }
        className="py-8"
      />
    );
  }

  return (
    <div className="space-y-4">
      <PanelSection
        icon={MapPin}
        title="Sedes del departamento"
        hint="Habilítelo en cada sede y defina el correo al que se le escribe allí."
        flush
      >
        <ul className="divide-y divide-border/60">
          {(locations ?? []).map((location) => {
            const row = rows[location.id] ?? EMPTY_ROW;
            const wrong = invalid(row);

            return (
              <li key={location.id} className={cn("px-4 py-3", !row.enabled && "opacity-80")}>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-lg font-mono text-xs font-semibold tracking-wide",
                      row.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {location.cod_iata}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium wrap-anywhere">{locationName(location)}</p>
                    <p className={hintClass}>{row.enabled ? "Habilitado" : "No habilitado"}</p>
                  </div>

                  <Switch
                    checked={row.enabled}
                    onCheckedChange={(checked) => update(location.id, { enabled: checked })}
                    aria-label={`Habilitar en ${locationName(location)}`}
                  />
                </div>

                {row.enabled && (
                  <div className="mt-3">
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        autoComplete="off"
                        className={cn(fieldClass, "pl-9")}
                        placeholder="correo@empresa.com"
                        aria-label={`Correo en ${locationName(location)}`}
                        aria-invalid={wrong || undefined}
                        value={row.email}
                        onChange={(event) => update(location.id, { email: event.target.value })}
                      />
                    </div>
                    {wrong && (
                      <p className="mt-1 text-[13px] text-destructive">
                        Ingrese un correo válido.
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </PanelSection>

      <div className="flex justify-end">
        <Button
          className="min-w-35 max-sm:w-full"
          onClick={save}
          disabled={syncDepartmentLocations.isPending || hasInvalid || !dirty}
        >
          {syncDepartmentLocations.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Guardar sedes"
          )}
        </Button>
      </div>
    </div>
  );
}
