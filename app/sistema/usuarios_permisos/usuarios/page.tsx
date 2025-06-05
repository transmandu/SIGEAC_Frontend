'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import { useGetUsers } from '@/hooks/sistema/usuario/useGetUsers'
import { Loader2 } from 'lucide-react';
import React from 'react'
import { DataTable } from './data-table';
import { columns } from './column';

const UsersPage = () => {

  const { data: users, error, isLoading } = useGetUsers();

  return (
    <ContentLayout title='Usuarios'>
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
        users && (
          <DataTable columns={columns} data={users} />
        )
      }
    </ContentLayout>
  )
}

export default UsersPage
