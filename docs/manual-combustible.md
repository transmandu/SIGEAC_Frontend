# Manual de Usuario — Control de Combustible

## 1. Registro de Vehículos

**Propósito:** Dar de alta un vehículo en el sistema para poder registrar operaciones de combustible sobre él.

**Pasos:**
1. Ingresa al módulo **Almacén → Combustible**.
2. Haz clic en el botón **"Registrar vehículo"** (esquina superior derecha).
3. Completa los campos del formulario:
   - **Placa:** Identificador único del vehículo (ej: `A12BC3`).
   - **Tipo:** Carro, Camión, Moto u Otro.
   - **Responsable / Conductor:** Persona asignada al vehículo (opcional).
   - **Capacidad del tanque:** Capacidad máxima en litros (ej: `60`).
   - **Saldo actual inicial:** Si el vehículo ya tiene combustible al momento de registrarse (ej: `25`). No puede superar la capacidad del tanque. Si es mayor a 0, el sistema creará automáticamente un movimiento de tipo "Saldo inicial vehículo".
   - **Rendimiento (km/L):** Cuántos kilómetros recorre el vehículo por cada litro de combustible (ej: `10.5`). Este dato es necesario si se desea usar el cálculo automático por kilometraje en los recorridos.
   - **Kilometraje inicial:** Lectura actual del odómetro al momento de registrar el vehículo (ej: `15000`). Sirve como punto de referencia para el primer recorrido por kilometraje.
4. Haz clic en **"Registrar vehículo"**.

**Resultado:** El vehículo aparece en la pestaña **Vehículos** con estado "Activo".

---

## 2. Activar / Inactivar Vehículos

**Propósito:** Un vehículo inactivo no puede recibir nuevas operaciones de combustible, pero su historial se conserva.

**Pasos:**
1. Ve a la pestaña **Vehículos**.
2. Localiza el vehículo en la tabla.
3. Haz clic en el botón **"Inactivar"** (si está activo) o **"Activar"** (si está inactivo).

**Resultado:** El estado del vehículo cambia inmediatamente. Si está inactivo, no aparecerá como opción al registrar movimientos.

---

## 3. Saldo Inicial de Almacén

**Propósito:** Establecer la cantidad de combustible disponible en el almacén al iniciar el sistema. Solo puede existir un saldo inicial activo a la vez.

**Pasos:**
1. En la sección **Acciones rápidas**, haz clic en **"Saldo inicial almacén"**.
2. Completa:
   - **Fecha operativa:** Fecha en que se realizó el conteo.
   - **Litros:** Cantidad de combustible en almacén.
   - **Observación** (opcional).
3. Haz clic en **"Registrar movimiento"**.

**Resultado:** El resumen superior muestra el saldo del almacén actualizado. Se crea una entrada FIFO que será consumida por futuros despachos.

---

## 4. Surtido Externo

**Propósito:** Registrar cuando un vehículo es abastecido de combustible desde una fuente externa (ej: estación de servicio), sin pasar por el almacén.

**Pasos:**
1. Haz clic en **"Surtido externo"** en Acciones rápidas.
2. Completa:
   - **Fecha operativa.**
   - **Litros:** Cantidad cargada.
   - **Vehículo:** Selecciona el vehículo que fue abastecido (solo aparecen los activos).
   - **Observación** (opcional).
3. El sistema valida que los litros cargados no superen la capacidad disponible del tanque.
4. Haz clic en **"Registrar movimiento"**.

**Resultado:** El saldo del vehículo aumenta. El almacén no se ve afectado.

---

## 5. Descarga al Almacén

**Propósito:** Cuando un vehículo devuelve combustible al almacén (ej: se trasvasó del tanque del vehículo al depósito).

**Pasos:**
1. Haz clic en **"Descarga al almacén"**.
2. Completa:
   - **Fecha operativa.**
   - **Litros:** Cantidad devuelta.
   - **Vehículo:** El que entrega el combustible.
   - **Observación** (opcional).
