"use client";

import { Home, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface GuestMenuProps {
  isOpen: boolean | undefined;
}

// Menú simple para usuarios invitados (no autenticados)
const guestMenuItems = [
  {
    label: "Inicio",
    icon: Home,
    href: "/",
  },
  {
    label: "Iniciar Sesión",
    icon: LogIn,
    href: "/login",
  },
];

export function GuestMenu({ isOpen }: GuestMenuProps) {
  const pathname = usePathname();

  // Calculate the minimum height for the menu container
  const menuContainerHeight = useMemo(() => {
    return isOpen === undefined
      ? "calc(100vh - 48px - 36px - 16px - 32px)"
      : "calc(100vh - 32px - 40px - 32px)";
  }, [isOpen]);

  const getItemClassName = (active: boolean) =>
    cn(
      "group relative m-1 h-11 w-full justify-start overflow-hidden rounded-xl border pl-2 pr-3 text-[13px] transition-all duration-200",
      "border-transparent bg-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/40 hover:text-foreground",
      active &&
      "border-border/80 bg-muted/60 text-foreground shadow-sm shadow-black/5"
    );

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-6 h-full w-full" aria-label="Guest navigation">
        <ul
          className={cn(
            "flex flex-col items-start gap-2 px-2",
            `min-h-[${menuContainerHeight}]`
          )}
        >
          <li className="w-full">
            {guestMenuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <div className="w-full" key={index}>
                  <TooltipProvider disableHoverableContent>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={getItemClassName(isActive)}
                          asChild
                        >
                          <Link href={item.href}>
                            <span
                              className={cn(
                                "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-500 opacity-0 transition-opacity duration-200",
                                isActive && "opacity-100"
                              )}
                            />
                            <span
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent bg-muted/30 text-muted-foreground transition-all duration-200 group-hover:border-border/60 group-hover:bg-background group-hover:text-foreground",
                                isActive &&
                                  "border-border/80 bg-background text-foreground shadow-sm shadow-black/5",
                                isOpen === false
                                  ? "mx-auto"
                                  : "mr-3"
                              )}
                            >
                              <item.icon size={18} />
                            </span>
                            <p
                              className={cn(
                                "truncate text-left text-[13px] font-medium transition-all duration-200",
                                isOpen === false
                                  ? "-translate-x-96 opacity-0"
                                  : "translate-x-0 opacity-100"
                              )}
                            >
                              {item.label}
                            </p>
                          </Link>
                        </Button>
                      </TooltipTrigger>

                      {isOpen === false && (
                        <TooltipContent
                          side="right"
                          className="rounded-lg"
                        >
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            })}
          </li>
        </ul>
      </nav>
    </ScrollArea>
  );
}