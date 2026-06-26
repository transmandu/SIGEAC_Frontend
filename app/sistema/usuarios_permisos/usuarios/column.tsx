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
import { useState } from "react"
import UserStatusButton  from "@/components/misc/UserStatusButton"
import { Info } from "lucide-react"
import Link from "next/link"


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
            <TooltipTrigger asChild>
              <Link
                href={`/sistema/usuarios_permisos/usuarios/${row.original.id}`}
                className="text-center font-medium hover:text-black hover:underline transition-colors"
              >
                {row.original.first_name} {row.original.last_name}
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver detalle del usuario</p>
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

      const CHART_DOTS = [
        "bg-[hsl(var(--chart-1))]",
        "bg-[hsl(var(--chart-2))]",
        "bg-[hsl(var(--chart-3))]",
        "bg-[hsl(var(--chart-4))]",
        "bg-[hsl(var(--chart-5))]",
      ]

      if (!item.roles || item.roles.length === 0) {
        return (
          <div className="flex items-center justify-center">
            <span className="text-xs italic text-muted-foreground/50">Sin roles asignados</span>
          </div>
        )
      }

      if (item.roles.length < 3) {
        return (
          <div className="flex flex-col gap-2 items-center">
            {item.roles.map((rol, idx) => {
              const company = item.companies?.find((c) => String(c.id) === String(rol.company_id))
              return (
                <div key={rol.id} className="flex flex-col items-center gap-1">
                  {company && (
                    <Badge variant="outline" className="text-[10px] gap-1 py-0 font-medium text-muted-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CHART_DOTS[idx % CHART_DOTS.length]}`} />
                      {company.name}
                    </Badge>
                  )}
                  <Badge variant="secondary">{rol.label}</Badge>
                </div>
              )
            })}
          </div>
        )
      }

      return (
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex -space-x-1">
            {item.roles.slice(0, 3).map((rol, idx) => (
              <span key={rol.id} className={`w-3 h-3 rounded-full border-2 border-background ${CHART_DOTS[idx % CHART_DOTS.length]}`} />
            ))}
            {item.roles.length > 3 && (
              <span className="w-3 h-3 rounded-full border-2 border-background bg-muted-foreground/40" />
            )}
          </div>
          <RolesDialog names={`${item.first_name} ${item.last_name}`} roles={item.roles} companies={item.companies} />
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
