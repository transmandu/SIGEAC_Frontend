"use client";

import { cn } from "@/lib/utils";
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
    purchase_order_id?: number | null;
    purchase_order_number?: string | null;
    /** Número de la requisición de origen: purchase_order -> quote_order -> requisition_order. */
    requisition_order_number?: string | null;
}

interface IRegisterArticleProps {
    isEditing?: boolean;
    initialData?: EditingArticle;
    category?: string;
    /** Al editar: reemplaza la redirección post-guardado (útil dentro de diálogos). */
    onEditSuccess?: () => void;
    /**
     * Rótulo del botón de guardado. El formulario se reutiliza desde flujos que
     * no son "ingresar al almacén" (corregir un artículo en cuarentena, editar
     * uno en tránsito), donde el texto por defecto describe algo que no ocurre.
     */
    submitLabel?: string;
    /** Título del formulario; por defecto describe crear o editar un artículo. */
    title?: string;
    /**
     * Oculta el bloque de acciones del formulario y notifica su estado. Lo usan
     * los flujos que lo embeben en un diálogo y montan el botón en el footer,
     * fuera del área que se desplaza; el submit se dispara por `requestSubmit()`.
     */
    onStateChange?: (state: { busy: boolean; canSave: boolean }) => void;
}

const DirectRegisterArticleForm = ({
    isEditing = false,
    initialData,
    onEditSuccess,
    submitLabel,
    title,
    onStateChange,
}: IRegisterArticleProps) => {
    const [type, setType] = useState(
        initialData?.batch.category.toUpperCase() ?? "COMPONENT",
    );
    function handleTypeSelect(data: string) {
        setType(data);
    }
    return (
        // Sin margen inferior cuando el contexto pone su propio pie: dejaría un
        // hueco entre el formulario y el footer del diálogo.
        <div className={cn("space-y-3", !onStateChange && "mb-4")}>
            <h1 className="font-bold text-3xl">
                {title ?? (isEditing ? "Edicion de Articulo" : "Carga de Articulo")}
            </h1>
            {!isEditing && (
                <p className="text-sm text-muted-foreground">
                    Seleccione el tipo de articulo a registrar:
                </p>
            )}
            {/* Al editar la categoría no puede cambiar: el selector solo ocupa
                espacio deshabilitado. */}
            {!isEditing && (
                <Select value={type} onValueChange={handleTypeSelect}>
                    <SelectTrigger className="w-[230px]">
                        <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="CONSUMABLE">CONSUMIBLE</SelectItem>
                        <SelectItem value="TOOL">HERRAMIENTA</SelectItem>
                        <SelectItem value="COMPONENT">COMPONENTE</SelectItem>
                        <SelectItem value="PART">PARTE</SelectItem>
                    </SelectContent>
                </Select>
            )}
            {type === "CONSUMABLE" && (
                <DirectRegisterConsumableForm isEditing={isEditing} initialData={initialData} onEditSuccess={onEditSuccess} submitLabel={submitLabel} onStateChange={onStateChange} />
            )}
            {type === "TOOL" && (
                <CreateToolForm isEditing={isEditing} initialData={initialData} onEditSuccess={onEditSuccess} submitLabel={submitLabel} onStateChange={onStateChange} />
            )}
            {type === "COMPONENT" && (
                <DirectRegisterComponentForm isEditing={isEditing} initialData={initialData} onEditSuccess={onEditSuccess} submitLabel={submitLabel} onStateChange={onStateChange} />
            )}
            {type === "PART" && (
                <DirectRegisterPartForm isEditing={isEditing} initialData={initialData} onEditSuccess={onEditSuccess} submitLabel={submitLabel} onStateChange={onStateChange} />
            )}
        </div>
    );
};
export default DirectRegisterArticleForm;
