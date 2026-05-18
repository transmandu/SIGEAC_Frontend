# Plan de Implementacion: Modulo de Combustible en Almacen

Spec base: `docs/superpowers/specs/2026-04-25-combustible-almacen-design.md`

## Objetivo

Implementar el frontend del modulo `Almacen > Combustible` siguiendo el spec aprobado. El modulo debe permitir gestionar vehiculos terrestres, consultar saldos, registrar movimientos de combustible, anular movimientos y consultar trazabilidad FIFO de despachos.

## Dependencias

El frontend depende de endpoints backend para:

- vehiculos de combustible;
- resumen de saldos;
- movimientos;
- anulaciones;
- trazabilidad FIFO;
- terceros existentes en `/third-parties`.

Si el backend no esta disponible al iniciar, se debe implementar la capa de tipos, hooks y pantallas contra contratos esperados, dejando los nombres de endpoints aislados en actions/hooks para facilitar ajuste posterior.

## Fase 1: Tipos y contratos frontend

1. Agregar tipos compartidos en `types/index.ts`:
   - `FuelVehicle`;
   - `FuelVehicleStatus`;
   - `FuelVehicleType`;
   - `FuelMovement`;
   - `FuelMovementType`;
   - `FuelMovementStatus`;
   - `FuelSummary`;
   - `FuelTraceabilityDetail`;
   - `FuelFifoRow`;
   - request payloads para crear vehiculo, movimientos y anulaciones.
2. Definir constantes locales para:
   - tipos de vehiculo;
   - tipos de movimiento;
   - codigos canonicos de error backend.
3. Mantener los nombres alineados con el spec:
   - `tank_capacity_liters`;
   - `current_balance_liters`;
   - `operational_date`;
   - `liters`.

## Fase 2: Capa de datos

1. Crear `actions/mantenimiento/almacen/combustible/actions.ts` con mutaciones:
   - crear vehiculo;
   - activar/desactivar vehiculo;
   - registrar saldo inicial de almacen;
   - registrar surtido externo;
   - registrar descarga al almacen;
   - registrar despacho a vehiculo;
   - registrar despacho a tercero;
   - registrar consumo diario;
   - anular movimiento.
2. Crear hooks en `hooks/mantenimiento/almacen/combustible`:
   - `useGetFuelVehicles`;
   - `useGetFuelSummary`;
   - `useGetFuelMovements`;
   - `useGetFuelMovementById`;
   - `useGetFuelTraceability`.
3. Usar TanStack Query con query keys separadas:
   - `fuel-vehicles`;
   - `fuel-summary`;
   - `fuel-movements`;
   - `fuel-movement`;
   - `fuel-traceability`.
4. Invalidar `fuel-summary`, `fuel-vehicles` y `fuel-movements` despues de cada mutacion que cambie saldos.
5. Normalizar errores de backend para mostrar mensajes claros en formularios y toasts.

## Fase 3: Rutas y menu

1. Crear ruta principal:
   - `app/[company]/almacen/combustible/page.tsx`.
2. Si el layout local es necesario, crear:
   - `app/[company]/almacen/combustible/layout.tsx`.
3. Agregar item al menu en `lib/menu-list-2.tsx` bajo `Almacen`:
   - label: `Combustible`;
   - roles: `SUPERUSER`, `JEFE_ALMACEN`;
   - icono sugerido: `Fuel` si esta disponible en `lucide-react`; si no, usar `Gauge` o `Droplets`.
4. Aplicar las mismas restricciones de rol en la UI del modulo. El backend sigue siendo la autoridad final.

## Fase 4: Dashboard operativo

1. Construir la pagina principal con `ContentLayout` y breadcrumbs consistentes con otros modulos de almacen.
2. Mostrar cards de resumen:
   - saldo disponible en almacen;
   - litros distribuidos en vehiculos;
   - vehiculos activos.
3. Agregar acciones rapidas:
   - registrar vehiculo;
   - saldo inicial almacen;
   - surtido externo;
   - descarga;
   - despacho;
   - consumo diario.
4. Agregar tabs o secciones:
   - `Movimientos`;
   - `Vehiculos`;
   - `Trazabilidad`.
5. Manejar estados de carga, error y vacio sin romper el layout.

## Fase 5: Vehiculos

1. Crear componentes en `components/forms/mantenimiento/almacen/combustible`:
   - `CreateFuelVehicleForm`.
2. Crear dialogos en `components/dialogs/mantenimiento/almacen/combustible`:
   - `CreateFuelVehicleDialog`;
   - dialogo o accion de activar/desactivar.
3. Validaciones frontend:
   - placa requerida;
   - tipo requerido;
   - capacidad `> 0`;
   - saldo inicial `>= 0`;
   - saldo inicial no mayor a capacidad.
4. Mostrar tabla/listado con:
   - placa;
   - tipo;
   - responsable;
   - capacidad;
   - saldo actual;
   - estado;
   - acciones.
5. Vehiculos inactivos:
   - visibles en historial y listado;
   - no seleccionables para nuevos movimientos operativos.

## Fase 6: Formularios de movimientos

Crear formularios/dialogos dedicados para cada flujo:

