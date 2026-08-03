"use client";

import { Fragment, useMemo } from "react";
import { usePathname } from "next/navigation";
import BackButton from "@/components/misc/BackButton";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { buildBreadcrumbTrail, type Crumb } from "@/lib/menus/breadcrumbs";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";

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
                    {crumbs.map((crumb, index) => {
                        const isLast = index === crumbs.length - 1;

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
                            </Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}

export default PageHeader;
