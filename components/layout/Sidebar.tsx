"use client";

import { Menu } from "@/components/sidebar/Menu";
import { SidebarToggle } from "@/components/sidebar/SidebarToggle";
import { Button } from "@/components/ui/button";
import { useSidebarToggle } from "@/hooks/helpers/use-sidebar-toggle";
import { useStore } from "@/hooks/helpers/use-store";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import Logo from "@/components/misc/Logo";
import Link from "next/link";

export function Sidebar() {
  const sidebar = useStore(useSidebarToggle, (state) => state);
  const { selectedCompany, selectedStation } = useCompanyStore();

  if (!sidebar) return null;

  const { isOpen, setIsOpen } = sidebar;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0",
        "transition-[width] ease-in-out duration-300",
        isOpen === false ? "w-[90px]" : "w-72"
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="glass-panel relative h-full flex flex-col px-3 py-4 overflow-hidden">
        {/* LOGO CONTAINER */}
        <div
          className={cn(
            "flex justify-center items-center mb-1 mt-4",
            "px-4 py-4"
          )}
        >
          <Button
            className={cn(
              "transition-transform ease-in-out duration-300 w-full justify-center",
              isOpen === false ? "translate-x-1" : "translate-x-0"
            )}
            variant="link"
            asChild
          >
            <Link
              href={
                selectedCompany && selectedStation
                  ? `/${selectedCompany.slug}/dashboard`
                  : "/inicio"
              }
              className="flex items-center justify-center w-full"
            >
              <Logo width={120} height={120} />
            </Link>
          </Button>
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