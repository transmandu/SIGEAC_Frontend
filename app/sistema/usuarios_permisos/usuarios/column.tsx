"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import RolesDialog from "@/components/dialogs/general/RolesDialog"
import UserDropdownActions from "@/components/dropdowns/ajustes/UserDropdownActions"
import { Badge } from "@/components/ui/badge"
import { User } from "@/types"
import { redirect } from "next/navigation"
import { useState } from "react"
import UserStatusButton  from "@/components/misc/UserStatusButton"
import { Info } from "lucide-react"


export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "first_name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    cell: ({ row }) =>
      <div className="flex items-center justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex justify-center"><p className='text-center font-medium'>{row.original.first_name} {row.original.last_name}</p></TooltipTrigger>
            <TooltipContent>
              <p>TODO: Agregar imagen</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Usuario" />
    ),
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="flex items-center justify-center">
          <p className="font-bold">{item.username}</p>
        </div>
      )
    }
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">{item.email}</p>
        </div>
      )
    }
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <div className="flex items-center justify-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground/90 cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-sm text-gray-600">
              Para activar o desactivar un usuario, haga clic en su estado.
            </p>
          </TooltipContent>
        </Tooltip>
        <DataTableColumnHeader column={column} title="Status" />
      </div>
    ),
    cell: ({ row }) => {
      const item = row.original

      const isActive = Number(item.isActive) === 1

      return (
        <div className="flex items-center justify-center">
          <UserStatusButton
            userId={Number(item.id)}
            isActive={isActive}
          />
        </div>
      )
    }
  },
  {
    accessorKey: "roles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Roles" />
    ),
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="flex flex-col gap-2 justify-center items-center">
          {
            item && item.roles && item?.roles?.length < 3 ? item.roles.map((rol) => (
              <div onClick={() => redirect('/administracion/usuarios_permisos/roles')} className="flex items-center justify-center cursor-pointer" key={rol.id}>
                <Badge className="text-center">{rol.label}</Badge>
              </div>
            ))
              :
              (
                item && item.roles && <RolesDialog names={`${item.first_name} ${item.last_name}`} roles={item.roles} />
              )
          }
          {
            item && item.roles && item?.roles?.length <= 0 && <p className="text-center italic text-muted-foreground">No tiene permisos</p>
          }
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      const companies = row.original.companies
      return (
        <UserDropdownActions user={user} companies={companies} />
      )
    },
  },
]
