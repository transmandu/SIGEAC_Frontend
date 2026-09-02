'use client'

import { useUpdateCompanySettings } from '@/actions/sistema/company_settings/actions'
import { ContentLayout } from '@/components/layout/ContentLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import LoadingPage from '@/components/misc/LoadingPage'
import ProtectedLayout from '@/components/layout/ProtectedLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCompanySettings } from '@/hooks/general/useCompanySettings'
import { DEFAULT_TIMEZONE, formatInstant } from '@/lib/date'
import { DEFAULT_QUARANTINE_LEGAL_DAYS } from '@/lib/warehouse/quarantine'
import { Clock, Loader2, Save, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'

const MIN_DAYS = 1
const MAX_DAYS = 365

/**
 * Las zonas que la operación puede necesitar. UTC de primero porque es el
 * default: mientras nadie elija, la pantalla dice lo que hay guardado.
 */
const TIMEZONES = [
  { value: 'UTC', label: 'UTC (hora guardada, sin conversión)' },
  { value: 'America/Caracas', label: 'Caracas (UTC−4)' },
  { value: 'America/Bogota', label: 'Bogotá / Lima / Panamá (UTC−5)' },
  { value: 'America/New_York', label: 'Nueva York / Miami (UTC−5/−4)' },
  { value: 'America/Santo_Domingo', label: 'Santo Domingo (UTC−4)' },
  { value: 'America/La_Paz', label: 'La Paz (UTC−4)' },
  { value: 'America/Santiago', label: 'Santiago (UTC−4/−3)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (UTC−3)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC−3)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (UTC−6)' },
  { value: 'Europe/Madrid', label: 'Madrid (UTC+1/+2)' },
]

const OperationalSettingsPage = () => {
  const { data: settings, isLoading } = useCompanySettings()
  const { updateCompanySettings } = useUpdateCompanySettings()

  const [legalDays, setLegalDays] = useState<string>('')
  const [timezone, setTimezone] = useState<string>('')

  // El valor guardado llega asíncrono; sincroniza el campo cuando aparece sin
  // pisar lo que el usuario esté escribiendo (solo si el campo está vacío).
  useEffect(() => {
    if (settings?.quarantine_legal_days !== undefined && legalDays === '') {
      setLegalDays(String(settings.quarantine_legal_days))
    }
  }, [settings?.quarantine_legal_days, legalDays])

  useEffect(() => {
    if (settings?.timezone !== undefined && timezone === '') {
      setTimezone(settings.timezone)
    }
  }, [settings?.timezone, timezone])

  // La vista previa debe avanzar sola: una hora congelada no sirve para
  // confirmar que la zona elegida es la correcta.
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const parsed = Number(legalDays)
  const isValid = Number.isInteger(parsed) && parsed >= MIN_DAYS && parsed <= MAX_DAYS
  const storedValue = Number(settings?.quarantine_legal_days ?? DEFAULT_QUARANTINE_LEGAL_DAYS)
  const hasChanges = isValid && parsed !== storedValue

  const storedTimezone = settings?.timezone ?? DEFAULT_TIMEZONE
  const hasTimezoneChanges = timezone !== '' && timezone !== storedTimezone

  const handleSave = async () => {
    if (!hasChanges) return

    await updateCompanySettings.mutateAsync({ quarantine_legal_days: parsed })
  }

  const handleSaveTimezone = async () => {
    if (!hasTimezoneChanges) return

    await updateCompanySettings.mutateAsync({ timezone })
  }

  if (isLoading) return <LoadingPage />

  return (
    <ProtectedLayout roles={['SUPERUSER']}>
      <ContentLayout title="Ajustes operativos">
        <PageHeader className="mb-6" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Ajustes Operativos</h1>
            <p className="text-xs text-muted-foreground">
              Parámetros que rigen los procesos de la empresa. Afectan el cálculo y las
              alertas de todo el sistema, así que solo un superusuario puede cambiarlos.
            </p>
          </div>

          <Card className="max-w-2xl rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="size-4" />
                Plazo legal de cuarentena
              </CardTitle>
              <CardDescription>
                Días máximos que un artículo puede permanecer retenido antes de considerarse
                vencido. Determina las alertas y los recordatorios que recibe Compras.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quarantine-legal-days">Días de retención permitidos</Label>
                <Input
                  id="quarantine-legal-days"
                  type="number"
                  min={MIN_DAYS}
                  max={MAX_DAYS}
                  value={legalDays}
                  onChange={(e) => setLegalDays(e.target.value)}
                  className="max-w-[180px]"
                />
                {legalDays !== '' && !isValid && (
                  <p className="text-xs text-destructive">
                    Debe ser un número entero entre {MIN_DAYS} y {MAX_DAYS}.
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Valor actual: <span className="font-semibold">{storedValue} días</span>
                </p>
              </div>

              {hasChanges && (
                <Button
                  onClick={handleSave}
                  disabled={updateCompanySettings.isPending}
                  className="gap-1.5"
                >
                  {updateCompanySettings.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  Guardar cambios
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="max-w-2xl rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4" />
                Zona horaria
              </CardTitle>
              <CardDescription>
                Zona con la que se muestran todas las fechas y horas del sistema. No
                cambia lo que se guarda —siempre se registra en UTC—, solo cómo se lee.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-timezone">Zona de visualización</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="company-timezone" className="max-w-[340px]">
                    <SelectValue placeholder="Seleccione una zona horaria" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {timezone && (
                  <p className="text-xs text-muted-foreground">
                    Hora actual en esta zona:{' '}
                    <span className="font-semibold">
                      {formatInstant(now, timezone, 'dd/MM/yyyy HH:mm:ss')}
                    </span>
                  </p>
                )}

                {storedTimezone === DEFAULT_TIMEZONE && !hasTimezoneChanges && (
                  <p className="text-xs text-muted-foreground">
                    Sin una zona propia, las fechas se muestran tal como están guardadas.
                  </p>
                )}
              </div>

              {hasTimezoneChanges && (
                <Button
                  onClick={handleSaveTimezone}
                  disabled={updateCompanySettings.isPending}
                  className="gap-1.5"
                >
                  {updateCompanySettings.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  Guardar cambios
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </ContentLayout>
    </ProtectedLayout>
  )
}

export default OperationalSettingsPage
