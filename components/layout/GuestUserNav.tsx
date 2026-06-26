"use client";

import {
  Loader2,
  LogIn,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export function GuestUserNav() {
  const { loading } = useAuth();

  const initials = "G";

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.18,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  "relative flex items-center justify-center",
                  "h-9 w-9 p-0 rounded-full",
                  "bg-background",
                  "border border-border/80",
                  "hover:border-border",
                  "hover:bg-muted/70",
                  "transition-all duration-200",
                  "overflow-hidden"
                )}
              >
                <Avatar
                  className="h-8 w-8"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <AvatarImage
                    src={" "}
                    alt="Avatar"
                    className="object-cover"
                    sizes="32px"
                  />

                  <AvatarFallback
                    className={cn(
                      "bg-transparent",
                      "text-[10px] font-medium",
                      "text-foreground/80"
                    )}
                  >
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      initials
                    )}
                  </AvatarFallback>
                </Avatar>
              </motion.button>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <TooltipContent side="bottom">
            Perfil
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AnimatePresence>
        <DropdownMenuContent
          align="end"
          forceMount
          className={cn(
            "w-56 rounded-2xl",
            "border border-border/70",
            "bg-background/95",
            "backdrop-blur-xl",
            "shadow-2xl",
            "p-1.5"
          )}
        >
          {/* HEADER */}
          <motion.div
            initial={{
              opacity: 0,
              y: 4,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.18,
            }}
            className="px-2 py-2"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border/60">
                <AvatarImage src={" "} alt="Avatar" className="object-cover" sizes="40px" />
                <AvatarFallback className="text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium truncate">
                  Invitado
                </p>

                <p className="text-xs text-muted-foreground truncate">
                  Sin sesión iniciada
                </p>
              </div>
            </div>
          </motion.div>

          <DropdownMenuSeparator className="my-1" />

          {/* NAV */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              asChild
              className="rounded-xl px-2 py-2 cursor-pointer"
            >
              <Link
                href="/login"
                className="flex items-center gap-2"
              >
                <LogIn className="w-4 h-4 text-muted-foreground" />
                Iniciar Sesión
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </AnimatePresence>
    </DropdownMenu>
  );
}