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
    hazard_notification?: HazardNotification;
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
    hazard_notification?: HazardNotification;
    image?: string;
    document?: string;
    imageUrl?: string;
    documentUrl?: string;
}

export type HazardNotification = {
    id: number;
    report_number: string;
    reception_date: string;
    location?: Location;
    identification_area: string;
    danger_type: string;
    information_source?: InformationSource;
    description: string;
    analysis_of_root_causes: string;
    report_type: string;
    voluntary_report?: VoluntaryReport;
    obligatory_report?: ObligatoryReport;
    mitigation_plan?: MitigationPlan;
    analysis?: Analysis;

}


export interface MitigationPlan {
    id: number;
    area_responsible: string;
    possible_consequences: string;
    consequence_to_evaluate: string;
    description: string;
    measures: MitigationMeasure[];
    analysis?: Analysis;
}

export interface MitigationMeasure {
    id: number;
    description: string;
    implementation_supervisor: string;
    implementation_responsible: string;
    estimated_date: string;
    execution_date?: string;
    follow_up_controls?: FollowUpControl[];

}

export interface FollowUpControl {
    id: number;
    description: string;
    date: string;
    mitigation_measure_id: number | string;
    image?: string;
    document?: string;
}

export interface Analysis {
    id: number;
    severity: string;
    probability: string;
    result: string;
    type: string;
    hazard_notification?: number;
    mitigation_plan_id?: number;
}
