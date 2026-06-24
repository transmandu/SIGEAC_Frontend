"use client";

import { GuestMenu } from "@/components/sidebar/GuestMenu";
import { SidebarToggle } from "@/components/sidebar/SidebarToggle";
import { Button } from "@/components/ui/button";
import { useGuestSidebarToggle } from "@/hooks/helpers/use-guest-sidebar-toggle";
import { useStore } from "@/hooks/helpers/use-store";
import { cn } from "@/lib/utils";
import Logo from "@/components/misc/Logo";
import Link from "next/link";

export function GuestSidebar() {
  const sidebar = useStore(useGuestSidebarToggle, (state) => state);

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

      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800 mt-5">
        {/* LOGO CONTAINER */}
        <div
          className={cn(
            "flex justify-center items-center mb-1 mt-4",
            "bg-background",
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
            <Link href="/" className="flex items-center justify-center w-full">
              <Logo width={120} height={120} />
            </Link>
          </Button>
        </div>

        <GuestMenu isOpen={isOpen} />
      </div>
    </aside>
  );
}
