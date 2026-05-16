'use client';

import { UserNav } from "@/components/layout/UserNav";
import { SheetMenu } from "@/components/sidebar/SheetMenu";
import CompanySelect from "../selects/CompanySelect";
import { ThemeToggler } from "./ThemeToggler";
import NotificationBell from '@/components/notifications/NotificationBell';

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="relative mx-4 sm:mx-8 flex h-14 items-center">

        {/* IZQUIERDA */}
        <div className="flex items-center gap-4 flex-shrink-0 max-w-[40%] overflow-hidden z-0">
          <SheetMenu />

          <h1 className="hidden md:block text-xs sm:text-sm font-bold truncate max-w-[220px] lg:max-w-[320px]">
            {title}
          </h1>
        </div>

        {/* CENTRO */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex w-full max-w-[420px] xl:max-w-[520px] justify-center z-20">
          <div className="w-full flex items-center justify-center flex-nowrap min-w-0">
            <CompanySelect />
          </div>
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0 z-10">
          <ThemeToggler />
          <NotificationBell />
          <UserNav />
        </div>

      </div>
    </header>
  );
}