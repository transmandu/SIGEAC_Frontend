"use client";

import { Menu } from "@/components/sidebar/Menu";
import { SidebarToggle } from "@/components/sidebar/SidebarToggle";
import { Button } from "@/components/ui/button";
import { useSidebarToggle } from "@/hooks/helpers/use-sidebar-toggle";
import { useStore } from "@/hooks/helpers/use-store";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import Image from "next/image";
import Link from "next/link";

export function Sidebar() {
  const sidebar = useStore(useSidebarToggle, (state) => state);
  const { selectedCompany, selectedStation } = useCompanyStore();
  if (!sidebar) return null;
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        sidebar?.isOpen === false ? "w-[90px]" : "w-72"
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800 mt-5">
        <div className="bg-background rounded-md px-2 pt-2 pb-4 mb-1 mt-4 shadow-sm dark:shadow-zinc-900 flex justify-center">
          <Button
            className={cn(
              "transition-transform ease-in-out duration-300 w-full justify-center",
              sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0"
            )}
            variant="link"
            asChild
          >
            <Link
              href={`/${selectedCompany?.slug}/dashboard`}
              className="flex items-center justify-center w-full"
            >
              <Image src={"/logo.png"} width={150} height={150} alt="Logo" priority/>
            </Link>
          </Button>
        </div>
        {selectedCompany && selectedStation ? (
          <Menu isOpen={sidebar?.isOpen}  />
        ) : (
          <p className="text-sm text-muted-foreground text-center mt-10">
            Por favor, seleccione una <strong>Empresa</strong> y una{" "}
            <strong>Estacion</strong>.
          </p>
        )}
      </div>
    </aside>
  );
}
