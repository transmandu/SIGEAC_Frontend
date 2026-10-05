# Catálogo de `components/` — Referencia completa

> Inventario de la interfaz. Antes de crear un componente, búscalo aquí: la causa
> más común de duplicación en este proyecto es no saber que algo ya existe.
>
> Cifras al momento de escribir: **593 archivos**, de los cuales 35 no tienen ningún
> consumidor.

---

## Índice

1. [Cómo está organizado](#1-cómo-está-organizado)
2. [El flujo tabla, diálogo y formulario](#2-el-flujo-tabla-diálogo-y-formulario)
3. [Piezas reutilizables que ya existen](#3-piezas-reutilizables-que-ya-existen)
4. [Convenciones de la interfaz](#4-convenciones-de-la-interfaz)
5. [Cuándo reutilizar y cuándo NO](#5-cuándo-reutilizar-y-cuándo-no)
6. [Nombres: cuándo renombrar en vez de comentar](#6-nombres-cuándo-renombrar-en-vez-de-comentar)
7. [Antes de crear un componente nuevo](#7-antes-de-crear-un-componente-nuevo)
8. [Deuda técnica conocida](#8-deuda-técnica-conocida)
9. [Referencia completa por tipo](#9-referencia-completa-por-tipo)

---

## 1. Cómo está organizado

`components/` se agrupa por **tipo de artefacto**, no por módulo:

| Carpeta | Qué contiene | Nº |
|---|---|---|
| `forms/` | Formularios (react-hook-form + zod) | 168 |
| `dialogs/` | Modales que envuelven formularios | 116 |
| `dropdowns/` | Menús de acciones por fila de tabla | 61 |
| `tour/` | Pasos de los tutoriales guiados | 49 |
| `misc/` | Utilidades transversales de UI | 47 |
| `ui/` | Primitivas shadcn/ui | 47 |
| `layout/` | Navbar, contenedores, estructura | 18 |
| `dashboard/` | Widgets y secciones de tableros | 17 |
| `library/` | Biblioteca digital | 14 |
| `cards/`, `charts/`, `selects/`, `tables/` | Piezas específicas | 10, 9, 7, 7 |
| `side-panels/`, `sidebar/`, `pdf/` | Paneles, menú lateral, documentos | 6, 6, 5 |

Dentro de `forms/`, `dialogs/` y `dropdowns/` hay un segundo nivel por área
(`ajustes/`, `mantenimiento/`, `aerolinea/`…). **Ese segundo nivel arrastra nombres
históricos que ya no coinciden con `app/`**: lo que vive en `aerolinea/` suele
consumirse desde `administracion/` o `sms/`, y lo de `mantenimiento/` desde
`almacen/`, `compras/` o `planificacion/`.

No te fíes de la carpeta para saber quién lo usa; usa la tabla de la
[sección 9](#9-referencia-completa-por-tipo), que indica el módulo real.

---

## 2. El flujo tabla, diálogo y formulario

Es **el patrón central del sistema**. Entenderlo evita el 80% de las dudas.

```
app/[company]/<modulo>/<recurso>/
├── page.tsx        → obtiene datos con un hook, monta la tabla
├── columns.tsx     → define columnas; la última monta <XDropdownActions>
└── data-table.tsx  → arma la tabla y monta <CreateXDialog>
```

Y en `components/`:

```
CreateXDialog      (dialogs/)    → botón "Nuevo" + modal
  └── CreateXForm  (forms/)      → campos + submit, recibe onClose

XDropdownActions   (dropdowns/)  → menú "⋮" de cada fila
  ├── diálogo de editar  → EditXForm (forms/)
  └── diálogo de eliminar → confirmación + useDeleteX
```

### Por qué hay 54 `CreateDialog` y solo 2 `EditDialog`

Porque **editar y eliminar viven dentro del `DropdownActions`**, con sus diálogos
declarados inline en el mismo archivo. Solo la creación necesita un diálogo propio,
porque su disparador está en la cabecera de la tabla y no en una fila.

Si buscas "dónde se edita X", no busques `EditXDialog`: abre `XDropdownActions.tsx`.

### El contrato `onClose`

Los formularios reciben `onClose` y lo llaman al terminar. El diálogo es dueño del
estado `open`; el formulario solo avisa:

```tsx
const [open, setOpen] = useState(false);
// ...
<CreateBankForm onClose={() => setOpen(false)} />
```

---

## 3. Piezas reutilizables que ya existen

**Búscalas aquí antes de escribir una versión propia.**

### Tablas — `components/tables/`

| Componente | Para qué |
|---|---|
| `DataTablePagination` | Paginación completa (usada por 70 tablas) |
| `DataTableViewOptions` | Selector de columnas visibles |
| `DataTableFacetedFilter` | Filtro por valores de una columna |
| `DataTableHeader` / `DataTableHeaderAct` | Cabeceras ordenables |
| `StatusColumnHeader` | Cabecera para columnas de estado |
| `LoadingDataTable` | Esqueleto de carga |

Complementos en `ui/`: `DataTableColumHeader`, y en la raíz `DataTableMixedSorting.tsx`.

### Campos de formulario

| Componente | Ubicación | Para qué |
|---|---|---|
| `ComboboxField` | `ui/` | Select con búsqueda |
| `DatePickerField` | `ui/` | Fecha con calendario |
| `timePicker` | `ui/` | Hora |
| `AmountInput` | `misc/` | Montos con formato de moneda |
| `MultiInputField` | `misc/` | Lista de valores repetibles |
| `CompanyMultiSelect` | `misc/` | Selección múltiple de empresas |
| `PaymentMethodMultiSelect` | `misc/` | Métodos de pago |

### Filtros y utilidades

| Componente | Ubicación | Para qué |
|---|---|---|
| `DataFilter` | `misc/` | Filtro genérico de tabla |
| `DateFilter` / `DoubleDateFilter` / `DateRangePickerInput` | `misc/` | Filtros por fecha y rango |
| `TablePagination` / `GroupPagination` | `misc/` | Paginación fuera de DataTable |
| `DropdownActions` | `misc/` | Base genérica de menú de acciones |
| `LoadingPage` | `misc/` | Página completa en carga |
| `BackButton` / `ButtonLink` | `misc/` | Navegación |
| `ImageViewer` / `ImageZoom` | `misc/`, `ui/` | Vista de imágenes |
| `PreviewPanelIcon` | `misc/` | Ícono abrir/cerrar del panel de vista previa |
| `QRGenerator` | `misc/` | Códigos QR |
| `StatusCellWithPopover` | `misc/` | Celda de estado con detalle |

### Estado global disponible

No lo repliques con props si ya está en contexto:

| Fuente | Da acceso a |
|---|---|
| `useCompanyStore()` (`stores/`) | `selectedCompany`, `selectedStation` |
| `useAuth()` (`contexts/AuthContext`) | Usuario, roles, permisos |
| `PageTitleContext` | Título de la página actual |
| `OnlineUsersContext` | Usuarios conectados |

---

## 4. Convenciones de la interfaz

Tres reglas del proyecto que debes respetar:

### Nada de estados deshabilitados

Si una acción no está permitida, **no se renderiza**. No se muestra un botón gris.

```tsx
if (!hasAccess) {
  return null;
}
```

### Botones de icono llevan `Tooltip`

Nunca el atributo nativo `title=`. Se usa el componente `Tooltip` de `ui/`.

### El gating por rol va en el componente

Se lee del contexto y se compara contra la lista permitida. El backend valida
igual — esto es solo para la interfaz:

```tsx
const { user } = useAuth();
const ALLOWED_ROLES = ["SUPERUSER", "JEFE_ADMINISTRACION"];
const hasAccess = user?.roles?.some((role) => ALLOWED_ROLES.includes(role.name));
```

Ten presente que **`SUPERUSER` es un rol global**, no por empresa.

---

## 5. Cuándo reutilizar y cuándo NO

Esta es la decisión donde más fácil se hace daño. La regla del proyecto:

> Se unifican los componentes que son **literalmente el mismo** usado en distintas
> páginas. **No** se construye un mega-componente con banderas para cubrir todos los
> casos.

### Ejemplos reales que NO se fusionaron, y por qué

| Par | Similitud | Por qué se dejaron separados |
|---|---|---|
| `CompleteOrderForm` / `PayPurchaseOrderForm` | ~90% | Difieren en 305 de ~380 líneas: distintas mutaciones, validación de método de pago opuesta, un campo extra. Unificarlos exigía banderas por todos lados. |
| Los formularios de despacho | alta | Ya comparten la lógica real en `_hooks/useDispatchForm.ts`. Lo que difiere son las opciones de destino. |

**La lección:** un parecido estructural alto no implica que sean el mismo
componente. Antes de fusionar, compara la **lógica de negocio**, no el JSX.

### Cuando la lógica sí se repite

Extráela a un **hook**, no a un componente con banderas. El despacho de almacén es
el ejemplo a seguir:

```
components/forms/mantenimiento/almacen/
├── _hooks/useDispatchForm.ts       554 líneas — el cerebro compartido
├── _components/ConversionPanel.tsx 305 líneas — conversión de unidades
├── _components/ArticleRowCard.tsx  126 líneas — fila de artículo
├── _components/SectionHeader.tsx    11 líneas
├── ComponentDispatchForm.tsx            ┐
├── PartDispatchForm.tsx                 ├─ consumen useDispatchForm
└── ConsumableDispatchRequestForm.tsx    ┘
```

Casi 1.000 líneas de lógica común viven una sola vez; cada formulario aporta solo
sus campos y su destino. **La convención `_hooks/` y `_components/` con guion bajo**
marca piezas privadas de esa carpeta: no las importes desde otro módulo.

Nota: `ToolDispatchForm.tsx` **no** usa este hook pese al nombre parecido.

---

## 6. Nombres: cuándo renombrar en vez de comentar

Si dos componentes hacen algo parecido pero pertenecen a contextos distintos, **el
nombre debe decirlo**. Un nombre correcto sustituye al comentario explicativo.

Renombrados con este criterio:

| Antes | Después |
|---|---|
| `DispatchReportDialog` (×2) | `AdministrationDispatchReportDialog` / `WarehouseDispatchReportDialog` |
| `CreateRequisitionDialog` (×2) | `GeneralModuleRequisitionDialog` / `PurchasesRequisitionDialog` |
| `NotificationItem` | `AlertCard` |

**No agregues un comentario que explique lo que el nombre y la ruta ya dicen.**

---

## 7. Antes de crear un componente nuevo

1. **Busca por lo que hace, no por cómo lo llamarías.**
   `grep -rn "DatePicker\|Combobox" components/`
2. **Revisa `ui/`, `misc/` y `tables/`** — ahí está lo transversal.
3. **¿Es un formulario?** Mira si ya hay un `Create*Form` del mismo recurso; quizá
   solo necesitas un `Edit*Form` al lado.
4. **¿Es una acción de fila?** Va dentro del `DropdownActions` existente, no en un
   archivo nuevo.
5. **¿Necesitas empresa, usuario o roles?** Sale del store/contexto, no por props.
6. **Si se parece a otro, compara la lógica**, no el JSX ([sección 5](#5-cuándo-reutilizar-y-cuándo-no)).

---

## 8. Deuda técnica conocida

### 75 `data-table.tsx` casi idénticos

En `app/` hay 75 archivos `data-table.tsx` que suman **10.382 líneas**. Setenta ya
usan las piezas de `components/tables/`, pero cada uno reimplementa el mismo
andamiaje: estado de `sorting`, `columnFilters`, `useReactTable`, el `<Table>`
completo y el botón de reset.

Comparando dos al azar, difieren en ~60 líneas y la diferencia real es **qué diálogo
de creación montan** y qué columna filtran.

Es el candidato más claro a un `<DataTableShell>` genérico que reciba `columns`,
`data` y un `slot` para el diálogo. **No se abordó** porque toca 75 páginas y
merece su propia tarea revisada.

Mientras tanto: si creas una tabla nueva, copia la más parecida y **usa siempre**
`DataTablePagination` y `DataTableViewOptions` en vez de escribirlos.

### 35 componentes huérfanos

Sin ningún consumidor. Están marcados **huérfano** en las tablas de la sección 9.

Antes de borrar uno, **verifica también los imports relativos** (`from "./X"`), no
solo los de alias. Un `grep` que solo busque `@/components/...` reporta falsos
huérfanos — pasó con `DynamicBarChart`, que parecía muerto y lo usa
`StatisticQuestionPage` por ruta relativa.

### Archivos de prueba en producción

En `misc/` hay `TestChart.tsx`, `TestPage.tsx` y `TestSales.tsx`. Son restos de
pruebas, no componentes del sistema.

### SMS

El módulo está **en construcción por otro desarrollador**. Puedes corregir bugs y
comentarios, pero **no fusiones, muevas ni elimines** archivos suyos.

Ten en cuenta que hay componentes fuera de carpetas SMS que **solo** consume SMS
(`RiskMatrix`, `DynamicBarChart*`, `MultipleBarChartComponent`, los
`*CertificateForm`, `GraphicsSelector`, `DoubleDateFilter`). Aunque su ruta no lo
diga, tocarlos afecta a SMS.

---

## 9. Referencia completa por tipo

Cada componente con su ruta, el módulo de `app/` que realmente lo consume y su
tamaño. **Usado por** se calculó siguiendo las cadenas de import hasta `app/`:
varios módulos significa que es transversal; **huérfano** significa cero consumidores.


### forms  (168)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `AddClientBalanceForm` | `forms/aerolinea/administracion/AddClientBalanceForm.tsx` | ajustes | 87 |
| `AircraftExpensiveForm` | `forms/aerolinea/administracion/AircraftExpensiveForm.tsx` | administracion | 747 |
| `_(sin export nombrado)_` | `forms/aerolinea/administracion/CreateAccountForm.tsx` | administracion | 273 |
| `CreateAdministrationQuoteForm` | `forms/aerolinea/administracion/CreateAdministrationQuoteForm.tsx` | — | 479 |
| `CreateAdministrationRequisitionForm` | `forms/aerolinea/administracion/CreateAdministrationRequisitionForm.tsx` | **huérfano** | 339 |
| `CreateAircraftForm` | `forms/aerolinea/administracion/CreateAircraftForm.tsx` | administracion | 380 |
| `CreateCashForm` | `forms/aerolinea/administracion/CreateCashForm.tsx` | administracion | 155 |
| `CreateCashMovementForm` | `forms/aerolinea/administracion/CreateCashMovementForm.tsx` | **huérfano** | 798 |
| `CreateCategoryForm` | `forms/aerolinea/administracion/CreateCategoryForm.tsx` | administracion | 153 |
| `CreateCreditForm` | `forms/aerolinea/administracion/CreateCreditForm.tsx` | administracion | 319 |
| `CreditPaymentForm` | `forms/aerolinea/administracion/CreateCreditPaymentForm.tsx` | administracion | 347 |
| `_(sin export nombrado)_` | `forms/aerolinea/administracion/CreateFilterDates.tsx` | administracion | 109 |
| `_(sin export nombrado)_` | `forms/aerolinea/administracion/CreateFilterDatesUpdate.tsx` | administracion | 114 |
| `FlightForm` | `forms/aerolinea/administracion/CreateFlightForm.tsx` | administracion | 676 |
| `CreateRentingForm` | `forms/aerolinea/administracion/CreateRentingForm.tsx` | administracion | 604 |
| `_(sin export nombrado)_` | `forms/aerolinea/administracion/CreateRouteForm.tsx` | administracion | 271 |
| `DefineEndDateForm` | `forms/aerolinea/administracion/DefineEndDateForm.tsx` | administracion | 196 |
| `EditAccountantForm` | `forms/aerolinea/administracion/EditAccountForm.tsx` | administracion | 101 |
| `EditAircraftForm` | `forms/aerolinea/administracion/EditAircraftForm.tsx` | administracion | 402 |
| `EditCategoryForm` | `forms/aerolinea/administracion/EditCategoryForm.tsx` | administracion | 168 |
| `EditClientForm` | `forms/aerolinea/administracion/EditClientForm.tsx` | ajustes | 256 |
| `DailyReportForm` | `forms/aerolinea/desarollo/DailyReportForm.tsx` | desarrollo | 188 |
| `AcceptObligatoryReport` | `forms/aerolinea/sms/AcceptObligatoryForm.tsx` | sms | 129 |
| `AcceptVoluntaryReport` | `forms/aerolinea/sms/AcceptVoluntaryForm.tsx` | sms | 111 |
| `ActivityCategoriesForm` | `forms/aerolinea/sms/ActivityCategoriesForm.tsx` | general, sms | 254 |
| `AddCourseAttendanceForm` | `forms/aerolinea/sms/AddCourseAtendanceForm.tsx` | general, general_admin | 284 |
| `AddSMSActivityAttendanceForm` | `forms/aerolinea/sms/AddSMSActivityAttendanceForm.tsx` | sms | 286 |
| `AddToCourseForm` | `forms/aerolinea/sms/AddToCourseForm.tsx` | general, general_admin | 312 |
| `AddToSMSActivity` | `forms/aerolinea/sms/AddToSMSActivityForm.tsx` | sms | 314 |
| `CreateAnalysisForm` | `forms/aerolinea/sms/CreateAnalysisForm.tsx` | sms | 254 |
| `CreateCourseForm` | `forms/aerolinea/sms/CreateCourseForm.tsx` | general, general_admin | 419 |
| `CreateExamForm` | `forms/aerolinea/sms/CreateExamForm.tsx` | general, general_admin | 174 |
| `CreateFollowUpControlForm` | `forms/aerolinea/sms/CreateFollowUpControlForm.tsx` | general_admin, sms | 249 |
| `CreateGeneralObligatoryReportForm` | `forms/aerolinea/sms/CreateGeneralObligatoryReportForm.tsx` | _app_root | 853 |
| `CreateGeneralVoluntaryReportForm` | `forms/aerolinea/sms/CreateGeneralVoluntaryReportForm.tsx` | _app_root | 632 |
| `CreateDangerIdentificationForm` | `forms/aerolinea/sms/CreateIdentificationForm.tsx` | sms | 632 |
| `CreateInformationSourceForm` | `forms/aerolinea/sms/CreateInformationSourceForm.tsx` | ajustes | 122 |
| `CreateMitigationMeasureForm` | `forms/aerolinea/sms/CreateMitigationMeasureForm.tsx` | sms | 314 |
| `CreateMitigationPlanForm` | `forms/aerolinea/sms/CreateMitigationPlanForm.tsx` | sms | 246 |
| `CreateObligatoryReportForm` | `forms/aerolinea/sms/CreateObligatoryReportForm.tsx` | general, sms | 983 |
| `CreateSafetyBulletinForm` | `forms/aerolinea/sms/CreateSafetyBulletinForm.tsx` | sms | 392 |
| `CreateSMSActivityForm` | `forms/aerolinea/sms/CreateSMSActivityForm.tsx` | general, sms | 851 |
| `CreateVoluntaryReportForm` | `forms/aerolinea/sms/CreateVoluntaryReportForm.tsx` | general, sms | 800 |
| `EditFollowUpControlForm` | `forms/aerolinea/sms/EditFollowUpControlForm.tsx` | sms | 266 |
| `EditInformationSourceForm` | `forms/aerolinea/sms/EditInformationSourceForm.tsx` | ajustes, sms | 121 |
| `DatePickerWithRange` | `forms/aerolinea/sms/HorizontalForm.tsx` | **huérfano** | 66 |
| `LinkBulletinToActivityForm` | `forms/aerolinea/sms/LinkBulletinToActivityForm.tsx` | sms | 102 |
| `RedirectionForm` | `forms/aerolinea/sms/RedirectionForm.tsx` | **huérfano** | 139 |
| `CreateSurveyForm` | `forms/aerolinea/sms/survey/CreateSurveyForm.tsx` | sms | 779 |
| `EditSurveyForm` | `forms/aerolinea/sms/survey/EditSurveyForm.tsx` | **huérfano** | 795 |
| `QuestionItem` | `forms/aerolinea/sms/survey/QuestionItem.tsx` | _app_root | 160 |
| `SurveyQuestionsManager` | `forms/aerolinea/sms/survey/SurveyQuestionsManager.tsx` | sms | 606 |
| `SurveyResponseForm` | `forms/aerolinea/sms/survey/SurveyResponseForm.tsx` | _app_root | 461 |
| `CompanyUpdateForm` | `forms/ajustes/CompanyUpdateForm.tsx` | _app_root | 292 |
| `AuthorizedEmployeeForm` | `forms/ajustes/CreateAuthorizedEmployeed.tsx` | ajustes | 232 |
| `CreateBankAccountForm` | `forms/ajustes/CreateBankAccountForm.tsx` | _app_root, administracion | 291 |
| `CreateBankCardForm` | `forms/ajustes/CreateBankCardForm.tsx` | _app_root, administracion | 265 |
| `CreateBankForm` | `forms/ajustes/CreateBankForm.tsx` | _app_root, administracion | 122 |
| `CreateConditionForm` | `forms/ajustes/CreateConditionForm.tsx` | ajustes, compras, general | 149 |
| `CreateModuleForm` | `forms/ajustes/CreateModuleForm.tsx` | _app_root | 100 |
| `CreateUnitForm` | `forms/ajustes/CreateUnitForm.tsx` | ajustes, almacen, compras, general, ingenieria | 106 |
| `CreateUserForm` | `forms/ajustes/CreateUserForm.tsx` | _app_root | 669 |
| `CreateUserFromEmployeeForm` | `forms/ajustes/CreateUserFromEmployeeForm.tsx` | **huérfano** | 445 |
| `_(sin export nombrado)_` | `forms/ajustes/CreateWarehouseForm.tsx` | ajustes | 164 |
| `EditUserForm` | `forms/ajustes/EditUserForm.tsx` | _app_root | 185 |
| `LoginForm` | `forms/ajustes/LoginForm.tsx` | _app_root | 257 |
| `ConditionCombobox` | `forms/general/compras/_components/ConditionCombobox.tsx` | compras, general | 145 |
| `QuoteGeneralMetaSection` | `forms/general/compras/_components/QuoteGeneralMetaSection.tsx` | compras, general | 248 |
| `RetailerCombobox` | `forms/general/compras/_components/RetailerCombobox.tsx` | compras, general | 161 |
| `UnitCombobox` | `forms/general/compras/_components/UnitCombobox.tsx` | compras, general | 150 |
| `VendorCombobox` | `forms/general/compras/_components/VendorCombobox.tsx` | compras, general | 153 |
| `CreateGeneralQuoteForm` | `forms/general/compras/CreateGeneralQuoteForm.tsx` | compras, general | 304 |
| `CreateCertificateForm` | `forms/general/CreateCertificateForm.tsx` | sms | 392 |
| `CreateClientForm` | `forms/general/CreateClientForm.tsx` | ajustes, operaciones | 282 |
| `CreateCompanyForm` | `forms/general/CreateCompanyForm.tsx` | _app_root, ajustes, almacen, compras, control_calidad, general, ingenieria, planificacion | 529 |
| `CreateDepartmentForm` | `forms/general/CreateDepartmentForm.tsx` | ajustes | 103 |
| `CreateEmployeeForm` | `forms/general/CreateEmployeeForm.tsx` | ajustes | 1175 |
| `CreateJobTitleForm` | `forms/general/CreateJobTitleForm.tsx` | ajustes | 90 |
| `CreateManufacturerForm` | `forms/general/CreateManufacturerForm.tsx` | ajustes, almacen, compras, control_calidad, general, ingenieria, planificacion | 155 |
| `CreatePilotForm` | `forms/general/CreatePilotForm.tsx` | ajustes | 130 |
| `CreateRetailerForm` | `forms/general/CreateRetailerForm.tsx` | ajustes, compras, general | 122 |
| `CreateRoleForm` | `forms/general/CreateRoleForm.tsx` | _app_root, ajustes | 186 |
| `CreateShippingAgencyForm` | `forms/general/CreateShippingAgencyForm.tsx` | ajustes | 218 |
| `CreateThirdPartyForm` | `forms/general/CreateThirdPartyForm.tsx` | ajustes | 123 |
| `CreateVendorForm` | `forms/general/CreateVendorForm.tsx` | ajustes, compras, general | 205 |
| `_(sin export nombrado)_` | `forms/general/EditCertificateForm.tsx` | sms | 218 |
| `UpdateDepartmentForm` | `forms/general/UpdateDepartmentForm.tsx` | ajustes | 170 |
| `UpdateEmployeeForm` | `forms/general/UpdateEmployeeForm.tsx` | ajustes | 737 |
| `UpdateThirdPartyForm` | `forms/general/UpdateThirdPartyForm.tsx` | ajustes | 125 |
| `AircraftInfoForm` | `forms/mantenimiento/aeronaves/AircraftInfoForm.tsx` | planificacion | 593 |
| `PART_CATEGORIES, AircraftPartsInfoForm` | `forms/mantenimiento/aeronaves/AircraftPartsForm.tsx` | planificacion | 427 |
| `CreateResguardoAircraftForm` | `forms/mantenimiento/aeronaves/CreateResguardoAircraftForm.tsx` | almacen | 237 |
| `ManufacturerCombobox` | `forms/mantenimiento/aeronaves/ManufacturerCombobox.tsx` | planificacion | 261 |
| `PART_TYPES, POSITION_TYPES, usePartValue` | `forms/mantenimiento/aeronaves/parts-form/constants.ts` | planificacion | 21 |
| `IdentificationFields` | `forms/mantenimiento/aeronaves/parts-form/IdentificationFields.tsx` | planificacion | 126 |
| `PartSection` | `forms/mantenimiento/aeronaves/parts-form/PartSection.tsx` | planificacion | 422 |
| `PartsList` | `forms/mantenimiento/aeronaves/parts-form/PartsList.tsx` | planificacion | 42 |
| `ArticleRowCard` | `forms/mantenimiento/almacen/_components/ArticleRowCard.tsx` | almacen | 127 |
| `ConversionPanel` | `forms/mantenimiento/almacen/_components/ConversionPanel.tsx` | almacen | 306 |
| `SectionHeader` | `forms/mantenimiento/almacen/_components/SectionHeader.tsx` | almacen | 12 |
| `FormSchema, aeroKey, genKey, useDispatchForm` | `forms/mantenimiento/almacen/_hooks/useDispatchForm.ts` | almacen | 555 |
| `CreateFuelVehicleForm` | `forms/mantenimiento/almacen/combustible/CreateFuelVehicleForm.tsx` | almacen | 371 |
| `EditFuelVehicleForm` | `forms/mantenimiento/almacen/combustible/EditFuelVehicleForm.tsx` | almacen | 362 |
| `FuelMovementForm` | `forms/mantenimiento/almacen/combustible/FuelMovementForm.tsx` | almacen | 559 |
| `ComponentDispatchForm` | `forms/mantenimiento/almacen/ComponentDispatchForm.tsx` | almacen | 722 |
| `ConsumableConversionsField` | `forms/mantenimiento/almacen/ConsumableConversionsField.tsx` | almacen | 284 |
| `ConsumableDispatchForm` | `forms/mantenimiento/almacen/ConsumableDispatchRequestForm.tsx` | almacen | 702 |
| `CreateBatchForm` | `forms/mantenimiento/almacen/CreateBatchForm.tsx` | almacen, compras, general, ingenieria | 518 |
| `formSchema, CreateComponentForm` | `forms/mantenimiento/almacen/CreateComponentForm.tsx` | almacen | 571 |
| `_(sin export nombrado)_` | `forms/mantenimiento/almacen/CreateConsumableForm.tsx` | almacen | 1122 |
| `_(sin export nombrado)_` | `forms/mantenimiento/almacen/CreateGeneralArticleForm.tsx` | almacen | 587 |
| `_(sin export nombrado)_` | `forms/mantenimiento/almacen/CreatePartForm.tsx` | **huérfano** | 844 |
| `CreateToolBoxForm` | `forms/mantenimiento/almacen/CreateToolBoxForm.tsx` | almacen | 325 |
| `CreateToolForm` | `forms/mantenimiento/almacen/CreateToolForm.tsx` | almacen, compras, control_calidad, general, ingenieria | 810 |
| `DestinationUnknownField` | `forms/mantenimiento/almacen/DestinationUnknownField.tsx` | almacen | 45 |
| `EditBatchForm` | `forms/mantenimiento/almacen/EditBatchForm.tsx` | almacen, ingenieria | 75 |
| `EditToolBoxForm` | `forms/mantenimiento/almacen/EditToolBoxForm.tsx` | almacen | 328 |
| `PartDispatchForm` | `forms/mantenimiento/almacen/PartDispatchForm.tsx` | almacen | 693 |
| `_(sin export nombrado)_` | `forms/mantenimiento/almacen/RegisterArticleForm.tsx` | almacen, compras, control_calidad, general, ingenieria | 127 |
| `ToolDispatchForm` | `forms/mantenimiento/almacen/ToolDispatchForm.tsx` | almacen | 436 |
| `ActiveRequisitionWarning` | `forms/mantenimiento/compras/_components/ActiveRequisitionWarning.tsx` | compras, general | 93 |
| `AdditionalInfoSection` | `forms/mantenimiento/compras/_components/AdditionalInfoSection.tsx` | compras, general | 161 |
| `ArticleDocumentTypesAttachment` | `forms/mantenimiento/compras/_components/ArticleDocumentTypesAttachment.tsx` | compras, general | 117 |
| `ArticleImageAttachment` | `forms/mantenimiento/compras/_components/ArticleImageAttachment.tsx` | compras, general | 125 |
| `BatchArticlesSection` | `forms/mantenimiento/compras/_components/BatchArticlesSection.tsx` | compras, general | 545 |
| `DuplicateRequisitionDialog` | `forms/mantenimiento/compras/_components/DuplicateRequisitionDialog.tsx` | compras, general | 69 |
| `GeneralArticlesSection` | `forms/mantenimiento/compras/_components/GeneralArticlesSection.tsx` | compras, general | 888 |
| `getStoragePathFromUrl` | `forms/mantenimiento/compras/_components/imageUtils.ts` | compras, general | 12 |
| `isHigherPriority` | `forms/mantenimiento/compras/_components/priorityUtils.ts` | compras, general | 9 |
| `QuoteBatchArticlesSection` | `forms/mantenimiento/compras/_components/QuoteBatchArticlesSection.tsx` | compras, general | 492 |
| `QuoteGeneralArticlesSection` | `forms/mantenimiento/compras/_components/QuoteGeneralArticlesSection.tsx` | compras, general | 686 |
| `QuoteMetaSection` | `forms/mantenimiento/compras/_components/QuoteMetaSection.tsx` | compras, general | 251 |
| `RequiredIndicator` | `forms/mantenimiento/compras/_components/RequiredIndicator.tsx` | compras, general | 27 |
| `RequisitionHeader` | `forms/mantenimiento/compras/_components/RequisitionHeader.tsx` | compras, general | 685 |
| `CompleteOrderForm` | `forms/mantenimiento/compras/CompleteOrderForm.tsx` | compras | 852 |
| `CreateAeronauticalRequisitionForm` | `forms/mantenimiento/compras/CreateAeronauticalRequisitionForm.tsx` | compras, general | 488 |
| `CreateGeneralRequisitionForm` | `forms/mantenimiento/compras/CreateGeneralRequisitionForm.tsx` | compras, general | 400 |
| `LEAD_TIME_UNITS, articleNeedsJustification, CreateQuoteForm` | `forms/mantenimiento/compras/CreateQuoteForm.tsx` | compras, general | 462 |
| `CreateWarehouseRequisitionForm` | `forms/mantenimiento/compras/CreateWarehouseRequisitionForm.tsx` | compras, general | 767 |
| `PayPurchaseOrderForm` | `forms/mantenimiento/compras/PayPurchaseOrderForm.tsx` | compras | 891 |
| `AddInspectionItemForm` | `forms/mantenimiento/ordenes_trabajo/AddInspectionItemForm.tsx` | planificacion | 118 |
| `CreateFlightControlForm` | `forms/mantenimiento/ordenes_trabajo/CreateFlightControlForm.tsx` | planificacion | 638 |
| `_(sin export nombrado)_` | `forms/mantenimiento/ordenes_trabajo/CreateNoRutineForm.tsx` | planificacion | 454 |
| `_(sin export nombrado)_` | `forms/mantenimiento/planificacion/ordenes_trabajo/EditWorkOrderForm.tsx` | planificacion | 657 |
| `CloseVoluntaryReportForm` | `forms/mantenimiento/sms/CloseVoluntaryReportForm.tsx` | sms | 197 |
| `CreateFollowUpControl` | `forms/mantenimiento/sms/CreateFollowUpControl.tsx` | sms | 268 |
| `CreateGenObliReport` | `forms/mantenimiento/sms/CreateGenObliReport.tsx` | _app_root, general | 711 |
| `CreateGenVolReport` | `forms/mantenimiento/sms/CreateGenVolReport.tsx` | _app_root, general | 707 |
| `CreateHazardNotification` | `forms/mantenimiento/sms/CreateHazardNotification.tsx` | sms | 399 |
| `CreateMitigationMeasure` | `forms/mantenimiento/sms/CreateMitigationMeasure.tsx` | sms | 316 |
| `CreateMitigationPlanAnalysis` | `forms/mantenimiento/sms/CreateMitigationPlanAnalysis.tsx` | sms | 620 |
| `CreateCargoManifestForm` | `forms/operaciones/cargo/CreateCargoManifestForm.tsx` | operaciones | 672 |
| `CreateCargoShipmentForm` | `forms/operaciones/cargo/CreateCargoShipmentForm.tsx` | operaciones | 446 |
| `CreateCarrierForm` | `forms/operaciones/cargo/CreateCarrierForm.tsx` | operaciones | 204 |
| `ItemsTable` | `forms/operaciones/cargo/ItemsTable.tsx` | operaciones | 226 |
| `ProductAutocompleteInput` | `forms/operaciones/cargo/ProductAutoCompleteInput.tsx` | operaciones | 153 |
| `UpdateCargoManifestForm` | `forms/operaciones/cargo/UpdateCargoManifestForm.tsx` | operaciones | 272 |
| `CreateErrorReportForm` | `forms/sistema/CreateErrorReportForm.tsx` | _app_root, layout | 467 |
| `CreateUniformItemForm` | `forms/sms/CreateUniformItemForm.tsx` | sms | 327 |
| `EditUniformItemForm` | `forms/sms/EditUniformItemForm.tsx` | sms | 129 |
| `RegisterUniformMovementForm` | `forms/sms/RegisterUniformMovementForm.tsx` | sms | 334 |
| `UniformArticleTypeForm` | `forms/sms/UniformArticleTypeForm.tsx` | sms | 171 |
| `UniformBrandForm` | `forms/sms/UniformBrandForm.tsx` | sms | 105 |
| `createSurveyValidator, isAnswerProvided` | `forms/validators/sms/createSurveyValidator.ts` | _app_root | 73 |

### dialogs  (116)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `AdministrationDispatchReportDialog` | `dialogs/aerolinea/administracion/AdministrationDispatchReportDialog.tsx` | dashboard | 551 |
| `_(sin export nombrado)_` | `dialogs/aerolinea/administracion/AircraftResumeDialog.tsx` | administracion | 136 |
| `_(sin export nombrado)_` | `dialogs/aerolinea/administracion/CashResumeDialog.tsx` | administracion | 59 |
| `_(sin export nombrado)_` | `dialogs/aerolinea/administracion/ClientResumeDialog.tsx` | administracion | 116 |
| `CreateAccountantDialog` | `dialogs/aerolinea/administracion/CreateAccountDialog.tsx` | administracion | 36 |
| `CreateAircraftDialog` | `dialogs/aerolinea/administracion/CreateAircraftDialog.tsx` | administracion | 44 |
| `CashDialog` | `dialogs/aerolinea/administracion/CreateCashDialog.tsx` | administracion | 43 |
| `CashMovementDialog` | `dialogs/aerolinea/administracion/CreateCashMovementDialog.tsx` | administracion | 74 |
| `CreateCategoryDialog` | `dialogs/aerolinea/administracion/CreateCategoryDialog.tsx` | administracion | 36 |
| `CreateClientDialog` | `dialogs/aerolinea/administracion/CreateClientDialog.tsx` | ajustes | 55 |
| `CreditDialog` | `dialogs/aerolinea/administracion/CreateCreditDialog.tsx` | administracion | 66 |
| `CreditFlightDialog` | `dialogs/aerolinea/administracion/CreateCreditFlightDialog.tsx` | administracion | 39 |
| `CreditRentingDialog` | `dialogs/aerolinea/administracion/CreateCreditRentingDialog.tsx` | administracion | 37 |
| `CreateFlightControlDialog` | `dialogs/aerolinea/administracion/CreateFlightControl.tsx` | planificacion | 51 |
| `CreateFlightDialog` | `dialogs/aerolinea/administracion/CreateFlightDialog.tsx` | administracion | 48 |
| `CreateHClientDialog` | `dialogs/aerolinea/administracion/CreateHClientDialog.tsx` | **huérfano** | 34 |
| `RentingDialog` | `dialogs/aerolinea/administracion/CreateRentingDialog.tsx` | administracion | 42 |
| `RouteDialog` | `dialogs/aerolinea/administracion/CreateRouteDialog.tsx` | administracion | 43 |
| `_(sin export nombrado)_` | `dialogs/aerolinea/administracion/FlightResumeDialog.tsx` | administracion | 156 |
| `_(sin export nombrado)_` | `dialogs/aerolinea/administracion/MovementDetailsDialog.tsx` | administracion | 60 |
| `PdfPreviewDialog` | `dialogs/aerolinea/administracion/PdfPreviewDialog.tsx` | planificacion | 254 |
| `_(sin export nombrado)_` | `dialogs/aerolinea/administracion/VendorResumeDialog.tsx` | administracion | 120 |
| `ConfirmCreateActivityReportDialog` | `dialogs/aerolinea/desarollo/CreateActivityReportDialog.tsx` | desarrollo | 34 |
| `DailyReportDialog` | `dialogs/aerolinea/desarollo/DailyReportDialog.tsx` | desarrollo | 201 |
| `ActionPlanDialog` | `dialogs/aerolinea/sms/ActionPlanDialog.tsx` | _app_root | 100 |
| `CreateAnalysesDialog` | `dialogs/aerolinea/sms/CreateAnalysesDialog.tsx` | sms | 76 |
| `CreateDangerIdentificationDialog` | `dialogs/aerolinea/sms/CreateDangerIdentificationDialog.tsx` | sms | 66 |
| `CreateFollowUpControlDialog` | `dialogs/aerolinea/sms/CreateFollowUpControlDialog.tsx` | general_admin, sms | 54 |
| `CreateMitigationMeasureDialog` | `dialogs/aerolinea/sms/CreateMitigationMeasureDialog.tsx` | sms | 52 |
| `CreateObligatoryReportDialog` | `dialogs/aerolinea/sms/CreateObligatoryDialog.tsx` | sms | 64 |
| `CreateSafetyBulletinDialog` | `dialogs/aerolinea/sms/CreateSafetyBulletinDialog.tsx` | sms | 65 |
| `CreateSMSActivityDialog` | `dialogs/aerolinea/sms/CreateSMSActivityDialog.tsx` | general, sms | 53 |
| `CreateVoluntaryReportDialog` | `dialogs/aerolinea/sms/CreateVoluntaryReportDialog.tsx` | sms | 65 |
| `DeleteDangerIdentificationDialog` | `dialogs/aerolinea/sms/DeleteDangerIdentificationDialog.tsx` | sms | 99 |
| `DeleteObligatoryReportDialog` | `dialogs/aerolinea/sms/DeleteObligatoryReportDialog.tsx` | sms | 90 |
| `DeleteVoluntaryReportDialog` | `dialogs/aerolinea/sms/DeleteVoluntaryReportDialog.tsx` | sms | 90 |
| `_(sin export nombrado)_` | `dialogs/aerolinea/sms/DocumentDisplayDialog.tsx` | sms | 152 |
| `FeaturesDialog` | `dialogs/aerolinea/sms/FeaturedDialog.tsx` | _app_root | 118 |
| `_(sin export nombrado)_` | `dialogs/aerolinea/sms/ImageDisplayDialog.tsx` | sms | 167 |
| `PreviewVoluntaryReportPdfDialog` | `dialogs/aerolinea/sms/PreviewObligatoryReportPdfDialog.tsx` | sms | 85 |
| `PreviewVoluntaryReportPdfDialog` | `dialogs/aerolinea/sms/PreviewVoluntaryReportPdfDialog.tsx` | sms | 89 |
| `QuizResultsDialog` | `dialogs/aerolinea/sms/QuizResultDialog.tsx` | _app_root | 217 |
| `_(sin export nombrado)_` | `dialogs/aerolinea/sms/ResponsibleResumeDialog.tsx` | **huérfano** | 93 |
| `SMSConceptsDialog` | `dialogs/aerolinea/sms/SMSConceptsDialog.tsx` | _app_root | 89 |
| `_(sin export nombrado)_` | `dialogs/ajustes/BankAccountResumeDialog.tsx` | administracion | 90 |
| `_(sin export nombrado)_` | `dialogs/ajustes/CompanyDropdownDialogs.tsx` | _app_root | 200 |
| `CreateAuthorizedEmployeeDialog` | `dialogs/ajustes/CreateAuthorizedEmployeeDialog.tsx` | ajustes | 39 |
| `CreateBankAccountDialog` | `dialogs/ajustes/CreateBankAccountDialog.tsx` | _app_root, administracion | 74 |
| `CreateBankCardDialog` | `dialogs/ajustes/CreateBankCardDialog.tsx` | _app_root, administracion | 47 |
| `CreateBankDialog` | `dialogs/ajustes/CreateBankDialog.tsx` | _app_root | 46 |
| `CreateCompanyDialog` | `dialogs/ajustes/CreateCompanyDialog.tsx` | _app_root, ajustes | 34 |
| `CreateConditionDialog` | `dialogs/ajustes/CreateConditionDialog.tsx` | ajustes | 57 |
| `CreateInformationSourceDialog` | `dialogs/ajustes/CreateInformationSourceDialog.tsx` | ajustes | 44 |
| `CreatePilotDialog` | `dialogs/ajustes/CreatePilotDialog.tsx` | ajustes | 44 |
| `CreateUnitDialog` | `dialogs/ajustes/CreateUnitDialog.tsx` | ajustes | 33 |
| `CreateUserDialog` | `dialogs/ajustes/CreateUserDialog.tsx` | _app_root | 30 |
| `_(sin export nombrado)_` | `dialogs/ajustes/CreateWarehouseDialog.tsx` | ajustes | 33 |
| `_(sin export nombrado)_` | `dialogs/ajustes/DeleteAuthorizedEmployeeDialog.tsx` | ajustes | 118 |
| `EditUserDialog` | `dialogs/ajustes/EditUserDialog.tsx` | _app_root | 43 |
| `_(sin export nombrado)_` | `dialogs/ajustes/ManageCompanyModulesDialog.tsx` | _app_root | 179 |
| `ModuleDialog` | `dialogs/ajustes/ModuleDialog.tsx` | _app_root | 36 |
| `CourseListDialog` | `dialogs/CourseListDialog.tsx` | general, sms | 116 |
| `CreateCourseCalendarDialog` | `dialogs/general/CreateCourseCalendarDialog.tsx` | general | 40 |
| `CreateCourseDialog` | `dialogs/general/CreateCourseDialog.tsx` | general, general_admin | 79 |
| `CreateDepartmentDialog` | `dialogs/general/CreateDepartmentDialog.tsx` | ajustes | 37 |
| `CreateEmployeeDialog` | `dialogs/general/CreateEmployeeDialog.tsx` | ajustes | 59 |
| `CreateJobTitleDialog` | `dialogs/general/CreateJobTitleDialog.tsx` | ajustes | 37 |
| `CreateManufacturerDialog` | `dialogs/general/CreateManufacturerDialog.tsx` | ajustes, almacen, compras, control_calidad, general, ingenieria, planificacion | 59 |
| `CreateRoleDialog` | `dialogs/general/CreateRoleDialog.tsx` | _app_root | 36 |
| `CreateShippingAgencyDialog` | `dialogs/general/CreateShippingAgencyDialog.tsx` | ajustes | 98 |
| `CreateThirdPartyDialog` | `dialogs/general/CreateThirdPartyDialog.tsx` | ajustes | 41 |
| `CreateVendorDialog` | `dialogs/general/CreateVendorDialog.tsx` | ajustes | 108 |
| `_(sin export nombrado)_` | `dialogs/general/DepartmentDropdownDialogs.tsx` | ajustes | 209 |
| `GeneralModuleRequisitionDialog` | `dialogs/general/GeneralModuleRequisitionDialog.tsx` | general | 219 |
| `ImageGalleryDialog` | `dialogs/general/ImageGalleryDialog.tsx` | _app_root | 140 |
| `_(sin export nombrado)_` | `dialogs/general/PermissionsDialog.tsx` | _app_root | 87 |
| `_(sin export nombrado)_` | `dialogs/general/RolesDialog.tsx` | _app_root | 86 |
| `_(sin export nombrado)_` | `dialogs/general/ShippingAgencyDropdownDialogs.tsx` | ajustes | 173 |
| `_(sin export nombrado)_` | `dialogs/general/ThirdPartyDropdownDialogs.tsx` | ajustes | 155 |
| `_(sin export nombrado)_` | `dialogs/general/VendorDropdownDialogs.tsx` | ajustes | 171 |
| `CreateMaintenanceAircraftDialog` | `dialogs/mantenimiento/aeronaves/CreateMaintenanceAircraftDialog.tsx` | **huérfano** | 264 |
| `CreateResguardoAircraftDialog` | `dialogs/mantenimiento/aeronaves/CreateResguardoAircraftDialog.tsx` | almacen | 67 |
| `AnnulFuelMovementDialog` | `dialogs/mantenimiento/almacen/combustible/AnnulFuelMovementDialog.tsx` | almacen | 97 |
| `CreateFuelVehicleDialog` | `dialogs/mantenimiento/almacen/combustible/CreateFuelVehicleDialog.tsx` | almacen | 39 |
| `DeleteFuelMovementDialog` | `dialogs/mantenimiento/almacen/combustible/DeleteFuelMovementDialog.tsx` | almacen | 91 |
| `DeleteFuelVehicleDialog` | `dialogs/mantenimiento/almacen/combustible/DeleteFuelVehicleDialog.tsx` | almacen | 134 |
| `EditFuelVehicleDialog` | `dialogs/mantenimiento/almacen/combustible/EditFuelVehicleDialog.tsx` | almacen | 64 |
| `FuelMovementDetailDialog` | `dialogs/mantenimiento/almacen/combustible/FuelMovementDetailDialog.tsx` | almacen | 190 |
| `FuelMovementDialog` | `dialogs/mantenimiento/almacen/combustible/FuelMovementDialog.tsx` | almacen | 72 |
| `CreateBatchDialog` | `dialogs/mantenimiento/almacen/CreateBatchDialog.tsx` | almacen, ingenieria | 90 |
| `CreateToolBoxDialog` | `dialogs/mantenimiento/almacen/CreateToolBoxDialog.tsx` | almacen | 34 |
| `_(sin export nombrado)_` | `dialogs/mantenimiento/almacen/DispatchArticlesDialog.tsx` | almacen | 199 |
| `DispatchReportFilters` | `dialogs/mantenimiento/almacen/DispatchReportFilters.tsx` | almacen, dashboard, planificacion | 1188 |
| `PreviewCreateComponentDialog` | `dialogs/mantenimiento/almacen/PreviewCreateComponentDialog.tsx` | almacen | 151 |
| `RegisterDispatchRequestDialog` | `dialogs/mantenimiento/almacen/RegisterDispatchRequestDialog.tsx` | almacen | 173 |
| `ReturnWarehouseDialog` | `dialogs/mantenimiento/almacen/ReturnWarehouseDialog.tsx` | **huérfano** | 65 |
| `_(sin export nombrado)_` | `dialogs/mantenimiento/almacen/ToolBoxToolsDialog.tsx` | almacen | 102 |
| `WarehouseDispatchReportDialog` | `dialogs/mantenimiento/almacen/WarehouseDispatchReportDialog.tsx` | almacen, planificacion | 448 |
| `WarehouseReportDialog` | `dialogs/mantenimiento/almacen/WarehouseReportDialog.tsx` | **huérfano** | 89 |
| `CreateRetailerDialog` | `dialogs/mantenimiento/compras/CreateRetailerDialog.tsx` | ajustes | 34 |
| `DownloadRequisitionPdfDialog` | `dialogs/mantenimiento/compras/DownloadRequisitionPdfDialog.tsx` | compras, general | 295 |
| `_(sin export nombrado)_` | `dialogs/mantenimiento/compras/InvoicePreviewDialog.tsx` | compras | 81 |
| `_(sin export nombrado)_` | `dialogs/mantenimiento/compras/PurchaseOrderDropdownDialogs.tsx` | compras | 315 |
| `PurchasesRequisitionDialog` | `dialogs/mantenimiento/compras/PurchasesRequisitionDialog.tsx` | compras | 259 |
| `_(sin export nombrado)_` | `dialogs/mantenimiento/compras/QuoteDropdownDialogs.tsx` | compras | 421 |
| `_(sin export nombrado)_` | `dialogs/mantenimiento/compras/RequisitionDropdownDialogs.tsx` | compras, general | 533 |
| `_(sin export nombrado)_` | `dialogs/mantenimiento/compras/UpdateRequisitionPriorityDialog.tsx` | compras, general | 231 |
| `CreateWorkOrderDialog` | `dialogs/mantenimiento/ordenes_trabajo/CreateWorkOrderDialog.tsx` | **huérfano** | 33 |
| `PrelimInspectItemDialog` | `dialogs/mantenimiento/ordenes_trabajo/PrelimInspecItemDialog.tsx` | planificacion | 34 |
| `PdfEndpointPreviewDialog` | `dialogs/shared/PdfEndpointPreviewDialog.tsx` | sms | 178 |
| `CreateErrorReportDialog` | `dialogs/sistema/CreateErrorReportDialog.tsx` | _app_root, layout | 29 |
| `RequestPasswordResetDialog` | `dialogs/sistema/RequestPasswordResetDialog.tsx` | _app_root | 287 |
| `ResolvePasswordResetDialog` | `dialogs/sistema/ResolvePasswordResetDialog.tsx` | _app_root | 333 |

### dropdowns  (61)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `_(sin export nombrado)_` | `dropdowns/aerolinea/administracion/AccountDropdownActions.tsx` | administracion | 119 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/administracion/AdministrationRequisitionDropdownActions.tsx` | **huérfano** | 246 |
| `AircraftDropdownActions` | `dropdowns/aerolinea/administracion/AircraftDropdownActions.tsx` | administracion | 332 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/administracion/CashDropdownActions.tsx` | administracion | 158 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/administracion/CashMovementDropdownActions.tsx` | administracion | 106 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/administracion/CategoryDropdownActions.tsx` | administracion | 99 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/administracion/CreditDropdownActions.tsx` | administracion | 60 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/administracion/FlightDropdownActions.tsx` | administracion | 235 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/administracion/RentingDropdownActions.tsx` | administracion | 116 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/administracion/RouteDropdownActions.tsx` | administracion | 78 |
| `ActivityDropdownActions` | `dropdowns/aerolinea/desarrollo/ActivityDropdownActions.tsx` | desarrollo | 314 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/desarrollo/ActivityReportsDropdownActions.tsx` | desarrollo | 142 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/sms/CertificatesDropDownActions.tsx` | sms | 212 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/sms/CourseDropdownActions.tsx` | general, general_admin | 349 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/sms/DangerIdentificationDropdownActions.tsx` | sms | 231 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/sms/FollowUpControlDropdownActions.tsx` | sms | 137 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/sms/InformationSourceDropDownActions.tsx` | ajustes | 122 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/sms/MitigationMeasuresDropDownActions.tsx` | sms | 173 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/sms/MitigationTableDropdownActions.tsx` | sms | 462 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/sms/ObligatoryReportDropdownActions.tsx` | sms | 267 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/sms/SafetyBulletinDropDownActions.tsx` | sms | 130 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/sms/SMSActivityDropDownActions.tsx` | sms | 322 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/sms/survey/surveyDropDownActions.tsx` | sms | 192 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/sms/survey/surveySettingDropDownActions.tsx` | sms | 224 |
| `_(sin export nombrado)_` | `dropdowns/aerolinea/sms/VoluntaryReportDropDownMenu.tsx` | sms | 217 |
| `_(sin export nombrado)_` | `dropdowns/ajustes/AuthorizedEmployeeDropdownActions.tsx` | ajustes | 64 |
| `BankDropdownActions, BankAccountDropdownActions, BankCardDropdownActions` | `dropdowns/ajustes/BancosPagosDropdownActions.tsx` | _app_root, administracion | 208 |
| `_(sin export nombrado)_` | `dropdowns/ajustes/CompanyDropdownActions.tsx` | _app_root | 186 |
| `_(sin export nombrado)_` | `dropdowns/ajustes/PermissionsDropdownActions.tsx` | **huérfano** | 68 |
| `_(sin export nombrado)_` | `dropdowns/ajustes/RolesDropdownActions.tsx` | _app_root | 71 |
| `_(sin export nombrado)_` | `dropdowns/ajustes/UnitDropdownActions.tsx` | ajustes | 185 |
| `_(sin export nombrado)_` | `dropdowns/ajustes/UserDropdownActions.tsx` | _app_root | 87 |
| `_(sin export nombrado)_` | `dropdowns/ajustes/WarehouseDropdownActions.tsx` | ajustes | 82 |
| `_(sin export nombrado)_` | `dropdowns/general/ClientDropdownActions.tsx` | ajustes | 274 |
| `_(sin export nombrado)_` | `dropdowns/general/DepartmentDropdownActions.tsx` | ajustes | 111 |
| `_(sin export nombrado)_` | `dropdowns/general/EmployeesDropdownActions.tsx` | ajustes | 275 |
| `LibraryDropdownActions` | `dropdowns/general/LibraryDropdownActions.tsx` | general | 272 |
| `_(sin export nombrado)_` | `dropdowns/general/ManufacturerDropdownActions.tsx` | ajustes | 146 |
| `_(sin export nombrado)_` | `dropdowns/general/ShippingAgencyDropdownActions.tsx` | ajustes | 184 |
| `_(sin export nombrado)_` | `dropdowns/general/ThirdPartyDropdownActions.tsx` | ajustes | 156 |
| `_(sin export nombrado)_` | `dropdowns/general/VendorDropdownActions.tsx` | ajustes | 166 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/almacen/ArticleDropdownActions.tsx` | almacen, general | 111 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/almacen/BatchDropdownActions.tsx` | **huérfano** | 59 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/almacen/DispatchRequestDropdownActions.tsx` | almacen | 161 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/almacen/GeneralArticleDropDownActions.tsx` | almacen | 119 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/almacen/InReceptionArticleDropdownActions.tsx` | almacen | 71 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/almacen/InTransitArticleDropdownActions.tsx` | almacen | 70 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/almacen/WaitingToLocateArticleDropdownActions.tsx` | almacen | 84 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/compras/PurchaseOrderDropdownActions.tsx` | compras | 197 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/compras/PurchaseOrderLinkButton.tsx` | compras | 139 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/compras/PurchaseOrderMenuLink.tsx` | compras | 142 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/compras/QuoteDropdownActions.tsx` | compras | 320 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/compras/QuoteLinkButton.tsx` | compras | 132 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/compras/RequisitionDropdownActions.tsx` | compras, general | 374 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/control_calidad/IncomingArticleDropdownActions.tsx` | control_calidad | 36 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/FlightControlDropdownActions.tsx` | planificacion | 131 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/ordenes_trabajo/MaintenanceAircraftDropdownActions.tsx` | planificacion | 62 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/ordenes_trabajo/ToolBoxDropdownActions.tsx` | almacen | 84 |
| `_(sin export nombrado)_` | `dropdowns/mantenimiento/ordenes_trabajo/WorkOrderDropdownActionts.tsx` | planificacion | 103 |
| `VoluntaryReportDropdownActions` | `dropdowns/mantenimiento/sms/VoluntaryReportDropdownActions.tsx` | sms | 237 |

### tour  (49)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `agenciasEnvioSteps` | `tour/steps/ajustes/agencia-envios/agencia-envios.ts` | ajustes | 41 |
| `agenciasEnvioCrearSteps` | `tour/steps/ajustes/agencia-envios/agencias-envio-crear.ts` | ajustes | 50 |
| `clientesCrearSteps` | `tour/steps/ajustes/clientes/clientes-crear.ts` | ajustes | 59 |
| `clientesDetalleSteps` | `tour/steps/ajustes/clientes/clientes-detalle.ts` | ajustes | 35 |
| `clientesSteps` | `tour/steps/ajustes/clientes/clientes.ts` | ajustes | 35 |
| `comerciosSteps` | `tour/steps/ajustes/comercios.ts` | ajustes | 35 |
| `condicionesSteps` | `tour/steps/ajustes/condiciones.ts` | ajustes | 29 |
| `fabricantesSteps` | `tour/steps/ajustes/fabricantes.ts` | ajustes | 35 |
| `proveedoresCrearSteps` | `tour/steps/ajustes/proveedores/proveedores-crear.ts` | ajustes | 47 |
| `proveedoresSteps` | `tour/steps/ajustes/proveedores/proveedores.ts` | ajustes | 46 |
| `unidadesSteps` | `tour/steps/ajustes/unidades.ts` | ajustes | 35 |
| `cargoDashboardSteps` | `tour/steps/cargo/dashboard.ts` | operaciones | 47 |
| `cargoGuiaCrearSteps` | `tour/steps/cargo/guia-crear.ts` | operaciones | 116 |
| `cargoGuiaDetalleSteps` | `tour/steps/cargo/guia-detalle.ts` | operaciones | 40 |
| `cargoGuiaListaSteps` | `tour/steps/cargo/guia-lista.ts` | operaciones | 37 |
| `cargoManifiestoCrearSteps` | `tour/steps/cargo/manifiesto-crear.ts` | operaciones | 62 |
| `cargoManifiestoDetalleSteps` | `tour/steps/cargo/manifiesto-detalle.ts` | operaciones | 30 |
| `cargoManifiestoEditarSteps` | `tour/steps/cargo/manifiesto-editar.ts` | operaciones | 50 |
| `cargoManifiestosSteps` | `tour/steps/cargo/manifiestos.ts` | operaciones | 31 |
| `cuentaSteps` | `tour/steps/cuenta.ts` | _app_root | 23 |
| `bibliotecaDashboardSteps` | `tour/steps/general/biblioteca/biblioteca-dashboard.ts` | general | 35 |
| `bibliotecaDescargaSteps` | `tour/steps/general/biblioteca/biblioteca-descarga.ts` | general | 24 |
| `bibliotecaEliminarSteps` | `tour/steps/general/biblioteca/biblioteca-eliminar.ts` | general | 24 |
| `bibliotecaPageSteps` | `tour/steps/general/biblioteca/biblioteca-page.ts` | general | 71 |
| `bibliotecaShareSteps` | `tour/steps/general/biblioteca/biblioteca-share.ts` | general | 48 |
| `bibliotecaSolicitudesSteps` | `tour/steps/general/biblioteca/biblioteca-solicitudes.ts` | general | 28 |
| `bibliotecaUploadVersionSteps` | `tour/steps/general/biblioteca/biblioteca-upload-version.ts` | general | 46 |
| `bibliotecaUploadSteps` | `tour/steps/general/biblioteca/biblioteca-upload.ts` | general | 44 |
| `bibliotecaVersionesSteps` | `tour/steps/general/biblioteca/biblioteca-versiones.ts` | general | 19 |
| `bibliotecaVisualizadorSteps` | `tour/steps/general/biblioteca/biblioteca-visualizador.ts` | general | 19 |
| `calendarioSteps` | `tour/steps/general/cursos/calendario.ts` | general | 17 |
| `certificadosCrearSteps` | `tour/steps/general/cursos/certificados/certificados-crear.ts` | sms | 31 |
| `getCertificadosSteps` | `tour/steps/general/cursos/certificados/certificados.ts` | sms | 47 |
| `cursosCrearSteps` | `tour/steps/general/cursos/cursos/crear.ts` | general, general_admin | 45 |
| `cursosIndexSteps` | `tour/steps/general/cursos/cursos/index.ts` | general | 37 |
| `estadisticasSteps` | `tour/steps/general/cursos/estadisticas.ts` | general | 28 |
| `resumenSteps` | `tour/steps/general/cursos/resumen.ts` | general | 21 |
| `obligatorioSteps` | `tour/steps/general/sms/obligatorios.ts` | general | 69 |
| `qrSteps` | `tour/steps/general/sms/qr.ts` | general | 45 |
| `voluntarioSteps` | `tour/steps/general/sms/voluntario.ts` | general | 47 |
| `bancosSteps` | `tour/steps/sistema/banca/banco.ts` | _app_root | 35 |
| `cuentasSteps` | `tour/steps/sistema/banca/cuenta.ts` | _app_root | 35 |
| `cuentasCrearSteps` | `tour/steps/sistema/banca/cuentas-crear.ts` | _app_root, administracion | 57 |
| `metodosPagoSteps` | `tour/steps/sistema/banca/metodos-pago.ts` | _app_root | 23 |
| `notificacionesSteps` | `tour/steps/sistema/banca/notificaciones.ts` | notifications | 23 |
| `tarjetasSteps` | `tour/steps/sistema/banca/tarjeras.ts` | _app_root | 35 |
| `tercerosSteps` | `tour/steps/sistema/terceros.ts` | ajustes | 35 |
| `useTourContext, CustomTourProvider` | `tour/TourProvider.tsx` | _app_root, administracion, ajustes, general, general_admin, layout, notifications, operaciones, sms | 229 |
| `useTourProgress` | `tour/useTourProgress.ts` | **huérfano** | 33 |

### misc  (47)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `_(sin export nombrado)_` | `misc/AlertCard.tsx` | — | 33 |
| `AmountInput` | `misc/AmountInput.tsx` | administracion, ajustes, compras, general | 50 |
| `_(sin export nombrado)_` | `misc/ArticleDocumentsSelector.tsx` | almacen, compras, control_calidad, general, ingenieria | 339 |
| `tracksStatusSince, ArticleStatusSincePopover` | `misc/ArticleStatusSincePopover.tsx` | almacen | 74 |
| `BackButton` | `misc/BackButton.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, cuenta, desarrollo, general, general_admin, ingenieria, mantenimiento, notifications, operaciones, planificacion, sms, supervisor | 203 |
| `_(sin export nombrado)_` | `misc/BigCalendarComponent.tsx` | **huérfano** | 84 |
| `ButtonLink` | `misc/ButtonLink.tsx` | **huérfano** | 43 |
| `_(sin export nombrado)_` | `misc/CashMovementResume.tsx` | administracion | 122 |
| `CompanyMultiSelect` | `misc/CompanyMultiSelect.tsx` | _app_root, administracion | 62 |
| `_(sin export nombrado)_` | `misc/DashboardTabs.tsx` | **huérfano** | 26 |
| `_(sin export nombrado)_` | `misc/DashboradNotifications.tsx` | **huérfano** | 32 |
| `_(sin export nombrado)_` | `misc/DataFilter.tsx` | general, sms | 152 |
| `_(sin export nombrado)_` | `misc/DateFilter.tsx` | **huérfano** | 111 |
| `_(sin export nombrado)_` | `misc/DateRangePickerInput.tsx` | _app_root, sms | 282 |
| `_(sin export nombrado)_` | `misc/DoubleDateFilter.tsx` | sms | 213 |
| `_(sin export nombrado)_` | `misc/DropdownActions.tsx` | **huérfano** | 62 |
| `ErrorReportTrigger` | `misc/ErrorReportTrigger.tsx` | _app_root, layout | 77 |
| `_(sin export nombrado)_` | `misc/PreviewPanelIcon.tsx` | compras | 61 |
| `FileServer` | `misc/FileServer.tsx` | compras, sms | 80 |
| `GenerateInProgressRequisitionsPdfButton` | `misc/GenerateInProgressRequisitionsPdfButton.tsx` | compras | 229 |
| `GraphicsSelector` | `misc/GraphicsSelector.tsx` | sms | 155 |
| `_(sin export nombrado)_` | `misc/GroupPagination.tsx` | compras | 162 |
| `_(sin export nombrado)_` | `misc/ImageViewer.tsx` | compras | 78 |
| `_(sin export nombrado)_` | `misc/LoadingPage.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, dashboard, desarrollo, general, ingenieria, layout, loading, mantenimiento, operaciones, planificacion, sms, supervisor | 13 |
| `_(sin export nombrado)_` | `misc/Logo.tsx` | _app_root, layout | 50 |
| `MarqueeBlockText` | `misc/MarqueeBlockText.tsx` | compras, general | 108 |
| `MarqueeText` | `misc/MarqueeText.tsx` | _app_root, layout | 52 |
| `Message` | `misc/Message.tsx` | dashboard, sms | 14 |
| `MissionVision` | `misc/MissionVision.tsx` | _app_root | 62 |
| `_(sin export nombrado)_` | `misc/MitigationMeasureList.tsx` | **huérfano** | 40 |
| `MultiInputField` | `misc/MultiInputField.tsx` | almacen, compras, control_calidad, general, ingenieria | 164 |
| `PaymentMethodMultiSelect` | `misc/PaymentMethodMultiSelect.tsx` | _app_root, administracion | 61 |
| `_(sin export nombrado)_` | `misc/PermissionsDrawer.tsx` | **huérfano** | 80 |
| `_(sin export nombrado)_` | `misc/PilotDropdownActions.tsx` | ajustes | 133 |
| `_(sin export nombrado)_` | `misc/PlaneIntro.tsx` | _app_root | 53 |
| `_(sin export nombrado)_` | `misc/QRGenerator.tsx` | general, sms | 144 |
| `_(sin export nombrado)_` | `misc/QuoteComparisonToggle.tsx` | compras | 100 |
| `RedirectHandler` | `misc/RedirectHandler.tsx` | _app_root | 32 |
| `_(sin export nombrado)_` | `misc/RiskMatrix.tsx` | sms | 258 |
| `SelectCompanyState` | `misc/SelectCompanyState.tsx` | _app_root | 62 |
| `_(sin export nombrado)_` | `misc/SimpleNotificationBell.tsx` | dashboard | 16 |
| `StatusCellWithPopover` | `misc/StatusCellWithPopover.tsx` | almacen | 187 |
| `PAGE_SIZES, TablePagination` | `misc/TablePagination.tsx` | administracion, general | 145 |
| `description, TestChart` | `misc/TestChart.tsx` | planificacion | 222 |
| `_(sin export nombrado)_` | `misc/TestPage.tsx` | **huérfano** | 18 |
| `_(sin export nombrado)_` | `misc/TestSales.tsx` | — | 77 |
| `UserStatusButton` | `misc/UserStatusButton.tsx` | _app_root | 113 |

### ui  (47)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `Accordion, AccordionItem, AccordionTrigger, AccordionContent` | `ui/accordion.tsx` | general, planificacion | 59 |
| `AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel` | `ui/alert-dialog.tsx` | _app_root, ajustes, almacen, compras, general, operaciones, planificacion, sms, supervisor | 142 |
| `Alert, AlertTitle, AlertDescription` | `ui/alert.tsx` | administracion, planificacion | 63 |
| `Avatar, AvatarImage, AvatarFallback` | `ui/avatar.tsx` | _app_root, administracion, ajustes, almacen, general, layout, sms | 51 |
| `Badge, badgeVariants` | `ui/badge.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, dashboard, general, general_admin, ingenieria, operaciones, planificacion, sms, supervisor | 39 |
| `Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis` | `ui/breadcrumb.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, cuenta, desarrollo, general, general_admin, ingenieria, mantenimiento, notifications, operaciones, planificacion, sms, supervisor | 116 |
| `Button, buttonVariants` | `ui/button.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, cuenta, dashboard, desarrollo, general, general_admin, ingenieria, layout, mantenimiento, notifications, operaciones, planificacion, sms, supervisor | 57 |
| `Calendar` | `ui/calendar.tsx` | _app_root, administracion, almacen, compras, control_calidad, dashboard, desarrollo, general, general_admin, ingenieria, operaciones, planificacion, sms, supervisor | 69 |
| `Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent` | `ui/card.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, dashboard, general, general_admin, ingenieria, operaciones, planificacion, sms | 80 |
| `ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle` | `ui/chart.tsx` | planificacion | 370 |
| `Checkbox` | `ui/checkbox.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, dashboard, desarrollo, general, ingenieria, layout, mantenimiento, operaciones, planificacion, sms, supervisor | 31 |
| `Collapsible, CollapsibleTrigger, CollapsibleContent` | `ui/collapsible.tsx` | _app_root, layout, operaciones, planificacion, sms | 12 |
| `ComboboxField` | `ui/ComboboxField.tsx` | operaciones, sms | 197 |
| `Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator` | `ui/command.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, general, general_admin, ingenieria, mantenimiento, operaciones, planificacion, sms | 164 |
| `DataTableColumnHeader` | `ui/DataTableColumHeader.tsx` | **huérfano** | 74 |
| `DatePickerField` | `ui/DatePickerField.tsx` | almacen | 304 |
| `Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription` | `ui/dialog.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, dashboard, desarrollo, general, general_admin, ingenieria, layout, mantenimiento, operaciones, planificacion, sms, supervisor | 131 |
| `Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription` | `ui/drawer.tsx` | — | 119 |
| `DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup` | `ui/dropdown-menu.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, cuenta, desarrollo, general, general_admin, ingenieria, layout, mantenimiento, notifications, operaciones, planificacion, sms, supervisor | 201 |
| `useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField` | `ui/form.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, desarrollo, general, general_admin, ingenieria, layout, mantenimiento, operaciones, planificacion, sms | 179 |
| `ImageZoom` | `ui/ImageZoom.tsx` | sms | 298 |
| `InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator` | `ui/input-otp.tsx` | administracion | 72 |
| `Input` | `ui/input.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, dashboard, desarrollo, general, general_admin, ingenieria, layout, mantenimiento, notifications, operaciones, planificacion, sms, supervisor | 26 |
| `Label` | `ui/label.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, dashboard, desarrollo, general, general_admin, ingenieria, layout, mantenimiento, operaciones, planificacion, sms, supervisor | 27 |
| `Popover, PopoverTrigger, PopoverAnchor, PopoverContent, PopoverClose` | `ui/popover.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, dashboard, desarrollo, general, general_admin, ingenieria, layout, mantenimiento, notifications, operaciones, planificacion, sms, supervisor | 43 |
| `Progress` | `ui/progress.tsx` | planificacion | 29 |
| `RadioGroup, RadioGroupItem` | `ui/radio-group.tsx` | _app_root, planificacion, sms, supervisor | 45 |
| `ScaleButton` | `ui/scale/ScaleButton.tsx` | operaciones | 58 |
| `ScaleConnectionPanel` | `ui/scale/ScaleConnectionPanel.tsx` | operaciones | 80 |
| `ScaleStatusBadge` | `ui/scale/ScaleStatusBadge.tsx` | operaciones | 40 |
| `ScrollArea, ScrollBar` | `ui/scroll-area.tsx` | _app_root, administracion, almacen, compras, general, layout, mantenimiento, operaciones, planificacion, sms | 49 |
| `SectionCard` | `ui/SectionCard.tsx` | almacen | 27 |
| `Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton` | `ui/select.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, dashboard, desarrollo, general, general_admin, ingenieria, layout, mantenimiento, notifications, operaciones, planificacion, sms, supervisor | 161 |
| `Separator` | `ui/separator.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, general, general_admin, ingenieria, layout, planificacion, sms | 32 |
| `Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription` | `ui/sheet.tsx` | _app_root, compras, control_calidad, layout, sms | 150 |
| `Skeleton` | `ui/skeleton.tsx` | _app_root, sms | 9 |
| `Toaster` | `ui/sonner.tsx` | _app_root | 38 |
| `StepIndicator` | `ui/step-indicator.tsx` | sms | 105 |
| `Switch` | `ui/switch.tsx` | _app_root, general, planificacion, sms | 30 |
| `Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption` | `ui/table.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, dashboard, desarrollo, general, general_admin, ingenieria, mantenimiento, operaciones, planificacion, sms | 118 |
| `Tabs, TabsList, TabsTrigger, TabsContent` | `ui/tabs.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, dashboard, general, ingenieria, operaciones, planificacion, sms, supervisor | 56 |
| `Textarea` | `ui/textarea.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, desarrollo, general, general_admin, ingenieria, layout, mantenimiento, planificacion, sms | 25 |
| `TimePicker` | `ui/timePicker.tsx` | **huérfano** | 87 |
| `type ToastProps, type ToastActionElement, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction` | `ui/toast.tsx` | desarrollo, planificacion, sms | 130 |
| `Toaster` | `ui/toaster.tsx` | **huérfano** | 36 |
| `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider` | `ui/tooltip.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, cuenta, dashboard, desarrollo, general, general_admin, ingenieria, layout, mantenimiento, notifications, operaciones, planificacion, sms, supervisor | 33 |
| `reducer, useToast, toast` | `ui/use-toast.ts` | desarrollo, planificacion, sms | 195 |

### layout  (18)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `BirthdayConfetti` | `layout/BirthdayConfetti.tsx` | _app_root, layout | 103 |
| `ContentLayout` | `layout/ContentLayout.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, cuenta, dashboard, desarrollo, general, general_admin, ingenieria, mantenimiento, notifications, operaciones, planificacion, sms, supervisor | 33 |
| `CriticalAlertCard` | `layout/CriticalAlertCard.tsx` | _app_root, layout | 124 |
| `CriticalAlertsButton` | `layout/CriticalAlertsButton.tsx` | _app_root, layout | 284 |
| `DashboardLayout` | `layout/DashboardLayout.tsx` | _app_root, layout | 55 |
| `_(sin export nombrado)_` | `layout/Footer.tsx` | _app_root, layout | 15 |
| `GuestContentLayout` | `layout/GuestContentLayout.tsx` | _app_root | 27 |
| `GuestDashboardLayout` | `layout/GuestDashboardLayout.tsx` | _app_root | 46 |
| `GuestNavbar` | `layout/GuestNavbar.tsx` | _app_root | 37 |
| `GuestSidebar` | `layout/GuestSidebar.tsx` | _app_root | 56 |
| `GuestUserNav` | `layout/GuestUserNav.tsx` | _app_root | 167 |
| `Navbar` | `layout/Navbar.tsx` | _app_root, layout | 48 |
| `PageHeader` | `layout/PageHeader.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, cuenta, desarrollo, general, general_admin, ingenieria, mantenimiento, notifications, operaciones, planificacion, sms, supervisor | 146 |
| `PageTitle` | `layout/PageTitle.tsx` | _app_root, layout | 149 |
| `_(sin export nombrado)_` | `layout/ProtectedLayout.tsx` | administracion, almacen, compras, general, sms, supervisor | 76 |
| `_(sin export nombrado)_` | `layout/ProtectedRoute.tsx` | _app_root, administracion, ajustes, operaciones, sms | 50 |
| `Sidebar` | `layout/Sidebar.tsx` | _app_root, layout | 74 |
| `ThemeToggler` | `layout/ThemeToggler.tsx` | _app_root, layout | 114 |
| `UserNav` | `layout/UserNav.tsx` | _app_root, layout | 240 |

### dashboard  (17)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `AdministrationDashboard` | `dashboard/AdministrationDashboard.tsx` | dashboard | 107 |
| `AdministrationDashboardContent` | `dashboard/content/AdministrationDashboardContent.tsx` | dashboard | 125 |
| `SMSDashboardContent` | `dashboard/content/SMSDashboardContent.tsx` | dashboard | 112 |
| `WarehouseDashboardContent` | `dashboard/content/WarehouseDashboardContent.tsx` | dashboard | 124 |
| `DefaultDashboard` | `dashboard/DefaultDashboard.tsx` | dashboard | 103 |
| `DispatchSummary` | `dashboard/sections/Administration/DispatchSummary.tsx` | dashboard | 273 |
| `DispatchWarehouseReports` | `dashboard/sections/Administration/DispatchWarehouseReports.tsx` | dashboard | 88 |
| `DashboardSummary` | `dashboard/sections/SMS/SMSDashboardSummary.tsx` | dashboard | 381 |
| `SMSReportIndicator` | `dashboard/sections/SMS/SMSReportIndicator.tsx` | dashboard | 320 |
| `SMSStatistics` | `dashboard/sections/SMS/SMSStatistics.tsx` | dashboard | 209 |
| `ArticlesSummary` | `dashboard/sections/warehouse/ArticlesSummary.tsx` | dashboard | 330 |
| `DashboardSummary` | `dashboard/sections/warehouse/DashboardSummary.tsx` | dashboard | 145 |
| `ToolsSummary` | `dashboard/sections/warehouse/ToolsSummary.tsx` | dashboard | 327 |
| `UsersSummary` | `dashboard/sections/warehouse/UsersSummary.tsx` | dashboard | 266 |
| `SMSDashboard` | `dashboard/SMSDashboard.tsx` | dashboard | 60 |
| `SuperUserDashboard` | `dashboard/SuperUserDashboard.tsx` | dashboard | 194 |
| `WarehouseDashboard` | `dashboard/WarehouseDashboard.tsx` | dashboard | 90 |

### library  (14)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `CreateFolderDialog` | `library/CreateFolderDialog.tsx` | general | 198 |
| `DashboardModal` | `library/DashboardModal.tsx` | general | 864 |
| `DeleteDocumentDialog` | `library/DeleteDocumentDialog.tsx` | general | 281 |
| `DeleteFolderDialog` | `library/DeleteFolderDialog.tsx` | general | 83 |
| `DownloadDocumentDialog` | `library/DownloadDocumentDialog.tsx` | general | 264 |
| `_(sin export nombrado)_` | `library/FolderTree.tsx` | general | 420 |
| `TraceabilityPanel` | `library/HistoryPanel.tsx` | general | 269 |
| `RenameFolderDialog` | `library/RenameFolderDialog.tsx` | general | 99 |
| `SecureFileViewer` | `library/SecureFileViewer.tsx` | almacen, compras, control_calidad, general, ingenieria | 242 |
| `SecureViewer` | `library/SecureVisualizer.tsx` | general | 284 |
| `ShareDialog` | `library/ShareDialog.tsx` | general | 627 |
| `ShareRequestsPanel` | `library/ShareRequestsPanel.tsx` | general | 696 |
| `UploadVersionDialog` | `library/UploadVersionDialog.tsx` | general | 345 |
| `HistoryPanel` | `library/VersionPanel.tsx` | general | 193 |

### cards  (10)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `_(sin export nombrado)_` | `cards/ChildrenInfoCard.tsx` | **huérfano** | 64 |
| `getMonthByNumber` | `cards/ConfigMonths.tsx` | administracion, ajustes | 29 |
| `CustomCard` | `cards/CustomCard.tsx` | _app_root | 96 |
| `_(sin export nombrado)_` | `cards/FatureCard.tsx` | **huérfano** | 41 |
| `PolicyCard` | `cards/PolicyCard.tsx` | _app_root | 131 |
| `StrategyCard` | `cards/StrategyCard.tsx` | _app_root | 82 |
| `SummaryCard` | `cards/SummaryCard.tsx` | administracion, ajustes | 27 |
| `_(sin export nombrado)_` | `cards/UserCompaniesTab.tsx` | _app_root | 272 |
| `_(sin export nombrado)_` | `cards/UserCompanyModulesTab.tsx` | _app_root | 290 |
| `_(sin export nombrado)_` | `cards/UserRolesTab.tsx` | _app_root | 268 |

### charts  (9)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `_(sin export nombrado)_` | `charts/BarChartComponent.tsx` | dashboard, general, sms | 144 |
| `_(sin export nombrado)_` | `charts/BarChartCourseComponent.tsx` | general, sms | 136 |
| `_(sin export nombrado)_` | `charts/DynamicBarChart.tsx` | sms | 140 |
| `_(sin export nombrado)_` | `charts/DynamicBarChart2.tsx` | **huérfano** | 148 |
| `_(sin export nombrado)_` | `charts/DynamicBarChartComponent.tsx` | sms | 103 |
| `_(sin export nombrado)_` | `charts/MultipleBarChartComponent.tsx` | sms | 105 |
| `PieChartComponent` | `charts/PieChartComponent.tsx` | dashboard, general, sms | 112 |
| `_(sin export nombrado)_` | `charts/SimpleLineChart.tsx` | dashboard | 97 |
| `_(sin export nombrado)_` | `charts/StatisticQuestionPage.tsx` | sms | 84 |

### selects  (7)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `AIRPORT_CODE_REGEX, AirportCombobox` | `selects/AirportCombobox.tsx` | administracion, planificacion | 186 |
| `_(sin export nombrado)_` | `selects/ArticleTypeSelect.tsx` | **huérfano** | 35 |
| `_(sin export nombrado)_` | `selects/CompanySelect.tsx` | _app_root, layout | 164 |
| `DayMonthYearPicker` | `selects/DayMonthYearPicker.tsx` | operaciones | 62 |
| `MonthYearPicker` | `selects/MonthYearPicker.tsx` | operaciones | 140 |
| `_(sin export nombrado)_` | `selects/SelectBatchCategory.tsx` | almacen, ingenieria | 280 |
| `YearPicker` | `selects/YearPicker.tsx` | _app_root | 179 |

### tables  (7)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `DataTableFacetedFilter` | `tables/DataTableFacetedFilter.tsx` | _app_root | 164 |
| `DataTableColumnHeader` | `tables/DataTableHeader.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, desarrollo, general, general_admin, ingenieria, mantenimiento, operaciones, planificacion, sms | 268 |
| `DataTableColumnHeaderAct` | `tables/DataTableHeaderAct.tsx` | **huérfano** | 153 |
| `DataTablePagination` | `tables/DataTablePagination.tsx` | _app_root, administracion, ajustes, almacen, compras, control_calidad, desarrollo, general, general_admin, mantenimiento, operaciones, planificacion, sms | 139 |
| `DataTableViewOptions` | `tables/DataTableViewOptions.tsx` | _app_root, administracion, ajustes, almacen, control_calidad, desarrollo, general, general_admin, mantenimiento, operaciones, planificacion, sms | 66 |
| `LoadingDataTable` | `tables/LoadingDataTable.tsx` | operaciones | 15 |
| `StatusColumnHeader` | `tables/StatusColumnHeader.tsx` | almacen | 153 |

### side-panels  (6)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `PurchaseOrderPreviewPanel` | `side-panels/PurchaseOrderPreviewPanel.tsx` | compras | 495 |
| `usePurchaseOrderPreview, usePurchaseOrderPreviewSelectedId, PurchaseOrderSplitView` | `side-panels/PurchaseOrderSplitView.tsx` | compras | 68 |
| `QuotePreviewPanel` | `side-panels/QuotePreviewPanel.tsx` | compras | 487 |
| `useQuotePreview, useQuotePreviewSelectedId, QuoteSplitView` | `side-panels/QuoteSplitView.tsx` | compras | 68 |
| `RequisitionPreviewPanel` | `side-panels/RequisitionPreviewPanel.tsx` | compras | 411 |
| `useRequisitionPreview, useRequisitionPreviewSelectedId, RequisitionSplitView` | `side-panels/RequisitionSplitView.tsx` | compras | 68 |

### sidebar  (6)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `CollapseMenuButton` | `sidebar/CollapseMenuButton.tsx` | _app_root, layout | 247 |
| `GuestMenu` | `sidebar/GuestMenu.tsx` | _app_root | 126 |
| `GuestSheetMenu` | `sidebar/GuestSheetMenu.tsx` | _app_root | 142 |
| `Menu` | `sidebar/Menu.tsx` | _app_root, layout | 251 |
| `SheetMenu` | `sidebar/SheetMenu.tsx` | _app_root, layout | 167 |
| `SidebarToggle` | `sidebar/SidebarToggle.tsx` | _app_root, layout | 59 |

### pdf  (5)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `_(sin export nombrado)_` | `pdf/almacen/GeneralWarehouseReport.tsx` | — | 194 |
| `_(sin export nombrado)_` | `pdf/desarrollo/ActivityReport.tsx` | desarrollo | 191 |
| `_(sin export nombrado)_` | `pdf/sms/ObligatoryReportPdf.tsx` | sms | 1185 |
| `InstructiveFirstPart, FirstPage, SecondPage, ThirdPage, FourthPage, FifthPage, SixthPage` | `pdf/sms/SafetyRiskManagement.tsx` | sms | 3736 |
| `_(sin export nombrado)_` | `pdf/sms/VoluntaryReportPdf.tsx` | sms | 794 |

### notifications  (3)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `NotificationBell` | `notifications/NotificationBell.tsx` | _app_root, layout | 159 |
| `NotificationItem` | `notifications/NotificationItem.tsx` | _app_root, layout, notifications | 304 |
| `NotificationPanel` | `notifications/NotificationPanel.tsx` | _app_root, layout | 273 |

### DataTableMixedSorting.tsx  (1)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `DataTable` | `DataTableMixedSorting.tsx` | **huérfano** | 106 |

### auth  (1)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `AuthRedirect` | `auth/AuthRedirect.tsx` | _app_root | 39 |

### company  (1)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `_(sin export nombrado)_` | `company/CompanyBootstrap.tsx` | _app_root | 414 |

### sms  (1)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `getUniformTypeIcon, MOVEMENT_TYPE_META` | `sms/uniform-meta.tsx` | sms | 42 |

### tabs  (1)

| Componente | Ruta | Usado por | Líneas |
|---|---|---|---|
| `_(sin export nombrado)_` | `tabs/dashboardTabs/OverviewTab.tsx` | — | 87 |
