import ProtectedLayout from '@/components/layout/ProtectedLayout'
import React from 'react'

// Los mismos roles que ven estas opciones en `lib/menus/purchases.ts`.
const GeneralPurchaseLayout = ({ children }: {
  children: React.ReactNode
}) => {
  return (
    <ProtectedLayout roles={["ASISTENTE_COMPRAS", "SUPERUSER", "JEFE_ADMINISTRACION"]}>
      {children}
    </ProtectedLayout>
  )
}

export default GeneralPurchaseLayout
