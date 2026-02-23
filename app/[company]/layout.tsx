'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { usePathname } from 'next/navigation';
import React from 'react';

const RoutesLayout = ({ children }: {
  children: React.ReactNode
}) => {
  const pathname = usePathname();
  const isPublicPage = pathname?.includes('/general/reporte/pagina_de_sms');

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <DashboardLayout>{children}</DashboardLayout>
  )
}

export default RoutesLayout
