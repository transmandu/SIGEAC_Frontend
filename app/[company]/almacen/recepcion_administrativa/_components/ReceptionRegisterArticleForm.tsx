"use client";

import { useState } from "react";

import CreateGeneralArticleForm from "@/components/forms/mantenimiento/almacen/CreateGeneralArticleForm";
import { ArticleCategoryPicker } from "@/components/forms/mantenimiento/almacen/articulos/ArticleCategoryPicker";
import ConsumableArticleForm from "@/components/forms/mantenimiento/almacen/articulos/ConsumableArticleForm";
import PartComponentArticleForm from "@/components/forms/mantenimiento/almacen/articulos/PartComponentArticleForm";
import ToolArticleForm from "@/components/forms/mantenimiento/almacen/articulos/ToolArticleForm";

// El tipo vive con los formularios que lo consumen; aquí solo se
// reexporta para no romper a quien lo importaba desde este módulo.
import type { EditingArticle } from "@/components/forms/mantenimiento/almacen/articulos/types";
export type { EditingArticle };

interface IRegisterArticleProps {
    isEditing?: boolean;
    initialData?: EditingArticle;
    category?: string;
}

/**
 * Única entrada de creación de artículos por lote.
 *
 * El destino del artículo lo decide el propio formulario con casillas, no la
 * ruta: antes había tres rutas con una copia completa del formulario cada una.
 */
const ReceptionRegisterArticleForm = ({
    isEditing = false,
    initialData,
}: IRegisterArticleProps) => {
    const [category, setCategory] = useState(
        initialData?.batch?.category?.toUpperCase() ?? "COMPONENT",
    );

    return (
        <div className="space-y-5">
            {/* Al editar la categoría no puede cambiar: el artículo ya existe
                bajo un lote de esa categoría. */}
            {!isEditing && (
                <ArticleCategoryPicker value={category} onChange={setCategory} />
            )}

            {category === "COMPONENT" && (
                <PartComponentArticleForm
                    category="COMPONENT"
                    isEditing={isEditing}
                    initialData={initialData}
                />
            )}
            {category === "PART" && (
                <PartComponentArticleForm
                    category="PART"
                    isEditing={isEditing}
                    initialData={initialData}
                />
            )}
            {category === "CONSUMABLE" && (
                <ConsumableArticleForm isEditing={isEditing} initialData={initialData} />
            )}
            {category === "TOOL" && (
                <ToolArticleForm isEditing={isEditing} initialData={initialData} />
            )}
            {category === "GENERAL" && <CreateGeneralArticleForm />}
        </div>
    );
};

export default ReceptionRegisterArticleForm;
