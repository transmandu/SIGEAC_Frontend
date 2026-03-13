"use client";

import { Minus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { CollapseMenuButton } from "@/components/sidebar/CollapseMenuButton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useRouteSelection } from "@/hooks/helpers/use-route-selection";
import { getMenuList } from "@/lib/menu-list-2";
import { cn } from "@/lib/utils";

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const { currentCompany, currentStation } = useRouteSelection();

  const menuList = useMemo(() => {
    const userRoles = user?.roles?.map((role) => role.name) || [];
    const withStation = (href: string) => {
      if (!currentStation || !href.startsWith("/")) {
        return href;
      }

      const separator = href.includes("?") ? "&" : "?";
      return `${href}${separator}station=${currentStation}`;
    };

    return getMenuList(pathname, currentCompany, userRoles).map((group) => ({
      ...group,
      menus: group.menus.map((menu) => ({
        ...menu,
        href: withStation(menu.href),
        submenus: menu.submenus.map((submenu) => ({
          ...submenu,
          href: withStation(submenu.href),
        })),
      })),
    }));
  }, [currentCompany, currentStation, pathname, user?.roles]);

  // Calculate the minimum height for the menu container
  const menuContainerHeight = useMemo(() => {
    return isOpen === undefined
      ? "calc(100vh - 48px - 36px - 16px - 32px)"
      : "calc(100vh - 32px - 40px - 32px)";
  }, [isOpen]);

  const getItemClassName = (active: boolean) =>
    cn(
      "group relative m-1 h-11 w-full justify-start overflow-hidden rounded-xl border px-3 text-[13px] transition-all duration-200",
      "border-transparent bg-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/40 hover:text-foreground",
      active &&
        "border-border/80 bg-muted/60 text-foreground shadow-sm shadow-black/5"
    );

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-6 h-full w-full" aria-label="Main navigation">
        <ul
          className={cn(
            "flex flex-col items-start gap-2 px-2",
            `min-h-[${menuContainerHeight}]`
          )}
        >
          {menuList.map(({ groupLabel, menus }, index) => (
            <li className={cn("w-full", groupLabel ? "pt-3" : "")} key={index}>
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <div className="px-2 pb-2">
                  <div className="flex items-center gap-3">
                    <p className="max-w-[180px] truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/90">
                      {groupLabel}
                    </p>
                    <span className="h-px flex-1 bg-border/70" />
                  </div>
                </div>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="flex w-full items-center justify-center pb-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground">
                          <Minus className="h-4 w-4" />
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="rounded-lg">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="pb-2"></p>
              )}
              {menus.map(
                ({ href, label, icon: Icon, active, submenus }, index) =>
                  submenus.length === 0 ? (
                    <div className="w-full" key={index}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className={getItemClassName(active)}
                              asChild
                            >
                              <Link href={href}>
                                <span
                                  className={cn(
                                    "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-500 opacity-0 transition-opacity duration-200",
                                    active && "opacity-100"
                                  )}
                                />
                                <span
                                  className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent bg-muted/30 text-muted-foreground transition-all duration-200 group-hover:border-border/60 group-hover:bg-background group-hover:text-foreground",
                                    active &&
                                      "border-border/80 bg-background text-foreground shadow-sm shadow-black/5",
                                    isOpen === false ? "mx-auto" : "mr-3"
                                  )}
                                >
                                  <Icon size={18} />
                                </span>
                                <p
                                  className={cn(
                                    "truncate text-left text-[13px] font-medium transition-all duration-200",
                                    isOpen === false
                                      ? "-translate-x-96 opacity-0"
                                      : "translate-x-0 opacity-100"
                                  )}
                                >
                                  {label}
                                </p>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {isOpen === false && (
                            <TooltipContent side="right" className="rounded-lg">
                              {label}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div className="w-full" key={index}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={active}
                        submenus={submenus}
                        isOpen={isOpen}
                      />
                    </div>
                  )
              )}
            </li>
          ))}
        </ul>
      </nav>
    </ScrollArea>
  );
}
