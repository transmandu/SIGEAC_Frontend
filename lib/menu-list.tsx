"use client";

import { format } from "date-fns";
import { buildSystemGroup } from "@/lib/menus/system";
import { buildDashboardGroup } from "@/lib/menus/dashboard";
import { buildDevelopmentGroup } from "@/lib/menus/development";
import { buildEngineeringGroup } from "@/lib/menus/engineering";
import { buildGeneralGroup } from "@/lib/menus/general";
import { filterMenuGroups } from "@/lib/menus/helpers";
import { buildMaintenanceGroup } from "@/lib/menus/maintenance";
import { buildOperationGroup } from "@/lib/menus/operation";
import { buildPlanificationGroup } from "@/lib/menus/planification";
import { buildPurchasesGroups } from "@/lib/menus/purchases";
import { buildQualityControlGroup } from "@/lib/menus/quality-control";
import { buildProfileGroup } from "@/lib/menus/profile";
import { buildSettingsGroup } from "@/lib/menus/settings";
import { buildSmsGroup } from "@/lib/menus/sms";
import { buildSupervisorGroup } from "@/lib/menus/supervisor";
import type { Group } from "@/lib/menus/types";
import { buildWarehouseGroup } from "@/lib/menus/warehouse";
import type { Company } from "@/types";

/**
 * Todos los grupos sin filtrar por roles ni módulos. El sidebar siempre debe
 * usar `getMenuList`; esto es para quien necesite el mapa completo de rutas a
 * etiquetas, como las migajas de `PageHeader`.
 */
export function buildMenuGroups(
    pathname: string,
    currentCompany: Company | null,
    userRoles: string[] = [],
): Group[] {
    const context = {
        pathname,
        currentCompany,
        date: format(new Date(), "yyyy-MM-dd"),
        userRoles,
    };

    // Sin compañía solo sobreviven Perfil y Sistema, que son de master; el resto
    // de los grupos depende del tenant y armaría hrefs sin slug al que apuntar.
    if (!currentCompany) {
        return [buildProfileGroup(context), buildSystemGroup(context)];
    }

    return [
        buildDashboardGroup(context),
        buildGeneralGroup(context),
        buildDevelopmentGroup(context),
        buildSmsGroup(context),
        ...buildPurchasesGroups(context),
        buildWarehouseGroup(context),
        buildPlanificationGroup(context),
        buildQualityControlGroup(context),
        buildOperationGroup(context),
        buildMaintenanceGroup(context),
        buildEngineeringGroup(context),
        buildSettingsGroup(context),
        buildProfileGroup(context),
        buildSystemGroup(context),
        buildSupervisorGroup(context),
    ];
}

export function getMenuList(
    pathname: string,
    currentCompany: Company | null,
    userRoles: string[],
): Group[] {
    return filterMenuGroups(buildMenuGroups(pathname, currentCompany, userRoles), {
        currentCompany,
        userRoles,
    });
}
