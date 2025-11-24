"use client";

import { GuestMenu } from "@/components/sidebar/GuestMenu";
import { SidebarToggle } from "@/components/sidebar/SidebarToggle";
import { Button } from "@/components/ui/button";
import { useSidebarToggle } from "@/hooks/helpers/use-sidebar-toggle";
import { useStore } from "@/hooks/helpers/use-store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export function GuestSidebar() {
  const sidebar = useStore(useSidebarToggle, (state) => state);
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
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1 mt-4",
            sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href="/" className="flex items-center gap-2">
            <Image src={"/logo.png"} width={150} height={150} alt="Logo" />
          </Link>
        </Button>
        <GuestMenu isOpen={sidebar?.isOpen} />
      </div>
    </aside>
  );
}