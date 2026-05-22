'use client'

import Image from 'next/image'

import {
  Building2,
  Phone,
  Boxes,
  Plane,
  BadgeCheck,
} from 'lucide-react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { Badge } from '@/components/ui/badge'

import { Company } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  company: Company
}

interface ItemProps {
  icon: React.ReactNode
  label: string
  value?: React.ReactNode
  className?: string
}

const Item = ({
  icon,
  label,
  value,
  className,
}: ItemProps) => {
  return (
    <div
      className={cn(
        `
          flex items-start gap-3 rounded-lg border
          bg-background/70 backdrop-blur-sm
          border-slate-200/70 dark:border-slate-700/60
          px-3 py-3
        `,
        className
      )}
    >
      <div
        className="
          mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center
          rounded-md bg-slate-100 dark:bg-slate-800
        "
      >
        {icon}
      </div>

      <div className="flex flex-col leading-tight">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </span>

        <span className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words">
          {value ?? '—'}
        </span>
      </div>
    </div>
  )
}

export default function CompaniesSubRow({
  company,
}: Props) {

  const modulesCount = company.modules?.length ?? 0

  const logoSrc = company.logo

  return (
    <div className="flex flex-col gap-4">

      <div className="flex items-center justify-between gap-4">

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Información de la empresa
          </span>
        </div>

        <div className="flex items-center gap-2">

        <Popover>
        <PopoverTrigger asChild>
            <button type="button">
            <Badge
                variant="outline"
                className="
                cursor-pointer rounded-md px-2 py-0.5 text-[11px]
                font-medium bg-background/60 transition-colors
                hover:bg-slate-100 dark:hover:bg-slate-800
                "
            >
                {modulesCount}{' '}
                {modulesCount === 1 ? 'módulo' : 'módulos'}
            </Badge>
            </button>
        </PopoverTrigger>

        <PopoverContent
            align="end"
            className="
            w-64 rounded-xl border border-slate-200/70
            bg-background/95 p-3 backdrop-blur-sm
            dark:border-slate-700/60
            "
        >
            <div className="flex flex-col gap-2">

            <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-muted-foreground" />

                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Módulos asociados
                </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {company.modules?.length ? (
                company.modules.map((module) => (
                    <Badge
                    key={module.id}
                    variant="secondary"
                    className="
                        rounded-md text-[10px]
                        font-medium tracking-wide
                    "
                    >
                    {module.label}
                    </Badge>
                ))
                ) : (
                <span className="text-xs text-muted-foreground">
                    Sin módulos asociados
                </span>
                )}
            </div>

            </div>
        </PopoverContent>
        </Popover>

          <div
            className="
              relative flex h-11 w-11 shrink-0
              items-center justify-center overflow-hidden
              rounded-full border bg-background
              border-slate-200 dark:border-slate-700
            "
          >
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={company.slug}
              fill
              className="object-cover"
            />
          ) : (
            <Building2 className="h-5 w-5 text-muted-foreground" />
          )}
          </div>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

        <Item
          icon={
            <Phone className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          }
          label="Teléfono principal"
          value={company.phone_number}
        />

        <Item
          icon={
            <Phone className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          }
          label="Teléfono alternativo"
          value={company.alt_phone_number}
        />

        <Item
          icon={
            <Plane className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          }
          label="Código IATA"
          value={company.cod_iata}
        />

        <Item
          icon={
            <Plane className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          }
          label="Código OACI"
          value={company.cod_oaci}
        />

        <Item
          icon={
            <BadgeCheck className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          }
          label="Tipo de organización"
          value={
            company.isOMAC ? (
              <Badge
                className="
                  mt-1 w-fit rounded-md
                  border-blue-500/30
                  bg-blue-500/10
                  text-blue-700
                  dark:text-blue-300
                  hover:bg-blue-500/10
                "
              >
                OMAC
              </Badge>
            ) : (
              <Badge
                className="
                  mt-1 w-fit rounded-md
                  border-slate-500/30
                  bg-slate-500/10
                  text-slate-700
                  dark:text-slate-300
                  hover:bg-slate-500/10
                "
              >
                Operador General
              </Badge>
            )
          }
        />

      </div>

    </div>
  )
}