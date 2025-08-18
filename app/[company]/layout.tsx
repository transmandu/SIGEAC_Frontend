'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import React from 'react';

const RoutesLayout = ({children}: {
    children: React.ReactNode
}) => {
  return (
    <DashboardLayout>{children}</DashboardLayout>
  )
}

export default RoutesLayout
