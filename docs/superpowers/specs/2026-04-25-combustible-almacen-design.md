# Diseno: Modulo de Combustible en Almacen

Fecha: 2026-04-25

## Objetivo

Crear un modulo independiente de control de combustible dentro del area de Almacen. El modulo debe controlar la gasolina almacenada, la gasolina contenida en vehiculos terrestres propios, las entradas por descarga, los despachos a vehiculos o terceros, el consumo diario por vehiculo y la trazabilidad FIFO de las salidas del almacen.

El modulo no reemplaza el inventario general de articulos. Debe vivir como una capacidad separada, enfocada en combustible medido en litros.

## Alcance

Incluido en esta version:

- Registro de vehiculos terrestres propios.
- Saldo inicial auditable del almacen.
- Saldo inicial auditable por vehiculo.
- Surtido externo a vehiculo.
- Descarga desde vehiculo hacia almacen.
- Despacho desde almacen hacia vehiculo registrado.
- Despacho desde almacen hacia terceros del catalogo existente.
- Consumo diario por vehiculo.
- Anulacion auditable de movimientos.
- Stock unico visible del almacen con trazabilidad interna por entradas FIFO.
- Historial de movimientos con filtros.
- Vista de saldos actuales por vehiculo.
- Detalle de trazabilidad FIFO para despachos.

Fuera de alcance por ahora:

- Proveedor, estacion de servicio, costos, facturas o comprobantes.
- Gestion de multiples tanques o multiples almacenes de combustible.
- Saldo de combustible para terceros.
- Flujo de aprobacion.
- Edicion de movimientos ya registrados.
- Seleccion manual de lotes de combustible para despacho.

## Ubicacion en el producto

El modulo se ubicara bajo Almacen:

- Ruta principal: `/{company}/almacen/combustible`
- Menu: grupo `Almacen`, item `Combustible`
- Roles con acceso: `SUPERUSER`, `JEFE_ALMACEN`

## Modelo funcional

### Vehiculo terrestre

Cada vehiculo registrado debe tener:

- placa;
- tipo de vehiculo: carro, camion, moto u otro;
- responsable o conductor, como texto libre opcional;
- capacidad del tanque en litros;
- saldo actual de combustible en litros;
- estado activo o inactivo.

No se guardara marca del vehiculo en esta version.

La placa debe ser unica por compania. Un vehiculo inactivo sigue reservando su placa para conservar auditoria y evitar ambiguedad historica. Si se intenta crear otro vehiculo con una placa existente, el backend debe rechazar la operacion con un error de placa duplicada y la UI debe mostrarlo junto al campo de placa.

Los vehiculos inactivos permanecen visibles en historial y reportes, pero no pueden recibir nuevos movimientos operativos: surtido externo, descarga al almacen, despacho desde almacen ni consumo diario. Las anulaciones de movimientos previos relacionados con vehiculos inactivos si deben permitirse cuando cumplan las validaciones de saldo, capacidad y FIFO.

### Terceros

Los despachos especiales usaran el catalogo reutilizable existente de terceros:

- Hook actual: `useGetThirdParties`.
- Endpoint actual de lectura: `/third-parties`.
- Tipo compartido actual: `ThirdParty`.
- Campos minimos requeridos: `id`, `name`, `type`.

El formulario de despacho a tercero debe seleccionar un `third_party_id` existente y mostrar `name` como texto principal, con `type` como informacion secundaria cuando este disponible. El backend debe rechazar terceros inexistentes, eliminados, inactivos si el catalogo soporta estado, o no validos para la compania/alcance del usuario. El despacho a tercero no crea ni modifica saldo del tercero.

### Saldos

El modulo maneja dos saldos separados:

- Saldo de almacen: litros fisicamente almacenados y disponibles para despacho.
- Saldo de vehiculo: litros contenidos actualmente en cada vehiculo propio.

Ejemplo: si un camion llega con 60 L y descarga 30 L, el almacen queda con 30 L disponibles y el camion queda con 30 L en su saldo propio.

