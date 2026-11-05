import ProtectedLayout from '@/components/layout/ProtectedLayout'
import React from 'react'

// Los mismos roles que ven estas opciones en `lib/menus/purchases.ts`.
const AeronauticalPurchaseLayout = ({ children }: {
  children: React.ReactNode
}) => {
  return (
    <ProtectedLayout roles={["ANALISTA_COMPRAS", "JEFE_COMPRAS", "SUPERUSER", "JEFE_ADMINISTRACION"]} requiresOmac={true}>
      {children}
    </ProtectedLayout>
  )
}

export default AeronauticalPurchaseLayout
