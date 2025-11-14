"use client";

import { Home, Info, Mail, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  {
    label: "Acerca de",
    icon: Info,
    href: "/about",
  },
  {
    label: "Contacto",
    icon: Mail,
    href: "/contact",
  },
];

export function GuestMenu({ isOpen }: GuestMenuProps) {
  const pathname = usePathname();

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-8 h-full w-full" aria-label="Guest navigation">
        <ul className="flex flex-col items-start space-y-1 px-2">
          <li className="w-full">
            <p className="text-sm font-medium text-muted-foreground px-4 pb-2">
              Menú Principal
            </p>
            {guestMenuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <div className="w-full" key={index}>
                  <TooltipProvider disableHoverableContent>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start h-10 mb-1"
                          asChild
                        >
                          <Link href={item.href}>
                            <span className={cn(isOpen === false ? "" : "mr-4")}>
                              <item.icon size={18} />
                            </span>
                            <p
                              className={cn(
                                "max-w-[200px] truncate",
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
                        <TooltipContent side="right">
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