# Catálogo de `actions/` — Referencia completa

> Inventario de las **escrituras** del frontend. Si vas a crear, editar, borrar o
> cambiar el estado de algo, el hook vive aquí (o debería).
>
> Cifras al momento de escribir: **94 archivos, 339 hooks exportados**
> (332 mutaciones, 7 queries que son excepciones documentadas más abajo).

---

## Índice

1. [La regla: actions escribe, hooks lee](#1-la-regla-actions-escribe-hooks-lee)
2. [Anatomía de un action](#2-anatomía-de-un-action)
3. [Convenciones que debes seguir](#3-convenciones-que-debes-seguir)
4. [Invalidación de caché: el error más común](#4-invalidación-de-caché-el-error-más-común)
5. [Casos especiales del backend](#5-casos-especiales-del-backend)
6. [Antes de crear un action nuevo](#6-antes-de-crear-un-action-nuevo)
7. [Deuda técnica conocida](#7-deuda-técnica-conocida)
8. [Referencia completa por módulo](#8-referencia-completa-por-módulo)

---

## 1. La regla: actions escribe, hooks lee

La separación es simple y el proyecto la respeta casi al 100%:

| Carpeta | Contiene | React Query |
|---|---|---|
| `actions/` | Escrituras: POST, PUT, PATCH, DELETE | `useMutation` |
| `hooks/` | Lecturas: GET | `useQuery` |

**Por qué importa:** cuando buscas "dónde se guarda una requisición" sabes que está
en `actions/`. Cuando buscas "de dónde sale la lista" sabes que está en `hooks/`.
Sin la regla, hay que abrir los dos.

### Las 7 excepciones reales

Son queries que viven en `actions/` porque acompañan a la mutación que las usa:

| Archivo | Hook | Por qué |
|---|---|---|
| `actions/aerolinea/cuentas/actions.ts` | `useGetAccount` | Lee la cuenta para precargar el form de edición |
| `actions/aerolinea/rutas/actions.ts` | `useGetRoute` | Ídem, ruta a editar |
| `actions/sms/reporte_obligatorio/actions.ts` | `useGetNextReportNumber` | Correlativo que el form muestra antes de guardar |
| `actions/sms/reporte_voluntario/actions.ts` | `useGetNextReportNumber` | Ídem |
| `actions/sms/sms_actividades/actions.ts` | `useGetNextActivityNumber` | Ídem |
| `actions/mantenimiento/sms/reporte_obligatorio/actions.ts` | `useGetNextReportNumber` | **Duplicado** — ver deuda técnica |
| `actions/mantenimiento/sms/reporte_voluntario/actions.ts` | `useGetNextReportNumber` | **Duplicado** — ver deuda técnica |

No añadas más. Si necesitas leer, va en `hooks/`.

---

## 2. Anatomía de un action

El patrón que se repite en los 94 archivos:

```ts
export const useCreateAircraft = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ data, company }) => {
      await axiosInstance.post(`/${company}/aircrafts`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aircrafts'] });
      toast.success("¡Creado!", { description: "..." });
    },
    onError: (error) => {
      toast.error("Oops!", { description: "..." });
    },
  });

  return { createAircraft: createMutation };
};
```

Verás el cliente de React Query nombrado de formas distintas según el archivo
(`queryClient`, `queryAircraft`, …). Es inconsistencia heredada, no significados
distintos: en código nuevo usa `queryClient`.

Cuatro cosas son constantes:

1. **Se devuelve un objeto con nombre**, no la mutación pelada: `{ createAircraft: createMutation }`.
   Así el consumidor escribe `const { createAircraft } = useCreateAircraft()` y en el
   JSX se lee qué hace.
2. **`company` viaja como parámetro**, no se lee del store dentro del action. El
   consumidor lo saca de `useCompanyStore()` y lo pasa.
3. **`onSuccess` invalida y notifica.** Sin invalidación la tabla no refresca.
4. **`onError` avisa al usuario.** Un `console.log` solo no sirve: el usuario cree que guardó.

---

## 3. Convenciones que debes seguir

### Nombres

| Prefijo | Uso |
|---|---|
| `useCreateX` | POST que crea |
| `useUpdateX` | PUT/PATCH que edita |
| `useDeleteX` | DELETE |
| `useUpdateXStatus` | Cambio de estado (aprobar, rechazar, cerrar) |

La clave devuelta va sin el `use`: `useCreateAircraft` → `{ createAircraft }`.

### Ubicación

`actions/<área>/<recurso>/actions.ts`. **La carpeta identifica el recurso, no el
nombre del archivo** — por eso hay 60+ archivos llamados `actions.ts` y no colisionan.

Cuando un recurso tiene varias familias de escritura, se parte por archivo con
nombre propio: `actions/cargo/manifestActions.ts`, `carrierActions.ts`.

### Multi-tenant

La URL **siempre** lleva el slug de la empresa:

```ts
await axiosInstance.post(`/${company}/aircrafts`, data);
```

Nunca hardcodees el tenant. Hay 34 casos heredados que lo hacen mal (ver
[deuda técnica](#7-deuda-técnica-conocida)); no los tomes de ejemplo.

---

## 4. Invalidación de caché: el error más común

Un action que escribe bien pero invalida mal **parece funcionar**: el backend
guarda, el toast dice "¡Actualizado!", y la tabla sigue mostrando lo viejo. El
usuario reporta "no se guardó" cuando sí se guardó.

**La clave que invalidas debe coincidir exactamente con la que usa el hook de lectura.**

```ts
// hooks/ajustes/cargo/useGetJobTitles.ts
queryKey: ["job_titles", company]

// actions/general/cargo/actions.ts  →  DEBE invalidar lo mismo
queryClient.invalidateQueries({ queryKey: ["job_titles", company] });
```

Este bug exacto existió en `cargo` (invalidaba `["job-titles"]`, con guion) y en
`sistema/modulos` (invalidaba `['category']` porque el archivo se copió del de
categorías). Ambos corregidos.

**Cómo verificarlo:** busca el `useGet*` del recurso, copia su `queryKey` literal,
pégalo en tu `invalidateQueries`. Si la clave lleva `company`, pásalo también —
si no, invalidas la caché de otra empresa y no la tuya.

---

## 5. Casos especiales del backend

### `_method` spoofing

Laravel no parsea `multipart/form-data` en PUT/PATCH reales. Cuando subes archivos
y además editas, se manda **POST** con un campo `_method`:

```ts
formData.append("_method", "PUT");
await axiosInstance.post(`/${company}/recurso/${id}`, formData);
```

Si ves un POST hacia una URL con `/${id}`, casi siempre es esto.

### Rutas sin prefijo de empresa

Algunos endpoints heredados no llevan `/${company}/`. No es un error tuyo: el
backend los expone así. Están marcados en las tablas — verifica contra
`routes/api/**` del backend antes de "corregirlos".

### Endpoints que devuelven blob

Los que generan PDF/Excel usan `responseType: "blob"` y disparan la descarga en el
navegador. Viven en `actions/` solo si además **cambian estado** en el backend
(ej. `useGenerateIncomingFormat`, donde `download: false` mueve los artículos a
`WAITING_TO_LOCATE`). Si solo descargan, van en `hooks/`.

---

## 6. Antes de crear un action nuevo

Cuatro comprobaciones que evitan duplicar:

1. **Busca el recurso, no el verbo.** `grep -rn "nombre-del-endpoint" actions/`.
   Puede que el action ya exista con otro nombre.
2. **Mira la carpeta del recurso.** Si `actions/ajustes/clientes/actions.ts` existe,
   tu nueva escritura de clientes va **ahí dentro**, no en un archivo nuevo.
3. **Confirma que es escritura.** Si es un GET, va en `hooks/`.
4. **Localiza el hook de lectura** para copiar su `queryKey` exacta.

---

## 7. Deuda técnica conocida

Cosas que están mal en el código actual. **No las repliques**; si tocas uno de estos
archivos, aprovecha y arregla.

### Tenant hardcodeado (34 endpoints en 15 archivos)

```ts
await axiosInstance.delete(`/transmandu/accountants/${id}`);   // ❌
await axiosInstance.post(`/hangar74/condition-article`, data); // ❌
await axiosInstance.delete(`/${company}/accountants/${id}`);   // ✅
```

Rompe para cualquier empresa que no sea esa. Aparece mezclado con el patrón
correcto **dentro del mismo archivo**, así que no asumas que un archivo está bien
porque su primer hook lo está.

Detectarlos: `grep -rn '/transmandu/\|/hangar74/' actions/ hooks/`

### `useGetNextReportNumber` duplicado

Existe cuatro veces: en `actions/sms/**` y en `actions/mantenimiento/sms/**`. La
rama `mantenimiento/sms/` es la copia vieja. **SMS está en construcción por otro
desarrollador** — no fusiones ni borres ahí; solo evita agregar más copias.

### Invalidaciones sin `company`

Muchos `invalidateQueries({ queryKey: ['clients'] })` no pasan la empresa aunque el
hook de lectura sí la use en su clave. Funciona por coincidencia (React Query hace
match por prefijo), pero invalida de más: refresca la caché de todas las empresas.

---

## 8. Referencia completa por módulo

Tabla exhaustiva: cada hook exportado, su verbo HTTP, su endpoint y las claves que
invalida. `_method=` indica spoofing de Laravel; `multipart` indica subida de archivos.


## aerolinea  (22 archivos, 54 hooks)

**actions/aerolinea/aeronaves/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateAircraft` | POST | `/${company}/aircrafts` | ['aircrafts'] |
| `useDeleteAircraft` | DELETE | `/${company}/aircrafts/${acronym}` | ['aircrafts'] |
| `useUpdateAircraft` | PUT | `/${company}/aircrafts/${acronym}` | ['aircrafts'] |
| `useCashMovementForAircraft` | POST | `/${company}/cash-movement-aircraft/${acronym}/expenses` | — |

**actions/aerolinea/almacen/condiciones_articulos/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCondition` | POST | `/hangar74/condition-article` | ['conditions'] |
| `useDeleteCondition` | DELETE | `/condition-article/${id}` | ['conditions'] |

**actions/aerolinea/arrendamiento/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateRenting` | POST | `/${company}/rentings` | ['renting'] |
| `useDeleteRenting` | DELETE | `/transmandu/rentings/${id}` | ['renting'] |
| `useDefineEndDateRenting` | PATCH | `/transmandu/renting-define-end-date/${id}` | ['renting'] |

**actions/aerolinea/cajas/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCash` | POST | `/${company}/cash` | ['cashes'] |
| `useDeleteCash` | DELETE | `/${company}/cash/${id}` | ['cashes'] |

**actions/aerolinea/categorias/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCategory` | POST | `/${company}/accountants-categories` | ['category'] |
| `useDeleteCategory` | DELETE | `/${company}/accountants-categories/${id}` | ['category'] |
| `useUpdateCategory` | PUT | `/transmandu/accountants-categories/${id}` | ['category'] |

**actions/aerolinea/clientes/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useUpdateBalance` | PATCH | `/${company}/clients-add-balance/${id}` | ['clients'] |

**actions/aerolinea/compras/requisiciones/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateRequisition` | POST `multipart` | `/requisition-order` | ['requisitions-orders'] |
| `useUpdateRequisition` | PUT | `/requisition-order/${id}` | ['requisitions-orders'] |
| `useDeleteRequisition` | POST | `/delete-requisition-order/${id}` | ['requisitions-orders'] |
| `useUpdateRequisitionStatus` | PUT | `/requisition-order-update-status/${id}` | ['requisitions-orders']<br>['requisition-order'] |

**actions/aerolinea/creditos/credito_arrendamiento/page.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCreditRent` | POST | `/${company}/credits-with-rents` | ['credit-rent'] |

**actions/aerolinea/creditos/credito_venta/page.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCreditSell` | POST | `/transmandu/credits-with-sells` | ['credit-sell'] |

**actions/aerolinea/creditos/credito_vuelo/page.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCreditFlight` | POST | `/${company}/credits-with-flights` | ['credit-flight'] |

**actions/aerolinea/creditos/cuentas_por_pagar/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCredit` | POST | `/transmandu/credits` | ['credits'] |

**actions/aerolinea/cuentas/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateAccount` | POST | `/${company}/accountants` | ['accountants'] |
| `useDeleteAccount` | DELETE | `/transmandu/accountants/${id}` | ['accountants'] |
| `useGetAccount` | GET | `/transmandu/accountants/${id}` | — |
| `useUpdateAccount` | PATCH | `/${company}/accountants/${values.id}` | ['account'] |

**actions/aerolinea/desarrollo/reportes_diarios/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateActivityReport` | POST | `/transmandu/activity-report` | ["user-activity"]<br>["activities"] |
| `useRegisterActivity` | POST | `/transmandu/activity` | ["activities"]<br>["user-activity"] |
| `useDeleteActivity` | DELETE | `/transmandu/activity/${id}` | ["activities"]<br>["user-activity"] |
| `useEditActivity` | PATCH | `/transmandu/update-allActivity/${data.id}` | ["activities"]<br>["user-activity"]<br>["update-activity"] |
| `useUpdateFinalHour` | PUT | `/transmandu/update-activity/${data.id}` | ["user-activity"]<br>["activities"] |
| `useUpdateObservation` | PATCH | `/transmandu/update-observation/${data.id}` | ["daily-activity"]<br>["activities"] |

**actions/aerolinea/empresa/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateAdministrationCompany` | POST | `/transmandu/administration-company` | ['admin-company'] |
| `useDeleteAdministrationCompany` | DELETE | `/transmandu/administration-company/${id}` | ['admin-company'] |
| `useUpdateAdministrationCompany` | PUT | `/transmandu/administration-company/${id}` | ['admin-company'] |

**actions/aerolinea/movimientos/actions.tsx**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCashMovement` | POST | `/${company}/cash-movements` | ["cash-movements"] |
| `useDeleteCashMovement` | DELETE | `/transmandu/cash-movements/${id}` | ["cash-movements"] |

**actions/aerolinea/pagos_creditos/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCreditPayment` | POST | `/transmandu/credit-payment/${data.id}` | ['credit-payment']<br>['credits']<br>['credit-flight-payment']<br>['credit-rent-payment'] |

**actions/aerolinea/permisos/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreatePermission` | POST | `/permission` | ['permissions'] |
| `useDeletePermission` | DELETE | `/permission/${id}` | ['permissions'] |

**actions/aerolinea/roles/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateRole` | POST | `/role` | ['roles'] |
| `useDeleteRole` | DELETE | `/role/${id}` | ['roles'] |

**actions/aerolinea/rutas/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateRoute` | POST | `/transmandu/route` | ['routes'] |
| `useGetRoute` | GET | `/transmandu/route/${id}` | — |
| `useUpdateRoute` | PATCH | `/transmandu/route/${values.id}` | ["routes"] |
| `useDeleteRoute` | DELETE | `/transmandu/route/${id}` | ['routes'] |

**actions/aerolinea/usuarios/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateUser` | POST | `/register` | ['users'] |
| `useDeleteUser` | POST | `/delete-user/${id}` | ['users'] |

**actions/aerolinea/ventas/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateSell` | POST | `/transmandu/sells` | ['sell'] |
| `useDeleteSell` | DELETE | `/transmandu/sells/${id}` | ['sell'] |
| `useUpdateSell` | PUT | `/transmandu/sells/${id}` | ['sell'] |

**actions/aerolinea/vuelos/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateFlight` | POST | `/transmandu/flights` | ['credit-flight-payment'] |
| `useDeleteFlight` | DELETE | `/transmandu/flights/${id}` | ['credit-flight-payment'] |

## ajustes  (11 archivos, 34 hooks)

**actions/ajustes/agencias_envio/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateShippingAgency` | — | `—` | ["shipping-agencies", companySlug] |
| `useUpdateShippingAgency` | — | `—` | ["shipping-agencies", companySlug] |
| `useDeleteShippingAgency` | — | `—` | ["shipping-agencies", companySlug] |

**actions/ajustes/autorizados/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateAuthorizedEmployee` | — | `—` | [ "authorized-employees-from-company", variables.from_company_db, ] |
| `useDeleteAuthorizedEmployee` | — | `—` | ["authorized-employees-from-company", companySlug] |

**actions/ajustes/clientes/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateClient` | POST | `/${company}/clients` | ['clients'] |
| `useDeleteClient` | DELETE | `/${company}/clients/${id}` | ['clients'] |
| `useUpdateClient` | PATCH | `/${company}/clients/${id}` | ['clients'] |

**actions/ajustes/comercios/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateRetailer` | POST | `/${data.company}/retailers` | ['retailers'] |
| `useUpdateRetailer` | PUT | `/${data.company}/retailers/${id}` | ['retailers'] |
| `useDeleteRetailer` | DELETE | `/${company}/retailers/${id}` | ['retailers'] |

**actions/ajustes/departamento/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateDepartment` | POST | `/departments` | ["departments"] |
| `useUpdateDepartment` | PUT | `/departments/${data.id}` | ["departments"] |
| `useDeleteDepartment` | DELETE | `/${company}/departments/${id}` | ["departments"] |

**actions/ajustes/empleados/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateEmployee` | POST | `/${data.company}/employees` | ["employees", variables.company] |
| `useUpdateEmployee` | — `_method=PATCH` `multipart` | `—` | ["employees", variables.company]<br>["employee", variables.company, variables.id] |
| `useDeleteEmployee` | DELETE | `/${company}/employees/${id}` | ["employees", variables.company] |
| `useDeactivateEmployee` | PATCH | `/${company}/employees/${id}/deactivate` | ["employees", variables.company]<br>["employees-inactive", variables.company] |
| `useReactivateEmployee` | PATCH | `/${company}/employees/${id}/reactivate` | ["employees", variables.company]<br>["employees-inactive", variables.company] |

**actions/ajustes/fabricantes/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateManufacturer` | POST | `/${company}/manufacturers` | ['manufacturers'] |
| `useUpdateManufacturer` | PUT | `/${company}/manufacturers/${id}` | ['manufacturers'] |
| `useDeleteManufacturer` | DELETE | `/hangar74/manufacturers/${id}` | ['manufacturers'] |

**actions/ajustes/piloto/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreatePilot` | POST `multipart` | `/${company}/pilots` | ["pilots"] |
| `useDeletePilot` | DELETE | `/transmandu/pilots/${id}` | ["pilots"] |
| `useUpdatePilot` | PUT | `/${company}/pilots/${id}` | ["pilots"] |

**actions/ajustes/proveedores/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateVendor` | — | `—` | ["vendors", companySlug] |
| `useUpdateVendor` | — | `—` | ["vendors", companySlug] |
| `useDeleteVendor` | — | `—` | ["vendors", companySlug] |

**actions/ajustes/tipos_fuente/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateInformationSource` | POST `multipart` | `/${company}/information-sources` | ["information-sources"] |
| `useDeleteInformationSource` | DELETE | `/transmandu/information-sources/${id}` | ["information-sources"] |
| `useUpdateInformationSource` | PUT | `/${company}/information-sources/${id}` | ["information-sources"] |

**actions/ajustes/unidades/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateUnit` | POST | `/${selectedCompany?.slug}/unit` | ["units", selectedCompany?.slug] |
| `useUpdateUnit` | PATCH | `/${selectedCompany?.slug}/unit/${id}` | ["units", selectedCompany?.slug]<br>["secondary-units", selectedCompany?.slug] |
| `useDeleteUnit` | DELETE | `/${selectedCompany?.slug}/unit/${id}` | ["units", selectedCompany?.slug]<br>["secondary-units", selectedCompany?.slug] |

## cargo  (4 archivos, 9 hooks)

**actions/cargo/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCargoShipment` | POST | `/${company}/cargo-shipments` | ["cargo-shipments"]<br>["cargo-shipments-by-aircraft"]<br>["cargo-shipments-by-external-aircraft"]<br>["cargo-stats-by-aircraft"]<br>["cargoNextGuide"]<br>["product-suggestions"] |
| `useDeleteCargoShipment` | DELETE | `/${company}/cargo-shipments/${id}` | ["cargo-shipments"]<br>["cargo-shipments-by-aircraft"]<br>["cargo-shipments-by-external-aircraft"]<br>["cargo-stats-by-aircraft"]<br>["cargoNextGuide"]<br>["product-suggestions"] |
| `useUpdateCargoShipment` | PUT | `/${company}/cargo-shipments/${id}` | ["cargo-shipments"]<br>["cargo-shipments-by-aircraft"]<br>["cargo-shipments-by-external-aircraft"]<br>["cargo-stats-by-aircraft"]<br>["cargo-shipment"]<br>["cargoNextGuide"]<br>["product-suggestions"] |

**actions/cargo/carrierActions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCarrier` | POST | `/${company}/carriers` | ["carriers"] |

**actions/cargo/externalAircraftActions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useManageExternalAircraft` | PUT | `/${company}/cargo-shipments/external-aircraft/bulk-rename` | ["cargo-stats-by-aircraft"]<br>["external-aircraft-suggestions"]<br>["cargo-stats-by-aircraft"] |

**actions/cargo/manifestActions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCargoManifest` | POST | `/${company}/cargo-manifests` | — |
| `useUpdateCargoManifest` | PUT | `/${company}/cargo-manifests/${id}` | — |
| `useDeleteCargoManifest` | DELETE | `/${company}/cargo-manifests/${id}` | — |
| `useReprintCargoManifest` | PUT | `/${company}/cargo-manifests/${id}/reprint` | ["cargo-manifests"] |

## general  (3 archivos, 13 hooks)

**actions/general/asistencia_curso/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCourseAttendance` | POST `multipart` | `/general/${data.company}/create-attendance/${data.course_id}` | ["course-attendance-stats", data.course_id]<br>["course-by-id", data.course_id]<br>["department-courses"]<br>["enrollment-status-by-course",data.course_id] |
| `useMarkCourseAttendance` | PATCH | `/general/${company}/course/${course_id}/mark-attendance` | ["course-attendance-stats", data.course_id]<br>["sms-course-attendance-list", data.course_id]<br>["course-by-id", data.course_id]<br>["department-courses"]<br>["employees-course", data.course_id]<br>["sms-training"] |

**actions/general/calendario/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCalendarEvent` | POST | `/${company}/calendar-events` | ["calendar-events"]<br>["calendar-manual-events"] |
| `useUpdateCalendarEvent` | PUT | `/${company}/calendar-events/${id}` | ["calendar-events"]<br>["calendar-manual-events"] |
| `useDeleteCalendarEvent` | DELETE | `/${company}/calendar-events/${id}` | ["calendar-events"]<br>["calendar-manual-events"] |
| `useCreateCalendarEventType` | POST | `/${company}/calendar-event-types` | ["calendar-event-types"] |
| `useUpdateCalendarEventType` | PUT | `/${company}/calendar-event-types/${id}` | ["calendar-event-types"]<br>["calendar-events"] |
| `useDeleteCalendarEventType` | DELETE | `/${company}/calendar-event-types/${id}` | ["calendar-event-types"]<br>["calendar-events"]<br>["calendar-manual-events"] |
| `useCreateCalendarVisibilityRule` | POST | `/${company}/calendar-visibility-rules` | ["calendar-visibility-rules"]<br>["calendar-events"]<br>["calendar-manual-events"] |
| `useDeleteCalendarVisibilityRule` | DELETE | `/${company}/calendar-visibility-rules/${id}` | ["calendar-visibility-rules"]<br>["calendar-events"]<br>["calendar-manual-events"] |

**actions/general/cargo/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateJobTitle` | POST | `/${company}/job-titles` | ["job_titles", company] |
| `useUpdateJobTitle` | PUT | `/job-titles/${id}` | ["job_titles", company] |
| `useDeleteJobTitle` | DELETE | `/${company}/job-titles/${id}` | ["job_titles", company] |

**actions/general/cursos/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCourse` | POST `multipart` | `/general/${company}/${location_id}/create-course` | ["department-courses"] |
| `useDeleteCourse` | DELETE | `/general/${company}/delete-course/${id}` | ["department-courses"] |
| `useFinishCourse` | PATCH | `/general/${company}/finish-course/${id}` | ["finish-course"]<br>["department-courses"] |
| `useReopenCourse` | PATCH | `/general/${company}/reopen-course/${id}` | ["department-courses"] |
| `useUpdateCourse` | PATCH | `/general/${company}/update-course/${id}` | ["department-courses"] |
| `useUpdateCourseCalendar` | PATCH | `/general/${selectedCompany?.slug}/update-course-calendar/${id}` | ["course-calendar"] |
| `useCreateCourseExam` | POST | `/general/${company}/course/${course_id}/create-exam` | ["course-exams"] |
| `useUpdateCourseExamResult` | POST `multipart` | `/general/${company}/course-exam/${exam_id}/register-attendance` | ["course-exam-attendance"]<br>["sms-course-attendance-list"] |

## mantenimiento  (29 archivos, 120 hooks)

**actions/mantenimiento/almacen/almacenes/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateWarehouse` | POST | `/warehouses` | ['warehouses'] |
| `useDeleteWarehouse` | POST | `/warehouse-delete/${id}` | ['warehouses'] |

**actions/mantenimiento/almacen/articulos/useUpdateArticleQuantityAndZone.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useUpdateArticleQuantityAndZone` | PATCH | `/${company}/update-article-quantities-zones` | ["warehouse-articles"]<br>["articles"]<br>["batches"] |

**actions/mantenimiento/almacen/combustible/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateFuelVehicle` | POST | `/${company}/fuel/vehicles` | — |
| `useUpdateFuelVehicleStatus` | PATCH | `/${company}/fuel/vehicles/${id}/status` | — |
| `useUpdateFuelVehicle` | PUT | `/${company}/fuel/vehicles/${id}` | — |
| `useDeleteFuelVehicle` | DELETE | `/${company}/fuel/vehicles/${id}` | — |
| `useCreateFuelMovement` | POST | `/${company}/fuel/movements` | — |
| `useAnnulFuelMovement` | POST | `/${company}/fuel/movements/${id}/annul` | — |
| `useDeleteFuelMovement` | DELETE | `/${company}/fuel/movements/${id}` | — |

**actions/mantenimiento/almacen/inventario/articulos/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateArticle` | POST | `/${company}/article` | ["warehouse-articles"]<br>['articles', data.company, data.data.status] |
| `useCreateToReviewArticle` | POST `multipart` | `/${company}/article` | ["in-review-articles"]<br>["warehouse-articles"] |
| `useUploadArticleDocuments` | POST | `/${company}/articles/${articleId}/document-requirements` | ["articles"]<br>["warehouse-articles"] |
| `useConsignRequirementDocuments` | POST | `/${company}/article-document-requirements/${consignment.requirementId}/documents` | ["articles"]<br>["warehouse-articles"] |
| `useDeleteArticleDocument` | DELETE | `/${company}/article-documents/${documentId}` | ["articles"]<br>["warehouse-articles"] |
| `useDeleteArticle` | DELETE | `/${company}/article/${id}` | ["articles"]<br>["warehouse-articles", data.company]<br>['warehouse-articles'] |
| `useUpdateArticleStatus` | PUT | `/${selectedCompany?.slug}/update-article-status` | ["in-transit-articles"]<br>["in-reception-articles"]<br>["checking-articles"]<br>["warehouse-articles"]<br>["articles"]<br>["articles", company, "TRANSIT"]<br>["articles", company, "RECEPTION"]<br>["articles", company, "INCOMING"]<br>["articles", company, "WAITING_FOR_FORMAT"]<br>["articles", company, "WAITING_TO_LOCATE"]<br>["articles", company, "QUARANTINE"]<br>["articles", company, "TO_DETERMINATE"]<br>["articles", company, "STORED"]<br>["purchase-orders"] |
| `useConfirmIncomingArticle` | POST | `/${selectedCompany.slug}/incoming-inspections` | ["warehouse-articles"]<br>["articles"]<br>["articles", company, "INCOMING"]<br>["articles", company, "WAITING_FOR_FORMAT"]<br>["incoming-inspections"] |
| `useEditArticle` | POST `multipart` | `/${company}/update-article/${data.id}` | ["article"]<br>["articles"]<br>["warehouse-articles"]<br>["batches"]<br>["in-transit-articles"]<br>["in-reception-articles"]<br>['articles', data.company, data.data.status] |
| `useUpdateArticle` | POST `multipart` | `/${company}/update-article/${id}` | ["warehouse-articles"]<br>["articles"]<br>["batches"]<br>["search-batches"] |
| `useLocateArticle` | PATCH | `/${selectedCompany?.slug}/${id}/locate-article` | ["articles"]<br>["warehouse-articles"] |
| `useSendToQuarantine` | POST | `/${selectedCompany.slug}/quarantine-articles` | ["warehouse-articles"]<br>["articles"]<br>["articles", company, "INCOMING"]<br>["articles", company, "QUARANTINE"]<br>["incoming-articles"]<br>["quarantine-articles"] |
| `useUpdateToolArticleStatus` | PATCH | `/${selectedCompany?.slug}/update-tool/${id}` | ['warehouse-articles'] |

**actions/mantenimiento/almacen/inventario/articulos_generales/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useUpdateGeneralArticle` | PATCH `_method=PATCH` `multipart` | `/${selectedCompany?.slug}/general-articles/${id}` | ["general-articles", selectedCompany?.slug]<br>["low-stock-general-articles", selectedCompany?.slug] |
| `useAddQuantityGeneralArticle` | PATCH | `/${selectedCompany.slug}/add-quantity-general-article/${id}` | ["general-articles"] |
| `useUpdateGeneralArticleQuantity` | PATCH | `/${selectedCompany?.slug}/article-general-quantity` | ["general-articles"]<br>["low-stock-general-articles", selectedCompany?.slug] |
| `useConfirmGeneralArticleIntake` | PATCH | `/${selectedCompany?.slug}/general-article-intakes/${id}/confirm` | ["general-article-intakes"]<br>["general-articles"]<br>["conversions-by-general-article"] |
| `useRejectGeneralArticleIntake` | PATCH | `/${selectedCompany?.slug}/general-article-intakes/${id}/reject` | ["general-article-intakes"] |
| `useUpdateGeneralArticleIntake` | PATCH | `/${selectedCompany?.slug}/general-article-intakes/${id}` | ["general-article-intakes"]<br>["general-articles"] |
| `useCreateGeneralArticle` | POST `multipart` | `/${company}/general-articles` | ["general-articles"] |

**actions/mantenimiento/almacen/inventario/caja_herramientas/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateToolBox` | POST `multipart` | `/${company}/tool-box` | ['tool-boxes'] |
| `useUpdateToolBox` | PUT | `/${company}/tool-box/${data.id}` | ['tool-boxes'] |
| `useDeleteToolBox` | DELETE | `/${company}/tool-box/${id}` | ['tool-boxes'] |

**actions/mantenimiento/almacen/inventario/lotes/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateBatch` | POST | `/${company}/batches` | ['batches'] |
| `useUpdateBatch` | PUT | `/${company}/batches/${id}` | ["batches"]<br>[ "search-batches", data.company, selectedStation, data.data.category, ] |
| `useDeleteBatch` | DELETE | `/${company}/batches/${id}` | ['batches'] |

**actions/mantenimiento/almacen/solicitudes/salida/action.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateDispatchRequest` | POST `multipart` | `/${company}/dispatch-order` | ["dispatches-requests", data.company, selectedStation] |
| `useUpdateStatusDispatchRequest` | PUT | `/${company}/update-status-dispatch/${id}` | ["dispatches-requests-in-process"]<br>["dispatched-articles"]<br>["warehouse-articles"] |
| `useDeleteDispatchRequest` | DELETE | `/${company}/dispatch-order/${id}` | ["dispatches-requests", variables.company, selectedStation]<br>["dispatches-requests-in-process", variables.company, selectedStation]<br>["dispatched-articles", variables.company]<br>["warehouse-articles"] |
| `useReturnToWarehouse` | PUT | `/${company}/update-status-items/${article_id}` | ["dispatched-articles", company] |

**actions/mantenimiento/almacenes/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateWarehouse` | POST | `/warehouses` | ['warehouses'] |

**actions/mantenimiento/compras/cotizaciones/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateQuote` | POST | `/${company}/quote` | ['quotes']<br>['quote']<br>['requisitions-orders']<br>['requisition-order'] |
| `useCreateComplementaryQuote` | POST | `/${company}/quote/${quoteId}/complementary` | ['quotes']<br>['quote'] |
| `useUpdateQuoteStatus` | PUT | `/${company}/quote-order-update-status/${id}` | ['quotes']<br>['quote']<br>['requisitions-orders']<br>['requisition-order'] |
| `useCascadeDeleteQuote` | DELETE | `/${company}/quote/${id}/cascade` | ['quotes']<br>['quote']<br>['requisitions-orders']<br>['requisition-order']<br>['purchase-orders']<br>['purchase-order']<br>['general-article-intakes'] |
| `useDeleteQuote` | DELETE | `/${company}/delete-quote/${id}` | ['quotes']<br>['quote']<br>['requisitions-orders']<br>['requisition-order'] |

**actions/mantenimiento/compras/gestion_costos/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useUpdateArticleCost` | — | `—` | — |
| `useBulkUpdateArticleCost` | — | `—` | — |
| `useUpdateGeneralCost` | — | `—` | — |
| `useBulkUpdateGeneralCost` | — | `—` | — |

**actions/mantenimiento/compras/ordenes_compras/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreatePurchaseOrder` | POST | `/${company}/purchase-order` | ['purchase-orders']<br>['purchase-order']<br>['purchaseOrderByQuote']<br>['quotes']<br>['quote']<br>['requisitions-orders']<br>['requisition-order'] |
| `useCompletePurchase` | POST `_method=PUT` `multipart` | `/${company}/purchase-order/${id}` | ['purchase-orders']<br>['purchase-order']<br>['quotes']<br>['quote']<br>['requisitions-orders']<br>['requisition-order'] |
| `useMarkPurchaseOrderAsPaid` | PUT | `/${company}/purchase-order/${id}/pay` | ['purchase-orders']<br>['purchase-order']<br>['quotes']<br>['quote']<br>['requisitions-orders']<br>['requisition-order'] |
| `useRegisterGeneralArticlesDelivery` | PATCH | `/${company}/purchase-order/${id}/register-general-articles-delivery` | ['purchase-orders']<br>['purchase-order']<br>['general-article-intakes'] |
| `useCascadeDeletePurchaseOrder` | DELETE | `/${company}/purchase-order/${id}/cascade` | ['purchase-orders']<br>['purchase-order']<br>['quotes']<br>['quote']<br>['requisitions-orders']<br>['requisition-order']<br>['general-article-intakes'] |
| `useMarkPurchaseOrderAsCompleted` | PUT | `/${company}/purchase-order/${id}/complete` | ['purchase-orders']<br>['purchase-order']<br>['quotes']<br>['quote']<br>['requisitions-orders']<br>['requisition-order'] |

**actions/mantenimiento/compras/requisiciones/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateRequisition` | POST `multipart` | `/${company}/requisition-order` | ['requisitions-orders']<br>['requisition-order'] |
| `useUpdateRequisition` | POST `_method=PUT` `multipart` | `/${company}/requisition-order/${id}` | ['requisitions-orders']<br>['requisition-order'] |
| `useCreateRequisitionFromLowStockAlert` | POST | `/${params.company}/requisition-order/from-low-stock-alert` | ['requisitions-orders']<br>['requisition-order']<br>['low-stock-general-articles']<br>['low-stock-consumable-articles'] |
| `useDeleteRequisition` | DELETE | `/${company}/delete-requisition-order/${id}` | ['requisitions-orders']<br>['requisition-order'] |
| `useCascadeDeleteRequisition` | DELETE | `/${company}/requisition-order/${id}/cascade` | ['requisitions-orders']<br>['requisition-order']<br>['quotes']<br>['quote']<br>['purchase-orders']<br>['purchase-order']<br>['general-article-intakes'] |
| `useUpdateRequisitionPriority` | PUT | `/${company}/requisition-order-update-priority/${id}` | ['requisitions-orders']<br>['requisition-order'] |
| `useUpdateRequisitionStatus` | PUT | `/${company}/requisition-order-update-status/${id}` | ['requisitions-orders']<br>['requisition-order'] |

**actions/mantenimiento/control_calidad/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useGenerateIncomingFormat` | POST | `/${company}/incoming-format` | ["warehouse-articles"]<br>["articles"]<br>["articles", company, "WAITING_FOR_FORMAT"]<br>["articles", company, "WAITING_TO_LOCATE"] |

**actions/mantenimiento/inventario/articulos/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateArticle` | POST | `/${company}/articles` | ['articles']<br>['warehouse-articles'] |
| `useDeleteGeneralArticle` | DELETE | `/${company}/general-articles/${id}` | ["general-articles", data.company] |

**actions/mantenimiento/inventario/lotes/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateBatch` | POST | `/${company}/batches` | ['batches'] |

**actions/mantenimiento/planificacion/aeronaves/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateMaintenanceAircraft` | POST | `/${company}/aircrafts` | ['aircrafts'] |
| `useUpdateMaintenanceAircraft` | PUT | `/${company}/aircrafts/${acronym}` | ['aircrafts']<br>['aircraft'] |
| `useDeleteMaintenanceAircraft` | DELETE | `/${company}/aircrafts/${id}` | ['aircrafts']<br>['aircraft'] |

**actions/mantenimiento/planificacion/ordenes_trabajo/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateWorkOrder` | POST | `/${company}/work-orders` | ["work-orders"] |
| `useDeleteWorkOrder` | DELETE | `/${company}/work-orders/${id}` | ["work-orders"]<br>["work-order"] |
| `useUpdateWorkOrder` | POST `_method=PUT` `multipart` | `/${company}/work-orders/${id}` | ["work-orders"]<br>["work-order"] |
| `useUpdateWorkOrderTask` | PUT | `/${company}/update-work-order-task/${id}` | ["work-orders"] |
| `useDeleteWorkOrderTask` | DELETE | `/${company}/work-order-tasks/${id}` | ["work-orders"] |
| `useAddWorkOrderTask` | POST | `/${company}/${work_order_id}/store-work-order-task` | ["work-orders"] |
| `useCloseWorkOrder` | PATCH | `/${company}/work-orders/${id}` | ["work-orders"]<br>["work-order"] |

**actions/mantenimiento/planificacion/ordenes_trabajo/hoja_reporte/action.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateReportPage` | POST | `/${data.company}/work-order-report-page` | ['work-order-report-page']<br>['work-order-report-page'] |
| `useAddReport` | POST | `/${company}/work-order-report-page-items/${data.id}` | ['work-order']<br>['work-order-report-page']<br>['work-order-report-page-items'] |
| `useUpdatePrelimInspection` | PATCH | `/${company}/preliminary-inspection/${data.id}` | ['work-orders']<br>['work-order'] |

**actions/mantenimiento/planificacion/ordenes_trabajo/inspecccion_preliminar/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreatePrelimInspection` | POST | `/${company}/preliminary-inspection` | ['work-order']<br>['work-orders'] |
| `useAddPrelimItem` | POST | `/${company}/preliminary-inspection-items/${data.id}` | ['work-orders']<br>['work-order'] |
| `useUpdatePrelimInspection` | PATCH | `/${company}/preliminary-inspection/${data.id}` | ['work-orders']<br>['work-order'] |

**actions/mantenimiento/planificacion/ordenes_trabajo/no_rutinarios/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateNoRutine` | POST | `/${company}/non-routine` | ['work-orders']<br>['work-order', variables.order_number, variables.company] |
| `useUpdateNoRoutineTask` | PUT | `/${company}/no-routine-task/${data.id}` | ['work-orders']<br>['work-order', variables.order_number, variables.company] |

**actions/mantenimiento/planificacion/ordenes_trabajo/rutinarios/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useUpdateWorkOrderTaskStatus` | PUT | `/${company}/update-status-work-order-task/${task_id}` | ["work-order"] |
| `useUpdateWorkOrderTask` | PUT | `/${company}/update-work-order-task/${data.id}` | ["work-orders"]<br>["work-order"] |
| `useAddWorkOrderTask` | POST | `/${selectedCompany?.slug}/${work_order_id}/store-work-order-task` | ["work-orders"]<br>["work-order"] |
| `useCreateTaskEvents` | POST | `/${selectedCompany?.slug}/${task_id}/store-work-order-task-event` | ["work-orders"]<br>["work-order"] |

**actions/mantenimiento/planificacion/servicios/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateMaintenanceService` | POST | `/${company}/service-task` | ['maintenance-services'] |
| `useDeleteService` | DELETE | `/${company}/service-task/${id}` | ['maintenance-services'] |

**actions/mantenimiento/planificacion/vuelos/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateFlightControl` | POST | `/${company}/flight-control` | ['flight-control'] |
| `useUpdateFlightControl` | PUT | `/${company}/flight-control/${id}` | ['flight-control'] |
| `useDeleteFlightControl` | DELETE | `/${company}/flight-control/${id}` | ["flight-control"]<br>["flight-controls"] |

**actions/mantenimiento/sms/evaluacion_mitigacion/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateMitigationPlan` | POST `multipart` | `/${company}/sms/aeronautical/mitigation-plans` | ["analysis"] |
| `useUpdateMitigationPlan` | PATCH | `/${company}/sms/aeronautical/mitigation-plans/${id}` | — |
| `useCreateMitigationAnalysis` | POST `multipart` | `/${company}/sms/aeronautical/analysis` | — |
| `useUpdateMitigationAnalysis` | PATCH | `/${company}/sms/aeronautical/analysis/${id}` | — |
| `useCreateRiskAssessment` | POST | `/${company}/sms/aeronautical/risk-assessments` | — |
| `useUpdateRiskAssessment` | PATCH | `/${company}/sms/aeronautical/risk-assessments/${id}` | — |
| `useCreateMitigationMeasure` | POST `multipart` | `/${company}/sms/aeronautical/mitigation-measures` | — |
| `useUpdateMitigationMeasure` | PATCH | `/${company}/sms/aeronautical/mitigation-measures/${id}` | — |
| `useCreateFollowUpControl` | POST `multipart` | `/${company}/sms/aeronautical/follow-up-controls` | — |
| `useUpdateFollowUpControl` | POST `multipart` | `/${company}/sms/aeronautical/update-follow-up-controls/${id}` | — |

**actions/mantenimiento/sms/notificacion_peligro/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateHazardNotification` | POST `multipart` | `/${company}/sms/aeronautical/hazard-notifications` | ["danger-identifications", data.company]<br>["voluntary-reports"]<br>["voluntary-report"]<br>["analysis"] |
| `useDeleteHazardNotification` | DELETE | `/${company}/sms/danger-identifications/${id}` | ["danger-identifications", data.company]<br>["voluntary-reports"]<br>["danger-identification-by-id"] |

**actions/mantenimiento/sms/reporte_obligatorio/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateObligatoryReport` | POST `multipart` | `/${company}/aeronautical/sms/obligatory-reports` | ["obligatory-reports", data.company] |
| `useDeleteObligatoryReport` | DELETE | `/${company}/sms/obligatory-reports/${id}` | ["danger-identifications", data.company]<br>["obligatory-reports"] |
| `useUpdateObligatoryReport` | POST `multipart` | `/${company}/sms/update-obligatory-reports/${id}` | ["obligatory-reports"] |
| `useAcceptObligatoryReport` | PATCH | `/${company}/sms/accept-obligatory-reports/${id}` | ["obligatory-reports"] |
| `useGetNextReportNumber` | GET | `/${company}/sms/next-obligatory-report-number` | — |

**actions/mantenimiento/sms/reporte_voluntario/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateVoluntaryReport` | POST `multipart` | `/${company}/aeronautical/sms/voluntary-reports` | ["voluntary-reports"] |
| `useDeleteVoluntaryReport` | DELETE | `/${company}/sms/aeronautical/voluntary-reports/${id}` | ["voluntary-reports", company] |
| `useUpdateVoluntaryReport` | POST `multipart` | `/${company}/aeronautical/sms/update-voluntary-reports/${id}` | ["voluntary-reports"]<br>["voluntary-report"] |
| `useGetNextReportNumber` | GET | `/${company}/sms/next-voluntary-report-number` | — |
| `useAcceptVoluntaryReport` | PATCH | `/${company}/sms/aeronautical/accept-report/${id}` | ["voluntary-reports"] |
| `useCloseVoluntaryReport` | POST `multipart` | `/${company}/sms/aeronautical/close-rvp/${id}` | ["voluntary-reports", company]<br>["hazard-notifications", company]<br>["hazard-notification-by-report", company] |
| `useOpenVoluntaryReport` | PATCH | `/${company}/sms/aeronautical/open-rvp/${id}` | ["voluntary-reports", company]<br>["hazard-notifications", company]<br>["hazard-notification-by-report", company] |

## notifications  (1 archivos, 5 hooks)

**actions/notifications/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useMarkNotificationAsRead` | PATCH | `/${company}/notifications/${id}/read` | — |
| `useMarkAllNotificationsAsRead` | PATCH | `/${company}/notifications/mark-all-read` | — |
| `useClearAllNotifications` | DELETE | `/${company}/notifications/clear/all` | ['notifications', company] |
| `useClearReadNotifications` | DELETE | `/${company}/notifications/clear/read` | ['notifications', company] |
| `useClearUnreadNotifications` | DELETE | `/${company}/notifications/clear/unread` | ['notifications', company] |

## sistema  (10 archivos, 38 hooks)

**actions/sistema/banca/bancos/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateBank` | POST | `/banks` | ["banks"] |
| `useUpdateBank` | PUT | `/banks/${id}` | ["banks"]<br>["bank-accounts"]<br>["payment-options"] |
| `useDeleteBank` | DELETE | `/banks/${id}` | ["banks"] |

**actions/sistema/banca/cuentas/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateBankAccount` | POST | `/bank-accounts` | — |
| `useUpdateBankAccount` | PUT | `/bank-accounts/${id}` | — |
| `useDeleteBankAccount` | DELETE | `/bank-accounts/${id}` | ["bank-cards"] |

**actions/sistema/banca/tarjetas/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateBankCard` | POST | `/bank-cards` | — |
| `useUpdateBankCard` | PUT | `/bank-cards/${id}` | — |
| `useDeleteBankCard` | DELETE | `/bank-cards/${id}` | — |

**actions/sistema/empresas/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateCompany` | POST | `/company` | ["companies"] |
| `useUpdateCompany` | POST | `/company/${id}?_method=PUT` | ["companies"] |
| `useSyncCompanyModules` | PUT | `/company/${slug}/modules` | ["companies"] |
| `useDeleteCompany` | DELETE | `/company/${id}` | ["companies"] |

**actions/sistema/modulos/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateModule` | POST | `/modules` | ['modules'] |
| `useDeleteModule` | DELETE | `/modules/${id}` | ['modules'] |
| `useUpdateModule` | PUT | `/modules/${id}` | ['modules'] |

**actions/sistema/reportes/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateErrorReport` | POST `multipart` | `/error-reports` | ["error-reports"] |
| `useDeleteErrorReport` | DELETE | `/error-reports/${id}` | ["error-reports"] |
| `useSetErrorReportInProgress` | POST | `/error-reports/${id}/in-progress` | ["error-reports"] |
| `useResolveErrorReport` | POST | `/error-reports/${id}/resolve` | ["error-reports"] |
| `useMarkErrorReportDuplicate` | POST | `/error-reports/${id}/duplicate` | ["error-reports"] |
| `useUpdateErrorReportDiagnosis` | PATCH | `/error-reports/${id}/diagnosis` | ["error-reports"] |
| `useAddErrorReportImages` | POST `multipart` | `/error-reports/${id}/images` | ["error-reports"] |
| `useDeleteErrorReportImage` | DELETE | `/error-reports/${id}/images/${imageId}` | ["error-reports"] |
| `useImportErrorReportHistory` | POST `multipart` | `/error-reports/import-history` | ["error-report-imports"] |

**actions/sistema/terceros/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateThirdParty` | POST | `/${slug}/third-parties` | ["third-parties", slug] |
| `useUpdateThirdParty` | PUT | `/${slug}/third-parties/${id}` | ["third-parties", slug] |
| `useDeleteThirdParty` | DELETE | `/${slug}/third-parties/${id}` | ["third-parties", slug] |

**actions/sistema/usuarios/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateUser` | POST | `/register` | ['users'] |
| `useUpdateUser` | PUT | `/user/${id}` | ['users']<br>['user'] |
| `useAddRoleToUser` | POST | `/users/${userId}/roles` | ['user', userId] |
| `useRemoveRoleFromUser` | DELETE | `/users/${userId}/roles` | ['user', userId] |
| `useAddCompanyToUser` | POST | `/users/${userId}/companies` | ['user', userId] |
| `useRemoveCompanyFromUser` | DELETE | `/users/${userId}/companies/${companyId}` | ['user', userId] |
| `useAddModulesToUser` | POST | `/users/${userId}/modules` | ['user', userId] |
| `useRemoveModulesFromUser` | DELETE | `/users/${userId}/modules` | ['user', userId] |

**actions/sistema/usuarios/permisos/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreatePermission` | POST | `/permission` | ['permissions'] |

**actions/sistema/usuarios/roles/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateRole` | POST | `/role` | ['roles'] |

## sms  (14 archivos, 66 hooks)

**actions/sms/activity_categories/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateActivityCategory` | POST | `/${company}/sms/activity-categories` | ["sms-activity-categories"] |
| `useUpdateActivityCategory` | PATCH | `/${company}/sms/activity-categories/${id}` | ["sms-activity-categories"] |
| `useDeleteActivityCategory` | DELETE | `/${selectedCompany?.slug}/sms/activity-categories/${id}` | ["sms-activity-categories"] |

**actions/sms/analisis/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateAnalysis` | POST `multipart` | `/${company}/sms/analysis` | ["analysis"]<br>["danger-identifications", data.company]<br>["danger-identification"] |
| `useDeleteAnalysis` | DELETE | `/transmandu/sms/analysis/${id}` | ["analysis"] |
| `useUpdateAnalyses` | PATCH | `/${company}/sms/analysis/${id}` | ["analysis"]<br>["danger-identifications", data.company] |

**actions/sms/boletin/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateBulletin` | POST `multipart` | `/${company}/sms/bulletin` | ["safety-bulletins", data.company] |
| `useDeleteSafetyBulletin` | DELETE | `/${company}/sms/bulletin/${id}` | ["safety-bulletins", data.company] |
| `useDeleteBulletinDocument` | DELETE | `/${company}/sms/bulletin/${id}/document` | ["safety-bulletins", variables.company] |
| `useUpdateBulletin` | POST `multipart` | `/${company}/sms/bulletin/${id}` | ["safety-bulletins", data.company] |

**actions/sms/certificates/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateSMSCertificate` | POST `multipart` | `/${company}/sms/certificates` | ["sms-certificates"] |
| `useDeleteSMSCertificate` | DELETE | `/${company}/sms/certificates/${id}` | ["sms-certificates"] |
| `useUpdateSMSCertificate` | POST `_method=PUT` `multipart` | `/${company}/sms/certificates/${id}` | ["sms-certificates"] |

**actions/sms/controles_de_seguimiento/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateFollowUpControl` | POST `multipart` | `/${company}/sms/follow-up-controls` | ["follow-up-controls"]<br>["mitigation-measures"] |
| `useDeleteFollowUpControl` | DELETE | `/${company}/sms/follow-up-controls/${id}` | ["follow-up-controls"] |
| `useUpdateFollowUpControl` | POST `multipart` | `/${company}/sms/update-follow-up-controls/${id}` | ["follow-up-controls"] |

**actions/sms/medida_de_mitigacion/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateMitigationMeasure` | POST `multipart` | `/${company}/sms/mitigation-measures` | ["mitigation-measures"]<br>["analysis"] |
| `useDeleteMitigationMeasure` | DELETE | `/${company}/sms/mitigation-measures/${id}` | ["mitigation-measures"]<br>["analysis"] |
| `useUpdateMitigationMeasure` | PATCH | `/${company}/sms/mitigation-measures/${id}` | ["mitigation-measures"]<br>["analysis"] |

**actions/sms/peligros_identificados/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateDangerIdentification` | POST `multipart` | `/${company}/sms/danger-identifications/${reportType}/${id}` | ["danger-identifications", data.company]<br>["voluntary-reports"]<br>["voluntary-report"]<br>["analysis"] |
| `useDeleteDangerIdentification` | DELETE | `/${company}/sms/danger-identifications/${id}` | ["danger-identifications", data.company]<br>["voluntary-reports"]<br>["danger-identification-by-id"] |
| `useUpdateDangerIdentification` | PATCH | `/${company}/sms/danger-identifications/${id}` | ["danger-identifications", data.company]<br>["danger-identification"] |

**actions/sms/planes_de_mitigation/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateMitigationPlan` | POST `multipart` | `/${company}/sms/mitigation-plans` | ["mitigation-plans"]<br>["analysis"] |
| `useDeleteMitigationPlan` | DELETE | `/${company}/sms/mitigation-plans/${id}` | ["mitigation-plans"]<br>["analysis"] |
| `useUpdateMitigationPlan` | PATCH | `/${company}/sms/mitigation-plans/${id}` | ["analysis"] |
| `useCloseReport` | PATCH | `/${company}/sms/close_report/${data.mitigation_id}` | ["mitigation-plans"]<br>["voluntary-reports"]<br>["obligatory-reports"]<br>["analysis"] |
| `useOpenReport` | PATCH | `/${company}/sms/open_report/${data.mitigation_id}` | ["mitigation-plans"]<br>["voluntary-reports"]<br>["obligatory-reports"]<br>["analysis"] |

**actions/sms/reporte_obligatorio/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateObligatoryReport` | POST `multipart` | `/transmandu/sms/obligatory-reports` | ["obligatory-reports"] |
| `useDeleteObligatoryReport` | DELETE | `/${company}/sms/obligatory-reports/${id}` | ["danger-identifications", data.company]<br>["obligatory-reports"] |
| `useUpdateObligatoryReport` | POST `multipart` | `/${company}/sms/update-obligatory-reports/${id}` | ["obligatory-reports"] |
| `useAcceptObligatoryReport` | PATCH | `/${company}/sms/accept-obligatory-reports/${id}` | ["obligatory-reports"] |
| `useGetNextReportNumber` | GET | `/${company}/sms/next-obligatory-report-number` | — |

**actions/sms/reporte_voluntario/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateVoluntaryReport` | POST `multipart` | `/${company}/sms/voluntary-reports` | ["voluntary-reports"] |
| `useDeleteVoluntaryReport` | DELETE | `/${company}/sms/voluntary-reports/${id}` | ["danger-identifications", data.company]<br>["voluntary-reports"]<br>["analysis"] |
| `useUpdateVoluntaryReport` | POST `multipart` | `/${company}/sms/update-voluntary-reports/${id}` | ["voluntary-reports"]<br>["voluntary-report"] |
| `useAcceptVoluntaryReport` | PATCH | `/${company}/sms/accept-voluntary-reports/${id}` | ["voluntary-reports"]<br>["voluntary-report"] |
| `useGetNextReportNumber` | GET | `/${company}/sms/next-voluntary-report-number` | — |

**actions/sms/sms_actividades/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateSMSActivity` | POST `multipart` | `/${company}/sms/activities` | ["sms-activities"] |
| `useDeleteSMSActivity` | DELETE | `/${company}/sms/activities/${id}` | ["sms-activities"] |
| `useUpdateSMSActivity` | POST `_method=PATCH` `multipart` | `/${company}/sms/activities/${id}` | ["sms-activities"]<br>["sms-activity", data.id] |
| `useUpdateCalendarSMSActivity` | PATCH | `/${company}/sms/update-calendar-activity/${id}` | ["sms-calendar-activities"] |
| `useCloseSMSActivity` | PATCH | `/${selectedCompany?.slug}/sms/close-sms-activity/${id}` | ["sms-activities"] |
| `useOpenSMSActivity` | PATCH | `/${selectedCompany?.slug}/sms/open-sms-activity/${id}` | ["sms-activities"] |
| `useGetNextActivityNumber` | GET | `/${company}/sms/next-activity-number` | — |
| `useLinkBulletinToActivity` | PATCH | `/${company}/sms/activity-bulletin` | ["sms-activities"]<br>["bulletins-without-activity"] |

**actions/sms/sms_asistencia_actividades/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateSMSActivityAttendance` | POST `multipart` | `/${company}/sms/activities/${activity_id}/enrollements` | ["sms-activity-attendance"]<br>["enrollment-status-by-activity",data.activity_id]<br>["enrolled-employees"]<br>["sms-activity", data.activity_id]<br>["sms-activity-attendance-list", data.activity_id]<br>["sms-activity-attendance-stats", data.activity_id] |
| `useMarkSMSActivityAttendance` | PATCH | `/${selectedCompany?.slug}/sms/mark-sms-activity-attendance/${activity_id}` | ["sms-activity", data.activity_id]<br>["sms-activity-attendance-list", data.activity_id]<br>["sms-activity-attendance-stats", data.activity_id]<br>["sms-activities"]<br>["sms-activity-attendance-status", data.activity_id] |

**actions/sms/survey/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateSurvey` | POST | `/${selectedCompany?.slug}/${selectedStation}/sms/survey` | ["surveys", selectedCompany?.slug, selectedStation] |
| `useCreateSurveyAnswers` | POST | `/${company}/sms/survey-answer` | — |
| `useDeleteSurvey` | DELETE | `/${company}/${location_id}/sms/survey/${survey_number}` | ["surveys", data.company, data.location_id] |
| `useUpdateSurvey` | PUT | `/${company}/${location_id}/sms/survey/${survey_number}` | ["surveys", variables.company, variables.location_id] |
| `useUpdateQuestion` | PATCH | `/${company}/${location_id}/sms/survey/${survey_number}/question/${question_id}` | ["surveys", variables.company, variables.location_id] |
| `useDeleteQuestion` | DELETE | `/${company}/${location_id}/sms/survey/${survey_number}/question/${question_id}` | ["surveys", variables.company, variables.location_id] |
| `useCreateQuestion` | POST | `/${company}/${location_id}/sms/survey/${survey_number}/question` | ["surveys", variables.company, variables.location_id] |
| `useUpdateSurveyInfo` | PATCH | `/${company}/${location_id}/sms/survey/${survey_number}/info` | ["surveys", variables.company, variables.location_id] |
| `useUpdateSurveySetting` | PATCH `multipart` | `/${company}/sms/survey/${id}/${setting}` | ["surveys"] |

**actions/sms/uniforms/actions.ts**

| Hook | HTTP | Endpoint | Invalida |
|---|---|---|---|
| `useCreateUniformItem` | POST | `/${company}/sms/uniforms/items` | — |
| `useUpdateUniformItem` | PATCH | `/${company}/sms/uniforms/items/${id}` | — |
| `useDeleteUniformItem` | DELETE | `/${company}/sms/uniforms/items/${id}` | — |
| `useCreateUniformArticleType` | POST | `/${company}/sms/uniforms/article-types` | — |
| `useUpdateUniformArticleType` | PATCH | `/${company}/sms/uniforms/article-types/${id}` | — |
| `useDeleteUniformArticleType` | DELETE | `/${company}/sms/uniforms/article-types/${id}` | — |
| `useCreateUniformBrand` | POST | `/${company}/sms/uniforms/brands` | — |
| `useUpdateUniformBrand` | PATCH | `/${company}/sms/uniforms/brands/${id}` | — |
| `useDeleteUniformBrand` | DELETE | `/${company}/sms/uniforms/brands/${id}` | — |
| `useCreateUniformMovement` | POST | `/${company}/sms/uniforms/movements` | — |
