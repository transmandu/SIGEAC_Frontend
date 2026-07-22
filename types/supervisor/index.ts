import type { GeneralArticle, GeneralArticleCostHistoryEntry, Unit } from "@/types";

/**
 * Tipos del módulo SUPERVISOR (exclusivo de SUPERUSER).
 *
 * Respaldan el saneamiento de artículos generales duplicados por el flujo de
 * compras. Backend: GeneralArticleSupervisorController.
 */

/**
 * Artículo general con los conteos de filas dependientes, para que la tabla
 * muestre qué arrastra consigo cada artículo antes de fusionarlo.
 */
export type SupervisorGeneralArticle = GeneralArticle & {
    primary_unit_id: number;
    warehouse_id: number;
    intakes_count: number;
    cost_changes_count: number;
    conversions_count: number;
    dispatches_count: number;
    conversions?: SupervisorConversion[];
};

export type SupervisorConversion = {
    id: number;
    primary_unit: number;
    secondary_unit: number;
    equivalence: number;
    general_primary_unit?: Unit;
    general_secondary_unit?: Unit;
};

/**
 * Motivo por el que el detector agrupó estos artículos:
 * - BRAND_MODEL: misma marca escrita distinto ("3M" vs "3-M").
 * - UNIT: mismo artículo registrado en unidades distintas.
 */
export type DuplicateReason = "BRAND_MODEL" | "UNIT";

export type DuplicateCandidateGroup = {
    reason: DuplicateReason;
    label: string;
    articles: SupervisorGeneralArticle[];
};

/** Cómo se llegó a la cantidad final de cada artículo de la fusión. */
export type MergeQuantityBreakdown = {
    article_id: number;
    is_survivor: boolean;
    description: string;
    brand_model: string | null;
    original_quantity: number;
    original_unit_id: number;
    converted_quantity: number;
    conversion_id: number | null;
    equivalence: number | null;
};

/** Unidad sin Conversion disponible hacia la unidad final: bloquea la fusión. */
export type MissingConversion = {
    article_id: number;
    from_unit_id: number;
    from_unit: string | null;
    to_unit_id: number;
};

/** Valores finales que tendrá el artículo superviviente tras la fusión. */
export type MergeFinalValues = {
    description: string;
    brand_model: string | null;
    variant_type: string | null;
    minimum_quantity: number | null;
    primary_unit_id: number;
    quantity: number;
};

/**
 * Registro del historial de costo tal como lo expone el supervisor.
 *
 * entry_id identifica su fila de origen con prefijo de tabla ("intake:12",
 * "change:12", "new:0" para los aún no persistidos), porque intakes y
 * cost_changes tienen secuencias de id independientes que se solapan.
 *
 * editable es false para los registros que provienen de una compra: son el
 * rastro de un intake atado a una orden pagada y no se tocan desde el
 * supervisor. Solo los MANUAL/SEED admiten edición.
 */
export type SupervisorCostHistoryEntry = GeneralArticleCostHistoryEntry & {
    entry_id: string;
    editable: boolean;
    general_article_id: number | null;
};

/**
 * Ediciones del historial pendientes de aplicar. Viajan en cada merge-preview
 * (para calcular el resultado) y en el merge final (para persistirlas en la
 * misma transacción). Solo pueden referirse a registros editables.
 */
export type CostChangeEdits = {
    // unit_id ancla en qué unidad está expresado el costo. Si difiere de la
    // unidad base final de la fusión, el backend reexpresa el precio con la
    // conversión (ej: un $9 capturado en CAJA se vuelve $0.09 en UNIDADES).
    created?: { cost: number; unit_id?: number | null; changed_at?: string }[];
    updated?: { id: number; cost: number; unit_id?: number | null; changed_at?: string }[];
    deleted?: number[];
};

/**
 * Costo vigente del superviviente hoy vs. el que tendrá tras la fusión. Puede
 * cambiar sin que el supervisor lo pida: el costo se deriva del registro más
 * reciente del historial combinado, así que un absorbido con una compra
 * posterior pasa a mandar.
 */
export type MergeCostSummary = {
    current: number;
    resulting: number;
    resulting_from_article_id: number | null;
};

/**
 * Resultado calculado de una fusión, sin escribir nada. can_merge es false
 * mientras missing_conversions tenga elementos.
 */
