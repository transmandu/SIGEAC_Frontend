'use client';

import GuestDashboardLayout from '@/components/layout/GuestDashboardLayout';
import React from 'react';

const RoutesLayout = ({children}: {
    children: React.ReactNode
}) => {
  return (
    <GuestDashboardLayout>{children}</GuestDashboardLayout>
  )
}

export default RoutesLayout