### Movimientos

Todos los cambios de saldo deben quedar como movimientos auditables. Los tipos de movimiento son:

- `warehouse_initial_balance`: saldo inicial del almacen.
- `vehicle_initial_balance`: saldo inicial de vehiculo.
- `external_refuel`: surtido externo a vehiculo.
- `warehouse_unload`: descarga de vehiculo hacia almacen.
- `warehouse_dispatch_vehicle`: despacho desde almacen hacia vehiculo registrado.
- `warehouse_dispatch_third_party`: despacho desde almacen hacia tercero.
- `vehicle_daily_consumption`: consumo diario de vehiculo.
- `annulment`: anulacion o reverso.

Cada movimiento debe guardar:

- tipo;
- fecha operativa;
- fecha de creacion;
- usuario creador;
- litros;
- vehiculo relacionado, si aplica;
- tercero relacionado, si aplica;
- observacion opcional;
- estado: activo o anulado;
- referencia al movimiento original cuando sea una anulacion.

## Reglas de negocio

- Todas las cantidades se registran en litros.
- Todo movimiento debe tener `liters > 0`, incluyendo saldos iniciales. No se permiten movimientos de 0 L ni cantidades negativas.
- La capacidad del tanque de un vehiculo debe ser `tank_capacity_liters > 0`.
- El saldo inicial de un vehiculo debe ser `>= 0` y no puede superar la capacidad del tanque. Si el saldo inicial es 0 L, se registra el vehiculo sin crear movimiento `vehicle_initial_balance`.
- Todo movimiento confirmado impacta inventario de inmediato.
- No se permite inventario negativo en almacen.
- No se permite saldo negativo en vehiculos.
- No se permite que el saldo de un vehiculo supere su capacidad de tanque.
- Un surtido externo a vehiculo aumenta el saldo del vehiculo y valida capacidad.
- Una descarga al almacen baja el saldo del vehiculo, sube el saldo del almacen y crea una entrada FIFO trazable.
- Una descarga no puede superar el saldo actual del vehiculo.
- Un despacho a vehiculo baja el saldo del almacen, sube el saldo del vehiculo, consume entradas FIFO y valida la capacidad del vehiculo.
- Un despacho a tercero baja el saldo del almacen y consume entradas FIFO, sin manejar saldo del tercero.
- Un consumo diario baja el saldo del vehiculo y no afecta el saldo del almacen.
- Un consumo diario no puede superar el saldo actual del vehiculo.
- Los movimientos no se editan.
- Si un registro es incorrecto, se anula. La anulacion revierte el impacto en stock y el usuario debe crear un nuevo movimiento correcto.
- No se puede anular un movimiento ya anulado.
- El saldo inicial del almacen solo puede registrarse una vez por compania mientras exista un movimiento activo de tipo `warehouse_initial_balance`. Si se anula ese movimiento y la anulacion es valida, se permite registrar un nuevo saldo inicial. Cualquier carga posterior de combustible debe registrarse mediante descargas desde vehiculos, no como nuevos saldos iniciales.
- Las validaciones criticas deben vivir en backend. El frontend puede duplicarlas para mejorar la experiencia, pero no es la autoridad del inventario.

## FIFO y trazabilidad

El saldo visible del almacen sera unico, pero internamente cada entrada al almacen debe conservar trazabilidad.

Entradas que crean disponibilidad FIFO:

- saldo inicial del almacen;
- descarga desde vehiculo hacia almacen;

Salidas que consumen FIFO:

- despacho a vehiculo;
- despacho a tercero;
- anulacion de una entrada, cuando aplique.

El consumo FIFO debe usar primero las entradas mas antiguas con saldo disponible. Cada despacho debe guardar el detalle de las entradas consumidas, incluyendo litros tomados de cada una. La UI debe mostrar este detalle en la vista de trazabilidad del despacho.

