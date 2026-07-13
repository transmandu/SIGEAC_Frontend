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
- `reported_by`, `resolved_by`: nombres completos, autocompletados por el backend a partir del usuario autenticado. El frontend nunca los envia.
- `phone`: telefono del reportante, puede ser `null` (reportes creados desde la web en vez de importados de WhatsApp).
- `source`: origen del reporte (p. ej. `sigeac` para los creados desde la web, o el origen de la importacion de WhatsApp).
- `description`: texto libre, obligatorio.
- `module`: modulo de SIGEAC donde ocurrio el error o donde aplica la solicitud, puede ser `null` (p. ej. reportes importados de WhatsApp sin clasificar). Seleccionado desde una lista fija en el formulario (Mantenimiento, Administracion, SMS, Aerolinea, Curso, General, Otro). Opcional a nivel de API, pero la UI lo pide siempre al crear para mantener la calidad del dato.
- `severity`: `LOW` | `MEDIUM` | `HIGH` | `CRITICAL` (codigo en ingles, es el unico campo que devuelve el backend — no existe `severity_label`), o `null` si aun no ha sido clasificado. La UI traduce el codigo a espanol (Baja/Media/Alta/Critica) con un mapeo local (`lib/errorReportSeverity.ts`, `getErrorReportSeverityLabel`), tanto para mostrarlo en la tabla como para las opciones del select al crear/filtrar. Los usuarios normales nunca envian este campo. El superusuario puede fijarlo unicamente al crear un reporte manual (`POST /error-reports` acepta `severity` opcional); no existe endpoint para clasificar la severidad de un reporte ya creado por otro usuario.
- `http_status`: codigo HTTP asociado al error (numero, opcional), y `http_status_label`: descripcion legible ya calculada por el backend (`null` si `http_status` es `null`). El frontend nunca traduce el codigo.
- `technical_cause`: causa tecnica identificada durante el diagnostico (texto libre, opcional, se sobrescribe en cada actualizacion).
- `images`: lista de `{ id, image_url }`, siempre incluida en `GET /error-reports` (no requiere pedirse aparte). `image_url` ya viene resuelto como URL publica absoluta, se usa directo en un `<img src>`.
- `diagnostic_steps`: lista de pasos de diagnostico registrados; se acumula en el backend (cada llamada a `PATCH /diagnosis` agrega, no reemplaza).
- `duplicate_count`: cantidad de reportes duplicados asociados a este.
- `status`: `OPEN` | `IN_PROGRESS` | `RESOLVED` (codigo en mayusculas, tal cual lo devuelve el backend — no hay un campo `status_label` separado, por lo que la UI traduce el codigo a mano via `STATUS_LABEL` en `columns.tsx`). El estatus `VOIDED` ya no se usa (la accion de anular fue reemplazada por "Eliminar" via `DELETE`).
- `resolution`: texto de solucion, presente solo cuando `status = RESOLVED`.
- `resolution_minutes`: minutos transcurridos entre `reported_at` y `resolved_at`, calculado por el backend (puede venir como numero o como string numerico segun el reporte), `null` mientras no este resuelto.
- `reported_at`, `resolved_at`.

### Boton de header y creacion de reporte

El boton "!" (`ErrorReportTrigger`) sigue el mismo patron visual que `NotificationBell` (icono + tooltip), sin panel propio ni contador. Al hacer click:

- Si `user.roles` incluye un rol con `name === "SUPERUSER"`: navega con `router.push("/sistema/reportes")`.
- En cualquier otro caso: abre `CreateErrorReportDialog`, que envuelve `CreateErrorReportForm` (React Hook Form + Zod), con dos campos: `description` (textarea, requerido) y `module` (select, requerido), mas un selector de imagenes opcional (multiples, con previsualizacion y opcion de quitar antes de enviar). Al enviar: si no hay imagenes, `POST /error-reports` con JSON `{ description, module }`; si hay imagenes, se arma un `FormData` con esos mismos campos mas `images[]` (uno por archivo) y se envia con header `multipart/form-data`. Sin campo de severidad ni de tipo para usuarios normales.

El mismo dialog/formulario se reutiliza para el boton "Crear reporte manual" dentro del panel de gestion, para no duplicar el formulario.

### Panel de gestion (`/sistema/reportes`)

