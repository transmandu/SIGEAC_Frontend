import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  type Cell,
  type Column,
  type FilterFn,
  type ColumnDef,
  type ReactTable,
  type Row,
  type RowData,
  type SortFn,
} from "@tanstack/react-table";

/**
 * Features de TanStack Table v9 para todas las tablas de la aplicación.
 *
 * En v8 venían todas incluidas; v9 exige declarar las que se usan. Estas son
 * las nueve que el código realmente ejercita: no hay agrupación, ni reordenado
 * de columnas, ni pinning, ni resize interactivo, así que no se registran (es la
 * diferencia con `stockFeatures`, que la documentación marca como ayuda
 * temporal).
 *
 * Los registros completos `filterFns` y `sortFns` sí van enteros: las columnas
 * que no declaran función usan la que la tabla deduce del tipo de dato, y esa
 * deducción elige entre los built-in.
 *
 * Se define una sola vez, fuera de todo render, como pide la librería.
 */
export const appTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnVisibilityFeature,
  columnFacetingFeature,
  columnSizingFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowExpandingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filterFns,
  sortFns,
});

export type AppTableFeatures = typeof appTableFeatures;

/**
 * Alias de los tipos públicos con el juego de features ya aplicado. v9 agregó
 * `TFeatures` como primer genérico de todos ellos; con estos alias las
 * definiciones de columnas y los componentes compartidos se siguen escribiendo
 * igual que antes.
 */
export type AppColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<
  AppTableFeatures,
  TData,
  TValue
>;
// El tipo del adaptador de React, no el del core: es el que expone `state`,
// `Subscribe` y `FlexRender`, y todas las tablas de la app salen de useTable.
export type AppTable<TData extends RowData> = ReactTable<AppTableFeatures, TData>;
export type AppRow<TData extends RowData> = Row<AppTableFeatures, TData>;
export type AppColumn<TData extends RowData, TValue = unknown> = Column<
  AppTableFeatures,
  TData,
  TValue
>;
export type AppCell<TData extends RowData, TValue = unknown> = Cell<
  AppTableFeatures,
  TData,
  TValue
>;
export type AppSortFn<TData extends RowData> = SortFn<AppTableFeatures, TData>;
export type AppFilterFn<TData extends RowData> = FilterFn<AppTableFeatures, TData>;
