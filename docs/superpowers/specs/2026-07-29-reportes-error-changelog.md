# Reportes de Error — cambios (2026-07-29)

Registro de lo implementado sobre el diseño original de
[2026-07-11-reportes-error-design.md](./2026-07-11-reportes-error-design.md).
No reemplaza ese spec; documenta los ajustes hechos después.

## 1. Filtrado del selector de módulo por acceso de la empresa

**Archivos:** [lib/errorReportModules.ts](../../../lib/errorReportModules.ts),
[components/forms/sistema/CreateErrorReportForm.tsx](../../../components/forms/sistema/CreateErrorReportForm.tsx)

El selector "Módulo" del formulario (flujo normal, sin `showAdvancedFields`) ya
no muestra los 11 módulos fijos siempre: se filtra contra los módulos que
tiene habilitados la empresa seleccionada (`useCompanyStore().selectedCompany.modules`),
la misma fuente que usa el sidebar para gatear el menú
(`lib/menus/helpers.ts` → `isModuleActive`).

- `Company.modules[].value` usa claves en inglés (`warehouse`, `maintenance`,
  `engineering`, `quality_control`, `purchases`, `administration`,
  `planification`, `sms`). Se agregó `COMPANY_MODULE_TO_ERROR_REPORT_MODULE`
  para traducirlas a las claves en español de `ERROR_REPORT_MODULES`.
- `ALWAYS_AVAILABLE_ERROR_REPORT_MODULES` define los módulos que se muestran
  siempre, sin importar los módulos de la empresa, porque no están gateados
  por ningún `moduleValue` en el sidebar (viven en grupos/():submenús sin esa
  restricción): `GENERAL`, `AJUSTES`, `PERFIL`, `SISTEMA`, `OTRO`.
- Se agregaron `AJUSTES`, `PERFIL` y `SISTEMA` como opciones reales dentro de
  `ERROR_REPORT_MODULES` (antes solo estaban en la lista de "siempre
  disponibles" pero no existían como opción, así que nunca aparecían).
- Si la empresa seleccionada no tiene módulos cargados, se devuelve la lista
  completa para no bloquear el formulario.
- El panel de gestión (`showAdvancedFields`, solo superuser) sigue mostrando
  la lista completa sin filtrar, porque necesita poder clasificar/reasignar
  cualquier reporte.

## 2. Acceso de usuario normal a `/sistema/reportes`

**Archivos:** [app/sistema/reportes/layout.tsx](../../../app/sistema/reportes/layout.tsx),
[app/sistema/reportes/page.tsx](../../../app/sistema/reportes/page.tsx),
[app/sistema/reportes/columns.tsx](../../../app/sistema/reportes/columns.tsx),
[lib/menus/types.ts](../../../lib/menus/types.ts)

La ruta ya no está restringida a `SUPERUSER` a nivel de layout
(`ProtectedRoute` sin `roles`). La página ahora bifurca según el rol:

- **Usuario normal:** vista mínima — título, botón "Crear reporte" y la
  tabla de reportes (`DataTable`), sin KPIs, sin filtros, sin botones de
  exportar, sin tab de importaciones, sin click en fila. La columna
  "acciones" (Ver diagnóstico + tomar/resolver/eliminar/marcar duplicado)
  no se agrega a `getColumns` cuando `isSuperUser` es `false`, porque esas
  son mutaciones de administración. El diálogo de creación se abre sin
  `showAdvancedFields`, así que usa el mismo formulario simple y el módulo
  filtrado del punto 1.
- **Superuser:** vista completa sin cambios (tabs, KPIs, filtros, export,
  importaciones, diagnóstico, acciones).

De paso, `Menu.roles` en `lib/menus/types.ts` pasó de requerido a opcional
(`roles?: string[]`), igual que `Submenu.roles`, porque `filterMenuGroups` en
`lib/menus/helpers.ts` ya trataba la ausencia de `roles` como "visible para
todos" pero el tipo no lo permitía.

## 3. Feature flag para ocultar el acceso a usuario normal (temporal)

**Archivo:** [lib/errorReportModules.ts](../../../lib/errorReportModules.ts)

A pesar de que el punto 2 ya deja la página lista para usuarios normales, se
pidió ocultar por ahora los dos puntos de entrada sin borrar el trabajo:

```ts
export const ERROR_REPORT_VISIBLE_TO_NORMAL_USERS = false;
```

- [components/misc/ErrorReportTrigger.tsx](../../../components/misc/ErrorReportTrigger.tsx):
  el botón del navbar (`Navbar.tsx`) retorna `null` para no-superuser mientras
  la bandera esté en `false`.
- [lib/menus/system.ts](../../../lib/menus/system.ts): el ítem "Reportes" del
  grupo Sistema vuelve a restringirse a `roles: ["SUPERUSER"]` mientras la
  bandera esté en `false`; con la bandera en `true` queda sin `roles`
  (visible para todos).

**Para reactivarlo a futuro:** cambiar esa única constante a `true`. No hace
falta revertir ningún otro cambio — la página, el formulario y el filtrado de
módulos ya están listos para usuarios normales.

## 4. Ícono del botón "Reportar un problema"

**Archivos:** [components/misc/ErrorReportTrigger.tsx](../../../components/misc/ErrorReportTrigger.tsx),
[lib/menus/system.ts](../../../lib/menus/system.ts)

Se cambió el ícono de `TriangleAlert` a `HeartHandshake` (lucide-react) en el
botón del navbar y en el ítem "Reportes" del menú Sistema.
