# Diseno: Reporte de Errores (SIGEAC)

Fecha: 2026-07-11

## Objetivo

Dar a los usuarios de SIGEAC una forma de reportar errores o solicitudes directamente desde el header de la aplicacion, y dar al superusuario un panel para gestionar, resolver y hacer seguimiento de esos reportes, incluyendo la importacion del historico de reportes que llegaban por WhatsApp.

El backend ya existe y esta implementado (autenticacion via Sanctum, CRUD de estatus, export, import de historico). Este spec cubre unicamente el frontend.

## Alcance

Incluido en esta version:

- Boton "!" en el header (junto a la campana de notificaciones), visible para todos los usuarios autenticados.
- Para usuarios que no son SUPERUSER: dialog de creacion de reporte (descripcion + modulo).
- Para SUPERUSER: el boton navega al panel de gestion en vez de abrir el dialog.
- Panel de gestion en `/sistema/reportes` (protegido por rol SUPERUSER): listado paginado con filtros, cambios de estatus (tomar, resolver, anular, marcar duplicado), export a Excel y a PDF.
- Creacion manual de reportes desde el panel (mismo formulario que usan los demas usuarios).
- Importacion de historico de WhatsApp: subir `chat.txt`, ver historial de importaciones con su estatus, con actualizacion automatica (polling) mientras el job este en curso.

Fuera de alcance por ahora:

- Cualquier cambio en el backend.
- Notificaciones en tiempo real (websocket) de nuevos reportes; el panel se actualiza por refetch normal de TanStack Query, no por Echo/Pusher.
- Badge de conteo en el boton del header.
- Distincion formal entre "reporte de error" y "solicitud" (se maneja como texto libre en la descripcion).
- Edicion de `module`/`severity` en un reporte ya creado por un usuario no-superuser, mas alla de lo que el endpoint `resolve` permita (ver "Preguntas abiertas").

## Ubicacion en el producto

- Boton de header: `components/layout/Navbar.tsx`, junto a `NotificationBell`.
- Panel de gestion: nueva ruta `/sistema/reportes`, agregada como item del grupo "Sistema" en `lib/menus/system.ts` (mismo patron que Modulos, Usuarios y Permisos, Autorizaciones, Empresa).
- Roles con acceso al panel: `SUPERUSER` unicamente (no `ADMIN`, a diferencia de otros items del grupo Sistema).
- El boton del header es visible para cualquier usuario autenticado, sin importar rol ni compania seleccionada (los datos viven en `SIGEAC_DB_MASTER`, compartidos entre companias, por lo que no hay prefijo `/{company}/` en ninguna llamada a la API).

## Modelo funcional

### Reporte de error

Cada reporte tiene:

- `id`
- `description`: texto libre, obligatorio.
- `module`: modulo de SIGEAC donde ocurrio el error o donde aplica la solicitud. Seleccionado desde una lista fija en el formulario (Mantenimiento, Administracion, SMS, Aerolinea, Curso, General, Otro).
- `severity`: `baja` | `media` | `alta`, o `null` si aun no ha sido clasificado. Los usuarios normales nunca envian este campo; solo lo puede fijar el superusuario (ver "Preguntas abiertas" sobre como).
- `status`: `open` | `in_progress` | `resolved` | `voided`.
- `reported_by`, `resolved_by`, `voided_by`: nombres completos, autocompletados por el backend a partir del usuario autenticado. El frontend nunca los envia.
- `resolution`: texto de solucion, presente solo cuando `status = resolved`.
- `reported_at`, `resolved_at`, `created_at`, `updated_at`.

### Boton de header y creacion de reporte

El boton "!" (`ErrorReportTrigger`) sigue el mismo patron visual que `NotificationBell` (icono + tooltip), sin panel propio ni contador. Al hacer click:

- Si `user.roles` incluye un rol con `name === "SUPERUSER"`: navega con `router.push("/sistema/reportes")`.
- En cualquier otro caso: abre `CreateErrorReportDialog`, que envuelve `CreateErrorReportForm` (React Hook Form + Zod), con dos campos: `description` (textarea, requerido) y `module` (select, requerido). Al enviar, hace `POST /error-reports` con `{ description, module }` unicamente. Sin campo de severidad ni de tipo.

El mismo dialog/formulario se reutiliza para el boton "Crear reporte manual" dentro del panel de gestion, para no duplicar el formulario.

### Panel de gestion (`/sistema/reportes`)

- Tabla paginada (TanStack Table, patron identico al de `app/sistema/usuarios_permisos/roles`: `page.tsx` + `columns.tsx` + `data-table.tsx`), columnas: fecha reportado, descripcion (truncada con tooltip del texto completo), modulo, severidad (badge, "Sin clasificar" si es null), estatus (badge), reportado por, acciones.
- Barra de filtros: `status`, `module`, `severity`, rango de fechas (`from`/`to` sobre `reported_at`), rango de fechas de resolucion (`resolved_from`/`resolved_to`). Los filtros viajan como query params a `GET /error-reports` y se reflejan en la URL para poder compartir/recargar la vista filtrada.
- Acciones por fila (dropdown menu):
  - "Tomar" -> `POST /error-reports/{id}/in-progress`, sin confirmacion, refresca la fila.
  - "Resolver" -> abre `ResolveErrorReportDialog` con textarea `resolution` (requerido) -> `POST /error-reports/{id}/resolve`.
  - "Anular" -> `AlertDialog` de confirmacion -> `POST /error-reports/{id}/void`.
  - "Marcar duplicado" -> `AlertDialog` de confirmacion -> `POST /error-reports/{id}/duplicate`.
  - Las acciones solo se ofrecen cuando son validas para el estatus actual (p. ej. no se puede "Tomar" un reporte ya `resolved` o `voided`).
