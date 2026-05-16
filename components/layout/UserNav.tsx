"use client";

import {
  LayoutGrid,
  Loader2,
  LogOut,
  Mail,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { useCompanyStore } from '@/stores/CompanyStore'


import { useAuth } from "@/contexts/AuthContext";
import { useMyEmployee } from "@/hooks/sistema/usuario/useMyEmployee";
import { MarqueeText } from "../misc/MarqueeText";

export function UserNav() {
  const { selectedCompany, selectedStation } = useCompanyStore()
  const { user, loading, logout } = useAuth();
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();

  const initials =
    `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`;
  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`
    .trim()
    .toUpperCase()

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8" onContextMenu={(e) => e.preventDefault()}>
                  <AvatarImage
                    src={
                      employee?.photo_url
                        ? `${employee.photo_url}?size=64`
                        : " "
                    }
                    alt="Avatar"
                    className="object-cover w-full h-full"
                    sizes="32px"
                  />

                  <AvatarFallback className="bg-transparent">
                    {loading || employeeLoading ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      initials
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <TooltipContent side="bottom">Cuenta</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* DROPDOWN */}
      <DropdownMenuContent
        className="
          w-56
          rounded-xl
          p-1
          bg-background/95
          backdrop-blur-md
          border
          shadow-xl
        "
        align="end"
        forceMount
      >
        {/* HEADER USER CARD */}
        <div className="px-2 py-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
                <AvatarImage
                  src={
                    employee?.photo_url
                      ? `${employee.photo_url}?size=64`
                      : " "
                  }
                  alt="Avatar"
                  className="object-cover w-full h-full"
                  sizes="32px"
                />
              <AvatarFallback className="text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col min-w-0">
              <p className="text-sm font-medium truncate">
                {fullName ?? "Usuario"}
              </p>

              <div className="flex items-center gap-1 min-w-0">
                <Mail className="w-3 h-3 flex-shrink-0" />

                <div className="min-w-0 flex-1">
                  <MarqueeText text={user?.email?.trim() ?? ""} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1" />

        {/* NAVIGATION */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="rounded-lg cursor-pointer px-2 py-2"
          >
            <Link href={`/${selectedCompany?.slug}/dashboard`} className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-muted-foreground" />
              Dashboard
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="rounded-lg cursor-pointer px-2 py-2"
          >
            <Link href="/ajustes/cuenta" className="flex items-center gap-2">
              <UserCircle2 className="w-4 h-4 text-muted-foreground" />
              Mi cuenta
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        {/* LOGOUT */}
        <DropdownMenuItem
          onClick={logout}
          className="
            rounded-lg
            cursor-pointer
            px-2 py-2
            text-red-500
            focus:bg-red-500/10
            focus:text-red-500
          "
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}