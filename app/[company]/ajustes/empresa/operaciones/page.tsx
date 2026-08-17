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
import { useCompanySettings } from '@/hooks/general/useCompanySettings'
import { DEFAULT_QUARANTINE_LEGAL_DAYS } from '@/lib/warehouse/quarantine'
import { Loader2, Save, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'

const MIN_DAYS = 1
const MAX_DAYS = 365

const OperationalSettingsPage = () => {
  const { data: settings, isLoading } = useCompanySettings()
  const { updateCompanySettings } = useUpdateCompanySettings()

  const [legalDays, setLegalDays] = useState<string>('')

  // El valor guardado llega asíncrono; sincroniza el campo cuando aparece sin
  // pisar lo que el usuario esté escribiendo (solo si el campo está vacío).
  useEffect(() => {
    if (settings?.quarantine_legal_days !== undefined && legalDays === '') {
      setLegalDays(String(settings.quarantine_legal_days))
    }
  }, [settings?.quarantine_legal_days, legalDays])

  const parsed = Number(legalDays)
  const isValid = Number.isInteger(parsed) && parsed >= MIN_DAYS && parsed <= MAX_DAYS
  const storedValue = Number(settings?.quarantine_legal_days ?? DEFAULT_QUARANTINE_LEGAL_DAYS)
  const hasChanges = isValid && parsed !== storedValue

  const handleSave = async () => {
    if (!hasChanges) return

    await updateCompanySettings.mutateAsync({ quarantine_legal_days: parsed })
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
        </div>
      </ContentLayout>
    </ProtectedLayout>
  )
}

export default OperationalSettingsPage
