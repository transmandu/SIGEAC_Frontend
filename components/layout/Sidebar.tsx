"use client";

import { Menu } from "@/components/sidebar/Menu";
import { SidebarToggle } from "@/components/sidebar/SidebarToggle";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarToggle } from "@/hooks/helpers/use-sidebar-toggle";
import { useStoreHydrated } from "@/hooks/helpers/use-store";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import Logo from "@/components/misc/Logo";
import Link from "next/link";

export function Sidebar() {
  const isOpen = useSidebarToggle((state) => state.isOpen);
  const setIsOpen = useSidebarToggle((state) => state.setIsOpen);
  const hydrated = useStoreHydrated(useSidebarToggle);
  const { selectedCompany, selectedStation } = useCompanyStore();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0",
        // Sin transición hasta hidratar: el ancho persistido se aplica de golpe
        // en vez de animarse desde el default.
        hydrated && "transition-[width] ease-in-out duration-300",
        isOpen === false ? "w-22.5" : "w-72",
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="glass-panel relative h-full flex flex-col px-2 py-4 overflow-hidden">
        {/* LOGO CONTAINER */}
        <div className="relative mb-1 mt-4 h-24 shrink-0">
          {/* Plegada, la barra mide 74 px útiles y el logo horizontal quedaba
              ilegible: se muestra solo el avión de la marca, centrado en el
              mismo eje que los iconos del menú. */}
          <TooltipProvider disableHoverableContent>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  href={
                    selectedCompany && selectedStation
                      ? `/${selectedCompany.slug}/dashboard`
                      : "/inicio"
                  }
                  aria-label="Inicio"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span
                    className={cn(
                      "absolute px-4 transition-opacity duration-200",
                      isOpen === false
                        ? "pointer-events-none opacity-0"
                        : "opacity-100",
                    )}
                  >
                    <Logo width={120} height={120} />
                  </span>
                  {/* Avión recortado de cada versión del logo (public/plane*.png).
                      Como en Logo.tsx, el tema lo resuelve CSS, no JS. */}
                  {[
                    { src: "/plane.png", theme: "dark:hidden" },
                    { src: "/plane-dark.png", theme: "hidden dark:block" },
                  ].map(({ src, theme }) => (
                    <Image
                      key={src}
                      src={src}
                      alt=""
                      width={64}
                      height={64}
                      draggable={false}
                      loading="eager"
                      className={cn(
                        "pointer-events-none absolute size-16 max-w-none select-none transition-opacity duration-200",
                        theme,
                        isOpen === false ? "opacity-100" : "opacity-0",
                      )}
                    />
                  ))}
                </Link>
              </TooltipTrigger>
              {isOpen === false && (
                <TooltipContent side="right" className="rounded-lg">
                  Inicio
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Sin compañía el menú no se oculta: getMenuList ya devuelve solo los
            grupos de master, que es justo lo que el SUPERUSER necesita para
            administrar el sistema sin haber entrado a ninguna empresa. */}
        <Menu isOpen={isOpen} />

        {!(selectedCompany && selectedStation) && (
          <p className="text-sm text-muted-foreground text-center mt-6 px-4">
            Seleccione una <strong>Empresa</strong> y una{" "}
            <strong>Estación</strong> para ver los módulos operativos.
          </p>
        )}
      </div>
    </aside>
  );
}
