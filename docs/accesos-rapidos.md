# Catálogo de accesos rápidos — estado y criterio de cobertura

> Documento vivo del buscador global (**Ctrl/⌘ + K**, «Catálogo de accesos
> rápidos»). No hay un comando que lo audite: **no todo debe tener acceso
> rápido**, y decidir qué sí es una evaluación de criterio, no una regla
> mecánica. Este documento fija el criterio y deja el procedimiento para que, de
> vez en cuando, una persona con apoyo de una IA lo contraste con el estado real
> del proyecto y lo actualice.
>
> **Última evaluación:** 2026-11-27 (paso 2 cerrado: todos los bloques de
> `app/[company]/*`, `app/sistema`, `app/cuenta`, notificaciones y dashboard).

---

## 1. Qué ofrece el catálogo

El diálogo lista, en este orden:

1. **Accesos del sistema** (`hooks/helpers/use-system-palette-sections.ts`):
   cambiar de empresa o estación, tema, marcar notificaciones como leídas,
   reportar un problema, cerrar sesión.
2. **Pantallas del menú** (`getMenuList`), con los mismos filtros del sidebar
   (roles, módulo, tipo de empresa, tablas disponibles).
3. Colgando de cada pantalla, en árbol (`lib/navigation-palette.ts`):
   - **Vistas**: pestañas u otras pantallas sin entrada de menú (`?tab=`, o una
     ruta propia). Van primero y se muestran en gris.
   - **Acciones**: crear/registrar/descargar. Van después y se muestran en azul.
     Una acción que vive dentro de una pestaña cuelga de la vista de esa pestaña.

Las vistas y acciones se declaran en **`lib/menus/quick-actions.ts`** (fuente de
verdad; no se duplica aquí su listado completo, que quedaría desfasado en días).

## 2. Cómo se conecta una acción o vista

| Pieza | Dónde | Qué hace |
|---|---|---|
| `?accion=<nombre>` | `hooks/helpers/use-action-dialog.ts` | Abre un diálogo de la pantalla; el parámetro se consume (se retira de la URL). |
| `?tab=<valor>` | `hooks/helpers/use-tab-param.ts` | Fija la pestaña activa. Tercer argumento opcional = otro nombre de parámetro (p. ej. `dashboard`). |
| `consumeUrlParam` | `hooks/helpers/consume-url-param.ts` | Retira varios parámetros en una sola navegación. |
| Entrada del catálogo | `lib/menus/quick-actions.ts` | `href`, `parentHref`, `entryType: "view"` (vistas), `roles`, `excludedRoles`, `requiresTables`, `requiresOmac`, `keywords`. |

Un `Suspense` en `DashboardLayout` cubre los hooks de URL en las rutas
prerrenderizadas (cuenta, sistema).

## 3. Criterio: qué merece acceso rápido

**Sí:**
- Acciones de crear/registrar/importar/descargar que hoy abren un diálogo o una
  pantalla propia y se usan con frecuencia.
- Pestañas o pantallas sin entrada de menú que son destinos reales (p. ej.
  «Administrar calendario», «Historial de vuelos»).

**No:**
- Acciones que exigen una **selección previa en la tabla** (fusionar, editar en
  lote, acciones por fila).
- Diálogos embebidos dentro de otro formulario o de una fila.
- Pestañas que son una simple partición de datos sin identidad propia.
- Informes cuando dependen de una selección o de la pestaña activa; solo se
  ofrecen si son un diálogo de página, y van **al final** de las acciones.
- Cualquier cosa que el usuario no podría ejecutar en la pantalla destino.

## 4. Reglas de oro al añadir o cambiar una entrada

1. **Los roles son los de la pantalla destino**, no los del menú: copiar el
   layout / `ProtectedRoute` / `canWrite`, no la entrada del sidebar. (Error ya
   cometido en Operaciones: el menú mostraba más roles de los que pueden escribir.)
2. La acción va en la **página principal** de su pantalla. Si el diálogo está
   embebido en otro componente, se le pasan `open/onOpenChange` y el hook vive en
   la página.
3. Si el diálogo se abre por URL en una página con `canManage`/`canWrite`,
   proteger con `&& canManage` para que la URL no salte el permiso.
4. Un mismo diálogo en dos pantallas se registra **una sola vez** (reparto de
   audiencia con `excludedRoles`, como el reporte de salidas o el dashboard).
5. El dashboard cambia por rol con la precedencia SUPERUSER > almacén > SMS >
   administración; sus vistas replican esa precedencia con
   `roles` + `excludedRoles`.
6. Cada diálogo usa un nombre de `?accion=` propio; una pantalla con dos
   diálogos de crear no debe abrirlos a la vez.
7. Vistas por pestaña solo si la pestaña existe en `useTabParam` con ese valor
   (un valor no listado se ignora).
8. Si un grupo de acciones se declara por varios grupos de roles, el catálogo
   deduplica por id; no hace falta evitar la repetición a mano.

## 5. Procedimiento de evaluación periódica (para una persona + IA)

Objetivo: comprobar que el catálogo sigue reflejando el proyecto. No hace falta
cubrir todo; hace falta que **lo declarado sea cierto** y que **lo importante
nuevo no se haya quedado fuera por descuido**.

**A. Lo declarado sigue siendo cierto (roturas)**
1. Cada `?accion=<x>` de `quick-actions.ts` tiene un `useActionDialog("<x>")`
   (o `movimiento-<tipo>` en combustible) montado en esa pantalla:
   `grep -rn "useActionDialog(" app components`.
