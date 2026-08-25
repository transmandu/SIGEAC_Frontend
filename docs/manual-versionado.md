# Manual de versionado

SIGEAC lleva **una sola versión compartida** entre el Frontend y el Backend. Un
mismo número (por ejemplo `3.1.0`) describe el estado del sistema completo, de
modo que soportar a un cliente se reduce a preguntarle qué número ve en la
pantalla de inicio.

El punto de partida formal es **v3.0.0**. La interfaz venía mostrando `v2.0.2`
congelado desde hacía dos años, así que el salto a mayor reconoce todo lo que se
construyó en ese período sin que el número lo reflejara.

De ahí en adelante **el número lo calcula y publica el CI en cada merge a
`main`**. No depende de que nadie lo recuerde: esa dependencia es justamente lo
que mantuvo la versión congelada dos años.

## Dónde vive el número

| Repositorio | Fuente de verdad | Se muestra en |
| --- | --- | --- |
| Frontend | `package.json` → campo `version` | Pantalla de inicio |
| Backend | `composer.json` → campo `version` | `GET /api/version` |

Nada más contiene el número escrito a mano. `next.config.mjs` lo inyecta en el
build desde `package.json`, y `config/version.php` lo lee de `composer.json`.
Por eso **no se edita ningún otro archivo** al liberar una versión.

El commit corto acompaña al número para poder identificar el build exacto que
está desplegado, incluso entre dos despliegues de la misma versión.

## Cómo sube la versión

**Nadie la sube a mano.** Cada merge a `main` dispara
`.github/workflows/release.yml`, que lee los mensajes de commit, calcula el
número, actualiza el archivo correspondiente, escribe el `CHANGELOG.md` y crea
el tag.