- Tabla paginada (TanStack Table, patron identico al de `app/sistema/usuarios_permisos/roles`: `page.tsx` + `columns.tsx` + `data-table.tsx`), columnas: fecha reportado, descripcion (truncada con tooltip del texto completo), modulo, severidad (badge con la etiqueta traducida via `getErrorReportSeverityLabel(severity)`, "Sin clasificar" si es null), estatus (badge, con contador `x{duplicate_count+1}` si tiene duplicados), codigo HTTP (badge con `http_status`, tooltip con `http_status_label`), reportado por, acciones.
- Barra de filtros: `status`, `module`, `severity`, rango de fechas (`from`/`to` sobre `reported_at`), rango de fechas de resolucion (`resolved_from`/`resolved_to`). Los filtros viajan como query params a `GET /error-reports` y se reflejan en la URL para poder compartir/recargar la vista filtrada.
- Acciones por fila (dropdown menu):
  - "Diagnostico" -> abre `ErrorReportDiagnosisDialog` (ver seccion propia abajo). Disponible siempre, pero solo editable mientras el reporte no este `RESOLVED`.
  - "Tomar" -> `POST /error-reports/{id}/in-progress`, sin confirmacion, refresca la fila. Solo visible si `status = OPEN`.
  - "Resolver" -> abre `ResolveErrorReportDialog` con textarea `resolution` (requerido) -> `POST /error-reports/{id}/resolve`. No visible si ya esta `RESOLVED`.
  - "Marcar duplicado" -> `AlertDialog` de confirmacion -> `POST /error-reports/{id}/duplicate`. No visible si ya esta `RESOLVED`.
  - "Eliminar" -> `AlertDialog` de confirmacion -> `DELETE /error-reports/{id}`. Solo visible si `status = OPEN` (la API rechaza el borrado en cualquier otro estatus).
- Dos botones de exportacion, "Exportar Excel" y "Exportar PDF", que golpean `GET /error-reports/export/excel` y `GET /error-reports/export/pdf` respectivamente, reenviando los filtros activos como query params, y descargan el archivo (`responseType: "blob"`, descarga via `URL.createObjectURL` + `<a download>`).
- Boton "Crear reporte manual" que abre `CreateErrorReportDialog`/`CreateErrorReportForm` con `showAdvancedFields`, mostrando ademas los campos opcionales `severity` y `http_status` (unicamente disponibles en este flujo, no en el dialog del header).

### Diagnostico tecnico (`ErrorReportDiagnosisDialog`)

Pensado como un paso de investigacion separado de "Resolver". Disponible mientras `status` sea `OPEN` o `IN_PROGRESS` (el backend responde 409 si el reporte ya esta `RESOLVED`; en ese caso el dialog se muestra en modo solo lectura).

- Muestra datos de contexto: `reported_by`, `phone`, `source`, `module`, `description`, `duplicate_count`.
- Campo `http_status` (numero) y `technical_cause` (textarea): ambos se envian juntos en un boton "Guardar diagnostico" -> `PATCH /error-reports/{id}/diagnosis` con `{ http_status?, technical_cause? }`. Estos dos campos **sobrescriben** el valor anterior.
- Seccion de `diagnostic_steps`: lista de pasos ya guardados (solo lectura) mas un input para agregar un paso nuevo. Al confirmar, se envia `PATCH /diagnosis` con `{ diagnostic_steps: [nuevoPaso] }` (un solo elemento) porque el backend **acumula** la lista en vez de reemplazarla; nunca se reenvia la lista completa.
- El body de `PATCH /diagnosis` nunca se envia vacio (los tres campos son opcionales, pero se valida en el frontend que al menos uno tenga contenido antes de habilitar cada boton de guardado).
- En modo solo lectura (reporte `RESOLVED`) se muestra ademas `resolution`, `resolved_by`, `resolved_at` y `resolution_minutes`.
- Galeria de `images`: miniaturas (clic abre la imagen original en una pestaña nueva). Mientras el reporte no este `RESOLVED`, cada imagen tiene un boton para eliminarla (`DELETE /error-reports/{id}/images/{imageId}`) y hay un control para agregar nuevas (`POST /error-reports/{id}/images`, multipart con `images[]`, subida inmediata al seleccionar el archivo). En modo solo lectura la galeria se muestra sin esos controles.

### Importacion de historico de WhatsApp

Dentro del panel de gestion, una seccion/tab separada "Importar historico":

