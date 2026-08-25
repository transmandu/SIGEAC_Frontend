import type { Article, ArticleDimension, Batch, Convertion } from "@/types";

/**
 * Destino del artículo recién recepcionado, elegido con casillas del propio
 * formulario. Antes cada destino tenía su ruta y su copia del formulario.
 */
export interface ArticleDestination {
    /** Compras confirmará si el artículo pertenece a la empresa. */
    destination_unknown?: boolean;
    /** Salta la inspección y entra directo al inventario. */
    goes_to_inventory?: boolean;
}

/**
 * Artículo en edición.
 *
 * Unifica las dos definiciones que convivían (una por carpeta de formularios);
 * diferían en campos sueltos —`aircraft_id`, `model`, `purchase_order_*`— según
 * cuál se hubiera tocado por última vez.
 */
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
        /** Presente si el consumible se mide por dimensiones. */
        dimension?: ArticleDimension | null;
    };
    has_documentation?: boolean;
    reception_date?: string;
    purchase_order_id?: number | null;
    purchase_order_number?: string | null;
    /** Número de la requisición de origen: purchase_order -> quote_order -> requisition_order. */
    requisition_order_number?: string | null;
}

/**
 * Props que comparten los formularios de artículo por lote.
 *
 * No llevan título: el encabezado lo pone la página o el diálogo que los monta,
 * que es quien sabe en qué flujo está el usuario.
 */
export interface ArticleFormProps {
    initialData?: EditingArticle;
    isEditing?: boolean;
    /** Al editar: reemplaza la redirección post-guardado (útil dentro de diálogos). */
    onEditSuccess?: () => void;
    /** Rótulo del botón de guardado, para flujos que no son ingresar al almacén. */
    submitLabel?: string;
    /**
     * Oculta el bloque de acciones y notifica el estado del formulario. Lo usan
     * los flujos que lo embeben en un diálogo y montan el botón en el footer,
     * fuera del área desplazable, disparando el submit por `requestSubmit()`.
     */
    onStateChange?: (state: { busy: boolean; canSave: boolean }) => void;
}

/**
 * Estado con que nace el artículo, según lo que marque el usuario.
 *
 * Sin casillas sigue el camino normal: recepción y luego inspección. Las dos
 * casillas son excluyentes entre sí y desvían ese camino; indeterminado gana,
 * porque mientras no se sepa de quién es el artículo no puede almacenarse.
 *
 * Antes esto vivía repartido en ocho copias y tres lo resolvían mal: el
 * ingreso directo de parte ignoraba la casilla, la recepción de herramienta
 * mandaba a CHECKING y la de parte a INCOMING.
 */
export const statusForDestination = ({
    destination_unknown,
    goes_to_inventory,
}: ArticleDestination): string => {
    if (destination_unknown) return "TO_DETERMINATE";
    // Provisional: pasará a STORED cuando el ingreso quede validado. No es
    // WAITING_TO_LOCATE porque el formulario ya captura la ubicación.
    if (goes_to_inventory) return "CHECKING";

    return "RECEPTION";
};
