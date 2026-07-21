import ProtectedLayout from '@/components/layout/ProtectedLayout'
import React from 'react'

/**
 * Módulo SUPERVISOR — exclusivo de SUPERUSER.
 *
 * Herramientas de saneamiento de datos que operan por encima de los módulos
 * normales. El gating real vive en el backend
 * (routes/api/supervisor/routes.php); este layout solo evita que la pantalla
 * se abra para quien no corresponde.
 */
const SupervisorLayout = ({ children }: {
  children: React.ReactNode
}) => {
  return (
    <ProtectedLayout roles={["SUPERUSER"]}>
      {children}
    </ProtectedLayout>
  )
}

export default SupervisorLayout
