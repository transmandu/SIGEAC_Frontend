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
      <h1 className='text-4xl font-bold text-center mb-2'>Control de Usuarios</h1>
      <p className='text-sm text-muted-foreground text-center'>
        Aquí puede visualizar todos los usuarios registrados en el sistema. Utilice los filtros o el buscador para localizar un usuario específico. <br />
        Presione el botón de <strong>Crear</strong> para registrar un nuevo usuario. Desde la tabla podrá <strong>activar o desactivar</strong> usuarios, <strong>editar sus datos</strong>, <strong>cambiar la contraseña</strong>, <strong>consultar roles</strong> y, si es necesario, <strong>eliminarlos</strong>.
      </p>
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