3. El sistema valida que el vehículo tenga saldo suficiente.
4. Haz clic en **"Registrar movimiento"**.

**Resultado:** El saldo del vehículo disminuye, el saldo del almacén aumenta. Se crea una nueva entrada FIFO en el almacén.

---

## 6. Despacho a Vehículo

**Propósito:** Entregar combustible del almacén a un vehículo registrado.

**Pasos:**
1. Haz clic en **"Despacho a vehículo"**.
2. Completa:
   - **Fecha operativa.**
   - **Litros:** Cantidad a despachar.
   - **Vehículo:** El que recibe el combustible.
   - **Finalidad del despacho** (obligatorio): Motivo del despacho (ej: `BÚSQUEDA DE MATERIALES EN FERRETERÍA`).
   - **Observación** (opcional).
3. Validaciones:
   - El almacén debe tener stock suficiente.
   - El vehículo no debe exceder su capacidad de tanque.
4. Haz clic en **"Registrar movimiento"**.

**Resultado:** El saldo del almacén disminuye (consumo FIFO), el saldo del vehículo aumenta. Se generan registros de trazabilidad FIFO.

---

## 7. Despacho a Tercero

**Propósito:** Entregar combustible del almacén a una persona o entidad externa (no un vehículo registrado).

**Pasos:**
1. Haz clic en **"Despacho a tercero"**.
2. Completa:
   - **Fecha operativa.**
   - **Litros.**
   - **Tercero:** Selecciona de la lista de terceros registrados en el sistema.
   - **Finalidad del despacho** (obligatorio).
   - **Observación** (opcional).
3. El sistema valida que el almacén tenga stock suficiente.
4. Haz clic en **"Registrar movimiento"**.

**Resultado:** El saldo del almacén disminuye. No se modifica ningún vehículo. Se generan registros de trazabilidad FIFO.

---

## 8. Consumo Diario

**Propósito:** Registrar al final del día el total de combustible consumido por un vehículo durante su jornada.

**Pasos:**
1. Haz clic en **"Consumo diario"**.
2. Completa:
   - **Fecha operativa.**
   - **Litros:** Total consumido en el día.
   - **Vehículo.**
   - **Observación** (opcional).
3. El sistema valida que el vehículo tenga saldo suficiente.
4. Haz clic en **"Registrar movimiento"**.

**Resultado:** El saldo del vehículo disminuye. Es un registro consolidado (un solo movimiento por día).

---

## 9. Recorrido Vehicular

**Propósito:** Registrar cada viaje o recorrido individual de un vehículo, con destino y consumo. A diferencia del consumo diario, este captura cada movimiento por separado.

**Tiene dos modos de operación:**

### 9A. Modo Manual (litros)

1. Haz clic en **"Recorrido vehicular"**.
2. Aparece el selector **"Modo de cálculo"** — selecciona **"Manual (litros)"** (es el modo por defecto).
3. Completa:
   - **Fecha operativa.**
   - **Litros:** Cantidad consumida en el recorrido.
   - **Vehículo.**
   - **Destino / Motivo** (obligatorio): A dónde fue y por qué (ej: `IDA A FERRETERÍA POR MATERIALES`).
   - **Observación** (opcional).
4. Haz clic en **"Registrar movimiento"**.

**Resultado:** El saldo del vehículo disminuye por la cantidad indicada.

### 9B. Modo Por Kilometraje (automático)

**Requisitos previos:** El vehículo debe tener configurados el **rendimiento (km/L)** y el **kilometraje inicial**.

1. Haz clic en **"Recorrido vehicular"**.
2. Selecciona el modo **"Por kilometraje"**.
3. Completa:
   - **Fecha operativa.**
   - **Vehículo.**
   - **Kilometraje actual:** La lectura actual del odómetro (ej: `15320`).
   - **Destino / Motivo** (obligatorio).
   - **Observación** (opcional).
