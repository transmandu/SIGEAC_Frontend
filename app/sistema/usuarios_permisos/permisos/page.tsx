'use client';

import { ContentLayout } from '@/components/layout/ContentLayout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { Loader2 } from 'lucide-react'
import React from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'
import { useGetPermissions } from '@/hooks/sistema/usuario/useGetPermissions'

const PermisosPage = () => {
  const { data: permissions, isLoading, error } = useGetPermissions()
  return (
    <ProtectedRoute>
      <ContentLayout title='Permisos'>
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
              <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar los permisos...</p>
            </div>
          )
        }
        {
          permissions && (
            <DataTable columns={columns} data={permissions} />
          )
        }
      </ContentLayout>
    </ProtectedRoute>
  )
}

export default PermisosPage
