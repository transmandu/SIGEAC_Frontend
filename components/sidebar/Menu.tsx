"use client";

import { ChevronDown, Minus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { CollapseMenuButton } from "@/components/sidebar/CollapseMenuButton";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { getMenuList } from "@/lib/menu-list";

interface MenuProps {
    isOpen: boolean | undefined;
}

// Devuelve {} en el servidor, donde no hay localStorage: el primer render debe
// coincidir con el del cliente o Next reporta un hydration mismatch.
function readCollapsedGroups(storageKey: string): Record<string, boolean> {
    if (typeof window === "undefined") return {};

    try {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
}

export function Menu({ isOpen }: MenuProps) {
    const { user } = useAuth();
    const pathname = usePathname();
    const { selectedCompany } = useCompanyStore();
    const storageKey = useMemo(
        () => `sidebar-collapsed-groups-${selectedCompany?.slug ?? "default"}`,
        [selectedCompany?.slug]
    );

    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    // La clave cambia al cambiar de empresa, y cada empresa recuerda sus propios
    // grupos cerrados. Se ajusta durante el render en vez de en un efecto: así no
    // hay un primer pintado con los grupos abiertos que luego salta al estado real.
    const [loadedKey, setLoadedKey] = useState<string | null>(null);

    if (loadedKey !== storageKey) {
        setLoadedKey(storageKey);
        setCollapsedGroups(readCollapsedGroups(storageKey));
    }

    const isSuperUser = user?.roles?.some(
        (role) => role.name === "SUPERUSER"
    );

    const toggleGroup = (groupLabel: string) => {
        setCollapsedGroups((prev) => {
            const next = {
                ...prev,
                [groupLabel]: !prev[groupLabel],
            };

            localStorage.setItem(
                storageKey,
                JSON.stringify(next)
            );

            return next;
        });
    };

    // Memoize the menu list to prevent unnecessary recalculations
    const menuList = useMemo(() => {
        const userRoles = user?.roles?.map((role) => role.name) || [];
        return getMenuList(pathname, selectedCompany, userRoles);
    }, [pathname, selectedCompany, user?.roles]);

    const getItemClassName = (active: boolean) =>
        cn(
            // my-0.5 en vez de m-1: el margen lateral recortaba cada item por
            // ambos lados y lo desalineaba del encabezado de grupo, que no lo lleva.
            "group relative my-0.5 h-11 w-full justify-start overflow-hidden rounded-xl border pl-2 pr-2 text-[13px] transition-all duration-200",
            "border-transparent bg-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/40 hover:text-foreground",
            active &&
            "border-border/80 bg-muted/60 text-foreground shadow-xs shadow-black/5"
        );

    return (
        // Scroll nativo en vez de ScrollArea de Radix: el thumb virtual de Radix
        // se recalcula en JS y el menú bajaba a tirones. El nativo hereda la
        // inercia y el suavizado del sistema.
        <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-modern">
            <nav className="mt-6 w-full" aria-label="Main navigation">
                <ul className="flex flex-col items-start gap-2 px-1 pb-4">
                {menuList.map(({ groupLabel, menus }, index) => {
                    const isCollapsed =
                        collapsedGroups[groupLabel] ?? false;

                    return (
                        <li className={cn("w-full", groupLabel ? "pt-3" : "")} key={index}>
                            {(isOpen && groupLabel) || isOpen === undefined ? (
                                <div className="px-2 pb-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            isSuperUser &&
                                            groupLabel &&
                                            toggleGroup(groupLabel)
                                        }
                                        className={cn(
                                            "group flex w-full items-center gap-3 rounded-xl px-2 py-1.5 transition-all duration-200",
                                            "relative overflow-hidden",

                                            // SOLO interactivo si es superuser
                                            isSuperUser ? "cursor-pointer" : "cursor-default"
                                        )}
                                    >
                                        {/* Hover SOLO para superuser */}
                                        {isSuperUser && (
                                            <span className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-muted/30" />
                                        )}

                                        <p
                                            className={cn(
                                                // min-w-0 shrink en vez de un max-w fijo: el encabezado
                                                // usa el ancho que haya y solo trunca si de verdad falta.
                                                "relative z-10 min-w-0 shrink truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/90 transition-colors",

                                                // SOLO hover effect si es superuser
                                                isSuperUser && "group-hover:text-foreground"
                                            )}
                                        >
                                            {groupLabel}
                                        </p>

                                        <span
                                            className={cn(
                                                "relative z-10 h-px flex-1 bg-border/60 transition-colors",

                                                // hover SOLO si es superuser
                                                isSuperUser && "group-hover:bg-border/80"
                                            )}
                                        />

                                        {isSuperUser && (
                                            <ChevronDown
                                                className={cn(
                                                    "relative z-10 h-3 w-3 shrink-0 text-muted-foreground transition-all duration-200 group-hover:text-foreground/90",
                                                    isCollapsed && "-rotate-90"
                                                )}
                                            />
                                        )}
                                    </button>
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

                            {(!isSuperUser || !isCollapsed) &&
                                menus.map(
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
                                                                            "absolute left-0 top-1/2 h-6 w-0.75 -translate-y-1/2 rounded-r-full bg-primary opacity-0 transition-opacity duration-200",
                                                                            active && "opacity-100"
                                                                        )}
                                                                    />
                                                                    <span
                                                                        className={cn(
                                                                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent bg-muted/30 text-muted-foreground transition-all duration-200 group-hover:border-border/60 group-hover:bg-background/70 group-hover:text-foreground",
                                                                            active &&
                                                                                "glass-control text-foreground",
                                                                            isOpen === false
                                                                                ? "mx-auto"
                                                                                : "mr-3"
                                                                        )}
                                                                    >
                                                                        <Icon size={18} />
                                                                    </span>
                                                                    <p
                                                                        className={cn(
                                                                            "min-w-0 flex-1 truncate text-left text-[13px] font-medium transition-all duration-200",
                                                                            // hidden al colapsar: con flex-1 el label seguiría
                                                                            // ocupando ancho y el mx-auto del icono no centraría.
                                                                            isOpen === false
                                                                                ? "hidden"
                                                                                : "translate-x-0 opacity-100"
                                                                        )}
                                                                    >
                                                                        {label}
                                                                    </p>
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>

                                                        {isOpen === false && (
                                                            <TooltipContent
                                                                side="right"
                                                                className="rounded-lg"
                                                            >
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
                    );
                })}
                </ul>
            </nav>
        </div>
    );
}
