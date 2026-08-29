'use client';

import { UserNav } from "@/components/layout/UserNav";
import { SheetMenu } from "@/components/sidebar/SheetMenu";
import CompanySelect from "@/components/selects/CompanySelect";
import { ThemeToggler } from "./ThemeToggler";
import NotificationBell from '@/components/notifications/NotificationBell';
import ErrorReportTrigger from '@/components/misc/ErrorReportTrigger';
import { PageTitle } from './PageTitle';
import { useScrollGlass } from '@/hooks/helpers/use-scroll-glass';

export function Navbar() {
  const { scrolled, targetRef } = useScrollGlass();

  return (
    <header
      ref={targetRef as React.RefObject<HTMLElement>}
      data-scrolled={scrolled}
      className="glass-surface sticky top-0 z-10 w-full"
    >
      <div className="relative mx-4 sm:mx-8 flex h-14 items-center">

        {/* IZQUIERDA */}
        <div className="flex items-center gap-4 flex-shrink-0 max-w-[40%] overflow-hidden z-0">
          <SheetMenu />

          <PageTitle />
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
          <ErrorReportTrigger />
          <NotificationBell />
          <UserNav />
        </div>

      </div>
    </header>
  );
}