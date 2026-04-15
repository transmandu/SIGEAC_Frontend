import { Location } from "@/types";

export type VoluntaryReport = {
    id: number;
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
    status: string
    image?: string;
}


export type ObligatoryReport = {
    id: number;
    report_date: Date;
    report_time: string;
    incident_date: Date;
    incident_time: string;
    location: Location;
    origirin_location: Location;

    name: string;
    last_name: string;
    phone?: string;
    email?: string;

    incidents: string;
    other_incidents: string;
    description: string;
    incident_location: string;
    status: string;
    image?: string;
    document?: string;
    imageUrl?: string;
    documentUrl?: string;
}