4. El sistema calcula automáticamente:
   - Busca el último recorrido registrado de ese vehículo que tenga kilometraje.
   - Si no hay recorridos previos, usa el **kilometraje inicial** del vehículo.
   - Calcula: `(km actual - km anterior) / rendimiento km/L = litros consumidos`.
   - Ejemplo: `(15320 - 15300) / 10 = 2.0 litros`.
5. El sistema valida que el kilometraje ingresado sea mayor al último registrado.
6. Haz clic en **"Registrar movimiento"**.

**Resultado:** El saldo del vehículo disminuye por los litros calculados automáticamente. El movimiento queda registrado con el kilometraje para referencia futura.

---

## 10. Anulación de Movimientos

**Propósito:** Revertir un movimiento que fue registrado por error. No se elimina, se crea un movimiento de anulación que deja rastro auditable.

**Pasos:**
1. Ve a la pestaña **Movimientos**.
2. Localiza el movimiento a anular.
3. Haz clic en el botón de anulación (solo disponible si el movimiento está activo y no es una anulación).
4. Opcionalmente, escribe una **razón**.
5. Confirma la anulación.

**Validaciones según tipo:**

| Tipo original | Qué valida antes de anular |
|---|---|
| Surtido externo / Saldo inicial vehículo | Que el vehículo tenga saldo suficiente para restar lo que se le dio |
| Consumo diario / Recorrido vehicular | Que devolver los litros no supere la capacidad del tanque |
| Saldo inicial almacén / Descarga al almacén | Que la entrada FIFO no haya sido consumida por despachos posteriores |
| Despacho a vehículo | Que el vehículo tenga saldo suficiente para devolver + restaura las entradas FIFO |
| Despacho a tercero | Restaura las entradas FIFO consumidas |

**Resultado:** El movimiento original pasa a estado "Anulado". Se crea un nuevo movimiento de tipo "Anulación" vinculado al original. Todos los saldos se revierten.

---

## 11. Consulta de Movimientos

**Pasos:**
1. Ve a la pestaña **Movimientos**.
2. Usa los filtros disponibles:
   - **Rango de fechas** (desde / hasta).
   - **Vehículo** específico.
   - **Tercero** específico.
   - **Tipo de movimiento**.
3. La tabla muestra: fecha, tipo, destino/origen, finalidad, litros, estado y acciones.
4. Haz clic en el botón de detalle para ver información completa de un movimiento.

---

## 12. Trazabilidad FIFO

**Propósito:** Ver exactamente de dónde provino el combustible despachado. El sistema usa el método FIFO (primero en entrar, primero en salir) para consumir las entradas del almacén.

**Pasos:**
1. Ve a la pestaña **Trazabilidad**.
2. Solo se listan los movimientos de tipo despacho (a vehículo o a tercero).
3. Haz clic en el botón de detalle de un despacho.
4. Se muestra una tabla con:
   - De qué entrada FIFO se tomó combustible.
   - Cuántos litros se tomaron de cada entrada.
   - Cuántos litros quedaron disponibles en esa entrada después del despacho.
   - El tipo y fecha del movimiento que originó cada entrada (saldo inicial, descarga, etc.).

---

## 13. Panel de Resumen

En la parte superior de la página se muestran tres tarjetas:
- **Almacén disponible:** Total de litros disponibles en el almacén (suma de entradas FIFO).
- **En vehículos:** Total de litros distribuidos en todos los vehículos activos.
- **Vehículos activos:** Cantidad de vehículos con estado activo.

---

## Roles con Acceso

Solo los usuarios con rol **SUPERUSER** o **JEFE_ALMACEN** pueden acceder al módulo de combustible.

---

## Códigos de Error

