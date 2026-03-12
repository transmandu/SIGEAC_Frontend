"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Dot, LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

interface CollapseMenuButtonProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  submenus: Submenu[];
  isOpen: boolean | undefined;
}

export function CollapseMenuButton({
  icon: Icon,
  label,
  active,
  submenus,
  isOpen
}: CollapseMenuButtonProps) {
  const isSubmenuActive = submenus.some((submenu) => submenu.active);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(isSubmenuActive);
  const triggerClassName = cn(
    "group relative h-11 w-full justify-start overflow-hidden rounded-xl border px-3 text-[13px] transition-all duration-200",
    "border-transparent bg-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/40 hover:text-foreground",
    (active || isSubmenuActive) &&
      "border-border/80 bg-muted/60 text-foreground shadow-sm shadow-black/5"
  );

  useEffect(() => {
    if (isSubmenuActive) {
      setIsCollapsed(true);
    }
  }, [isSubmenuActive]);

  return isOpen ? (
    <Collapsible
      open={isCollapsed}
      onOpenChange={setIsCollapsed}
      className="w-full"
    >
      <CollapsibleTrigger
        className="[&[data-state=open]>div>div>svg]:rotate-180"
        asChild
      >
        <Button variant="ghost" className={triggerClassName}>
          <span
            className={cn(
              "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-500 opacity-0 transition-opacity duration-200",
              (active || isSubmenuActive) && "opacity-100"
            )}
          />
          <div className="w-full items-center flex justify-between">
            <div className="flex items-center">
              <span
                className={cn(
                  "mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent bg-muted/30 text-muted-foreground transition-all duration-200 group-hover:border-border/60 group-hover:bg-background group-hover:text-foreground",
                  (active || isSubmenuActive) &&
                    "border-border/80 bg-background text-foreground shadow-sm shadow-black/5"
                )}
              >
                <Icon size={18} />
              </span>
              <p
                className={cn(
                  "max-w-[150px] truncate text-left text-[13px] font-medium transition-all duration-200",
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-96 opacity-0"
                )}
              >
                {label}
              </p>
            </div>
            <div
              className={cn(
                "whitespace-nowrap text-muted-foreground transition-colors duration-200 group-hover:text-foreground",
                isOpen
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-96 opacity-0"
            )}
          >
              <ChevronDown
                size={18}
                className="transition-transform duration-200"
              />
            </div>
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden pl-4 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {submenus.map(({ href, label, active }, index) => (
          <Button
            key={index}
            variant="ghost"
            className={cn(
              "group relative m-1 h-10 w-full justify-start rounded-xl border border-transparent bg-transparent px-3 text-muted-foreground transition-all duration-200",
              "hover:border-border/60 hover:bg-muted/35 hover:text-foreground",
              active && "border-border/70 bg-background text-foreground"
            )}
            asChild
          >
            <Link href={href}>
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-5 w-px -translate-y-1/2 bg-border/70",
                  index === submenus.length - 1 && "h-0"
                )}
              />
              <span className="mr-3 ml-2 flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground/80">
                <Dot size={16} />
              </span>
              <p
                className={cn(
                  "max-w-[170px] truncate text-[13px] font-medium",
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-96 opacity-0"
                )}
              >
                {label}
              </p>
            </Link>
          </Button>
        ))}
      </CollapsibleContent>
    </Collapsible>
  ) : (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "group h-11 w-full justify-start rounded-xl border border-transparent bg-transparent px-3 text-muted-foreground transition-all duration-200",
                  "hover:border-border/70 hover:bg-muted/40 hover:text-foreground",
                  (active || isSubmenuActive) &&
                    "border-border/80 bg-muted/60 text-foreground shadow-sm shadow-black/5"
                )}
              >
                <div className="w-full items-center flex justify-between">
                  <div className="flex items-center">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent bg-muted/30 text-muted-foreground transition-all duration-200 group-hover:border-border/60 group-hover:bg-background group-hover:text-foreground",
                        (active || isSubmenuActive) &&
                          "border-border/80 bg-background text-foreground shadow-sm shadow-black/5",
                        isOpen === false ? "mx-auto" : "mr-3"
                      )}
                    >
                      <Icon size={18} />
                    </span>
                    <p
                      className={cn(
                        "max-w-[200px] truncate text-[13px] font-medium",
                        isOpen === false ? "opacity-0" : "opacity-100"
                      )}
                    >
                      {label}
                    </p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            align="start"
            alignOffset={2}
            className="rounded-lg"
          >
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent
        side="right"
        sideOffset={18}
        align="start"
        className="min-w-[220px] rounded-xl border-border/70 bg-popover/95 p-2 shadow-xl shadow-black/10 backdrop-blur"
      >
        <DropdownMenuLabel className="max-w-[190px] px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {submenus.map(({ href, label, active }, index) => (
          <DropdownMenuItem
            key={index}
            asChild
            className={cn(
              "rounded-lg px-0 focus:bg-transparent",
              active && "bg-transparent"
            )}
          >
            <Link className="cursor-pointer" href={href}>
              <div
                className={cn(
                  "flex w-full items-center rounded-lg border border-transparent px-2 py-2 text-[13px] font-medium text-muted-foreground transition-all duration-200 hover:border-border/60 hover:bg-muted/35 hover:text-foreground",
                  active && "border-border/70 bg-muted/50 text-foreground"
                )}
              >
                <span className="mr-2 flex h-6 w-6 items-center justify-center text-muted-foreground/80">
                  <Dot size={16} />
                </span>
                <p className="max-w-[180px] truncate">{label}</p>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuArrow className="fill-border" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
