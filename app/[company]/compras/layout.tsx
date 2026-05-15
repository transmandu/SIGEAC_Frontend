import ProtectedLayout from '@/components/layout/ProtectedLayout'
import React from 'react'

const PurchaseLayout = ({ children }: {
  children: React.ReactNode
}) => {
  return (
    <ProtectedLayout roles={["ANALISTA_COMPRAS", "SUPERUSER", "REGULAR", "ASISTENTE_COMPRAS", "ANALISTA_ADMINISTRACION", "JEFE_COMPRAS"]}>
      {children}
    </ProtectedLayout>
  )
}

export default PurchaseLayout
