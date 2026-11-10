import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    title?: string;
    /** Columna que encabeza la tarjeta en móvil; sin ella, la primera con `title`. */
    mobileTitle?: boolean;
    /**
     * Papel de la columna en la tarjeta móvil de compras: "wide" ocupa todo el
     * ancho (textos largos), "hidden" no se muestra, "action" es un botón con
     * texto que va a todo el ancho al pie, "preview" queda como icono arriba a la
     * derecha y "corner" es un dato breve (sin rótulo) en la esquina superior
     * derecha. Sin valor, es un campo de media tarjeta con su rótulo.
     */
    mobile?: "wide" | "hidden" | "action" | "preview" | "corner";
    /** Posición del campo en la tarjeta móvil (el título es 0); sin valor, el orden de las columnas. */
    mobileOrder?: number;
    /** Centra el campo (rótulo y valor) en la tarjeta móvil; por defecto se alinea a la izquierda. */
    mobileAlign?: "center";
    /** La cabecera ofrece filtro aunque la columna no ordene (p. ej. filtros del servidor). */
    filterable?: boolean;
    /** Ancla la columna al borde del scroll horizontal de la tabla. */
    sticky?: "right";
  }
}
