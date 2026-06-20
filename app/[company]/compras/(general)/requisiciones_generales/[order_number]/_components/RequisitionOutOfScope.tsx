'use client'

import { PackageSearch } from 'lucide-react'

import { ContentLayout } from '@/components/layout/ContentLayout'

const RequisitionOutOfScope = () => {
  return (
    <ContentLayout title="Requisición General">

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
              bg-amber-50
              dark:bg-amber-950/30
              border
              border-amber-200/60
              dark:border-amber-900/40
            "
          >
            <PackageSearch
              className="
                size-7
                text-amber-600
                dark:text-amber-400
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
              Solicitud no disponible aquí
            </h2>

            <p
              className="
                text-sm
                text-muted-foreground
                leading-relaxed
              "
            >
              Esta requisición corresponde a compras aeronáuticas y no se
              gestiona dentro del módulo de compras generales.
            </p>

          </div>

        </div>
      </div>

    </ContentLayout>
  )
}

export default RequisitionOutOfScope