El orden FIFO debe basarse en secuencia de creacion, no en fecha operativa: `created_at`, luego `id` como desempate. La fecha operativa se usa para reportes, filtros y auditoria de cuando ocurrio la operacion, pero no reordena entradas ya registradas. Esto evita que un movimiento creado hoy con fecha operativa anterior cambie la trazabilidad de despachos ya realizados.

Cuando se anula un despacho, los litros consumidos deben restaurarse sobre las mismas entradas FIFO originales, conservando su fecha y origen. No se crea una nueva capa FIFO con fecha de anulacion. Esto mantiene el orden FIFO futuro como si el despacho anulado nunca hubiera consumido esas entradas, mientras el historial sigue mostrando el despacho y su anulacion.

## Anulaciones

La anulacion debe ser auditable y reversible en terminos de stock.

Al anular:

- el movimiento original queda marcado como anulado;
- se crea un movimiento de anulacion con usuario, fecha, razon opcional y referencia al original;
- se revierte el impacto de saldo del movimiento original;
- si el movimiento original consumio FIFO, debe restaurarse la disponibilidad en las entradas FIFO originales;
- si el movimiento original creo disponibilidad FIFO, solo puede anularse cuando su entrada FIFO conserva disponibilidad completa, es decir, ningun despacho activo ha consumido litros de esa entrada.

Reglas especificas:

- Anular `external_refuel` resta litros al saldo del vehiculo y debe bloquearse si el vehiculo no tiene saldo suficiente.
- Anular `warehouse_dispatch_vehicle` resta litros al saldo del vehiculo, suma disponibilidad al almacen restaurando las entradas FIFO originales y debe bloquearse si el vehiculo no tiene saldo suficiente.
- Anular `warehouse_dispatch_third_party` suma disponibilidad al almacen restaurando las entradas FIFO originales.
- Anular `vehicle_daily_consumption` suma litros al saldo del vehiculo y debe bloquearse si supera la capacidad del tanque.
- Anular `warehouse_unload` resta litros del almacen retirando la entrada FIFO creada, suma litros al saldo del vehiculo y debe bloquearse si la entrada FIFO fue consumida total o parcialmente por despachos activos, o si el saldo resultante del vehiculo supera su capacidad.
- Anular `warehouse_initial_balance` resta litros del almacen retirando la entrada FIFO creada y debe bloquearse si esa entrada fue consumida total o parcialmente por despachos activos.
- Anular `vehicle_initial_balance` resta litros al saldo del vehiculo y debe bloquearse si el vehiculo no tiene saldo suficiente.
- Un movimiento de tipo `annulment` no puede anularse. Si una anulacion fue registrada por error, se debe resolver con una correccion operativa nueva definida por negocio, no anulando la anulacion.

Si una anulacion no puede aplicarse limpiamente por saldo, capacidad o dependencias FIFO posteriores, el backend debe bloquearla con un codigo de error especifico. La UI debe informar la razon, por ejemplo: "No se puede anular porque esta entrada ya fue usada en despachos posteriores" o "No se puede anular porque el vehiculo no tiene saldo suficiente para revertir este movimiento".

## Pantallas

### Dashboard de combustible

Ruta: `/{company}/almacen/combustible`

Debe mostrar:

- saldo disponible en almacen;
- litros distribuidos en vehiculos propios;
- cantidad de vehiculos activos;
- accesos rapidos para registrar vehiculo, saldo inicial de almacen, surtido externo, descarga, despacho y consumo;
- tabla de movimientos recientes;
- secciones o pestanas para `Movimientos`, `Vehiculos` y `Trazabilidad`.

### Vehiculos

Debe permitir:

- listar vehiculos;
- crear vehiculo;
- ver saldo actual;
- activar o desactivar vehiculo.

Al crear un vehiculo se captura su saldo actual inicial. Si el saldo inicial es mayor a 0, genera automaticamente un movimiento auditable `vehicle_initial_balance`; si es 0, se crea el vehiculo sin movimiento de combustible.

### Movimientos

Debe permitir registrar:

- saldo inicial de almacen;
- surtido externo a vehiculo;
- descarga al almacen;
- despacho a vehiculo registrado;
- despacho a tercero;
- consumo diario de vehiculo.

Los formularios deben conservar los valores ingresados si el backend rechaza una operacion por saldo, capacidad u otra validacion.

### Historial

Debe permitir filtrar por:

- rango de fechas;
- vehiculo;
- tipo de movimiento;
- tercero.

Cada registro debe abrir un detalle. Los movimientos anulados deben verse claramente como anulados y enlazar su anulacion.

### Trazabilidad

Para cada despacho desde almacen, la vista de detalle debe mostrar:

- movimiento de despacho;
- destino;
- litros despachados;
- entradas FIFO consumidas;
- litros tomados de cada entrada;
- fechas y vehiculos de origen cuando la entrada provenga de una descarga.

## Integracion frontend

El frontend debe seguir los patrones actuales del repositorio:

- Rutas: `app/[company]/almacen/combustible`
- Formularios: `components/forms/mantenimiento/almacen/combustible`
- Dialogos: `components/dialogs/mantenimiento/almacen/combustible`
- Hooks de lectura: `hooks/mantenimiento/almacen/combustible`
- Mutaciones: `actions/mantenimiento/almacen/combustible/actions.ts`
- Tipos compartidos: `types/index.ts`
- Menu: `lib/menu-list-2.tsx`

El modulo debe usar TanStack Query, Axios, componentes UI existentes, formularios con validacion y patrones de toast ya presentes en el proyecto.

## Contratos esperados del backend

Endpoints requeridos, nombres finales sujetos al backend:

- listar vehiculos de combustible;
- crear vehiculo con saldo inicial;
- activar/desactivar vehiculo;
- obtener resumen de combustible;
- registrar saldo inicial de almacen;
- registrar surtido externo;
- registrar descarga al almacen;
- registrar despacho a vehiculo;
- registrar despacho a tercero;
- registrar consumo diario;
- listar movimientos con filtros;
- obtener detalle de movimiento;
- obtener trazabilidad FIFO de despacho;
- anular movimiento.

El backend debe garantizar atomicidad para operaciones de stock y debe proteger contra concurrencia, especialmente en despachos simultaneos.

### Contrato minimo de datos

Las respuestas de vehiculos deben incluir:

- `id`;
- `plate`;
- `type`;
- `responsible`;
- `tank_capacity_liters`;
- `current_balance_liters`;
- `status`;
- `created_at`;
- `updated_at`.

Las respuestas de resumen deben incluir:

- `warehouse_balance_liters`;
- `vehicle_balance_liters`;
- `active_vehicle_count`;
- `movement_count_for_period`, cuando se consulte por rango.

Las respuestas de movimientos deben incluir:

- `id`;
- `type`;
- `operational_date`;
- `created_at`;
- `created_by`;
- `liters`;
- `vehicle`, cuando aplique;
- `third_party`, cuando aplique;
- `status`;
- `observation`;
- `annulled_by_movement_id`, cuando aplique;
- `original_movement_id`, cuando sea una anulacion.

El detalle de trazabilidad FIFO de un despacho debe incluir:

- `dispatch_movement_id`;
- `total_liters`;
- `destination_type`;
- `destination_label`;
- `fifo_rows`, con `entry_movement_id`, `entry_type`, `entry_operational_date`, `source_vehicle`, `liters_taken` y `remaining_liters_after_dispatch`.

Las mutaciones deben devolver al menos el movimiento creado y los saldos actualizados de almacen y vehiculo cuando aplique. En errores de validacion de saldo/capacidad, el backend debe devolver un codigo canonico y los saldos actuales relevantes.

Codigos de error esperados:

- `INSUFFICIENT_WAREHOUSE_STOCK`;
- `INSUFFICIENT_VEHICLE_BALANCE`;
- `VEHICLE_CAPACITY_EXCEEDED`;
- `MOVEMENT_ALREADY_ANNULLED`;
- `MOVEMENT_NOT_ANNULABLE`;
- `FIFO_ENTRY_ALREADY_CONSUMED`;
- `DUPLICATE_VEHICLE_PLATE`;
- `INACTIVE_VEHICLE`;
- `INVALID_THIRD_PARTY`;
- `INVALID_LITERS`;
- `INVALID_TANK_CAPACITY`;
- `CONCURRENT_STOCK_CONFLICT`.

Conflictos de concurrencia deben responder con un estado HTTP de conflicto, preferiblemente `409`, junto con los saldos actualizados para que la UI pueda refrescar y explicar el bloqueo.

## Errores esperados

La UI debe manejar al menos:

- stock insuficiente en almacen;
- saldo insuficiente en vehiculo;
- capacidad de tanque excedida;
- movimiento ya anulado;
- movimiento no anulable;
- vehiculo inactivo;
- tercero no valido;
- placa de vehiculo duplicada;
- litros o capacidad de tanque invalidos;
- conflicto de concurrencia por saldo actualizado;
- errores generales de red o servidor.

Los mensajes deben explicar la causa y, cuando sea posible, mostrar el saldo actual devuelto por el backend.

## Pruebas sugeridas

Pruebas de frontend:

- validaciones de formularios por tipo de movimiento;
- bloqueo visual de cantidades invalidas;
- calculo y render de saldos;
- filtros de historial;
- visibilidad del menu por rol;
- render de trazabilidad FIFO en detalle de despacho.

Pruebas de integracion o backend:

- creacion de saldo inicial de almacen;
- creacion de vehiculo con saldo inicial;
- bloqueo de placa duplicada por compania;
- bloqueo de litros en 0 o negativos;
- bloqueo de capacidad de tanque en 0 o negativa;
- surtido externo validando capacidad;
- descarga validando saldo de vehiculo;
- despacho a vehiculo validando stock y capacidad;
- despacho a tercero validando stock;
- consumo diario validando saldo de vehiculo;
- consumo FIFO con multiples entradas;
- anulacion de cada tipo de movimiento;
- bloqueo de anulacion de movimientos `annulment`;
- bloqueo de anulaciones no seguras;
- bloqueo de movimientos operativos para vehiculos inactivos;
- concurrencia en despachos.

## Criterios de aceptacion

- Solo `SUPERUSER` y `JEFE_ALMACEN` pueden acceder al modulo.
- Un usuario autorizado puede registrar vehiculos terrestres con saldo inicial auditable.
- Las placas de vehiculos son unicas por compania, incluyendo vehiculos inactivos.
- El dashboard muestra saldo de almacen, saldo distribuido en vehiculos y vehiculos activos.
- Cada movimiento impacta saldos inmediatamente.
- Solo puede existir un saldo inicial activo de almacen por compania.
- Todo movimiento operativo debe registrar litros mayores a 0.
- La capacidad del tanque de un vehiculo debe ser mayor a 0.
- No se puede despachar mas combustible del disponible en almacen.
- No se puede cargar un vehiculo por encima de su capacidad.
- No se puede descargar o consumir mas combustible del saldo del vehiculo.
- Los vehiculos inactivos no reciben nuevos movimientos operativos, pero siguen visibles en historial.
- Los despachos consumen entradas FIFO automaticamente.
- El detalle de un despacho muestra la trazabilidad de las entradas FIFO consumidas.
- Los movimientos no se pueden editar.
- Un movimiento puede anularse, generando auditoria y reverso de stock cuando sea valido.
- Un movimiento de anulacion no puede anularse.
- El orden FIFO se determina por creacion de la entrada, con `id` como desempate, no por fecha operativa.
- La anulacion de un despacho restaura disponibilidad sobre las entradas FIFO originales.
- La anulacion de una entrada FIFO se bloquea si ya fue consumida total o parcialmente por despachos activos.
- Los despachos a terceros usan el catalogo reutilizable de terceros y no mantienen saldo del tercero.