1. `WarehouseInitialBalanceForm`
   - fecha operativa;
   - litros `> 0`;
   - observacion opcional;
   - bloquear desde UI si ya existe saldo inicial activo, si el resumen/backend lo informa.
2. `ExternalRefuelForm`
   - vehiculo activo;
   - fecha operativa;
   - litros `> 0`;
   - validar saldo vehiculo + litros <= capacidad.
3. `WarehouseUnloadForm`
   - vehiculo activo;
   - fecha operativa;
   - litros `> 0`;
   - validar litros <= saldo vehiculo.
4. `WarehouseDispatchForm`
   - destino: vehiculo registrado o tercero;
   - si vehiculo: seleccionar vehiculo activo y validar capacidad;
   - si tercero: seleccionar `ThirdParty` desde `useGetThirdParties`;
   - fecha operativa;
   - litros `> 0`;
   - validar litros <= saldo almacen.
5. `VehicleDailyConsumptionForm`
   - vehiculo activo;
   - fecha operativa;
   - litros `> 0`;
   - validar litros <= saldo vehiculo.
6. Todos los formularios deben:
   - conservar valores ante error;
   - mostrar errores de saldo/capacidad cerca del campo afectado cuando sea posible;
   - mostrar toast de exito;
   - invalidar queries correctas.

## Fase 7: Historial y anulaciones

1. Crear tabla de movimientos con TanStack Table o patron local equivalente.
2. Columnas minimas:
   - fecha operativa;
   - tipo;
   - litros;
   - vehiculo;
   - tercero;
   - usuario;
   - estado;
   - acciones.
3. Filtros:
   - rango de fechas;
   - vehiculo;
   - tipo de movimiento;
   - tercero.
4. Crear detalle de movimiento en dialog/sheet:
   - datos principales;
   - referencia a movimiento original/anulacion;
   - observacion;
   - impacto de saldo si backend lo devuelve.
5. Crear flujo de anulacion:
   - confirmacion explicita;
   - razon opcional;
   - bloquear visualmente movimientos ya anulados y movimientos `annulment`;
   - mostrar mensajes especificos para `FIFO_ENTRY_ALREADY_CONSUMED`, `INSUFFICIENT_VEHICLE_BALANCE`, `VEHICLE_CAPACITY_EXCEEDED` y `MOVEMENT_NOT_ANNULABLE`.

## Fase 8: Trazabilidad FIFO

1. Agregar acceso al detalle FIFO desde despachos de almacen:
   - `warehouse_dispatch_vehicle`;
   - `warehouse_dispatch_third_party`.
2. Mostrar:
   - destino;
   - litros despachados;
   - entradas FIFO consumidas;
   - litros tomados por entrada;
   - fecha operativa de la entrada;
   - vehiculo origen si la entrada proviene de descarga.
3. Para movimientos sin trazabilidad FIFO, mostrar estado vacio contextual.

## Fase 9: UX y consistencia visual

1. Mantener estilo sobrio de dashboard operativo, sin landing ni hero.
2. Usar componentes existentes:
   - `Button`;
   - `Card`;
   - `Dialog`;
   - `Tabs`;
   - `Table`;
   - `Input`;
   - `Select`/`Popover Command` para busquedas.
3. Usar iconos de `lucide-react` en acciones.
4. Evitar formularios gigantes: preferir dialogos enfocados por movimiento.
5. Garantizar que cantidades y estados sean escaneables:
   - litros con formato consistente;
   - badges para estado activo/anulado/inactivo;
   - copy operativo y directo.

## Fase 10: Verificacion

1. Ejecutar lint/build si el entorno lo permite:
   - `npm run lint`;
   - `npm run build`.
2. Verificar manualmente:
   - acceso de menu para roles permitidos;
   - dashboard carga resumen;
   - alta de vehiculo;
   - validaciones de capacidad/saldo;
   - cada tipo de movimiento;
   - anulacion;
   - filtros de historial;
   - detalle FIFO.
3. Si los endpoints backend no estan disponibles, verificar:
   - TypeScript;
   - render basico;
   - formularios y validaciones frontend;
   - estados de carga/error.

## Orden recomendado de trabajo

1. Tipos y hooks base.
2. Menu y ruta principal.
3. Dashboard con resumen y tabs.
4. Vehiculos.
5. Movimientos de entrada: saldo inicial, surtido externo, descarga.
6. Movimientos de salida: despacho a vehiculo, despacho a tercero, consumo diario.
7. Historial.
8. Anulaciones.
9. Trazabilidad FIFO.
10. Pulido visual y verificacion.

## Criterios de finalizacion

- El modulo aparece en `Almacen > Combustible` solo para `SUPERUSER` y `JEFE_ALMACEN`.
- La pagina principal muestra saldos y vehiculos.
- Se pueden registrar vehiculos con saldo inicial valido.
- Se pueden registrar todos los movimientos definidos en el spec.
- Las validaciones frontend previenen errores obvios de saldo, capacidad y cantidades invalidas.
- Los errores backend canonicos se muestran con mensajes accionables.
- Los movimientos no se editan.
- Se pueden anular movimientos validos.
- Los despachos muestran trazabilidad FIFO cuando el backend la entrega.
- El proyecto pasa las verificaciones acordadas o se documentan bloqueos externos.
