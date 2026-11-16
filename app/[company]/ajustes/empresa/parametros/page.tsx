"use client";

import { useState } from "react";
import { Clock, Loader2, ShieldAlert, TriangleAlert } from "lucide-react";

import { useUpdateCompanySettings } from "@/actions/sistema/company_settings/actions";
import {
  fieldClass,
  hintClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { OptionCombobox } from "@/components/forms/general/OptionCombobox";
import {
  PanelSection,
  PanelStaticLabel,
} from "@/components/forms/PanelSection";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { EmptyState } from "@/components/misc/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanySettings } from "@/hooks/general/useCompanySettings";
import { useNow } from "@/hooks/useNow";
import { DEFAULT_TIMEZONE, formatInstant } from "@/lib/date";
import { DEFAULT_QUARANTINE_LEGAL_DAYS } from "@/lib/warehouse/quarantine";
import { cn } from "@/lib/utils";

const MIN_DAYS = 1;
const MAX_DAYS = 365;

/**
 * Las zonas que la empresa puede necesitar. UTC de primero porque es el
 * default: mientras nadie elija, la pantalla dice lo que hay guardado.
 */
const TIMEZONES = [
  { id: "UTC", label: "UTC (hora guardada, sin conversión)" },
  { id: "America/Caracas", label: "Caracas (UTC−4)" },
  { id: "America/Bogota", label: "Bogotá / Lima / Panamá (UTC−5)" },
  { id: "America/New_York", label: "Nueva York / Miami (UTC−5/−4)" },
  { id: "America/Santo_Domingo", label: "Santo Domingo (UTC−4)" },
  { id: "America/La_Paz", label: "La Paz (UTC−4)" },
  { id: "America/Santiago", label: "Santiago (UTC−4/−3)" },
  { id: "America/Argentina/Buenos_Aires", label: "Buenos Aires (UTC−3)" },
  { id: "America/Sao_Paulo", label: "São Paulo (UTC−3)" },
  { id: "America/Mexico_City", label: "Ciudad de México (UTC−6)" },
  { id: "Europe/Madrid", label: "Madrid (UTC+1/+2)" },
];

/** Reloj de la vista previa: avanza solo, y aislado para no repintar el formulario cada segundo. */
function ZoneClock({ timezone }: { timezone: string }) {
  const now = useNow(1000);

  const rows = [
    {
      label: "En la zona elegida",
      value: formatInstant(now, timezone, "dd/MM/yyyy HH:mm:ss"),
    },
    {
      label: "Hora guardada (UTC)",
      value: formatInstant(now, "UTC", "dd/MM/yyyy HH:mm:ss"),
    },
  ];

  return (
    <dl className="divide-y rounded-lg border bg-muted/20 text-sm">
      {rows.map(({ label, value }, index) => (
        <div
          key={label}
          className="flex items-center justify-between gap-3 px-3 py-2"
        >
          <dt className="text-muted-foreground">{label}</dt>
          <dd
            className={cn(
              "tabular-nums",
              index === 0
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Pie de cada panel: siempre presente para que el panel no cambie de alto al editar. */
function SaveRow({
  dirty,
  saving,
  onDiscard,
}: {
  dirty: boolean;
  saving: boolean;
  onDiscard: () => void;
}) {
  return (
    <div className="flex justify-end gap-2 border-t pt-4 max-sm:flex-col-reverse max-sm:[&>button]:w-full">
      <Button
        type="button"
        variant="outline"
        disabled={!dirty || saving}
        onClick={onDiscard}
      >
        Descartar
      </Button>
      <Button type="submit" disabled={!dirty || saving} className="min-w-35">
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Guardar cambios"
        )}
      </Button>
    </div>
  );
}

const CompanyParametersPage = () => {
  const { data: settings, isLoading, isError, refetch } = useCompanySettings();
  const { updateCompanySettings } = useUpdateCompanySettings();
  const saving = updateCompanySettings.isPending;

  // Lo que el usuario escribió; mientras no toque el campo se muestra el valor
  // guardado, que llega de forma asíncrona.
  const [daysEdit, setDaysEdit] = useState<string | null>(null);
  const [timezoneEdit, setTimezoneEdit] = useState<string | null>(null);

  const storedDays = Number(
    settings?.quarantine_legal_days ?? DEFAULT_QUARANTINE_LEGAL_DAYS,
  );
  const storedTimezone = settings?.timezone ?? DEFAULT_TIMEZONE;

  const days = daysEdit ?? String(storedDays);
  const timezone = timezoneEdit ?? storedTimezone;

  const parsedDays = Number(days);
  const daysValid =
    days !== "" &&
    Number.isInteger(parsedDays) &&
    parsedDays >= MIN_DAYS &&
    parsedDays <= MAX_DAYS;
  const daysDirty = daysEdit !== null && daysValid && parsedDays !== storedDays;
  const timezoneDirty = timezone !== storedTimezone;

  const saveDays = async () => {
    if (!daysDirty) return;

    try {
      await updateCompanySettings.mutateAsync({
        quarantine_legal_days: parsedDays,
      });
      setDaysEdit(null);
    } catch {
      // El aviso lo muestra la mutación; el valor escrito se conserva.
    }
  };

  const saveTimezone = async () => {
    if (!timezoneDirty) return;

    try {
      await updateCompanySettings.mutateAsync({ timezone });
      setTimezoneEdit(null);
    } catch {
      // El aviso lo muestra la mutación; la zona elegida se conserva.
    }
  };

  // La zona elegida puede no estar en la lista corta (se guardó por otro medio).
  const timezoneOptions = TIMEZONES.some((zone) => zone.id === timezone)
    ? TIMEZONES
    : [{ id: timezone, label: timezone }, ...TIMEZONES];

  return (
    <ProtectedLayout roles={["SUPERUSER"]}>
      <SettingsListPage
        title="Parámetros de la empresa"
        heading="Parámetros de la empresa"
        description="Reglas que rigen el cálculo y las alertas de todo el sistema, como el plazo de cuarentena y la zona horaria. Solo un superusuario puede cambiarlas."
      >
        {isError ? (
          <PanelSection
            icon={TriangleAlert}
            title="No se pudieron cargar los parámetros"
          >
            <EmptyState
              icon={TriangleAlert}
              tone="error"
              title="No se pudieron cargar los parámetros"
              description="Revise su conexión e inténtelo de nuevo."
              action={
                <Button variant="outline" onClick={() => refetch()}>
                  Reintentar
                </Button>
              }
              className="py-6"
            />
          </PanelSection>
        ) : isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : (
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void saveDays();
              }}
            >
              <PanelSection
                icon={ShieldAlert}
                title="Plazo legal de cuarentena"
                hint="Cuántos días puede permanecer retenido un artículo antes de considerarse vencido."
              >
                <div className="space-y-4">
                  <div>
                    <PanelStaticLabel>
                      Días de retención permitidos
                    </PanelStaticLabel>
                    <div className="relative max-w-48">
                      <Input
                        aria-label="Días de retención permitidos"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={3}
                        value={days}
                        disabled={saving}
                        aria-invalid={
                          days !== "" && !daysValid ? true : undefined
                        }
                        onChange={(event) =>
                          setDaysEdit(event.target.value.replace(/\D/g, ""))
                        }
                        className={cn(fieldClass, "pr-14 tabular-nums")}
                      />
                      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                        días
                      </span>
                    </div>
                    {days !== "" && !daysValid ? (
                      <p className="mt-1.5 text-xs text-destructive">
                        Debe ser un número entero entre {MIN_DAYS} y {MAX_DAYS}.
                      </p>
                    ) : (
                      <p className={cn(hintClass, "mt-1.5")}>
                        Valor guardado:{" "}
                        <span className="font-medium text-foreground">
                          {storedDays} {storedDays === 1 ? "día" : "días"}
                        </span>
                        . Define el vencimiento y los recordatorios que recibe
                        Compras.
                      </p>
                    )}
                  </div>

                  <SaveRow
                    dirty={daysDirty}
                    saving={saving}
                    onDiscard={() => setDaysEdit(null)}
                  />
                </div>
              </PanelSection>
            </form>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void saveTimezone();
              }}
            >
              <PanelSection
                icon={Clock}
                title="Zona horaria"
                hint="Con qué zona se muestran las fechas y horas del sistema."
              >
                <div className="space-y-4">
                  <div>
                    <PanelStaticLabel>Zona de visualización</PanelStaticLabel>
                    <OptionCombobox
                      value={timezone}
                      onChange={setTimezoneEdit}
                      options={timezoneOptions}
                      searchPlaceholder="Buscar zona horaria..."
                      disabled={saving}
                    />
                    <p className={cn(hintClass, "mt-1.5")}>
                      No cambia lo que se guarda —siempre se registra en UTC—,
                      solo cómo se lee.
                    </p>
                  </div>

                  <ZoneClock timezone={timezone} />

                  {storedTimezone === DEFAULT_TIMEZONE && !timezoneDirty && (
                    <p className={hintClass}>
                      Sin una zona propia, las fechas se muestran tal como están
                      guardadas.
                    </p>
                  )}

                  <SaveRow
                    dirty={timezoneDirty}
                    saving={saving}
                    onDiscard={() => setTimezoneEdit(null)}
                  />
                </div>
              </PanelSection>
            </form>
          </div>
        )}
      </SettingsListPage>
    </ProtectedLayout>
  );
};

export default CompanyParametersPage;