export type MergePreview = {
    survivor: SupervisorGeneralArticle;
    absorbed: SupervisorGeneralArticle[];
    final: MergeFinalValues;
    quantity_breakdown: MergeQuantityBreakdown[];
    missing_conversions: MissingConversion[];
    /** Ya incluye las ediciones pendientes enviadas en la petición. */
    cost_history: SupervisorCostHistoryEntry[];
    cost_summary: MergeCostSummary;
    child_rows: Record<string, number>;
    can_merge: boolean;
};

/** Payload compartido por merge-preview y merge. */
export type MergeRequest = {
    survivor_id: number;
    absorbed_ids: number[];
    final?: Partial<{
        description: string;
        brand_model: string;
        variant_type: string;
        minimum_quantity: number;
        primary_unit_id: number;
    }>;
    /**
     * Equivalencias declaradas al vuelo para unidades sin Conversion
     * registrada: { [unit_id]: equivalencia hacia la unidad final }.
     */
    conversions?: Record<number, number>;
    /** Ediciones del historial de costo a aplicar junto con la fusión. */
    cost_changes?: CostChangeEdits;
};

// ── Edición ──────────────────────────────────────────────────────────────────

/** Campos de texto que la herramienta de buscar/reemplazar puede rellenar. */
export type BulkTextField = "description" | "brand_model" | "variant_type";

/**
 * Valores finales de un artículo en la tabla de edición masiva.
 *
 * quantity y primary_unit_id solo se envían si el supervisor desbloqueó la
 * columna de existencia: omitirlos y enviarlos como null no significan lo
 * mismo para el backend.
 */
export type BulkEditRow = {
    id: number;
    description: string;
    brand_model?: string | null;
    variant_type?: string | null;
    minimum_quantity?: number | null;
    quantity?: number;
    primary_unit_id?: number;
};

export type BulkEditRequest = {
    articles: BulkEditRow[];
};

// ── Detalle editable de un artículo ──────────────────────────────────────────

/**
 * Conversión asociada a un artículo. shared_with cuenta cuántos OTROS
 * artículos usan la misma fila: si es > 0, editar la equivalencia crea una
 * copia exclusiva en vez de alterar la de los demás.
 */
export type ArticleConversion = {
    id: number;
    primary_unit: number;
    secondary_unit: number;
    equivalence: number;
    primary_unit_label: string | null;
    secondary_unit_label: string | null;
    shared_with: number;
};

/** Todo lo editable de un artículo, en una sola respuesta. */
export type ArticleDetail = {
    article: SupervisorGeneralArticle;
    conversions: ArticleConversion[];
    cost_history: SupervisorCostHistoryEntry[];
    current_cost: number;
};


/** Campos del artículo que pueden viajar en el diff de una edición. */
export type ArticleFieldEdits = Partial<{
    description: string;
    brand_model: string | null;
    variant_type: string | null;
    minimum_quantity: number | null;
    quantity: number;
    primary_unit_id: number;
}>;

/** Altas, cambios de equivalencia y desvinculaciones pendientes. */
export type ConversionEdits = {
    created?: { primary_unit: number; secondary_unit: number; equivalence: number }[];
    updated?: { id: number; equivalence: number }[];
    deleted?: number[];
};

/**
 * Payload de la edición individual. Las tres áreas viajan juntas y se
 * persisten en una sola transacción: nada se guarda hasta confirmar, y solo se
 * envía lo que realmente cambió.
 */
export type UpdateArticleRequest = {
    article?: ArticleFieldEdits;
    conversions?: ConversionEdits;
    cost_changes?: CostChangeEdits;
};

// ── Recorrido del artículo ───────────────────────────────────────────────────

/** Fuente de cada evento del timeline. */
export type TimelineEventType = "AUDIT" | "INTAKE" | "COST" | "DISPATCH" | "MERGE";

export type TimelineEvent = {
    type: TimelineEventType;
    /** Subtipo según la fuente: UPDATED/MERGED, CONFIRMED, MANUAL, SURVIVOR… */
    event: string;
    date: string | null;
    by: string | null;
    context: string | null;
    detail: Record<string, unknown> | null;
};

export type ArticleTimeline = {
    article: SupervisorGeneralArticle;
    events: TimelineEvent[];
};

/** Registro auditado de una fusión ejecutada; permite deshacerla. */
export type GeneralArticleMerge = {
    id: number;
    survivor_id: number;
    absorbed_ids: number[];
    resolution: {
        final: MergeFinalValues;
        breakdown: MergeQuantityBreakdown[];
    };
    merged_by: string;
    merged_at: string;
    undone_by: string | null;
    undone_at: string | null;
    survivor?: SupervisorGeneralArticle;
};
