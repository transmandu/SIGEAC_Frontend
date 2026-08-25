"use client";

import PartComponentArticleForm from "./articulos/PartComponentArticleForm";
import ConsumableArticleForm from "./articulos/ConsumableArticleForm";
import ToolArticleForm from "./articulos/ToolArticleForm";

// El tipo vive con los formularios que lo consumen; aquí solo se
// reexporta para no romper a quien lo importaba desde este módulo.
import type { EditingArticle } from "./articulos/types";
export type { EditingArticle };

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
    /**
     * Oculta el bloque de acciones del formulario y notifica su estado. Lo usan
     * los flujos que lo embeben en un diálogo y montan el botón en el footer,
     * fuera del área que se desplaza; el submit se dispara por `requestSubmit()`.
     */
    onStateChange?: (state: { busy: boolean; canSave: boolean }) => void;
}

/**
 * Elige el formulario según la categoría del artículo que se edita.
 *
 * Solo sirve a la edición: la creación entra por recepción administrativa. El
 * título lo pone el contexto que lo monta —página o diálogo—, que es quien sabe
 * si el usuario está corrigiendo una cuarentena o un artículo en tránsito.
 */
const RegisterArticleForm = ({
    isEditing = false,
    initialData,
    onEditSuccess,
    submitLabel,
    onStateChange,
}: IRegisterArticleProps) => {
    const category = initialData?.batch?.category?.toUpperCase() ?? "COMPONENT";

    const shared = {
        isEditing,
        initialData,
        onEditSuccess,
        submitLabel,
        onStateChange,
    };

    if (category === "CONSUMABLE") return <ConsumableArticleForm {...shared} />;
    if (category === "TOOL") return <ToolArticleForm {...shared} />;

    return (
        <PartComponentArticleForm
            category={category === "PART" ? "PART" : "COMPONENT"}
            {...shared}
        />
    );
};

export default RegisterArticleForm;
