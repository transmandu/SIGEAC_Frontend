"use client";

import { UserNav } from "@/components/layout/UserNav";
import { SheetMenu } from "@/components/sidebar/SheetMenu";
import CompanySelect from "@/components/selects/CompanySelect";
import { ThemeToggler } from "./ThemeToggler";
import NotificationBell from "@/components/notifications/NotificationBell";
import ErrorReportTrigger from "@/components/misc/ErrorReportTrigger";
import CommandPalette from "./CommandPalette";
import { useScrollGlass } from "@/hooks/helpers/use-scroll-glass";

export function Navbar() {
  const { scrolled, targetRef } = useScrollGlass();

  return (
    <header
      ref={targetRef as React.RefObject<HTMLElement>}
      data-scrolled={scrolled}
      className="glass-surface sticky top-0 z-10 w-full"
    >
      <div className="relative mx-2 flex h-14 items-center gap-2 min-[22rem]:mx-4 min-[22rem]:gap-3 sm:mx-8 sm:gap-4">
        {/* IZQUIERDA */}
        {/* Desde lg los tres bloques van en la misma fila: los lados se reparten
            el espacio que deja el selector de empresa (centrado mientras quepa)
            y, si falta, ceden ellos en vez de pisarse. */}
        <div className="z-0 flex min-w-19.5 max-w-80 flex-1 items-center gap-1.5 min-[22rem]:min-w-20 min-[22rem]:gap-2 sm:gap-4 lg:min-w-0 lg:max-w-none lg:basis-0">
          <SheetMenu />

          <div className="@container flex min-w-9 flex-1 items-center lg:max-w-80">
            <CommandPalette />
          </div>
        </div>

        {/* CENTRO */}
        <div className="hidden shrink-0 lg:flex justify-center">
          <div className="flex w-fit flex-nowrap items-center justify-center">
            <CompanySelect />
          </div>
        </div>

        {/* DERECHA */}
        {/* Con seis controles el ancho mínimo ronda los 16 rem: por debajo de
            17 rem el tema y el reporte (ambos están también en el buscador)
            ceden su sitio para que nada se solape ni se salga de la pantalla. */}
        <div className="z-10 ml-auto flex shrink-0 items-center gap-1.5 min-[22rem]:gap-2 lg:ml-0 lg:min-w-fit lg:flex-1 lg:basis-0 lg:justify-end">
          <div className="hidden min-[17rem]:contents">
            <ThemeToggler />
            <ErrorReportTrigger />
          </div>
          <NotificationBell />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
