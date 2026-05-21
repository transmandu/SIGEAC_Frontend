'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plane } from 'lucide-react'
import { useCompanyStore } from "@/stores/CompanyStore";
import Image from 'next/image'
import loadingGif from "@/public/loading2.gif";
import { useAuth } from '@/contexts/AuthContext';

export default function NotFound() {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth()

  const [isRedirecting, setIsRedirecting] = useState(false)

  const router = useRouter()

  const handleRedirect = () => {
    if (isRedirecting) return
    
    if (!user) {
      router.push('/login')
      return
    }

    setIsRedirecting(true)
    router.push(`/${selectedCompany?.slug}/dashboard`)
  }
  return (
    <div className="relative min-h-dvh w-dvw flex items-center justify-center overflow-hidden bg-background">

      {/* fondo con profundidad suave */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,black,transparent_40%),radial-gradient(circle_at_80%_70%,black,transparent_45%)]" />

      <div className="relative flex flex-col items-center text-center max-w-3xl px-8">

        {/* icono con presencia */}
        <div className="mb-10 relative flex items-center justify-center">
          <Plane className="size-32 rotate-[-18deg] text-black dark:text-white" />
        </div>


        <div className="mb-3 flex items-center justify-center gap-3">
          <div className="h-px w-16 bg-border" />

          <span className="text-[15px] font-medium tracking-[0.35em] uppercase text-muted-foreground">
            Error
          </span>

          <div className="h-px w-16 bg-border" />
        </div>
        {/* 404 dominante pero con aire */}
        <h1 className="relative text-[120px] leading-none font-bold tracking-tighter mb-6">
          <span className="relative z-10 text-transparent bg-clip-text bg-[url('/binary-pattern.avif')] dark:bg-[url('/binary-pattern-dark.webp')] bg-repeat bg-center">
            404
          </span>
        </h1>

        {/* contenido */}
        <div className="space-y-5 mb-12">
          <h2 className="text-5xl font-bold tracking-tight">
            PÁGINA NO ENCONTRADA
          </h2>

          <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            La ruta que intentas acceder no existe o fue movida.
            Revisa la URL o vuelve al panel principal para continuar.
          </p>
        </div>

        {/* botón moderno sin component global */}
        <button
          onClick={handleRedirect}
          disabled={isRedirecting}
          className="group relative inline-flex h-14 min-w-[220px] items-center justify-center overflow-hidden rounded-xl bg-foreground px-8 py-4 text-base font-medium text-background transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-80"
        >

          <div className="absolute inset-0 rounded-xl bg-foreground opacity-0 blur-md transition group-hover:opacity-10" />

          {isRedirecting ? (
            <div className="relative flex h-full items-center justify-center overflow-hidden">
              <Image
                src={loadingGif}
                width={170}
                height={170}
                alt="Loading..."
                className="pointer-events-none shrink-0 contrast-150 saturate-200 brightness-125"
              />
            </div>
          ) : (
            <span className="relative">
              Volver al dashboard
            </span>
          )}

        </button>

      </div>
    </div>
  )
}