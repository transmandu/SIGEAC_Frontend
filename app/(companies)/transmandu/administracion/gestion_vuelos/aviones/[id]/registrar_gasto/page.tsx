'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import { useParams } from 'next/navigation'
import React from 'react'

const AircraftExpensePage = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <ContentLayout title='Registrar Gasto'>
      
    </ContentLayout>
  )
}

export default AircraftExpensePage
