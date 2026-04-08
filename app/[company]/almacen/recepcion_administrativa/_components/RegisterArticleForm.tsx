"use client";

import CreateGeneralArticleForm from "@/components/forms/mantenimiento/almacen/CreateGeneralArticleForm";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Article, Batch, Convertion } from "@/types";
import { useState } from "react";
import RegisterConsumableForm from "./RegisterConsumableForm";
import RegisterPartForm from "./RegisterPartForm";
import RegisterToolForm from "./RegisterToolForm";
import RegisterComponentForm from "./RegisterComponentForm";

export interface EditingArticle extends Article {
    batch: Batch;
    tool?: {
        id: number;
        serial: string;
        isSpecial: boolean;
        needs_calibration: boolean;
        calibration_date?: string;
        next_calibration?: string | number;
        article_id: number;
    };
    partComponent?: {
        id: number;
        article_id: string;
        aircraft_id?: string;
        expiration_date?: string | null;
        fabrication_date: string | null;
        hour_date: string | null;
        cycle_date: string | null;
        calendary_date: string | null;
        life_limit_part_calendar?: string;
        life_limit_part_hours?: string | number;
        life_limit_part_cycles?: string | number;
        hard_time_calendar?: string;
        hard_time_hours?: string | number;
        hard_time_cycles?: string | number;
        shelf_life?: number;
        shelf_life_unit?: string;
    };
    consumable?: {
        lot_number?: string;
        expiration_date: string;
        fabrication_date: string | null;
        min_quantity?: number | string;
        quantity?: number;
        is_managed?: boolean | string | number;
        shelf_life?: string | null;
        primary_unit_id: string;
        conversions: Convertion[];
    };
    certificate_8130?: string;
    certificate_vendor?: string;
    certificate_fabricant?: string;
    has_documentation?: boolean;
}

interface IRegisterArticleProps {
    isEditing?: boolean;
    initialData?: EditingArticle;
    category?: string;
}

const RegisterArticleForm = ({
    isEditing = false,
    initialData,
}: IRegisterArticleProps) => {
    const [type, setType] = useState(
        initialData?.batch.category.toUpperCase() ?? "COMPONENTE",
    );
    function handleTypeSelect(data: string) {
        setType(data);
    }
    return (
        <div className="space-y-3 mb-4">
            <h1 className="font-bold text-3xl mt-2">
                {isEditing ? "Edicion de Articulo" : "Recepción Administrativa"}
            </h1>
            {!isEditing && (
                <p className="text-xs text-muted-foreground">
                    Seleccione el tipo de articulo a recepcionar. Si el articulo ya existe en el sistema, se actualizará su información y se agregará un nuevo lote con la cantidad ingresada:
                </p>
            )}
            <Select
                disabled={isEditing}
                value={type}
                onValueChange={handleTypeSelect}
            >
                <SelectTrigger className="w-[230px]">
                    <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="CONSUMIBLE">CONSUMIBLE</SelectItem>
                    <SelectItem value="COMPONENTE">COMPONENTE</SelectItem>
                    <SelectItem value="HERRAMIENTA">HERRAMIENTA</SelectItem>
                    <SelectItem value="PARTE">PARTE</SelectItem>
                    <SelectItem value="GENERAL">GENERAL</SelectItem>
                </SelectContent>
            </Select>
            {type === "CONSUMIBLE" && (
                <RegisterConsumableForm isEditing={isEditing} initialData={initialData} />
            )}
            {type === "HERRAMIENTA" && (
                <RegisterToolForm isEditing={isEditing} initialData={initialData} />
            )}
            {type === "COMPONENTE" && (
                <RegisterComponentForm isEditing={isEditing} initialData={initialData} />
            )}
            {type === "PARTE" && (
                <RegisterPartForm isEditing={isEditing} initialData={initialData} />
            )}
            {type === "GENERAL" && <CreateGeneralArticleForm />}
        </div>
    );
};
export default RegisterArticleForm;
