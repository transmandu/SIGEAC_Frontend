import type { MaintenanceAircraft, Unit } from "@/types";

/**
 * Catálogo de Servicios/Certificados y Tareas de Mantenimiento: el programa
 * de mantenimiento de cada aeronave (RAV 43/121/135, MSG-3), administrado por
 * Ingeniería pero consumido por toda la Dirección de Mantenimiento.
 * Backend: App\Models\MaintenanceCatalog\*.
 */

export type CatalogCategory = "CERTIFICATE" | "SERVICE";
export type CatalogStatus = "ACTIVE" | "SUPERSEDED";
export type CatalogCountingMethod = "HOURS" | "CYCLES" | "DAYS";
export type Msg3TaskType =
    | "LUBRICATION_SERVICING"
    | "OPERATIONAL_CHECK"
    | "VISUAL_CHECK"
    | "GENERAL_VISUAL_INSPECTION"
    | "DETAILED_INSPECTION"
    | "SPECIAL_DETAILED_INSPECTION"
    | "RESTORATION"
    | "DISCARD"
    | "FUNCTIONAL_CHECK";
export type CatalogRequirementType = "PART" | "TOOL" | "CONSUMABLE" | "COMPONENT" | "GENERAL";

export type CatalogManual = {
    id: number;
    name: string;
    manual_code: string | null;
    revision: string | null;
    effective_date: string | null;
    file_path: string | null;
    file_url: string | null;
    is_physical: boolean;
    status: CatalogStatus;
    superseded_by_manual_id: number | null;
    /** Solo en el detalle: la revisión que reemplazó a esta, si aplica. */
    superseded_by?: CatalogManual | null;
    /** Solo en el detalle: revisiones anteriores, de la más a la menos reciente. */
    previous_revisions?: CatalogManual[];
    description: string | null;
    services_count?: number;
    /** Solo en el detalle del manual. */
    services?: CatalogService[];
    registered_by: string;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
};

export type CatalogTaskRequirement = {
    id: number;
    maintenance_catalog_task_id: number;
    requirement_type: CatalogRequirementType;
    part_number: string | null;
    description: string;
    quantity: number | null;
    unit_id: number | null;
    unit: Unit | null;
    is_mandatory: boolean;
    notes: string | null;
};

export type CatalogTask = {
    id: number;
    maintenance_catalog_service_id: number;
    task_number: string | null;
    ata: string | null;
    msg3_type: Msg3TaskType;
    description: string;
    reference: string | null;
    estimated_man_hours: number | null;
    required_skill: string | null;
    requirements: CatalogTaskRequirement[];
};

export type CatalogService = {
    id: number;
    maintenance_catalog_manual_id: number | null;
    category: CatalogCategory;
    name: string;
    code: string | null;
    description: string | null;
    counting_method: CatalogCountingMethod | null;
    interval_value: number | null;
    status: CatalogStatus;
    manual: CatalogManual | null;
    tasks?: CatalogTask[];
    tasks_count?: number;
    aircrafts?: MaintenanceAircraft[];
    registered_by: string;
    updated_by: string | null;
};
