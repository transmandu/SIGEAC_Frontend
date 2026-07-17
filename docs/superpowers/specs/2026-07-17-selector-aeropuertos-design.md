# Diseno: Selector de aeropuertos IATA/ICAO para rutas y control de vuelos

Fecha: 2026-07-17

## Objetivo

Reemplazar los campos de texto libre donde el usuario escribe manualmente el codigo de aeropuerto (ej. "PZO", "CCS") por un selector con busqueda (combobox) respaldado por un catalogo real de aeropuertos IATA/ICAO. Esto evita nomenclaturas erroneas o inconsistentes al capturar rutas de vuelo.

## Problema actual

Dos formularios capturan codigos de aeropuerto como texto libre, sin validacion contra un catalogo:

- `components/forms/mantenimiento/ordenes_trabajo/CreateFlightControlForm.tsx` — campos `origin`/`destination` (edicion de un vuelo) y `flights.${index}.origin`/`flights.${index}.destination` (filas dinamicas de creacion de vuelos).
- `components/forms/aerolinea/administracion/CreateRouteForm.tsx` — campos `from`/`to` y el arreglo dinamico `layover` (escalas) de la ruta maestra.

En ambos casos el dato viaja al backend como string simple (`Route.from`, `Route.to`, `Route.layover: string[]`, `FlightControl.origin`, `FlightControl.destination`), sin relacion a ninguna entidad de aeropuerto. El objetivo de este trabajo es exclusivamente mejorar la captura en el frontend; no se toca el esquema de datos ni el backend.

## Alcance

Incluido en esta version:

- Catalogo estatico de aeropuertos con codigo IATA, generado a partir de `mwgg/Airports` (github), filtrado a los ~9,000 registros que tienen codigo IATA, con solo los campos `iata`, `icao`, `name`, `city`, `country`.
- Un hook `useAirports()` que carga ese catalogo una sola vez por sesion (via TanStack Query, `staleTime: Infinity`).
- Un componente reutilizable `AirportCombobox` (Command + Popover, mismo patron que `AircraftSelect` en `CreateFlightControlForm.tsx`) que fuerza la seleccion de un aeropuerto del catalogo (sin texto libre).
- Integracion en `CreateFlightControlForm.tsx`: reemplaza los `<Input>` de `origin`/`destination` en `EditForm` y en cada fila de `CreateForm`.
- Integracion en `CreateRouteForm.tsx`: reemplaza los `<Input>` de `from`/`to` y de cada entrada del arreglo `layover`.

Fuera de alcance por ahora:

- Cambios de backend o de esquema de datos (`Route`, `FlightControl` siguen guardando el codigo IATA como string).
- Cualquier otro formulario que no haya sido identificado en la exploracion (ver "Formularios explorados y descartados").
- Un componente de combobox generico reutilizable para otros catalogos (`SearchableCombobox<T>`) — se construye especificamente para aeropuertos; si aparece otro caso de uso similar en el futuro, se evalua extraer la abstraccion en ese momento.
- Actualizacion automatica/periodica del catalogo de aeropuertos — el JSON se regenera manualmente corriendo el script de filtrado si hace falta.

## Formularios explorados y descartados

- `app/[company]/administracion/gestion_vuelos/vuelos/` y `historial_vuelo/`: no tienen formulario propio de creacion; la creacion de vuelos ocurre en `components/forms/aerolinea/administracion/CreateFlightForm.tsx`, que selecciona una `Route` existente por `route_id` (ya es un combobox sobre `useGetRoute()`), no un codigo de aeropuerto en texto libre. Fuera de alcance.
- Resto de formularios con campos "origin"/"destination" en el codebase (`ReceptionRegisterToolForm.tsx` y similares en `almacen/recepcion_administrativa`): son campos de origen de recepcion de articulos, sin relacion con aeropuertos. Fuera de alcance.

## Datos: catalogo de aeropuertos

