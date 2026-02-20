'use client';

import { UserNav } from "@/components/layout/UserNav";
import { SheetMenu } from "@/components/sidebar/SheetMenu";
import CompanySelect from "../selects/CompanySelect";
import { ThemeToggler } from "./ThemeToggler";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex h-14 items-center justify-between">

        {/* Izquierda */}
        <div className="flex items-center gap-4">
          <SheetMenu />
          <h1 className="text-xs sm:text-sm xl:text-base font-bold">
            {title}
          </h1>
        </div>

        {/* Desktop real */}
        <div className="hidden xl:flex items-center">
          <CompanySelect />
        </div>

        <div className="flex xl:hidden items-center">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-muted/80 transition">
                <ChevronDown className="w-5 h-5" />
              </button>
            </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="center"
                sideOffset={8}
                className="
                  w-72 p-4
                  data-[state=open]:animate-in
                  data-[state=closed]:animate-out
                  data-[state=open]:fade-in-0
                  data-[state=closed]:fade-out-0
                  data-[state=open]:slide-in-from-top-2
                  data-[state=closed]:slide-out-to-top-2
                  duration-200
                  ease-out
                "
              >
                <CompanySelect />
              </PopoverContent>
          </Popover>
        </div>
        {/* Derecha */}
        <div className="flex items-center gap-2">
          <ThemeToggler />
          <UserNav />
        </div>

      </div>
    </header>
  );
}