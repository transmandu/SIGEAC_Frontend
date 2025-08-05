'use client';

import ProtectedLayout from '@/components/layout/ProtectedLayout';
import React from 'react';

const RoutesLayout = ({ children }: {
  children: React.ReactNode
}) => {
  return (
    <ProtectedLayout roles={["ANALISTA_ALMACEN", "ANALISTA_COMPRAS", "REGULAR", "SUPERUSER"]}>{children}</ProtectedLayout>
  )
}

export default RoutesLayout