- Dos botones de exportacion, "Exportar Excel" y "Exportar PDF", que golpean `GET /error-reports/export/excel` y `GET /error-reports/export/pdf` respectivamente, reenviando los filtros activos como query params, y descargan el archivo (`responseType: "blob"`, descarga via `URL.createObjectURL` + `<a download>`).
- Boton "Crear reporte manual" que abre el mismo `CreateErrorReportDialog`/`CreateErrorReportForm` descrito arriba.

### Importacion de historico de WhatsApp

Dentro del panel de gestion, una seccion/tab separada "Importar historico":

- Boton "Importar chat de WhatsApp" abre `ImportHistoryDialog`: input de archivo (`chat.txt`), campo opcional `from` (fecha), toggle opcional `dry_run`. Al enviar, hace `POST /error-reports/import-history` (multipart/form-data) y recibe `{ id, status: "queued" }`.
- Tabla `ImportHistoryTable` lista las importaciones (`GET /error-reports/import-history`), mostrando `id`, estatus, estadisticas (`stats`) cuando existan, y fecha.
- Mientras una importacion este en estatus `queued` o `running`, su fila hace polling automatico contra `GET /error-reports/import-history/{id}` (TanStack Query `refetchInterval` condicional, se detiene solo al llegar a `completed`).
- El estatus `paused_quota` se muestra como informativo (no como error): "Pausado por cuota de IA, se reintenta automaticamente cada 6h".
- Si `error` viene presente en la respuesta, se muestra en la fila con un icono de advertencia.

## Tipos (`types/index.ts`)

```ts
export type ErrorReportStatus = "open" | "in_progress" | "resolved" | "voided";
export type ErrorReportSeverity = "baja" | "media" | "alta";

export type ErrorReport = {
  id: number;
  description: string;
  module: string;
  severity: ErrorReportSeverity | null;
  status: ErrorReportStatus;
  reported_by: string;
  resolved_by: string | null;
  voided_by: string | null;
  resolution: string | null;
  reported_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ImportHistoryStatus = "queued" | "running" | "completed" | "paused_quota";

export type ErrorReportImport = {
  id: number;
  status: ImportHistoryStatus;
  stats: Record<string, number> | null;
  resume_from: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};
```

## Hooks (`hooks/sistema/reportes/`)

Todos usan la instancia compartida `axiosInstance` (el Bearer token se inyecta automaticamente), sin prefijo `/{company}/` en las rutas.

- `useGetErrorReports.ts`: `useQuery`, key `["error-reports", filters]`, `GET /error-reports` con filtros y paginacion como params, `keepPreviousData`.
- `useCreateErrorReport.ts`: `useMutation`, `POST /error-reports`, invalida `["error-reports"]`.
- `useSetErrorReportInProgress.ts`, `useResolveErrorReport.ts`, `useVoidErrorReport.ts`, `useMarkErrorReportDuplicate.ts`: un `useMutation` cada uno contra su endpoint, todos invalidan `["error-reports"]`.
- `useExportErrorReports.ts`: funcion (no `useQuery`) que descarga el blob de `/error-reports/export/excel` o `/error-reports/export/pdf` segun el formato pedido, reenviando los filtros activos.
- `useImportErrorReportHistory.ts`: `useMutation`, `POST /error-reports/import-history` (multipart), invalida `["error-report-imports"]`.
- `useGetImportHistoryList.ts`: `useQuery`, key `["error-report-imports"]`, `GET /error-reports/import-history`.
- `useGetImportHistoryStatus.ts`: `useQuery`, key `["error-report-imports", id]`, `GET /error-reports/import-history/{id}`, `refetchInterval` activo solo si el ultimo `status` es `queued` o `running`.

## Manejo de errores

- Todas las mutaciones siguen el patron existente en el proyecto: `onError` muestra `toast.error` (sonner) con mensaje generico en espanol; si el backend responde 422 con `errors` por campo, se mapean a los campos del formulario via React Hook Form.
- El estatus `paused_quota` de una importacion no se trata como error (ver seccion de importacion).
- Fallos de red al exportar (excel/pdf) muestran un toast de error indicando que no se pudo generar el archivo.

## Preguntas abiertas (a confirmar con backend antes de implementar)

- Los endpoints entregados no incluyen una forma de **actualizar** `module` o `severity` de un reporte ya creado. Esto es relevante porque los usuarios no-superuser nunca envian `severity`, y no hay endpoint para que el superusuario la clasifique despues de la creacion (el endpoint `resolve` solo acepta `resolution`). Hasta que esto se aclare, la UI muestra `severity` como "Sin clasificar" cuando es `null` y no ofrece forma de editarla. Si el backend agrega el campo `severity` al body de `resolve`, o crea un endpoint de actualizacion, este spec debe revisarse.
