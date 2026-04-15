import ProtectedLayout from '@/components/layout/ProtectedLayout'
import React from 'react'

const EnTransitoLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedLayout roles={["ANALISTA_COMPRAS", "JEFE_ALMACEN", "ANALISTA_ALMACEN", "SUPERUSER", "REGULAR"]}>
      {children}
    </ProtectedLayout>
  )
}

export default EnTransitoLayout