- Boton "Importar chat de WhatsApp" abre `ImportHistoryDialog`: input de archivo (`chat.txt`), campo opcional `from` (fecha), toggle opcional `dry_run`. Al enviar, hace `POST /error-reports/import-history` (multipart/form-data) y recibe `{ id, status: "queued" }`.
- Tabla `ImportHistoryTable` lista las importaciones (`GET /error-reports/import-history`), mostrando `id`, estatus, estadisticas (`stats`) cuando existan, y fecha.
- Mientras una importacion este en estatus `queued` o `running`, su fila hace polling automatico contra `GET /error-reports/import-history/{id}` (TanStack Query `refetchInterval` condicional, se detiene solo al llegar a `completed`).
- El estatus `paused_quota` se muestra como informativo (no como error): "Pausado por cuota de IA, se reintenta automaticamente cada 6h".
- Si `error` viene presente en la respuesta, se muestra en la fila con un icono de advertencia.

## Tipos (`types/index.ts`)

```ts
export type ErrorReportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type ErrorReportSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ErrorReportImage = {
  id: number;
  image_url: string;
};

export type ErrorReport = {
  id: number;
  reported_by: string;
  phone: string | null;
  source: string;
  module: string | null;
  description: string;
  severity: ErrorReportSeverity | null;
  http_status: number | null;
  http_status_label: string | null;
  technical_cause: string | null;
  diagnostic_steps: string[] | null;
  duplicate_count: number;
  images: ErrorReportImage[];
  reported_at: string;
  status: ErrorReportStatus;
  resolved_by: string | null;
  resolution: string | null;
  resolved_at: string | null;
  resolution_minutes: number | string | null;
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
- `useCreateErrorReport.ts`: `useMutation`, `POST /error-reports` con `{ description, module?, severity?, http_status?, images? }`. Si `images` tiene archivos, arma un `FormData` (`images[]` uno por archivo) y envia con `multipart/form-data`; si no, envia JSON plano. Invalida `["error-reports"]`.
- `useSetErrorReportInProgress.ts`, `useResolveErrorReport.ts`, `useDeleteErrorReport.ts`, `useMarkErrorReportDuplicate.ts`: un `useMutation` cada uno contra su endpoint, todos invalidan `["error-reports"]`. `useDeleteErrorReport.ts` usa `DELETE /error-reports/{id}`.
- `useUpdateErrorReportDiagnosis.ts`: `useMutation`, `PATCH /error-reports/{id}/diagnosis` con `{ http_status?, technical_cause?, diagnostic_steps? }`, invalida `["error-reports"]`.
- `useAddErrorReportImages.ts`: `useMutation`, `POST /error-reports/{id}/images` (multipart, `images[]`), invalida `["error-reports"]`.
- `useDeleteErrorReportImage.ts`: `useMutation`, `DELETE /error-reports/{id}/images/{imageId}`, invalida `["error-reports"]`.
- `useExportErrorReports.ts`: funcion (no `useQuery`) que descarga el blob de `/error-reports/export/excel` o `/error-reports/export/pdf` segun el formato pedido, reenviando los filtros activos.
- `useImportErrorReportHistory.ts`: `useMutation`, `POST /error-reports/import-history` (multipart), invalida `["error-report-imports"]`.
- `useGetImportHistoryList.ts`: `useQuery`, key `["error-report-imports"]`, `GET /error-reports/import-history`.
- `useGetImportHistoryStatus.ts`: `useQuery`, key `["error-report-imports", id]`, `GET /error-reports/import-history/{id}`, `refetchInterval` activo solo si el ultimo `status` es `queued` o `running`.

## Manejo de errores

- Todas las mutaciones siguen el patron existente en el proyecto: `onError` muestra `toast.error` (sonner) con mensaje generico en espanol; si el backend responde 422 con `errors` por campo, se mapean a los campos del formulario via React Hook Form.
- El estatus `paused_quota` de una importacion no se trata como error (ver seccion de importacion).
- Fallos de red al exportar (excel/pdf) muestran un toast de error indicando que no se pudo generar el archivo.
- Un 409 al guardar diagnostico (reporte ya `resolved`) o al eliminar (reporte no `open`) se maneja con el mismo `toast.error` generico; la UI ya evita mostrar esas acciones cuando no aplican, por lo que este caso solo ocurriria por una condicion de carrera (otro usuario cambio el estatus mientras el dialog estaba abierto).

## Preguntas abiertas

Ninguna pendiente: el backend confirmo la forma completa del objeto `ErrorReport`, el endpoint de diagnostico y la restriccion de borrado solo para reportes `open`.