| Código | Mensaje |
|---|---|
| `INSUFFICIENT_WAREHOUSE_STOCK` | No hay suficiente combustible disponible en almacén. |
| `INSUFFICIENT_VEHICLE_BALANCE` | El vehículo no tiene saldo suficiente para esta operación. |
| `VEHICLE_CAPACITY_EXCEEDED` | La operación supera la capacidad del tanque del vehículo. |
| `MOVEMENT_ALREADY_ANNULLED` | Este movimiento ya fue anulado. |
| `MOVEMENT_NOT_ANNULABLE` | Este movimiento no puede anularse. |
| `FIFO_ENTRY_ALREADY_CONSUMED` | No se puede anular porque la entrada ya fue usada en despachos posteriores. |
| `DUPLICATE_VEHICLE_PLATE` | Ya existe un vehículo con esta placa. |
| `INACTIVE_VEHICLE` | El vehículo está inactivo y no acepta nuevos movimientos. |
| `MISSING_KM_PER_LITER` | El vehículo no tiene configurado el rendimiento (km/L). |
| `INVALID_ODOMETER` | El kilometraje debe ser mayor al último registrado. |
| `CONCURRENT_STOCK_CONFLICT` | El saldo cambió mientras registrabas la operación. Actualiza e intenta de nuevo. |

---

## Mejoras Propuestas a Futuro

### Corto plazo (mejoras inmediatas)

1. **Edición de vehículos:** Actualmente solo se puede crear y activar/inactivar. Sería útil poder editar el rendimiento (km/L), el responsable, la capacidad del tanque y el kilometraje sin tener que crear uno nuevo.

2. **Alertas de saldo bajo:** Notificaciones cuando el almacén o un vehículo esté por debajo de un umbral configurable (ej: "El almacén tiene menos de 50 litros").

3. **Historial de kilometraje por vehículo:** Una vista dedicada que muestre la secuencia de lecturas del odómetro de cada vehículo, permitiendo identificar inconsistencias o patrones de uso.

4. **Exportación a Excel/PDF:** Generar reportes descargables de movimientos, resúmenes por período, consumo por vehículo, etc. Útil para auditorías y controles internos.

### Mediano plazo (valor operativo)

5. **Dashboard de estadísticas:** Gráficos de consumo por vehículo, por período, tendencias, comparación entre vehículos. Identificar cuáles consumen más de lo esperado.

6. **Consumo estimado vs. real:** Si un vehículo tiene rendimiento configurado, comparar el consumo teórico (por km) contra el real (por litros cargados/despachados). Diferencias grandes pueden indicar fugas, mal uso o necesidad de mantenimiento.

7. **Registro de conductores por recorrido:** Actualmente el responsable está en el vehículo, pero si múltiples personas usan el mismo vehículo, poder registrar quién lo condujo en cada recorrido.

8. **Aprobaciones y flujo de trabajo:** Que ciertos movimientos (despachos grandes, anulaciones) requieran aprobación de un supervisor antes de ejecutarse.

9. **Conciliación periódica:** Una función para verificar que el saldo teórico del sistema coincida con un conteo físico real, registrando diferencias como ajustes auditables.

### Largo plazo (escalabilidad)

10. **Múltiples almacenes:** Soporte para más de un punto de almacenamiento de combustible, con transferencias entre ellos.

11. **Integración con GPS/telemetría:** Si los vehículos tienen GPS, obtener el kilometraje automáticamente en lugar de ingresarlo manualmente.

12. **Predicción de reabastecimiento:** Basándose en el historial de consumo, estimar cuándo el almacén necesitará reabastecerse y generar alertas preventivas.

13. **Costos y facturación:** Asociar precio por litro a cada entrada de combustible para calcular costos operativos por vehículo, por recorrido y por período.

14. **Auditoría completa:** Un log detallado de quién hizo qué y cuándo, más allá del `registered_by` actual. Incluir IP, timestamp exacto y cambios específicos para cumplir requisitos de auditoría más estrictos.
