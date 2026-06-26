import ProtectedLayout from '@/components/layout/ProtectedLayout'
import React from 'react'

const AeronauticalPurchaseLayout = ({ children }: {
  children: React.ReactNode
}) => {
  return (
    <ProtectedLayout roles={["ANALISTA_COMPRAS", "SUPERUSER", "ASISTENTE_COMPRAS", "ANALISTA_ADMINISTRACION", "JEFE_COMPRAS", "JEFE_ADMINISTRACION"]} requiresOmac={true}>
      {children}
    </ProtectedLayout>
  )
}

export default AeronauticalPurchaseLayout
