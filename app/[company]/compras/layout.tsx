import ProtectedLayout from '@/components/layout/ProtectedLayout'
import React from 'react'

const PurchaseLayout = ({ children }: {
  children: React.ReactNode
}) => {
  return (
    <ProtectedLayout roles={["ANALISTA_COMPRAS", "JEFE_ALMACEN", "SUPERUSER", "REGULAR", "ASISTENTE_COMPRAS", "ANALISTA_ADMINISTRACION"]}>
      {children}
    </ProtectedLayout>
  )
}

export default PurchaseLayout
