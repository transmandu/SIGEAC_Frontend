import ProtectedLayout from '@/components/layout/ProtectedLayout'
import React from 'react'

const GeneralPurchaseLayout = ({ children }: {
  children: React.ReactNode
}) => {
  return (
    <ProtectedLayout roles={["SUPERUSER"]}>
      {children}
    </ProtectedLayout>
  )
}

export default GeneralPurchaseLayout
