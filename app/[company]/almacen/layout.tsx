import ProtectedLayout from '@/components/layout/ProtectedLayout'
import React from 'react'

const WarehouseLayout = ({ children }: {
  children: React.ReactNode
}) => {
  return (
    <ProtectedLayout roles={["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER", "REGULAR"]}>
      {children}
    </ProtectedLayout>
  )
}

export default WarehouseLayout