- Fuente: `https://raw.githubusercontent.com/mwgg/Airports/master/airports.json`.
- Proceso: descargar una vez, filtrar a registros con `iata` no vacio, proyectar a `{ iata, icao, name, city, country }`, y escribir el resultado en `public/data/airports.json`.
- El archivo se sirve como asset estatico (no entra al bundle de JS). Tamano estimado 400-500KB.
- No hay paso de build automatizado para regenerar este archivo; si el catalogo de aeropuertos cambia, se vuelve a correr el mismo procedimiento de descarga y filtrado manualmente.

## Hook `useAirports()`

- Ubicacion: `hooks/general/useAirports.ts`.
- Implementacion: `useQuery` de TanStack Query que hace `fetch('/data/airports.json')`, `staleTime: Infinity` (dato estatico, no debe refetchearse en la sesion).
- Retorna `{ data: Airport[] | undefined, isLoading: boolean, isError: boolean }`.
- Tipo `Airport`: `{ iata: string; icao: string; name: string; city: string; country: string }`, agregado a `types/index.ts` junto al resto de tipos del dominio.

## Componente `AirportCombobox`

- Ubicacion: `components/selects/AirportCombobox.tsx`.
- Props: `value: string | null`, `onChange: (iata: string | null) => void`, `placeholder?: string`, `disabled?: boolean`.
- Patron UI: identico a `AircraftSelect` (Popover + Command + CommandInput + CommandList + CommandItem con check de seleccionado), reutilizando los mismos primitivos de `components/ui/command.tsx` y `components/ui/popover.tsx` ya usados en el proyecto.
- Trigger (boton cerrado): muestra unicamente el codigo IATA seleccionado (ej. "PZO") o el `placeholder` si no hay seleccion — mantiene el mismo ancho compacto que el `<Input>` actual, apto para las columnas angostas de la grilla de vuelos (`grid-cols-[1fr_1fr_1fr_1fr_1fr_80px_80px_28px]`).
- Lista desplegada: cada item muestra codigo + ciudad + nombre del aeropuerto, ej. "PZO — Puerto La Cruz, Gen. Jose A. Anzoategui, Venezuela", para que el usuario pueda confirmar visualmente antes de elegir.
- Filtrado: client-side, substring case-insensitive sobre `iata`, `icao`, `city`, `name`; sin debounce ni virtualizacion (~9,000 registros en memoria es suficientemente rapido para un filtro simple).
- Seleccion forzada: no se permite guardar texto libre que no corresponda a un item del catalogo. Al seleccionar un item, `onChange` recibe el codigo `iata`.

## Integracion en los formularios

### `CreateFlightControlForm.tsx`

- `EditForm`: los `FormField` de `origin` y `destination` (lineas ~316-341 actuales) cambian su `render` para usar `AirportCombobox` en vez de `Input`, conservando `FormLabel`/`FormMessage`.
- `CreateForm`: dentro del `.map` de `fields`, los `FormField` de `flights.${index}.origin` y `flights.${index}.destination` cambian de la misma forma.
- El esquema Zod (`flightEntrySchema`, `editFormSchema`) no cambia: sigue siendo `origin: z.string().optional()`, `destination: z.string().optional()` — el combobox produce el mismo tipo de valor que el `Input` actual.

### `CreateRouteForm.tsx`

- Los `FormField` de `from` y `to` cambian de `Input` a `AirportCombobox`.
- El arreglo dinamico `layover` (escalas) cambia cada item de `Input` a `AirportCombobox`, manteniendo la logica existente de agregar/quitar escalas (`useFieldArray` o equivalente ya presente en el archivo).
- El esquema Zod de esta ruta tampoco cambia de forma; sigue siendo `z.string()` para `from`/`to` y `z.array(z.string())` para `layover`.

## Testing

- Verificacion manual en dev server (`npm run dev`): abrir el dialogo de creacion/edicion de vuelo y el de creacion/edicion de ruta, buscar aeropuertos por codigo, ciudad y nombre, confirmar que:
  - El valor persistido en el formulario es el codigo IATA correcto.
  - El envio (submit) sigue funcionando igual que antes (mismos campos, mismos tipos).
  - Los layouts angostos (grilla de vuelos) no se rompen visualmente con el nuevo componente.
- No aplica backend ni tests automatizados nuevos — no hay test runner configurado en el proyecto (segun CLAUDE.md).
