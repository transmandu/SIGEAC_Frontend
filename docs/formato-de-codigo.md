# Formato de código

El formato es automático y **no depende del editor que uses**. La configuración
vive en el repositorio y el CI la verifica en cada PR.

## La regla

| Repo     | Herramienta | Indentación | Config          |
| -------- | ----------- | ----------- | --------------- |
| Frontend | Prettier    | 2 espacios  | `.prettierrc`   |
| Backend  | Laravel Pint| 4 espacios  | `pint.json`     |

No es inconsistencia: 2 espacios es el default de Prettier y la convención de
JS/TS; 4 espacios es lo que exige **PSR-12**, el estándar de PHP que Pint aplica
sin opción de cambiarlo.

## Estado actual: formateo progresivo

El código del frontend es anterior a esta configuración: **1.403 de 1.704
archivos** no siguen el preset. Reformatearlos de golpe (~153.000 líneas) daría
conflictos en las más de 80 ramas activas, así que el formateo se aplica **solo
a las líneas que cada quien toca**. El repositorio converge solo, sin un commit
masivo.

Por eso el CI verifica únicamente los archivos que el PR modifica, no el repo
completo.

## Desde la terminal (cualquier editor)

```bash
# Frontend
pnpm format:changed   # formatea solo lo que cambiaste (lo habitual)
pnpm format:check     # verifica sin escribir
pnpm format           # TODO el repo — no lo uses salvo en el reformateo acordado

# Backend
composer format       # aplica Pint
composer format:check # verifica sin escribir
```

Si el CI marca tu PR, `pnpm format:changed` y un commit lo resuelven.

## Por editor

### VS Code

No hay que hacer nada: `.vscode/settings.json` viene en el repo. Al abrir el
proyecto, VS Code ofrece instalar las extensiones recomendadas — acepta.

El frontend está en modo `modifications`: al guardar formatea solo las líneas
que tocaste. En el backend Pint lo corre la extensión oficial de Laravel
(`Laravel.pint.runOnSave`), no un formateador aparte.

> **Si trabajas los dos repos a la vez**, ábrelos como workspace multi-root en
> vez de como carpetas sueltas (*File → Open Workspace from File*). La extensión
> de Laravel busca `artisan` en la raíz: si la raíz es el frontend, no lo
> encuentra y su servidor de lenguaje falla en bucle.

### PhpStorm / WebStorm

Prettier y EditorConfig son nativos, pero hay que activarlos una vez:

1. **Settings → Languages & Frameworks → JavaScript → Prettier**
   - *Automatic Prettier configuration*
   - Marca **Run on save**
   - En *Files*, deja: `{**/*,*}.{js,ts,jsx,tsx,mjs,cjs,json,css}`
2. **Settings → Editor → Code Style** → marca **Enable EditorConfig support**
3. Backend: **Settings → PHP → Quality Tools → Laravel Pint**
   - Configuration: `vendor/bin/pint`, y marca *Run on save*

> Ojo: PhpStorm formatea el **archivo completo** al guardar, no solo tus líneas.
> Mientras dure el formateo progresivo, revisa el diff antes de commitear y, si
> reformateó el archivo entero, sácalo con `git checkout -p`.

### Neovim / Vim

`.editorconfig` y `.prettierrc` se respetan si tienes los plugins
(`editorconfig-vim`, `conform.nvim`, `null-ls`). Ejemplo con conform.nvim:

```lua
require("conform").setup({
  formatters_by_ft = {
    typescript = { "prettier" },
    typescriptreact = { "prettier" },
    php = { "pint" },
  },
  format_on_save = { lsp_fallback = true },
})
```

Sin plugin, corre `pnpm format:changed` antes de commitear.

### Cualquier otro

Basta con respetar `.editorconfig` (lo soporta casi todo) y correr
`pnpm format:changed` / `composer format` antes de commitear.

## Fin de línea

`.gitattributes` fuerza **LF** en el repositorio. En Windows tu copia local
puede tener CRLF sin problema: git convierte al commitear. Esto evita los diffs
fantasma donde un archivo aparece cambiado por completo sin haberlo tocado.
