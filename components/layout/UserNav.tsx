"use client";

import Link from "next/link";

import {
  LayoutGrid,
  Loader2,
  LogOut,
  Mail,
  UserCircle2,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import { cn } from "@/lib/utils";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

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

import { useCompanyStore } from "@/stores/CompanyStore";

import { useAuth } from "@/contexts/AuthContext";
import { useMyEmployee } from "@/hooks/sistema/usuario/useMyEmployee";

import { MarqueeText } from "../misc/MarqueeText";

export function UserNav() {
  const { selectedCompany } = useCompanyStore();

  const { user, loading, logout } = useAuth();

  const { data: employee, isLoading: employeeLoading } =
    useMyEmployee();

  const initials =
    `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`;

  const fullName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`
      .trim()
      .toUpperCase();

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
                    src={
                      employee?.photo_url
                        ? `${employee.photo_url}?size=64`
                        : " "
                    }
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
                    {loading || employeeLoading ? (
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
            Cuenta
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
                <AvatarImage
                  src={
                    employee?.photo_url
                      ? `${employee.photo_url}?size=64`
                      : " "
                  }
                  alt="Avatar"
                  className="object-cover"
                  sizes="40px"
                />

                <AvatarFallback className="text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium truncate">
                  {fullName || "Usuario"}
                </p>

                <div className="flex items-center gap-1 text-muted-foreground min-w-0">
                  <Mail className="w-3 h-3 flex-shrink-0" />

                  <div className="min-w-0 flex-1">
                    <MarqueeText
                      text={user?.email?.trim() ?? ""}
                    />
                  </div>
                </div>
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
                href={`/${selectedCompany?.slug}/dashboard`}
                className="flex items-center gap-2"
              >
                <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                Dashboard
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              asChild
              className="rounded-xl px-2 py-2 cursor-pointer"
            >
              <Link
                href="/ajustes/cuenta"
                className="flex items-center gap-2"
              >
                <UserCircle2 className="w-4 h-4 text-muted-foreground" />
                Mi cuenta
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1" />

          {/* LOGOUT */}
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setTimeout(() => {
                logout();
              }, 0);
            }}
            className={cn(
              "rounded-xl px-2 py-2 cursor-pointer",
              "text-red-500",
              "focus:bg-red-500/10",
              "focus:text-red-500"
            )}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </AnimatePresence>
    </DropdownMenu>
  );
}