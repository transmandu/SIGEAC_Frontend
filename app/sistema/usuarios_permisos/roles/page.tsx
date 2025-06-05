'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import { useGetRoles } from '@/hooks/sistema/usuario/useGetRoles'
import React from 'react'
import { columns } from './columns'
import { Loader2 } from 'lucide-react'
import { DataTable } from './data-table'

const RolesPage = () => {
  const { data: roles, error, isLoading } = useGetRoles();
  return (
    <ContentLayout title='Roles'>
      <h1 className='text-2xl font-bold'>Listado de Roles</h1>
      {
        isLoading && (
          <div className='grid mt-72 place-content-center'>
            <Loader2 className='w-12 h-12 animate-spin' />
          </div>
        )
      }
      {
        error && (
          <div className='grid mt-72 place-content-center'>
            <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar los usuarios...</p>
          </div>
        )
      }
      {
        roles && (
          <DataTable columns={columns} data={roles} />
        )
      }
    </ContentLayout>
  )
}

export default RolesPage