2. Cada `?tab=<v>` existe en el `useTabParam([...])` de la pantalla.
3. Cada `parentHref` apunta a una pantalla, vista o entrada del menú que existe.
4. Las rutas de `href` siguen existiendo en `app/`.
5. Los `roles` siguen coincidiendo con los de la pantalla destino (revisar el
   layout y `canWrite`).
6. Las `requiresTables` siguen existiendo en el backend (`useGetAvailableTables`).

**B. Lo nuevo que quizá merece entrada (crecimiento)**
1. Pantallas añadidas desde la última evaluación: `git log --since=<fecha>
   --name-status -- app | grep "^A"` filtrando `page.tsx`.
2. Diálogos nuevos de crear/registrar en esas pantallas
   (`DialogTrigger` en `page.tsx` o `data-table.tsx`).
3. Pestañas nuevas (`<Tabs` / `TabsTrigger`) con identidad propia.
4. Aplicar la sección 3 a cada candidato; anotar la decisión en la sección 7
   (también las negativas, para no volver a discutirlas).

**C. Coherencia visual y de permisos**
1. Entrar como un rol de cada módulo y comprobar que el catálogo no ofrece nada
   que la pantalla destino rechace.
2. Comprobar el árbol (vistas antes que acciones, hijos bajo su vista).

Al terminar, actualizar la fecha de «Última evaluación» y la sección 7.

## 6. Cobertura actual (resumen por bloque)

Detalle exacto en `lib/menus/quick-actions.ts`.

| Bloque | Vistas | Acciones |
|---|---|---|
| Sistema (master) | Historial de importaciones | Crear empresa, usuario, rol, banco, reporte de error; importar WhatsApp; cuenta y tarjeta (solo sin empresa) |
| Perfil / Cuenta | Notificaciones sin leer | Solicitar cambio de contraseña |
| Dashboard | Dashboards de almacén/administración/SMS y sus pestañas | — |
| General | Calendario (administrar, tipos, manuales), cursos por expirar, matriz (grupos, módulos, patrones) | Crear tipo/evento, curso, grupo/módulo/patrón, subir documento/carpeta, solicitud, cargar certificado(s) |
| SMS | Reportes obligatorios, peligros RVP, uniformes (movimientos, tipos, marcas) | Reporte voluntario/obligatorio, cambio, actividad, minuta, artículo/movimiento/tipo/marca de uniforme |
| Supervisor | Inventario completo de artículos generales | — |
| Control de calidad | Pendientes por formato, re-inspección | Ver formatos emitidos |
| Compras | — | Nueva solicitud (aeronáutica / general), reporte de solicitudes |
| Almacén | Traslados, recepción general, trazabilidad y vehículos de combustible | Crear renglón, salida, reporte de salidas, salida a taller, caja de herramientas, vehículo, 7 movimientos de combustible |
| Ajustes | Empleados inactivos | Crear unidad, fabricante, proveedor, comercio, cliente, aeronave, tercero, condición, fuente, agencia, piloto, ubicación, empleado, cargo, almacén, convenio |
| Planificación | Historial de vuelos, registro de auditoría | OT, ingresar aeronave, controles (mantenimiento, componentes, aviónica, directivas), reporte de salidas, registrar vuelo, importar bitácora |
| Operaciones | Aeronaves externas | Manifiesto de vuelo, WhatsApp, guía de carga (+externa), manifiesto de carga |
| Administración | — | Cuenta bancaria, tarjeta |

## 7. Decisiones registradas (qué NO tiene acceso y por qué)

Actualizar al evaluar. Formato: pantalla · qué · motivo.

- Supervisor › artículos generales · fusionar y editar en lote · exigen una
  selección hecha en la tabla.
- Biblioteca · «Subir documento», «Crear carpeta» y la vista «Papelera de la
  biblioteca» solo para SUPERUSER/ADMIN/ADMINISTRADOR · la pantalla también deja
  a quien tiene cargo de director; un rol no puede expresarlo (esa persona sigue
  teniéndolo en su pantalla, no en el catálogo). Las vistas «Documentos
  favoritos» y «Documentos recientes» (`?tab=favoritos|recientes`) las ve
  cualquiera que abra la biblioteca; la papelera por URL se protege con
  `canManage`.
- Biblioteca · copiar, mover, renombrar, eliminar, favorito, versiones,
  compartir · acciones por documento: exigen elegir un documento.
- Mantenimiento (control de directivas/componentes/aviónica) · «Consultar
  Estado» (snapshot) · pendiente de replicar el diseño aprobado en esos
  módulos; entrar al catálogo cuando exista.
- Planificación › reporte de salidas · solo JEFE/ANALISTA de planificación sin
  rol de almacén · el mismo diálogo ya cuelga de almacén › Salidas.
- Operaciones › importar WhatsApp · no para OPERADOR_COUNTER/DESPACHADOR · la
  pantalla se lo quita.
- Dashboard › pestaña «Principal» de cada perfil · es el propio dashboard.
- `general_admin`, `planificacion/{reportes,trabajadores}`,
  `sms/.../medidas_de_mitigacion` · eliminadas del proyecto; no deben volver a
  aparecer en el catálogo.

## 8. Límites conocidos

- Las vistas por pestaña solo cambian la pestaña; si el contenido de esa pestaña
  necesita más estado (filtros) no se transporta por URL.
- Los accesos del sistema (empresa/estación/tema/sesión) no dependen del menú ni
  de módulo alguno y están siempre disponibles.
- «Reportar un problema» no se ofrece al SUPERUSER (su botón lleva a la gestión
  de reportes) ni a nadie cuando `ERROR_REPORT_VISIBLE_TO_NORMAL_USERS` es falso.
- Por debajo de 17 rem de ancho se oculta el botón de tema y el de reporte del
  navbar; siguen disponibles desde el catálogo (salvo lo anterior).
