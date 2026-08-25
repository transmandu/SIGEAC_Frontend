import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    title?: string;
    /** Ancla la columna al borde del scroll horizontal de la tabla. */
    sticky?: "right";
  }
}
