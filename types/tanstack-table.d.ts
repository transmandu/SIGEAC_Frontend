import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    title?: string;
    /** Columna que encabeza la tarjeta en móvil; sin ella, la primera con `title`. */
    mobileTitle?: boolean;
    /** La cabecera ofrece filtro aunque la columna no ordene (p. ej. filtros del servidor). */
    filterable?: boolean;
    /** Ancla la columna al borde del scroll horizontal de la tabla. */
    sticky?: "right";
  }
}
