'use client'

import { ShieldOff } from 'lucide-react'

import { ContentLayout } from '@/components/layout/ContentLayout'

const TransitPermissionDenied = () => {
  return (
    <ContentLayout title="Artículos en Tránsito">

      <div
        className="
          flex items-center justify-center
          min-h-[60vh]
        "
      >
        <div
          className="
            flex flex-col items-center
            gap-4
            max-w-md
            px-6 py-8
            rounded-2xl
            border
            bg-white/70
            dark:bg-slate-900/50
            border-slate-200/60
            dark:border-slate-700/60
            backdrop-blur-md
            shadow-sm
            dark:shadow-[0_10px_35px_rgba(0,0,0,0.35)]
          "
        >

          <div
            className="
              flex items-center justify-center
              size-14
              rounded-full
              bg-red-50
              dark:bg-red-950/30
              border
              border-red-200/60
              dark:border-red-900/40
            "
          >
            <ShieldOff
              className="
                size-7
                text-red-600
                dark:text-red-400
              "
            />
          </div>

          <div className="flex flex-col items-center text-center gap-1.5">

            <h2
              className="
                text-lg
                font-semibold
                tracking-tight
              "
            >
              Acceso restringido
            </h2>

            <p
              className="
                text-sm
                text-muted-foreground
                leading-relaxed
              "
            >
              No tienes permisos para visualizar los artículos en tránsito
              dentro del módulo de almacén y logística.
            </p>

          </div>

          <div
            className="
              px-3 py-1.5
              rounded-md
              text-[11px]
              font-medium
              tracking-wide
              bg-muted/50
              border border-border/50
              text-muted-foreground
            "
          >
            Roles requeridos:
            {' '}
            ALMACEN · JEFE_ALMACEN · ANALISTA_ALMACEN
          </div>

        </div>
      </div>

    </ContentLayout>
  )
}

export default TransitPermissionDenied