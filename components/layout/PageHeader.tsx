"use client";

import { Fragment, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    className="flex items-center transition-colors hover:text-foreground"
                                                    aria-label="Mostrar rutas intermedias"
                                                >
                                                    <BreadcrumbEllipsis className="h-4 w-4" />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start">
                                                    {hidden.map((item, hiddenIndex) => (
                                                        <DropdownMenuItem
                                                            key={`${item.label}-${hiddenIndex}`}
                                                            asChild={Boolean(item.href)}
                                                        >
                                                            {item.href ? (
                                                                <Link href={item.href}>
                                                                    {item.label}
                                                                </Link>
                                                            ) : (
                                                                <span>{item.label}</span>
                                                            )}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
