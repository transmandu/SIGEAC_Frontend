import ProtectedLayout from '@/components/layout/ProtectedLayout'
import React from 'react'

const GeneralPurchaseLayout = ({ children }: {
  children: React.ReactNode
}) => {
  return (
    <ProtectedLayout roles={["ANALISTA_COMPRAS", "JEFE_COMPRAS", "ASISTENTE_COMPRAS", "SUPERUSER", "JEFE_ADMINISTRACION"]}>
      {children}
    </ProtectedLayout>
  )
}

export default GeneralPurchaseLayout
