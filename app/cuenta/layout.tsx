'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import React from 'react';

// El perfil propio no pertenece ni a master ni a un tenant: cualquier usuario
// autenticado lo abre, con o sin compañía seleccionada.
const AccountLayout = ({ children }: {
  children: React.ReactNode
}) => {
  return (
    <DashboardLayout>{children}</DashboardLayout>
  )
}

export default AccountLayout
