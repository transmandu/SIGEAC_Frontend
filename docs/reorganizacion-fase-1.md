# Reorganización estructural — Fase 1

Ciclo base que toda empresa recibe al crearse: **Almacén, Compras, Administración, Supervisor**.

## El eje

SIGEAC soporta dos tipos de empresa. El eje ya existe en el backend
(`database/migrations/tenant/aeronautical/` y `.../airline/`) y define qué tablas tiene
cada empresa. Este documento lo lleva al frontend y lo aplica de forma consistente.

- **`aeronautical`** — taller aeronáutico certificado (OMAC)
- **`airline`** — empresa no OMAC (aerolínea, operadora)
- **compartido** — todo lo que no está dentro de una carpeta de flavor

En Next.js se usan *route groups* `(aeronautical)` / `(airline)`: agrupan archivos
**sin modificar la URL**, el endpoint ni ningún link existente. Su único propósito es que
la ubicación de un archivo le diga a cualquier programador a qué tipo de empresa afecta
su cambio.

```
app/[company]/
├── (aeronautical)/     solo OMAC
├── (airline)/          solo no-OMAC
├── almacen/            ambas
├── compras/            ambas
├── administracion/     ambas
└── supervisor/         ambas
```

## Estado de partida

El flavor `airline` quedó congelado en 2026-03 mientras `aeronautical` siguió creciendo:

| Área | aeronautical | airline |
|---|---|---|
| warehouse | 60+ migraciones | 7 |
| purchases | 43 migraciones | 6 (originales, sin cambios) |
| administration | — | 8 |

Consecuencia central: **toda la evolución del artículo general y del ciclo de compras se
construyó del lado `aeronautical`, cuando ambos son compartidos.** Esta fase los promueve.

---

## Decisiones

### Almacén — compartido

| Pieza | Flavor | Nota |
|---|---|---|
| `warehouses`, `zones`, `conditions`, `units` | compartido | base del módulo |
| Artículo general + toda su evolución | **compartido** | costo, min/max, conversiones, intakes, fusiones, auditoría, documentos |
| `articles` / `batches` | **compartido** | se revierte el `dropIfExists` de airline; el uso lo gobierna el tipo de almacén, no el flavor |
| Documentos de artículo (certificados) | **compartido** | `article_document_types` / `_requirements` / `_documents` |
| Combustible (`fuel`) | **compartido** | |
| Caja de herramientas (`tool_boxes`, `tools`) | **aeronautical** | |
| Inspección de ingreso + cuarentena | **aeronautical** | `incoming_inspections`, `quarantine_articles` |

El artículo general es el eje principal del almacén de una airline, y hoy su versión en
`airline` es la de 2026-03 (sin costo, sin mínimo/máximo, sin conversiones, sin intakes).
Se promueve la versión completa a compartido.

#### El gate real es el tipo de almacén

`warehouses.type` distingue **almacén aeronáutico** de **almacén general**. Esa es la
condición que gobierna el inventario por batch, no el flavor de la empresa:

> Si una empresa no tiene creado un almacén de tipo aeronáutico, no puede hacer
> inventario de artículos por batch.

Aplica igual a una OMAC y a una airline. Por eso `articles`/`batches` pueden existir en
ambos flavors sin riesgo: lo que decide es un dato de la propia empresa, no el esquema.

Consecuencia para el frontend: las data-tables e inventarios de artículos aeronáuticos se
filtran y se muestran según los almacenes de tipo aeronáutico que tenga la empresa. Si no
hay ninguno, esa vista no se renderiza (regla de no mostrar elementos muertos).

### Compras — compartido

El ciclo **requisición → cotización → orden de compra → recepción** es el mismo proceso
administrativo para cualquier empresa; lo único que varía es qué tipo de artículo se compra.
Las 43 migraciones de `aeronautical/purchases` se promueven a compartido, incluyendo
prioridades, pagos, complementarias, rechazos y correcciones de unidad.

`compras/(aeronautico)` y `compras/(general)` **no son el eje de empresa** — distinguen
tipo de artículo (trazable vs consumible) y se mantienen como están. El
`requiresOmac={true}` de `compras/(aeronautico)/layout.tsx` es incorrecto y se elimina.

