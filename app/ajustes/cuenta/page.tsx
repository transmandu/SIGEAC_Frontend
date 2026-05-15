"use client"

import UserInfoCard from '@/components/cards/UserInfoCard'
import UserInfoTabs from '@/components/cards/UserInfoTabs'
import { ContentLayout } from '@/components/layout/ContentLayout'
import LoadingPage from '@/components/misc/LoadingPage'
import { useAuth } from '@/contexts/AuthContext'
import React from 'react'

const AccountPage = () => {
  const { user, loading } = useAuth()
  if (loading) {
    return <LoadingPage />
  }
  if (!user) {
    return (
      <ContentLayout title="Cuenta">
        <div className="flex items-center justify-center min-h-[300px] text-sm text-muted-foreground">
          Sesión finalizada
        </div>
      </ContentLayout>
    )
  }
  return (
    <ContentLayout title='Cuenta'>
      <div className='space-y-3 mb-12'>
        <h1 className='text-center text-5xl font-bold'>Ajustes de Cuenta</h1>
        <p className='text-sm text-muted-foreground text-center'>Aquí puede ajustar la información de su cuenta, su nombre de usuario, contraseña, etc.</p>
      </div>
      <div className='flex flex-col md:flex-row items-center justify-center gap-12'>
        <UserInfoCard user={user} />
        <UserInfoTabs user={user} />
      </div>
    </ContentLayout>
  )
}

export default AccountPage
