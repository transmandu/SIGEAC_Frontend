# Manejo de errores

Cómo se le avisa un fallo al usuario, y cómo llega al desarrollador lo que
necesita para resolverlo. **No hace falta recordarlo: el lint y el CI lo
verifican.**

## La regla

Un fallo de la API se avisa con `notifyError`, nunca con un `toast.error`
escrito a mano.

```ts
import { notifyError } from "@/lib/notify-error";

// En una mutación
onError: (error) => {
  notifyError(error, { action: "crear el artículo" });
},

// En un try/catch
} catch (error) {
  notifyError(error, { action: "guardar la observación" });
}

// En una descarga con responseType: "blob": igual. notifyError lee solo el
// cuerpo del error (llega sin decodificar) y el aviso sale un instante después.
} catch (error) {
  notifyError(error, { action: "descargar el PDF" });
}
```

`notifyBlobError` hace lo mismo pero devuelve una promesa: úsalo solo si
necesitas esperar a que el aviso salga antes de seguir.

`action` va en infinitivo y dice **qué se intentaba hacer**. De ahí sale el
título: _"¡Ops! No se pudo crear el artículo"_.

## Qué hace por ti

| Situación | Lo que ve el usuario |
| --- | --- |
| Sin internet | ¡Ops! Sin conexión a internet |
| El servidor no responde | ¡Error! No pudimos conectar con el servidor |
| Dato del formulario rechazado | ¡Ops! Revisa el formulario (y el campo queda marcado bajo su input) |
| Regla de negocio | ¡Ops! No se pudo … + el motivo exacto que escribió el backend |
| Sin permiso / no existe | Un título propio para cada una |
| Sesión vencida | No avisa `notifyError`: la atiende el cierre de sesión automático (`AuthContext`) |
| Falla del sistema (columna que falta, base caída, bug) | ¡Error! Algo falló al … + **código `ERR-XXXXXX`** + botón **Reportar** |

El código `ERR-XXXXXX` es el mismo que el backend dejó en el log junto con el
detalle real. Quien atiende el reporte va directo a esa línea, sin abrir las
herramientas del navegador. **Nunca se muestra SQL, trazas ni el response
completo.**

## Casos particulares

- **Un texto propio para una familia de error** (el flujo sabe algo que el
  genérico no):

  ```ts
  notifyError(error, {
    action: "guardar el documento",
    messages: { tooLarge: "El máximo permitido es 10 MB." },
  });
  ```

- **Un mensaje deliberado en el cliente**: `throw new Error("No hay datos para
  esos filtros")` (un `Error` plano). `notifyError` lo muestra tal cual.
  `TypeError`, `ReferenceError`… se tratan como un bug de la pantalla.
- **Una consulta que ya muestra su propio estado**: `meta: { silent: true }` en
  el `useQuery` evita el aviso global de fallos de red.
- **Validaciones locales** (antes de llamar a la API): `toast.error("¡Ops! Debe
  cotizar al menos un artículo.")`. Empiezan con "¡Ops! " para tener el mismo
  tono. No son errores de la API y la regla no las toca.
- **El aviso necesita algo que `notifyError` no sabe** (por ejemplo una lista
  propia del backend): se permite con un comentario que diga por qué.

  ```ts
  // eslint-disable-next-line no-restricted-syntax -- aviso con la lista de documentos que faltan.
  toast.error("¡Ops! Faltan documentos por consignar", { … });
  ```

  Sin esa justificación, la excepción no pasa la revisión.

## Qué impide el lint

Todo esto es un error de lint, en el editor y en el CI (`pnpm lint`):

| No hagas | Por qué |
| --- | --- |
| `toast.error("Oops!")`, `toast.error("Error")` | No dice qué pasó |
| `toast.error(...)` dentro de `onError` | Pierde el título por causa, el código de referencia y "Reportar" |
| Leer `error.response…` dentro de un `toast.error` | `notifyError` ya entiende todas las respuestas |
| `error.message` en un `toast.error` | Es texto técnico (`Request failed with status code 500`) |
| `` `Falló: ${error}` `` | Vuelca `AxiosError: …` al usuario |
| `toast({ variant: "destructive" })` | Es otra vía de avisar errores fuera del contrato |

Las reglas viven en `eslint/contrato-de-errores.mjs`; cada una lleva en su
mensaje lo que hay que usar en su lugar.

## Formularios

Cualquier formulario hecho con `<Form {...form}>` marca solo, bajo su input, los
campos que el servidor rechazó: no hay que cablear nada. Si el nombre del campo
del backend no coincide con el del formulario, el aviso igual lista el motivo.

## Backend

El contrato del lado del servidor (formato de la respuesta, códigos, y qué no
puede devolver un `catch`) está en `docs/manejo-de-errores.md` del backend.
