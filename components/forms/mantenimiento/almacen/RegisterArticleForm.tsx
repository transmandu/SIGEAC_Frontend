"use client";

import { Article, Batch, Convertion } from "@/types";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../ui/select";
import DirectRegisterComponentForm from "@/app/[company]/almacen/ingresar_inventario/_components/DirectRegisterComponentForm";
import DirectRegisterConsumableForm from "@/app/[company]/almacen/ingresar_inventario/_components/DirectRegisterConsumableForm";
import DirectRegisterPartForm from "@/app/[company]/almacen/ingresar_inventario/_components/DirectRegisterPartForm";
import CreateToolForm from "./CreateToolForm";

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
        model?: string;
    };
    partComponent?: {
        id: number;
        article_id: string;
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
        aircraft_id?: string;
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
    has_documentation?: boolean;
}

interface IRegisterArticleProps {
    isEditing?: boolean;
    initialData?: EditingArticle;
    category?: string;
    /** Al editar: reemplaza la redirección post-guardado (útil dentro de diálogos). */
    onEditSuccess?: () => void;
}

const DirectRegisterArticleForm = ({
    isEditing = false,
    initialData,
    onEditSuccess,
}: IRegisterArticleProps) => {
    const [type, setType] = useState(
        initialData?.batch.category.toUpperCase() ?? "COMPONENTE",
    );
    function handleTypeSelect(data: string) {
        setType(data);
    }
    return (
        <div className="space-y-3 mb-4">
            <h1 className="font-bold text-3xl">
                {isEditing ? "Edicion de Articulo" : "Carga de Articulo"}
            </h1>
            {!isEditing && (
                <p className="text-sm text-muted-foreground">
                    Seleccione el tipo de articulo a registrar:
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
                    <SelectItem value="HERRAMIENTA">HERRAMIENTA</SelectItem>
                    <SelectItem value="COMPONENTE">COMPONENTE</SelectItem>
                    <SelectItem value="PARTE">PARTE</SelectItem>
                </SelectContent>
            </Select>
            {type === "CONSUMIBLE" && (
                <DirectRegisterConsumableForm isEditing={isEditing} initialData={initialData} onEditSuccess={onEditSuccess} />
            )}
            {type === "HERRAMIENTA" && (
                <CreateToolForm isEditing={isEditing} initialData={initialData} onEditSuccess={onEditSuccess} />
            )}
            {type === "COMPONENTE" && (
                <DirectRegisterComponentForm isEditing={isEditing} initialData={initialData} onEditSuccess={onEditSuccess} />
            )}
            {type === "PARTE" && (
                <DirectRegisterPartForm isEditing={isEditing} initialData={initialData} onEditSuccess={onEditSuccess} />
            )}
        </div>
    );
};
export default DirectRegisterArticleForm;
