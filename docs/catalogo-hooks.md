# Catálogo de `hooks/` — Referencia completa

> Inventario de las **lecturas** del frontend. Si necesitas mostrar datos que vienen
> del backend, el hook está aquí (o debería).
>
> Cifras al momento de escribir: **261 archivos con hooks exportados, 288 hooks**
> (260 queries, 28 que usan `useMutation` por motivos explicados abajo).

---

## Índice

1. [Qué va aquí y qué no](#1-qué-va-aquí-y-qué-no)
2. [Anatomía de un hook de lectura](#2-anatomía-de-un-hook-de-lectura)
3. [`queryKey`: el contrato con la caché](#3-querykey-el-contrato-con-la-caché)
4. [`enabled`: evitar la petición con `undefined`](#4-enabled-evitar-la-petición-con-undefined)
5. [Lecturas que usan `useMutation`](#5-lecturas-que-usan-usemutation)
6. [Hooks que no tocan la red](#6-hooks-que-no-tocan-la-red)
7. [Antes de crear un hook nuevo](#7-antes-de-crear-un-hook-nuevo)
8. [Deuda técnica conocida](#8-deuda-técnica-conocida)
9. [Referencia completa por módulo](#9-referencia-completa-por-módulo)

---

## 1. Qué va aquí y qué no

| Va en `hooks/` | Va en `actions/` |
|---|---|
| GET de listas y detalles | POST / PUT / PATCH / DELETE |
| Descargas que solo leen (PDF, Excel) | Descargas que **además** cambian estado |
| Estado de UI reutilizable (`useDebounce`) | — |
| Permisos derivados del usuario | — |

La distinción práctica: **si al llamarlo cambia algo en la base de datos, es un
action.** Si solo trae información, es un hook.

---

## 2. Anatomía de un hook de lectura

El patrón dominante, con las cuatro piezas que casi todos repiten:

```ts
import axios from '@/lib/axios';
import { JobTitle } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchJobTitles = async (company: string | undefined): Promise<JobTitle[]> => {
  const { data } = await axios.get(`/${company}/job-titles`);
  return data;
};

export const useGetJobTitles = (company: string | undefined) => {
  return useQuery<JobTitle[], Error>({
    queryKey: ['job_titles', company],
    queryFn: () => fetchJobTitles(company),
    enabled: !!company,
  });
};
```

1. **La función `fetch*` va fuera del hook.** Es la que habla con axios; el hook solo
   la envuelve. Facilita leer qué endpoint se consume sin desenredar React Query.
2. **El tipo de retorno es explícito** (`Promise<JobTitle[]>`, `useQuery<JobTitle[], Error>`).
   Sin esto, todo lo que consume el hook queda en `any`.
3. **`queryKey` incluye todo lo que cambia el resultado** — ver sección siguiente.
4. **`enabled`** evita disparar la petición antes de tiempo.

A diferencia de `actions/`, aquí se devuelve **la query pelada**, no un objeto con
nombre. El consumidor hace `const { data, isLoading } = useGetJobTitles(company)`.

---

## 3. `queryKey`: el contrato con la caché

React Query cachea por clave. **Dos llamadas con la misma clave devuelven lo mismo,
aunque los parámetros sean distintos.** Ese es el bug más caro de esta carpeta.

Regla: **todo parámetro que cambie la respuesta va en la clave.**

```ts
// ❌ dos rutas distintas comparten caché: al abrir la segunda se ve la primera
queryKey: ["route"]
queryFn: () => fetchRoute(id)

// ✅
queryKey: ["route", id]
```

En multi-tenant, **`company` va siempre**. Si falta, un usuario que cambia de
empresa sigue viendo los datos de la anterior:

```ts
queryKey: ['job_titles', company]
```

Este error existió en `useGetRouteById` (clave fija `["route"]`) y en
`useGetDailyActivities` (sin `company`, y además construía la URL con `undefined`).
Ambos corregidos.

### Cómo elegir el nombre de la clave

El nombre debe coincidir con el que invalida el action correspondiente. Antes de
inventar uno, busca si el recurso ya tiene clave:

```
grep -rn "queryKey" hooks/ | grep -i "nombre-del-recurso"
```

Si `actions/` invalida `['requisitions-orders']`, tu hook **debe** usar esa misma
cadena, no `['requisitions']`.

---

## 4. `enabled`: evitar la petición con `undefined`

Presente en 214 de los 261 archivos. Sin él, el hook dispara con `company === undefined`
en el primer render y pega a `/undefined/job-titles`, que devuelve 404 y ensucia
la consola (o peor: cachea el error).

```ts
enabled: !!company,                    // espera a la empresa
enabled: !!company && !!location_id,   // espera a ambos
```

**Regla:** si el hook recibe un parámetro que puede llegar `undefined` en el primer
render, necesita `enabled`.

`staleTime` aparece en 158 archivos; se usa para datos que cambian poco (catálogos,
unidades, fabricantes) y evita refetch en cada montaje.

---

## 5. Lecturas que usan `useMutation`

Hay **28 hooks** que consultan datos pero usan `useMutation`. **No es un error** y
tiene dos causas legítimas:

### a) El backend recibe filtros en el body

Son reportes con formularios de muchos filtros. El backend los expone como POST
porque no caben en query string:

```ts
// hooks/mantenimiento/almacen/reportes/useGetDispatchReport.ts
// Es una consulta, no una mutación: usa useMutation porque el reporte se pide
// a demanda con los filtros del formulario y no debe cachearse ni auto-refetch.
export const useGetDispatchReport = () => {
  return useMutation({ ... });
};
```

### b) Se piden a demanda, no al montar

Un reporte se genera cuando el usuario aprieta "Generar", no al abrir la página.
`useMutation` da exactamente eso: se dispara con `.mutate()` y no se auto-refetchea.

**Cuáles son:** los `useGet*Report*`, `useDownload*Pdf`, los `useGet*ByCompanyId`,
`useCheckWorkOrderArticles` y `useGetArticlesByBatch`.

### Archivos mixtos (query + mutation en el mismo archivo)

Tres archivos agrupan lectura y escritura porque son un flujo cohesivo y separarlos
dispersaría la lógica:

| Archivo | Por qué convive |
|---|---|
| `sistema/usuario/usePasswordResetRequests.ts` | Listar solicitudes + aprobar/rechazar |
| `mantenimiento/almacen/articulos/useArticleUnitConversions.ts` | Leer conversiones + CRUD de filas |
| `supervisor/useSupervisorGeneralArticles.ts` | Preview de fusión + ejecutar/deshacer |

Es una excepción consciente, no un patrón a extender.

---

## 6. Hooks que no tocan la red

En `hooks/helpers/` viven utilidades de UI que **no** consumen el backend. Son
transversales: los usa almacén, compras, SMS y ajustes por igual.

| Hook | Para qué |
|---|---|
| `useDebounce` | Retrasar búsquedas mientras se escribe |
| `use-document-title` | Título de la pestaña |
| `use-sidebar-toggle` / `use-guest-sidebar-toggle` | Estado abierto/cerrado del menú |
| `use-hide-read-notifications` | Filtro de la campana |
| `use-scroll-glass` | Efecto visual al hacer scroll |
| `use-store` | Puente para leer stores de Zustand en SSR |

**No los muevas a una carpeta de módulo** aunque hoy los use uno solo: son de uso
general y su ubicación comunica eso.

---

## 7. Antes de crear un hook nuevo

1. **Busca el endpoint, no el nombre.** `grep -rn "job-titles" hooks/` — puede que
   ya exista con otro nombre.
2. **Revisa la carpeta del módulo.** Si `hooks/ajustes/cargo/` existe, tu lectura de
   cargos va ahí.
3. **Confirma que es lectura.** Si escribe, va en `actions/`.
4. **Define la `queryKey` mirando qué invalida el action** del mismo recurso.
5. **Pon `enabled`** si algún parámetro puede llegar `undefined`.
6. **Tipa el retorno.** `useQuery<Tipo[], Error>`.

---

## 8. Deuda técnica conocida

### `hooks/useGetArticlesByBatch.ts` (raíz) — código muerto

Tiene **cero consumidores** y el tenant hardcodeado:

```ts
await axiosInstance.post(`/hangar74/batches/${batch}`, { location_id });
```

La versión viva y correcta es `hooks/mantenimiento/almacen/articulos/useGetArticlesByBatch.ts`
(67 líneas contra 15). **No importes el de la raíz.**

### Tenant hardcodeado

Igual que en `actions/`: hay endpoints con `/transmandu/` y `/hangar74/` fijos en
lugar de `${company}`. Rompe para otras empresas.

Detectarlos: `grep -rn '/transmandu/\|/hangar74/' hooks/`

### Hooks huérfanos

Hay archivos sin ningún consumidor. Antes de borrar uno, verifica también los
imports **relativos** (`from "./useAlgo"`), no solo los de alias (`@/hooks/...`) —
un `grep` que solo busque `@/` da falsos positivos de "no se usa".

---

## 9. Referencia completa por módulo

Cada hook exportado con su archivo, su `queryKey` y el endpoint que consume.
Los marcados `_(useMutation)_` son las lecturas a demanda de la [sección 5](#5-lecturas-que-usan-usemutation).


## (raiz)  (1 archivos, 1 hooks)

| Hook | Archivo | queryKey | Endpoint |
|---|---|---|---|
| `useGetArticlesByBatch` | `useGetArticlesByBatch.ts` | _(useMutation)_ | `—` |

## administracion  (4 archivos, 4 hooks)

| Hook | Archivo | queryKey | Endpoint |
|---|---|---|---|
| `useGetConditions` | `administracion/useGetConditions.ts` | ["conditions"] | `—` |
| `useGetDepartamentEmployees` | `administracion/useGetDepartamentEmployees.ts` | _(useMutation)_ | `—` |
| `useGetWarehouses` | `administracion/useGetWarehouses.ts` | ['warehouses'] | `—` |
| `useGetWarehousesByLocation` | `administracion/useGetWarehousesByUser.ts` | ['warehousesByLocation', company, location_id] | `—` |

## aerolinea  (35 archivos, 35 hooks)

| Hook | Archivo | queryKey | Endpoint |
|---|---|---|---|
| `useGetAircraftAcronyms` | `aerolinea/aeronaves/useGetAircraftAcronyms.ts` | ['aircrafts'] | `—` |
| `useGetAircraftByAcronym` | `aerolinea/aeronaves/useGetAircraftByAcronym.ts` | ["aircrafts", acronym] | `—` |
| `useGetAircrafts` | `aerolinea/aeronaves/useGetAircrafts.ts` | ['aircrafts'] | `—` |
| `useGetCash` | `aerolinea/cajas/useGetCash.ts` | ['cashes'] | `—` |
| `useGetCashById` | `aerolinea/cajas/useGetCashById.ts` | ["cash", id, company] | `—` |
| `useGetCategoriesByAccountant` | `aerolinea/categorias_cuentas/useGetCategoriesByAcountant.ts` | ["categories-accountant", id, company] | `—` |
| `useGetCategory` | `aerolinea/categorias_cuentas/useGetCategory.ts` | ["category"] | `—` |
| `useGetCategoryById` | `aerolinea/categorias_cuentas/useGetCategoryById.ts` | ["category", id] | `—` |
| `useGetCredit` | `aerolinea/creditos/useGetCredit.ts` | ['credits', company] | `—` |
| `useGetCreditFlight` | `aerolinea/creditos/useGetCreditFlight.ts` | ['credit-flight-payment'] | `—` |
| `useGetCreditRent` | `aerolinea/creditos/useGetCreditRent.ts` | ['credit-rent-payment', company] | `—` |
| `useGetCreditSell` | `aerolinea/creditos/useGetCreditSell.ts` | ['credit-sell'] | `—` |
| `useGetCreditStatistics` | `aerolinea/creditos/useGetCreditStatistics.ts` | ["credits-statistics-rentings"] | `—` |
| `useGetCreditStatisticsFlights` | `aerolinea/creditos/useGetCreditStatisticsFlights.ts` | ["credits-statistics-flights"] | `—` |
| `useGetCreditStatisticsRentings` | `aerolinea/creditos/useGetCreditStatisticsRentings.ts` | ["credits-statistics-rentings"] | `—` |
| `useGetAccountById` | `aerolinea/cuentas_contables/useGetAccountById.ts` | ["account", id] | `—` |
| `useGetAccountant` | `aerolinea/cuentas_contables/useGetAccountant.ts` | ["accountants"] | `—` |
| `useGetDailyActivityReport` | `aerolinea/desarrollo/useGetDailyActivities.ts` | ["daily-activity", date, user_id, company] | `—` |
| `useGetRegisterWithActivities` | `aerolinea/desarrollo/useGetRegisterWithActivities.ts` | ["activity-reports"] | `—` |
| `useGetUserActivity` | `aerolinea/desarrollo/useGetUserActivities.ts` | ["user-activity", id] | `—` |
| `useGetCashMovementByAccount` | `aerolinea/movimientos/useGetCashMovementByAccount.ts` | ["movements-by-accounts", cashId, dateParams.from, dateParams.to, company] | `—` |
| `useGetIncomeStatistics` | `aerolinea/movimientos/useGetIncomeStatistics.ts` | ["income-statistics"] | `—` |
| `useGetCashMovements` | `aerolinea/movimientos/useGetMovement.ts` | ['cash-movements', from, to] | `/${company}/cash-movements` |
| `useGetCashMovementById` | `aerolinea/movimientos/useGetMovementById.ts` | ["cashes-movements", id] | `—` |
| `useGetOutputStatistics` | `aerolinea/movimientos/useGetOutputStatistics.ts` | ["output-statistics"] | `—` |
| `useGetRenting` | `aerolinea/rentas/useGetRenting.ts` | ['renting'] | `—` |
| `useGetRentingById` | `aerolinea/rentas/useGetRentingById.ts` | ["rent"] | `—` |
| `useGetRouteById` | `aerolinea/rutas/useGetRouteById.ts` | ["route", id] | `/transmandu/route/${id}` |
| `useGetRoute` | `aerolinea/rutas/useGetRoutes.ts` | ['routes'] | `—` |
| `useGetAircraftStatistics` | `aerolinea/vuelos/useGetAircraftStatistics.ts` | ["flights", aircraftAcronym, company] | `—` |
| `useGetAverageCyclesAndHours` | `aerolinea/vuelos/useGetAverageCyclesAndHours.ts` | ["average-cycles-hours", company, acronym, dateRange] | `—` |
| `useGetFlightHistory` | `aerolinea/vuelos/useGetFlightHistory.ts` | ['flight-history', company, acronym] | `—` |
| `useGetAdministrationFlights` | `aerolinea/vuelos/useGetFlights.ts` | ['credit-flight-payment', from, to] | `/${company}/flights` |
| `useGetFlightsByDateRange` | `aerolinea/vuelos/useGetFlightsByDateRange.ts` | ["flights-by-date-range", company, acronym, dateRange] | `—` |
| `useGetFlightById` | `aerolinea/vuelos/useGetFlightsById.ts` | ["flights", id, company] | `—` |

## ajustes  (13 archivos, 13 hooks)

| Hook | Archivo | queryKey | Endpoint |
|---|---|---|---|
| `useGetAuthorizedEmployees` | `ajustes/autorizados/useGetAuthorizedEmployees.ts` | ["authorized-employees", companySlug] | `—` |
| `useGetAuthorizedEmployeesFromCompany` | `ajustes/autorizados/useGetAuthorizedEmployeesFromCompany.ts` | ["authorized-employees-from-company", companySlug] | `—` |
| `useGetJobTitleById` | `ajustes/cargo/useGetJobTitleById.ts` | ["job_titles", company] | `—` |
| `useGetJobTitles` | `ajustes/cargo/useGetJobTitles.ts` | ['job_titles', company] | `—` |
| `useGetDepartments` | `ajustes/departamento/useGetDepartment.ts` | ['departments', company] | `—` |
| `useGetDepartmentById` | `ajustes/departamento/useGetDepartmentsById.ts` | ["departments", company] | `—` |
| `useGetEmployeeById` | `ajustes/empleados/useGetEmployeeById.ts` | ["employee", id] | `—` |
| `useGetEmployeesByCompany` | `ajustes/empleados/useGetEmployees.ts` | ['employees', company] | `—` |
| `useGetEmployesByDepartment` | `ajustes/empleados/useGetEmployeesByDepartment.ts` | ["employees-by-department", acronym, location_id, company] | `—` |
| `useGetInactiveEmployeesByCompany` | `ajustes/empleados/useGetInactiveEmployees.ts` | ['employees-inactive', company] | `—` |
| `useGetUserDepartamentEmployees` | `ajustes/empleados/useGetUserDepartamentEmployees.ts` | ['departament-employees', company] | `—` |
| `useGetPilotByDni` | `ajustes/piloto/useGetPilotById.ts` | ["pilots", dni] | `—` |
| `useGetLocations` | `ajustes/ubicaciones/useGetLocations.ts` | ['locations'] | `—` |

## curso  (11 archivos, 11 hooks)

| Hook | Archivo | queryKey | Endpoint |
|---|---|---|---|
| `useGetCoursesForCalendar` | `curso/useGetCalendarCourses.ts` | ["course-calendar"] | `—` |
| `useGetCourseAttendanceList` | `curso/useGetCourseAttendanceList.ts` | ["sms-course-attendance-list",course_id] | `—` |
| `useGetCourseAttendanceStats` | `curso/useGetCourseAttendanceStats.ts` | ["course-attendance-stats",course_id] | `—` |
| `useGetCourseById` | `curso/useGetCourseById.ts` | ["course-by-id", id] | `—` |
| `useGetCourseEnrollementStatus` | `curso/useGetCourseEnrollementStatus.ts` | ["enrollment-status-by-course",course_id] | `—` |
| `useGetCourseExamAttendance` | `curso/useGetCourseExamAttendance.ts` | ["course-exam-attendance", company, course_id, exam_id] | `/general/${company}/course/${course_id}/attendance-list` |
| `useGetCourseExams` | `curso/useGetCourseExams.ts` | ["course-exams", course_id] | `/general/${company}/course/${course_id}/exams` |
| `useGetCourseStats` | `curso/useGetCourseStats.ts` | ["course-stats", company, location_id, from, to] | `—` |
| `useGetCoursesByDeparment` | `curso/useGetCoursesByDeparment.ts` | ["department-courses"] | `—` |
| `useGetCoursesByStatusDateRange` | `curso/useGetCoursesByStatusDateRange.ts` | ["course-stats"] | `—` |
| `useGetEmployeeTrainingProfile` | `curso/useGetEmployeeTrainingProfile.ts` | ["employee-training-profile", company, dni] | `/general/${company}/employee-training-profile/${dni}` |

## general  (20 archivos, 20 hooks)

| Hook | Archivo | queryKey | Endpoint |
|---|---|---|---|
| `useAirports` | `general/aeropuertos/useAirports.ts` | ["airports"] | `—` |
| `useGetShippingAgencies` | `general/agencias_envio/useGetShippingAgencies.ts` | ["shipping-agencies", companySlug] | `—` |
| `useGetImage` | `general/archivos/UseGetImage.ts` | ["image", company, origin, fileName] | `—` |
| `useGetDocument` | `general/archivos/useGetDocument.ts` | ["document", company, origin, fileName] | `—` |
| `useGetBanks` | `general/bancos/useGetBanks.ts` | ["banks"] | `—` |
| `useGetClientByDni` | `general/clientes/useGetClientByDni.ts` | ["clients", company, dni] | `—` |
| `useGetClientAddBalanceById` | `general/clientes/useGetClientUpdateBalanceById.ts` | ["balance", company , id ] | `—` |
| `useGetClients` | `general/clientes/useGetClients.ts` | ["clients", company] | `—` |
| `useGetFlightsByClient` | `general/clientes/useGetFlightByClients.ts` | ["flights", dni, company] | `—` |
| `useGetRetailers` | `general/comercios/useGetRetailers.ts` | ["retailers", company] | `—` |
| `useGetManufacturers` | `general/condiciones/useGetConditions.ts` | ["manufacturers"] | `—` |
| `useGetBankAccounts` | `general/cuentas_bancarias/useGetBankAccounts.ts` | ["bank-accounts", companyId] | `—` |
| `useGetBankAccountsByBankId` | `general/cuentas_bancarias/useGetBankAccountsByBankId.ts` | ["bank-accounts-by-bank", bankId, companyId] | `—` |
| `useGetPaymentOptions` | `general/cuentas_bancarias/useGetPaymentOptions.ts` | ["payment-options", companyId] | `—` |
| `useGetManufacturers` | `general/fabricantes/useGetManufacturers.ts` | ["manufacturers", company] | `—` |
| `useGetPaymentMethods` | `general/metodos_pago/useGetPaymentMethods.ts` | ["payment-methods"] | `—` |
| `useGetVendors` | `general/proveedores/useGetVendors.ts` | ["vendors", company] | `—` |
| `useGetBankCards` | `general/tarjetas/useGetBankCards.ts` | ["bank-cards", companyId] | `—` |
| `useGetThirdParties` | `general/terceros/useGetThirdParties.ts` | ["third-parties", slug] | `/${slug}/third-parties` |
| `useGetUnits` | `general/unidades/useGetPrimaryUnits.ts` | ["units",company] | `—` |

## mantenimiento  (71 archivos, 77 hooks)

| Hook | Archivo | queryKey | Endpoint |
|---|---|---|---|
| `useGetGeneralArticleIntakes` | `mantenimiento/almacen/almacen_general/useGetGeneralArticleIntakes.ts` | ['general-article-intakes', selectedCompany?.slug, selectedStation, status, warehouseOnly, range.from, range.to] | `—` |
| `useGetGeneralArticles` | `mantenimiento/almacen/almacen_general/useGetGeneralArticles.ts` | ["general-articles", selectedCompany?.slug] | `—` |
| `useGetIntakeConfirmationPreview` | `mantenimiento/almacen/almacen_general/useGetIntakeConfirmationPreview.ts` | ['general-article-intake-confirmation-preview', selectedCompany?.slug, intakeId] | `—` |
| `useGetArticleUnitConversions` | `mantenimiento/almacen/articulos/useArticleUnitConversions.ts` | — | `—` |
| `useGetAllUnitConversions` | `mantenimiento/almacen/articulos/useArticleUnitConversions.ts` | ["unit-conversions", company] | `—` |
| `useMutateUnitConversionRow` | `mantenimiento/almacen/articulos/useArticleUnitConversions.ts` | _(useMutation)_ | `—` |
| `useCreateArticleUnitConversion` | `mantenimiento/almacen/articulos/useArticleUnitConversions.ts` | _(useMutation)_ | `—` |
| `useUpdateArticleUnitConversion` | `mantenimiento/almacen/articulos/useArticleUnitConversions.ts` | _(useMutation)_ | `—` |
| `useDeleteArticleUnitConversion` | `mantenimiento/almacen/articulos/useArticleUnitConversions.ts` | _(useMutation)_ | `—` |
| `useGetAllWarehouseZones` | `mantenimiento/almacen/articulos/useGetAllWarehouseZones.ts` | ["warehouse-zones-all", selectedCompany?.slug, selectedStation] | `—` |
| `useGetArticle` | `mantenimiento/almacen/articulos/useGetArticle.ts` | _(useMutation)_ | `—` |
| `useGetArticleById` | `mantenimiento/almacen/articulos/useGetArticleById.ts` | ["article", id, company] | `—` |
| `useGetArticleDocumentTypes` | `mantenimiento/almacen/articulos/useGetArticleDocumentTypes.ts` | ["article-document-types", company] | `—` |
| `useGetArticlesByBatch` | `mantenimiento/almacen/articulos/useGetArticlesByBatch.ts` | _(useMutation)_ | `—` |
| `useGetArticlesByCategory` | `mantenimiento/almacen/articulos/useGetArticlesByCategory.ts` | ['articles-by-category', company, location_id, category] | `—` |
| `useGetArticlesByStatus` | `mantenimiento/almacen/articulos/useGetArticlesByStatus.ts` | ['articles', selectedCompany?.slug, status] | `—` |
| `useGetConversionByConsmable` | `mantenimiento/almacen/articulos/useGetConvertionsByConsumableId.ts` | ["conversions-by-consumable", company, article_id] | `—` |
| `useGetConversionByGeneralArticle` | `mantenimiento/almacen/articulos/useGetConvertionsByGeneralArticleId.ts` | ["conversions-by-general-article", company, general_article_id] | `—` |
| `useGetInReceptionArticles` | `mantenimiento/almacen/articulos/useGetInReceptionArticles.ts` | ["in-reception-articles", company, location_id] | `—` |
| `useGetInTransitArticles` | `mantenimiento/almacen/articulos/useGetInTransitArticles.ts` | ["in-transit-articles", company, location_id] | `—` |
| `useInventario` | `mantenimiento/almacen/articulos/useGetInventario.ts` | ['inventario'] | `—` |
| `useGetReceptionHistory` | `mantenimiento/almacen/articulos/useGetReceptionHistory.ts` | [ "reception-history", selectedCompany?.slug, range.from, range.to, ] | `—` |
| `useGetWarehouseArticlesByCategory` | `mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory.ts` | ["warehouse-articles", selectedCompany?.slug, selectedStation, page, per_page, category, status, part_number, is_hazardous, sort?.id, sort?.desc, filters?.condition, filters?.tool_status, filters?.zone, filters?.part_number_col, filters?.serial_col, filters?.description_col] | `—` |
| `useGetAllWarehouseArticlesByCategory` | `mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory.ts` | ["warehouse-articles-all", selectedCompany?.slug, selectedStation, category] | `—` |
| `useGetEmployeesForBox` | `mantenimiento/almacen/caja_herramientas/useGetEmployeeForBox.ts` | ["work-orders-employee", company, location_id] | `—` |
| `useGetEditToolBoxTools` | `mantenimiento/almacen/caja_herramientas/useGetToolBoxTools.ts` | ['tool-box-tools', company, location_id, id] | `—` |
| `useGetToolBoxes` | `mantenimiento/almacen/caja_herramientas/useGetToolBoxes.ts` | ['tool-boxes', company, location_id] | `—` |
| `useGetFuelMovementById` | `mantenimiento/almacen/combustible/useGetFuelMovementById.ts` | — | `—` |
| `useGetFuelMovements` | `mantenimiento/almacen/combustible/useGetFuelMovements.ts` | — | `—` |
| `useGetFuelSummary` | `mantenimiento/almacen/combustible/useGetFuelSummary.ts` | — | `—` |
| `useGetFuelTraceability` | `mantenimiento/almacen/combustible/useGetFuelTraceability.ts` | — | `—` |
| `useGetFuelVehicles` | `mantenimiento/almacen/combustible/useGetFuelVehicles.ts` | — | `—` |
| `useGetWarehousesEmployees` | `mantenimiento/almacen/empleados/useGetWarehousesEmployees.ts` | ['warehouses-employees', company, location_id] | `—` |
| `useGetBatchById` | `mantenimiento/almacen/renglones/useGetBatchById.ts` | ["batch", batch_id, company] | `—` |
| `useGetBatches` | `mantenimiento/almacen/renglones/useGetBatches.ts` | ["batches", company] | `—` |
| `useSearchBatchesByPartNumber` | `mantenimiento/almacen/renglones/useGetBatchesByArticlePartNumber.ts` | ["search-batches", company, location_id, part_number , category] | `—` |
| `useGetBatchesByCategory` | `mantenimiento/almacen/renglones/useGetBatchesByCategory.ts` | ["search-batches", selectedCompany, selectedStation, category] | `—` |
| `useGetBatchesByLocationId` | `mantenimiento/almacen/renglones/useGetBatchesByLocationId.ts` | _(useMutation)_ | `—` |
| `useGetBatchesWithArticlesCount` | `mantenimiento/almacen/renglones/useGetBatchesWithArticleCount.ts` | ["batches", "company"] | `—` |
| `useGetBatchesWithArticlesByLocation` | `mantenimiento/almacen/renglones/useGetBatchesWithArticlesByLocation.ts` | _(useMutation)_ | `—` |
| `useGetBatchesWithInWarehouseArticles` | `mantenimiento/almacen/renglones/useGetBatchesWithInWarehouseArticles.ts` | ['batches-in-warehouse', company, location_id, category] | `—` |
| `useSearchArticlesByPartNumber` | `mantenimiento/almacen/renglones/useSearchArticlesByPartNumber.ts` | ["search-articles", company, location_id, part_number] | `—` |
| `useSearchBatchesWithArticles` | `mantenimiento/almacen/renglones/useSearchBatchesWithArticles.ts` | ["search-batches-with-articles", company, location_id, part_number] | `—` |
| `useGetBalanceAndTotalReport` | `mantenimiento/almacen/reportes/useGetBalanceAndTotalReport.ts` | _(useMutation)_ | `—` |
| `useGetDispatchCostReport` | `mantenimiento/almacen/reportes/useGetDispatchCostReport.ts` | _(useMutation)_ | `—` |
| `useGetDispatchReport` | `mantenimiento/almacen/reportes/useGetDispatchReport.ts` | _(useMutation)_ | `—` |
| `useGetDispatchWorkOrders` | `mantenimiento/almacen/reportes/useGetDispatchWorkOrders.ts` | ["dispatch-work-orders", company] | `/${company}/dispatch-work-orders` |
| `useGetWarehouseReport` | `mantenimiento/almacen/reportes/useGetWarehouseReport.ts` | ['warehouse-report', company, location_id] | `—` |
| `useGetDispatchedArticles` | `mantenimiento/almacen/salidas_entradas/useGetDispatchedArticles.ts` | ['dispatched-articles', company] | `—` |
| `useGetDispatchesByLocation` | `mantenimiento/almacen/solicitudes/useGetDispatchesRequests.ts` | ["dispatches-requests", selectedCompany?.slug, selectedStation] | `—` |
| `useGetPendingDispatches` | `mantenimiento/almacen/solicitudes/useGetPendingDispatchRequests.ts` | ['dispatches-requests-in-process', company, location_id] | `—` |
| `useDownloadInProgressRequisitionsPdf` | `mantenimiento/compras/useDownloadInProgressRequisitionsPdf.ts` | _(useMutation)_ | `—` |
| `useDownloadRequisitionPdf` | `mantenimiento/compras/useDownloadRequisitionPdf.ts` | _(useMutation)_ | `—` |
| `useGetActiveGeneralArticleRequisitions` | `mantenimiento/compras/useGetActiveGeneralArticleRequisitions.ts` | ['active-general-article-requisitions', selectedCompany?.slug, selectedStation] | `—` |
| `useGetPurchaseOrder` | `mantenimiento/compras/useGetPurchaseOrder.ts` | ["purchase-order", company, order_number] | `—` |
| `useGetPurchaseOrderByQuoteId` | `mantenimiento/compras/useGetPurchaseOrderByQuoteId.ts` | ['purchaseOrderByQuote', company, quoteId] | `—` |
| `useGetPurchaseOrders` | `mantenimiento/compras/useGetPurchaseOrders.ts` | ["purchase-orders", companyId, locationId] | `—` |
| `useGetQuoteByQuoteNumber` | `mantenimiento/compras/useGetQuoteByQuoteNumber.ts` | ["quote", company, quote_number] | `—` |
| `useGetQuotes` | `mantenimiento/compras/useGetQuotes.ts` | ["quotes", companyId, locationId] | `—` |
| `useGetRequisitionByOrderNumber` | `mantenimiento/compras/useGetRequisitionByOrderNumber.ts` | ['requisition-order', company, order_number] | `—` |
| `useGetRequisitionPdfReceivers` | `mantenimiento/compras/useGetRequisitionPdfReceivers.ts` | ['requisition-pdf-receivers', company] | `—` |
| `useGetRequisition` | `mantenimiento/compras/useGetRequisitions.ts` | ["requisitions-orders", company, location_id, type] | `—` |
| `useGetTrackingInfo` | `mantenimiento/compras/useGetTrackingInfo.ts` | ["tracking"] | `—` |
| `useGetIncomingArticles` | `mantenimiento/control_calidad/useGetIncomingArticles.ts` | ['incoming-articles', selectedCompany?.slug] | `—` |
| `useGetIncomingChecks` | `mantenimiento/control_calidad/useGetIncomingInspectionChecks.ts` | ["incoming-checks", selectedCompany?.slug] | `—` |
| `useGetWaitingToLocateArticles` | `mantenimiento/control_calidad/useGetWaitingToLocateArticles.ts` | ['waiting-to-locate-articles', selectedCompany?.slug] | `—` |
| `useCheckWorkOrderArticles` | `mantenimiento/planificacion/useCheckWorkOrderArticles.ts` | _(useMutation)_ | `—` |
| `useGetAircraftsParts` | `mantenimiento/planificacion/useGetAircraftParts.ts` | ["aircraft-parts", company] | `—` |
| `useGetFlightControl` | `mantenimiento/planificacion/useGetFlightsControl.ts` | ["flight-control"] | `—` |
| `useGetMaintenanceAircrafts` | `mantenimiento/planificacion/useGetMaintenanceAircrafts.ts` | ["aircrafts", company] | `—` |
| `useGetMaintenanceServices` | `mantenimiento/planificacion/useGetMaintenanceServices.ts` | ["maintenance-services", company] | `—` |
| `useGetMaintenanceAircraftByAcronym` | `mantenimiento/planificacion/useGetMaitenanceAircraftByAcronym.ts` | ["aircraft", company, acronym] | `—` |
| `useGetPlanificationEvents` | `mantenimiento/planificacion/useGetPlanificationEvents.ts` | ["planification-events", selectedStation, selectedCompany?.slug] | `—` |
| `useGetServicesByManufacturer` | `mantenimiento/planificacion/useGetServicesByManufacturer.ts` | ["manufacturer-services", manufacturer_id, company] | `—` |
| `useGetWorkOrderByOrderNumber` | `mantenimiento/planificacion/useGetWorkOrderByOrderNumber.ts` | ["work-order", order_number, company] | `—` |
| `useGetWorkOrderEmployees` | `mantenimiento/planificacion/useGetWorkOrderEmployees.ts` | ["employees", company] | `—` |
| `useGetWorkOrders` | `mantenimiento/planificacion/useGetWorkOrders.ts` | ["work-orders", location_id, company] | `—` |

## notifications  (1 archivos, 1 hooks)

| Hook | Archivo | queryKey | Endpoint |
|---|---|---|---|
| `useNotifications` | `notifications/useNotifications.ts` | ['notifications', normalizedCompany] | `—` |

## operaciones  (15 archivos, 15 hooks)

| Hook | Archivo | queryKey | Endpoint |
|---|---|---|---|
| `useGetAvailableShipments` | `operaciones/cargo/useGetAvailableShipments.ts` | ["available-shipments", month, year, aircraftId, day] | `—` |
| `useGetCargoManifest` | `operaciones/cargo/useGetCargoManifest.ts` | ["cargo_manifests", month, year, aircraftId] | `—` |
| `useGetCargoManifestById` | `operaciones/cargo/useGetCargoManifestById.ts` | ["cargo-manifests", company, id] | `—` |
| `useGetCargoManifests` | `operaciones/cargo/useGetCargoManifests.ts` | ["cargo-manifests", month, year, aircraftId, day] | `—` |
| `useGetCargoShipmentById` | `operaciones/cargo/useGetCargoShipmentById.ts` | ["cargo-shipment", company, id] | `—` |
| `useGetCargoShipments` | `operaciones/cargo/useGetCargoShipments.ts` | ["cargo-shipments", company, month, year] | `/${company}/cargo-shipments` |
| `useGetCargoShipmentsByAircraft` | `operaciones/cargo/useGetCargoShipmentsByAircraft.ts` | [ "cargo-shipments-by-aircraft", company, aircraft_id, month, year, ] | `/${company}/cargo-shipments/aircraft/${aircraft_id}` |
| `useGetCargoShipmentsByExternalAircraft` | `operaciones/cargo/useGetCargoShipmentsByExternalAircraft.ts` | [ "cargo-shipments-by-external-aircraft", company, externalAircraft, month, year, ] | `/${company}/cargo-shipments/external-aircraft/${encodeURIComponent(externalAircraft || ` |
| `useGetCargoStatsByAircraft` | `operaciones/cargo/useGetCargoStatsByAircraft.ts` | ["cargo-stats-by-aircraft", company, month, year] | `/${company}/cargo-shipments/stats-by-aircraft` |
| `useGetCarriers` | `operaciones/cargo/useGetCarriers.ts` | ["carriers", company] | `—` |
| `useGetExternalAircraftSuggestions` | `operaciones/cargo/useGetExternalAircraftSuggestions.ts` | ["External-suggestions", company, search] | `/${company}/cargo-shipments/external-aircraft-suggestions` |
| `useGetExternalPilots` | `operaciones/cargo/useGetExternalPilots.ts` | ["external-pilots"] | `—` |
| `useGetNextGuide` | `operaciones/cargo/useGetNextGuide.ts` | ["cargoNextGuide", company, date, aircraftId, externalAircraft] | `—` |
| `useGetNextManifestNumber` | `operaciones/cargo/useGetNextManifestNumber.ts` | ["next-manifest-number", month, year, aircraftId, externalAircraft] | `—` |
| `useGetProductSuggestions` | `operaciones/cargo/useGetProductSuggestions.ts` | ["product-suggestions", company, search] | `/${company}/cargo-shipment-items/suggestions` |

## sistema  (25 archivos, 30 hooks)

| Hook | Archivo | queryKey | Endpoint |
|---|---|---|---|
| `useGetWarehouseDashboard` | `sistema/dashboard/useWarehouseDashboard.tsx` | ['warehouse-dashboard', company, location_id] | `—` |
| `useGetErrorReports` | `sistema/reportes/useGetErrorReports.ts` | ["error-reports", filters] | `—` |
| `useGetImportHistoryList` | `sistema/reportes/useGetImportHistoryList.ts` | ["error-report-imports"] | `—` |
| `useGetImportHistoryStatus` | `sistema/reportes/useGetImportHistoryStatus.ts` | ["error-report-imports", id] | `—` |
| `useGetActiveCompanyLogo` | `sistema/useGetActiveCompanyLogo.ts` | ['active-company-logo', company] | `—` |
| `useGetCompanies` | `sistema/useGetCompanies.ts` | ['companies'] | `—` |
| `useGetCompaniesWithWarehouses` | `sistema/useGetCompaniesWithWarehouses.ts` | ['companieswithwarehouses'] | `—` |
| `useGetEmployeesByDepartment` | `sistema/useGetEmployeesByDepartament.ts` | ["employees-by-department", department_acronym, company] | `—` |
| `useGetLocationsByCompanies` | `sistema/useGetLocationsByCompanies.ts` | ['company-locations'] | `/locations-by-companies` |
| `useGetLocationsByCompany` | `sistema/useGetLocationsByCompany.ts` | ['location'] | `—` |
| `useGetLocationsByCompanyId` | `sistema/useGetLocationsByCompanyId.ts` | _(useMutation)_ | `—` |
| `useGetModules` | `sistema/useGetModules.ts` | ["modules"] | `—` |
| `useGetModulesByCompanyId` | `sistema/useGetModulesByCompanyId.ts` | _(useMutation)_ | `—` |
| `useGetUsers` | `sistema/useGetUsers.ts` | ['users'] | `—` |
| `useGetWarehouses` | `sistema/useGetWarehouses.ts` | ['warehouses'] | `—` |
| `useGetWarehousesByUser` | `sistema/useGetWarehousesByUser.ts` | ['warehousesByUser'] | `—` |
| `useIsOmac` | `sistema/useIsOmac.ts` | ['is_omac', company] | `—` |
| `useGetPermissions` | `sistema/usuario/useGetPermissions.ts` | ['permissions'] | `—` |
| `useGetPermissionsByCompanyId` | `sistema/usuario/useGetPermissionsByCompanyId.ts` | _(useMutation)_ | `—` |
| `useGetRoles` | `sistema/usuario/useGetRoles.ts` | ['roles', companyId] | `—` |
| `useGetUserById` | `sistema/usuario/useGetUserById.ts` | ['user', id] | `—` |
| `useGetUserLocationsByCompanyId` | `sistema/usuario/useGetUserLocationsByCompanyId.ts` | _(useMutation)_ | `—` |
| `useUserLocationsByCompanyId` | `sistema/usuario/useGetUserLocationsByCompanyId.ts` | — | `—` |
| `useGetUsers` | `sistema/usuario/useGetUsers.ts` | ['users'] | `—` |
| `useMyEmployee` | `sistema/usuario/useMyEmployee.ts` | ["me-employee", companySlug, user?.id] | `—` |
| `useRequestPasswordReset` | `sistema/usuario/usePasswordResetRequests.ts` | _(useMutation)_ | `/password-reset-requests` |
| `usePendingPasswordResets` | `sistema/usuario/usePasswordResetRequests.ts` | ["password-reset-requests", "pending"] | `/password-reset-requests/pending` |
| `usePasswordResetRequests` | `sistema/usuario/usePasswordResetRequests.ts` | ["password-reset-requests", status ?? "all"] | `/password-reset-requests` |
| `useResolvePasswordReset` | `sistema/usuario/usePasswordResetRequests.ts` | ["password-reset-requests"] | `/password-reset-requests/${id}/resolve` |
| `useRejectPasswordReset` | `sistema/usuario/usePasswordResetRequests.ts` | ["password-reset-requests"] | `/password-reset-requests/${id}/reject` |

## sms  (64 archivos, 70 hooks)

| Hook | Archivo | queryKey | Endpoint |
|---|---|---|---|
| `useGetBulletinsWithoutActivity` | `sms/boletin/useGetBulletinsWithoutActivity.ts` | ["bulletins-without-activity", company] | `—` |
| `useGetSafetyBulletins` | `sms/boletin/useGetSafetyBulletins.ts` | ["safety-bulletins", company] | `—` |
| `useGetSafetyBulletinsByYear` | `sms/boletin/useGetSafetyBulletinsByYear.ts` | ["safety-bulletins", company, year] | `—` |
| `useGetAssessmentQuestions` | `sms/mantenimiento/useGetAssessmentQuestions.ts` | ["assessment-questions", company] | `—` |
| `useGetHazardNotificationByReportNumber` | `sms/mantenimiento/useGetHazardNotificationByReportNumber.ts` | ["hazard-notification-by-report", company, reportNumber] | `—` |
| `useGetHazardNotifications` | `sms/mantenimiento/useGetHazardNotifications.ts` | ["hazard-notifications", company] | `—` |
| `useGetObligatoryReports` | `sms/mantenimiento/useGetObligatoryReports.ts` | ["obligatory-reports"] | `—` |
| `useGetVoluntaryReportById` | `sms/mantenimiento/useGetVoluntaryReportById.ts` | ["voluntary-report", company, id] | `—` |
| `useGetVoluntaryReports` | `sms/mantenimiento/useGetVoluntaryReports.ts` | ["voluntary-reports", company] | `—` |
| `useGetNextReportNumber` | `sms/reporte_obligatorio/useGetNextReportNumber.ts` | ["next-obligatory-report-number", company] | `/${company}/sms/next-obligatory-report-number` |
| `useGetNextReportNumber` | `sms/reporte_voluntario/useGetNextReportNumber.ts` | ["next-voluntary-report-number", company] | `/${company}/sms/next-voluntary-report-number` |
| `useGetEmailCompletedSurvey` | `sms/survey/useGetEmailCompletedSurvey.ts` | ["survey-is-completed", company, id, email] | `—` |
| `useGetSurveyResponses` | `sms/survey/useGetResponsesBySurvey.ts` | ["survey-responses", selectedCompany?.slug] | `—` |
| `useGetSurveyResponsesByUser` | `sms/survey/useGetResponsesByUser.ts` | ["survey-responses-by-user", company, survey_number, data] | `—` |
| `useGetSurveyByNumber` | `sms/survey/useGetSurveyByNumber.ts` | ["survey-by-number", company, survey_number] | `—` |
| `useGetSurveySettingNumbers` | `sms/survey/useGetSurveySettingNumbers.ts` | ["survey-setting", company] | `—` |
| `useGetSurveyStats` | `sms/survey/useGetSurveyStatistics.ts` | ["survey-responses", selectedCompany?.slug, survey_number] | `—` |
| `useGetSurveys` | `sms/survey/useGetSurveys.ts` | ["surveys", selectedCompany?.slug, selectedStation] | `—` |
| `useGetActivityAttendanceList` | `sms/useGetActivityAttendanceList.ts` | ["sms-activity-attendance-list", activityNumber] | `—` |
| `useGetActivityCategories` | `sms/useGetActivityCategories.ts` | ["sms-activity-categories", selectedCompany?.slug] | `—` |
| `useGetSMSCertificates` | `sms/useGetCertificates.ts` | ["sms-certificates", company, employeeDni] | `/${company}/sms/certificates` |
| `useGetSMSCoursesList` | `sms/useGetCertificates.ts` | ["sms-courses-list", company] | `/${company}/sms/courses-list` |
| `useGetEmployeesList` | `sms/useGetCertificates.ts` | ["sms-employees-list", company] | `/${company}/sms/employees-list` |
| `useGetCourseEnrolledEmployees` | `sms/useGetCourseEnrolledEmployees.ts` | ["employees-course",course_id] | `—` |
| `useGetDangerIdentifications` | `sms/useGetDangerIdentification.ts` | ["danger-identifications", company] | `—` |
| `useGetDangerIdentificationById` | `sms/useGetDangerIdentificationById.ts` | ["danger-identification", id] | `—` |
| `useGetDangerIdentificationWithAllById` | `sms/useGetDangerIdentificationWithAllById.ts` | ["danger-identification/with-all-by", id] | `—` |
| `useGetDangerIdentificationsCountedByType` | `sms/useGetDangerIdentificationsCountedByType.ts` | [ "danger-identifications-counted-by-type", company, from, to, reportType, ] | `—` |
| `useGetEnrolledStatus` | `sms/useGetEnrolledStatus.ts` | ["enrollment-status-by-activity",activity_id] | `—` |
| `useGetIdentificationStatsBySourceName` | `sms/useGetIdentificationStatsBySourceName.ts` | [ "danger-identifications-information-source-count-by-name", company, from, to, reportType, ] | `—` |
| `useGetIdentificationStatsBySourceType` | `sms/useGetIdentificationStatsBySourceType.ts` | [ "danger-identifications-information-source-count-by-type", company, from, to, reportType, ] | `—` |
| `useGetInformationSources` | `sms/useGetInformationSource.ts` | ["information-sources"] | `—` |
| `useGetMeasureFollowUpControl` | `sms/useGetMeasureFollowUpControl.ts` | ["follow-up-controls", data.company, data.measure_id] | `—` |
| `useGetMitigationMeasure` | `sms/useGetMitigationMeasure.ts` | ["mitigation-measures"] | `—` |
| `useGetMitigationTable` | `sms/useGetMitigationTable.ts` | ["analysis", company] | `—` |
| `useGetNewReports` | `sms/useGetNewReports.ts` | ["new-reports", company] | `—` |
| `useGetNextActivityNumber` | `sms/useGetNextActivityNumber.ts` | ["next-activity-number", company] | `/${company}/sms/next-activity-number` |
| `useGetObligatoryReportAverage` | `sms/useGetObligatoryReportAverage.ts` | [ "obligatory-reports-average-by-date-range", company, from_first, to_first, from_second, to_second, ] | `—` |
| `useGetObligatoryReportById` | `sms/useGetObligatoryReportById.ts` | ["obligatory-report", company, id] | `—` |
| `useGetObligatoryReports` | `sms/useGetObligatoryReports.ts` | ["obligatory-reports"] | `—` |
| `useGetPilots` | `sms/useGetPilots.ts` | ["pilots"] | `—` |
| `useGetPostRiskCountByDateRange` | `sms/useGetPostRiskByDateRange.ts` | ["post-risk-count-by-date-range", company, from, to, reportType] | `—` |
| `useGetReportsNumberByMonth` | `sms/useGetReportsByMonth.ts` | ["reports-number-by-month", company, from, to] | `—` |
| `useGetReportsCountedByArea` | `sms/useGetReportsCountedByArea.ts` | ["reports-counted-by-area", company, from, to, reportType] | `—` |
| `useGetRiskCountByDateRange` | `sms/useGetRiskByDateRange.ts` | [ "risk-count-by-date-range", company, from, to, reportType, ] | `—` |
| `useGetSMSActivities` | `sms/useGetSMSActivities.ts` | ["sms-activities", company, from, to] | `—` |
| `useGetSMSActivitiesForCalendar` | `sms/useGetSMSActivitiesForCalendar.ts` | ["sms-calendar-activities"] | `—` |
| `useGetSMSActivityAttendanceStats` | `sms/useGetSMSActivityAttendanceStats.ts` | ["sms-activity-attendance-stats", activity_id] | `—` |
| `useGetSMSActivityAttendanceStatus` | `sms/useGetSMSActivityAttendanceStatus.ts` | ["sms-activity-attendance-status",activity_id] | `—` |
| `useGetSMSActivityByNumber` | `sms/useGetSMSActivityByNumber.ts` | ["sms-activity", activityNumber] | `—` |
| `useGetSMSActvityEnrollmentEmployeesStatus` | `sms/useGetSMSActivityEnrollmentEmployeesStatus.ts` | ["sms-activity-status-employees"] | `—` |
| `useGetSMSActivityStats` | `sms/useGetSMSActivityStats.ts` | ["sms-activity-stats", companySlug, stationId, from, to] | `/${companySlug}/sms/activities-stats` |
| `useGetSMSTraining` | `sms/useGetSMSTraining.ts` | ["sms-training", company] | `—` |
| `useGetTotalDangerIdentificationsCountedByType` | `sms/useGetTotalDangerIdentificationsCountedByType.ts` | ["total-danger-identifications-counted-by-type",company, from, to] | `—` |
| `useGetTotalIdentificationStatsBySourceName` | `sms/useGetTotalIdentificationStatsBySoruceName.ts` | ["total-danger-identifications-information-source-count-by-name",company, from, to] | `—` |
| `useGetTotalIdentificationStatsBySourceType` | `sms/useGetTotalIdentificationStatsBySoruceType.ts` | ["total-danger-identifications-information-source-count-by-type",company, from, to] | `—` |
| `useGetTotalPostRiskCountByDateRange` | `sms/useGetTotalPostRiskByDateRange.ts` | ["total-post-risk-count-by-date-range",company, from, to] | `—` |
| `useGetTotalReportsCountedByArea` | `sms/useGetTotalReportsCountedByArea.ts` | ["total-reports-counted-by-area",company, from, to] | `—` |
| `useGetTotalReportsStatsByYear` | `sms/useGetTotalReportsStatsByYear.ts` | ["total-reports-stats-by-year", company,from, to] | `—` |
| `useGetTotalRiskCountByDateRange` | `sms/useGetTotalRiskByDateRange.ts` | ["total-risk-count-by-date-range",company, from, to] | `—` |
| `useGetUniformItems` | `sms/useGetUniforms.ts` | ["uniform-items", company, onlyActive] | `/${company}/sms/uniforms/items` |
| `useGetUniformMovements` | `sms/useGetUniforms.ts` | ["uniform-movements", company, filters] | `/${company}/sms/uniforms/movements` |
| `useGetUniformArticleTypes` | `sms/useGetUniforms.ts` | ["uniform-article-types", company, onlyActive] | `/${company}/sms/uniforms/article-types` |
| `useGetUniformBrands` | `sms/useGetUniforms.ts` | ["uniform-brands", company, onlyActive] | `/${company}/sms/uniforms/brands` |
| `useGetUniformOptions` | `sms/useGetUniforms.ts` | ["uniform-options", company] | `/${company}/sms/uniforms/options` |
| `useGetVoluntaryReportById` | `sms/useGetVoluntaryReportById.ts` | ["voluntary-report", company, id] | `—` |
| `useGetVoluntaryReportingStatsByYear` | `sms/useGetVoluntaryReportingStatisticsByYear.ts` | ["reports-stats-by-year", company, from, to, reportType] | `—` |
| `useGetVoluntaryReports` | `sms/useGetVoluntaryReports.ts` | ["voluntary-reports", company] | `—` |
| `useGetVoluntaryReportsByDateRange` | `sms/useGetVoluntaryReportsByDateRange.ts` | ["voluntary-reports-by-date-range"] | `—` |
| `useGetVoluntaryReportsCountedByAirportLocation` | `sms/useGetVoluntaryReportsCountedByAirportLocation.ts` | [ "voluntary-reports-counted-by-airport-location", ] | `—` |

## supervisor  (1 archivos, 11 hooks)

| Hook | Archivo | queryKey | Endpoint |
|---|---|---|---|
| `useGetSupervisorGeneralArticles` | `supervisor/useSupervisorGeneralArticles.ts` | ["supervisor-general-articles", selectedCompany?.slug, selectedStation] | `—` |
| `useGetDuplicateCandidates` | `supervisor/useSupervisorGeneralArticles.ts` | ["supervisor-duplicate-candidates", selectedCompany?.slug, selectedStation] | `—` |
| `useCombinedCostHistory` | `supervisor/useSupervisorGeneralArticles.ts` | ["supervisor-combined-cost-history", selectedCompany?.slug, articleIds] | `—` |
| `useMergePreview` | `supervisor/useSupervisorGeneralArticles.ts` | _(useMutation)_ | `—` |
| `useMergeGeneralArticles` | `supervisor/useSupervisorGeneralArticles.ts` | _(useMutation)_ | `—` |
| `useUpdateSupervisorArticle` | `supervisor/useSupervisorGeneralArticles.ts` | _(useMutation)_ | `—` |
| `useGetArticleDetail` | `supervisor/useSupervisorGeneralArticles.ts` | ["supervisor-article-detail", selectedCompany?.slug, articleId] | `—` |
| `useBulkEditArticles` | `supervisor/useSupervisorGeneralArticles.ts` | _(useMutation)_ | `—` |
| `useGetArticleTimeline` | `supervisor/useSupervisorGeneralArticles.ts` | ["supervisor-article-timeline", selectedCompany?.slug, articleId] | `—` |
| `useGetMergeHistory` | `supervisor/useSupervisorGeneralArticles.ts` | ["supervisor-merge-history", selectedCompany?.slug] | `—` |
| `useUndoMerge` | `supervisor/useSupervisorGeneralArticles.ts` | [key] | `—` |
