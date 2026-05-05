"use client";

import { format } from "date-fns";
import { buildAdminGroup } from "@/lib/menus/admin";
import { buildDashboardGroup } from "@/lib/menus/dashboard";
import { buildDevelopmentGroup } from "@/lib/menus/development";
import { buildEngineeringGroup } from "@/lib/menus/engineering";
import { buildGeneralGroup } from "@/lib/menus/general";
import { filterMenuGroups } from "@/lib/menus/helpers";
import { buildMaintenanceGroup } from "@/lib/menus/maintenance";
import { buildOperationGroup } from "@/lib/menus/operation";
import { buildPlanificationGroup } from "@/lib/menus/planification";
import { buildPurchasesGroup } from "@/lib/menus/purchases";
import { buildQualityControlGroup } from "@/lib/menus/quality-control";
import { buildSettingsGroup } from "@/lib/menus/settings";
import { buildSmsGroup } from "@/lib/menus/sms";
import type { Group } from "@/lib/menus/types";
import { buildWarehouseGroup } from "@/lib/menus/warehouse";
import type { Company } from "@/types";

export function getMenuList(
    pathname: string,
    currentCompany: Company | null,
    userRoles: string[],
): Group[] {
    const context = {
        pathname,
        currentCompany,
        date: format(new Date(), "yyyy-MM-dd"),
    };

    const fullMenu: Group[] = [
        buildDashboardGroup(context),
        buildGeneralGroup(context),
        buildDevelopmentGroup(context),
        buildSmsGroup(context),
        buildPurchasesGroup(context),
        buildWarehouseGroup(context),
        buildPlanificationGroup(context),
        buildQualityControlGroup(context),
        buildOperationGroup(context),
        buildMaintenanceGroup(context),
        buildEngineeringGroup(context),
        buildSettingsGroup(context),
        buildAdminGroup(context),
    ];

    return filterMenuGroups(fullMenu, { currentCompany, userRoles });
}
