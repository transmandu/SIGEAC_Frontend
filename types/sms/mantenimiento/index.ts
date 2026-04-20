import { InformationSource, Location } from "@/types";

export type VoluntaryReport = {
    id: number;
    report_number?: string;
    report_date: string; // Las fechas vienen como string de la API (ISO format)
    identification_date: string;
    location: Location;
    identification_area: string;
    // Reporter Information (opcionales)
    reporter_name?: string;
    reporter_last_name?: string;
    reporter_phone?: string;
    reporter_email?: string;
    description: string;
    possible_consequences: string;
    status: string;
    danger_identification_id?: number | null;
    hazard_notification?: HazardNotification | null;
    danger_identification?: HazardNotification | null;
    image?: string;
}


export type ObligatoryReport = {
    id: number;
    report_number?: string;
    report_date: Date;
    report_time: string;
    incident_date: Date;
    incident_time: string;
    incident_location: Location;
    report_location: Location;

    name: string;
    last_name: string;
    phone?: string;
    email?: string;

    incidents: string;
    other_incidents: string;
    description: string;
    status: string;
    danger_identification_id?: number | null;
    hazard_notification?: HazardNotification | null;
    danger_identification?: HazardNotification | null;
    image?: string;
    document?: string;
    imageUrl?: string;
    documentUrl?: string;
}

export type HazardNotification = {
    id: number;
    report_number: string;
    reception_date: string; // O Date, si prefieres manejar objetos de fecha
    location?: Location; // Interfaz opcional de la relación

    identification_area: string;
    danger_type: string;
    information_source?: InformationSource;

    description: string;
    possible_consequences: string;
    consequence_to_evaluate: string;
    analysis_of_root_causes: string;

    report_type: string;
    voluntary_report?: VoluntaryReport;
    obligatory_report?: ObligatoryReport;
}