### Administración — compartido, previa limpieza ✅ EJECUTADO

> **Origen del desorden:** en una etapa temprana, unos pasantes construyeron un ciclo de
> compras paralelo para poder desarrollar administración. El compras real de hoy no existía.
> De ahí salen `creditos/`, `gestion_cajas/`, `gestion_vuelos/` y el
> `InvoiceManagementController`. Todo eso se elimina.


Administración es **contabilidad, y toda empresa la necesita**. Hoy todo el módulo vive
bajo `Administration/Airline/` y la mayor parte está mal estructurada y sin uso.

**Se conserva** (funcionando en producción):
- **Banca** — cuentas y tarjetas; las usa el pago de órdenes de compra
- **Recepciones administrativas** — ligado a la existencia de artículos generales

**Se elimina** — código, rutas y migraciones de drop (a ejecutar por el usuario):

| Backend | Frontend |
|---|---|
| `Administration/Airline/CashController` | `administracion/gestion_cajas/**` |
| `CashMovementController` | `administracion/creditos/**` |
| `AccountantController` | `administracion/operaciones/arrendamiento` |
| `AccountantCategoryController` | `hooks/aerolinea/cajas`, `/movimientos` |
| `CreditController` | `hooks/aerolinea/creditos`, `/cuentas_contables` |
| `RentingController` | `hooks/aerolinea/categorias_cuentas`, `/rentas` |
| Modelos: `Cash`, `CashMovement`, `CashMovementDetail`, `Accountant`, `AccountantCategory`, `Credit`, `Renting` | actions y componentes asociados |

Tablas a eliminar: `cashes`, `cash_movements`, `cash_movement_details`, `accountants`,
`accountants_categories`, `credits`, `rentings`.

### Supervisor — compartido, gateado por dependencia

Cada sub-módulo de Supervisor existe **si y solo si existe el módulo que supervisa**.
No depende del flavor:

- Fusión de artículos generales → requiere almacén con artículos generales
- Panel de Ciclo de Compras → requiere módulo compras

Si lo supervisado no existe, el sub-módulo no se renderiza.

### Gestión de vuelos — airline

`administracion/gestion_vuelos/**` (aviones, rutas, vuelos, historial) y arrendamiento
son la operación de una aerolínea. Pasan a `(airline)/`.

---

## Compra aeronáutica de la airline

**La regla de negocio está vigente:** una airline compra piezas para sus aeronaves y
físicamente quedan en el almacén de la OMAC que le hace el mantenimiento.

**Lo que el sistema registra en fase 1: solo la compra.** La airline corre su ciclo de
compras normal. El paso "la OMAC recibe en su almacén" ocurre en la realidad pero no se
modela todavía; si hace falta reflejarlo, se usa el ingreso manual que ya existe en el
módulo de almacén.

### Fuera de alcance (fase propia): recepción cross-tenant

Automatizar que el artículo comprado por la airline aparezca en el almacén de la OMAC
requiere, sobre bases de datos hoy aisladas (Spatie multitenancy, `SIGEAC_DB_<SLUG>`):

- relación airline ↔ OMAC en la base master
- escritura cross-tenant (la orden vive en una BD, el artículo en otra)
- marca de propiedad del artículo (de quién es el stock que la OMAC custodia)
- reglas de visibilidad: qué ve cada empresa del inventario de la otra

Es una feature nueva, no una reorganización. Se pospone para no romper nada del aislamiento
actual.

---

## Nombres a corregir

Deuda de nomenclatura: las carpetas actuales no corresponden al eje real.

| Hoy | Significa | Debe ser |
|---|---|---|
| `hooks/mantenimiento/`, `components/*/mantenimiento/` | lo de OMAC | `aeronautical` |
| `hooks/aerolinea/`, `actions/aerolinea/`, `components/*/aerolinea/` | lo de no-OMAC | `airline` |
| `routes/api/administration/airline/` | administración | compartido |
| `Warehouse/Aeronautical/GeneralArticle*` | artículo general | compartido |

Mismo vocabulario en ambos repos: `aeronautical` / `airline` / compartido.
