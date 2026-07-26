"use client";

import { GuestSheetMenu } from "@/components/sidebar/GuestSheetMenu";
import { GuestUserNav } from "./GuestUserNav";
import { ThemeToggler } from "./ThemeToggler";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { useScrollGlass } from "@/hooks/helpers/use-scroll-glass";

export function GuestNavbar() {
  const { title } = usePageTitle();
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
          <GuestSheetMenu />

          <h1 className="hidden md:block text-xs sm:text-sm font-bold truncate max-w-[220px] lg:max-w-[320px]">
            {title}
          </h1>
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0 z-10">
          <ThemeToggler />
          <GuestUserNav />
        </div>

      </div>
    </header>
  );
}
