"use client";

import { Fragment, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import BackButton from "@/components/misc/BackButton";
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { buildBreadcrumbTrail, type Crumb } from "@/lib/menus/breadcrumbs";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";

const MAX_CRUMBS = 3;

interface PageHeaderProps {
    /** Reemplaza la última migaja: en rutas dinámicas el segmento es un id crudo. */
    currentLabel?: string;
    extraCrumbs?: Crumb[];
    hideBackButton?: boolean;
    backFallbackHref?: string;
    className?: string;
}

export function PageHeader({
    currentLabel,
    extraCrumbs,
    hideBackButton = false,
    backFallbackHref,
    className,
}: PageHeaderProps) {
    const pathname = usePathname();
    const { selectedCompany } = useCompanyStore();

    const crumbs = useMemo(() => {
        const trail = buildBreadcrumbTrail(pathname ?? "", selectedCompany);
        const withExtras = extraCrumbs?.length ? [...trail, ...extraCrumbs] : trail;

        if (!currentLabel) return withExtras;

        return withExtras.map((crumb, index) =>
            index === withExtras.length - 1 ? { ...crumb, label: currentLabel } : crumb,
        );
    }, [pathname, selectedCompany, currentLabel, extraCrumbs]);

    // Siempre 3 migajas como máximo: primera > … > actual. Las intermedias
    // siguen accesibles desde el desplegable de los puntos suspensivos.
    const { visible, hidden } = useMemo(() => {
        if (crumbs.length <= MAX_CRUMBS) return { visible: crumbs, hidden: [] as Crumb[] };

        return {
            visible: [crumbs[0], crumbs[crumbs.length - 1]],
            hidden: crumbs.slice(1, -1),
        };
    }, [crumbs]);

    const hiddenLabels = hidden.map((crumb) => crumb.label).join(" / ");

    return (
        <div className={cn("flex items-center gap-3", className)}>
            {!hideBackButton && (
                <BackButton
                    iconOnly
                    tooltip="Volver"
                    variant="secondary"
                    fallbackHref={
                        backFallbackHref ??
                        (selectedCompany ? `/${selectedCompany.slug}/dashboard` : "/inicio")
                    }
                />
            )}

            <Breadcrumb>
                <BreadcrumbList>
                    {visible.map((crumb, index) => {
                        const isLast = index === visible.length - 1;

                        return (
                            <Fragment key={`${crumb.label}-${index}`}>
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                    ) : crumb.href ? (
                                        <BreadcrumbLink href={crumb.href}>
                                            {crumb.label}
                                        </BreadcrumbLink>
                                    ) : (
                                        crumb.label
                                    )}
                                </BreadcrumbItem>

                                {!isLast && <BreadcrumbSeparator />}

                                {index === 0 && hidden.length > 0 && (
                                    <>
                                        <BreadcrumbItem>
                                            {/* Muestra el tramo recorrido; no navega a ningún lado. */}
                                            <Popover>
                                                <PopoverTrigger
                                                    aria-label={`Ver ruta intermedia: ${hiddenLabels}`}
                                                    className="flex items-center rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                >
                                                    <BreadcrumbEllipsis className="h-4 w-4" />
                                                </PopoverTrigger>

                                                <PopoverContent
                                                    align="center"
                                                    side="bottom"
                                                    sideOffset={10}
                                                    collisionPadding={12}
                                                    className="w-auto max-w-sm px-3 py-2.5"
                                                >
                                                    {/* Ancla visual: sin ella el panel flota sin origen claro. */}
                                                    <PopoverPrimitive.Arrow
                                                        width={12}
                                                        height={6}
                                                        className="fill-popover"
                                                    />

                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Ruta intermedia
                                                    </p>

                                                    <ol className="mt-1.5 space-y-1 text-sm">
                                                        {hidden.map((item, hiddenIndex) => (
                                                            <li
                                                                key={`${item.label}-${hiddenIndex}`}
                                                                className="flex items-center gap-1.5 whitespace-nowrap"
                                                            >
                                                                <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
                                                                {item.label}
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </PopoverContent>
                                            </Popover>
                                        </BreadcrumbItem>

                                        <BreadcrumbSeparator />
                                    </>
                                )}
                            </Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}

export default PageHeader;
