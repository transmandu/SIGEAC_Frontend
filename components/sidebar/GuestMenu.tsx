"use client";

import { Home, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
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

  const getItemClassName = (active: boolean) =>
    cn(
      "group relative my-0.5 h-11 w-full justify-start overflow-hidden rounded-xl border pl-2 pr-2 text-[13px] transition-all duration-200",
      "border-transparent bg-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/40 hover:text-foreground",
      active &&
        "border-border/80 bg-muted/60 text-foreground shadow-xs shadow-black/5",
    );

  return (
    // Scroll nativo, igual que en Menu: ver la nota allí.
    <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-modern">
      <nav className="mt-6 w-full" aria-label="Guest navigation">
        <ul className="flex flex-col items-start gap-2 px-1 pb-4">
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
                                "absolute left-0 top-1/2 h-6 w-0.75 -translate-y-1/2 rounded-r-full bg-primary opacity-0 transition-opacity duration-200",
                                isActive && "opacity-100",
                              )}
                            />
                            <span
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent bg-muted/30 text-muted-foreground transition-all duration-200 group-hover:border-border/60 group-hover:bg-background/70 group-hover:text-foreground",
                                isActive && "glass-control text-foreground",
                                isOpen === false ? "mx-auto" : "mr-3",
                              )}
                            >
                              <item.icon size={18} />
                            </span>
                            <p
                              className={cn(
                                "min-w-0 flex-1 truncate text-left text-[13px] font-medium transition-all duration-200",
                                // hidden al colapsar: ver la nota en Menu.
                                isOpen === false
                                  ? "hidden"
                                  : "translate-x-0 opacity-100",
                              )}
                            >
                              {item.label}
                            </p>
                          </Link>
                        </Button>
                      </TooltipTrigger>

                      {isOpen === false && (
                        <TooltipContent side="right" className="rounded-lg">
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
    </div>
  );
}