Se usa [versionado semántico](https://semver.org/lang/es/): `MAYOR.MENOR.PARCHE`.
Lo que decide el incremento es **el prefijo del título del PR**:

| Prefijo del PR | Sube | Ejemplo en SIGEAC |
| --- | --- | --- |
| `fix:` `refactor:` `chore:` `docs:` `perf:` `style:` `test:` `build:` `ci:` `revert:` | **PARCHE** (`3.0.0` → `3.0.1`) | Arreglar un total mal calculado en un reporte |
| `feat:` | **MENOR** (`3.0.0` → `3.1.0`) | Un módulo nuevo, un campo nuevo en un formulario |
| Cualquiera con `!` (`feat!:`) o `BREAKING CHANGE` en el cuerpo | **MAYOR** (`3.0.0` → `4.0.0`) | Rediseñar un ciclo completo, migraciones que invalidan datos viejos |

Si un merge junta varios commits, **gana el incremento más alto**: un `feat:` y
tres `fix:` producen una versión menor.

### Lo único que hay que hacer

Escribir bien el título del PR. Un check lo valida antes de permitir el merge
(`.github/workflows/pr-title.yml`) y explica el formato si no coincide.

```
feat: panel de supervisor de compras
fix(sms): corrige el filtro de responsables
feat!: rediseño del ciclo de compras
```

### Cómo se mantienen sincronizados los dos repos

Cada repo calcula su versión y consulta los tags del otro por la API de GitHub.
Si el hermano ya va más adelante, adopta ese número como base antes de aplicar
su propio incremento. Así "3.1.0" sigue identificando un estado del sistema y no
de un repositorio, sin que los dos workflows tengan que coordinarse entre sí.

Si el token de lectura cruzada falta, el workflow **no falla**: registra un aviso
y versiona solo con sus propios tags. Los números pueden separarse hasta que se
restablezca.

### Si hay que forzar una versión concreta

Es raro, pero se puede: se crea el tag a mano y el siguiente merge parte de ahí.

```bash
git tag -a v4.0.0 -m "Release v4.0.0" && git push --tags
```

## Qué ve el usuario

Bajo el botón de inicio de sesión aparece `v3.1.0`. Al pasar el cursor, un
tooltip muestra la versión y el commit de la interfaz, los de la API, y la fecha
de compilación.

Si la interfaz y la API reportan versiones distintas, el badge lo advierte en
ámbar (`v3.1.0 · API v3.0.0`). Eso significa que **un lado quedó sin desplegar**
— es el síntoma que hay que corregir antes de investigar cualquier otro error
raro que reporte el usuario.

## Configuración del CI

Ya está aplicada. Se documenta con comandos `gh` y no con rutas del navegador
porque las pantallas de GitHub cambian a menudo, mientras que estos comandos son
verificables y reproducibles.

**1. Token de lectura cruzada** — secreto `PEER_REPO_TOKEN` en ambos repos, un
PAT clásico con scope `repo` (los workflows solo **leen** tags):

```bash
gh secret set PEER_REPO_TOKEN --repo transmandu/SIGEAC_Frontend
gh secret set PEER_REPO_TOKEN --repo transmandu/SIGEAC_Backend
```

Conviene que lo emita una cuenta de servicio de la organización y no la cuenta
personal de un desarrollador: si esa persona sale, su token muere con ella y
volvemos al problema que este CI resuelve. **Los PAT clásicos caducan**; cuando
eso pase, el CI no falla — deja de sincronizar los números y lo avisa en el log.

**2. Permiso de escritura para Actions.** Sin esto el workflow no puede publicar
el tag. La organización impone un techo, así que hay que subirlo **primero ahí**
y después en cada repo — cambiarlo solo en el repo devuelve `Conflict`:

```bash
gh api -X PUT orgs/transmandu/actions/permissions/workflow \
  -f default_workflow_permissions=write -F can_approve_pull_request_reviews=false

gh api -X PUT repos/transmandu/SIGEAC_Frontend/actions/permissions/workflow \
  -f default_workflow_permissions=write -F can_approve_pull_request_reviews=false
```

`can_approve_pull_request_reviews` se deja en `false` a propósito: el release no
lo necesita y ningún workflow debería poder aprobar PRs.

**3. Squash merge con el título del PR.**

```bash
gh api -X PATCH repos/transmandu/SIGEAC_Frontend \
  -f squash_merge_commit_title=PR_TITLE -f squash_merge_commit_message=COMMIT_MESSAGES
```

El valor por defecto de GitHub (`COMMIT_OR_PR_TITLE`) es una trampa: cuando el PR
trae **un solo commit**, usa el título de *ese commit* en vez del título del PR.
Así llegaban a `main` títulos como `fixes` aunque el PR estuviera bien nombrado.

**4. Check obligatorio** — ruleset que exige `validate` antes de mergear a `main`,
con `github-actions[bot]` en la lista de excepciones para que pueda empujar el
commit de versión.

> **Solo aplicado en el Frontend.** La organización está en plan **Free**, que no
> permite reglas de rama en repositorios privados. Como `SIGEAC_Backend` es
> privado, ahí el validador de títulos **corre y se ve en rojo, pero no bloquea
> el merge**: la convención queda como disciplina del equipo, no como barrera.
> Si algún día se pasa a un plan de pago, basta con crear el mismo ruleset ahí.

### Consumo de minutos

`SIGEAC_Frontend` es un repositorio **público**, así que sus Actions no consumen
cuota. Solo el backend (privado) descuenta de los 2.000 minutos mensuales del
plan Free, y estos workflows tardan segundos.

## Variables de despliegue

En producción el servidor puede no tener el directorio `.git` (despliegue por
copia de archivos). Para no perder el commit, el proceso de despliegue puede
fijarlo por variable de entorno; si no se fija, se lee de `.git` y si tampoco
está, simplemente no se muestra.

| Variable | Repo | Efecto |
| --- | --- | --- |
| `NEXT_PUBLIC_COMMIT` | Frontend | Commit mostrado; si falta, se lee de `.git` en build |
| `NEXT_PUBLIC_BUILT_AT` | Frontend | Se fija automáticamente en cada build |
| `APP_COMMIT` | Backend | Commit devuelto por `/api/version` |
| `APP_BUILT_AT` | Backend | Fecha de build; sin ella, el endpoint devuelve `null` |

`APP_BUILT_AT` no se inventa: sin la variable el endpoint devuelve `null`, porque
la fecha de la consulta no es la fecha del build.

## El endpoint

`GET /api/version` es público — sirve para verificar qué API está viva sin tener
sesión — y no expone nada más que la identidad del build:

```json
{
  "version": "3.1.0",
  "commit": "4638cd2",
  "built_at": "2026-08-25T14:30:00Z",
  "environment": "production"
}
```
