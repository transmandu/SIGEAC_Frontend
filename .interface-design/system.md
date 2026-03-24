# SIGEAC — Interface Design System

## Product
SIGEAC es un sistema de gestión aeronáutica (MRO). Los usuarios son técnicos, compradores y supervisores que trabajan con partes, órdenes de trabajo, inventario y trazabilidad. La herramienta debe sentirse precisa y técnica, no consumer.

## Direction & Feel
**Precise. Document-like. Technical procurement.** Como llenar un formulario oficial, no una app de consumidor.

- Dense pero legible. Los usuarios son profesionales que trabajan rápido.
- Sin decoración gratuita. Cada elemento visual debe significar algo.
- Color = significado. No usar color como decoración.

---

## Color Accent
**Ámbar** — reservado exclusivamente para badges de estado intermedio (PROCESO, PENDIENTE, EN TRÁNSITO). Connota "en movimiento, pendiente de acción". No usar en botones.

```
Badge PROCESO/PENDIENTE:
  bg-amber-100 text-amber-700 border-amber-200
  dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800

Badge ALT (parte alterna):
  text-amber-600 dark:text-amber-500
  bg-amber-50 dark:bg-amber-950/60
  border-amber-200 dark:border-amber-800/60

Icon containers en dialog headers (decorativo, no interactivo):
  bg-amber-100 dark:bg-amber-950/60
  text-amber-600 dark:text-amber-500
```

**Botones:** Usar siempre el `primary` de shadcn (`<Button>` sin className de color).
No poner `bg-amber-*` en ningún elemento interactivo (button, link-button).

Usar azul solo cuando el sistema de shadcn lo imponga (focus ring, etc.).

---

## Depth Strategy
**Borders-only.** Sin sombras internas en formularios ni cards dentro de diálogos.

- `border-border/60` — separadores de sección
- `border-border/40` — separadores entre filas/ítems
- `border-border/30` — separadores suaves (last:border-0 en listas)
- `bg-muted/60` — campos inset (disabled, read-only)
- `bg-muted/20` — hover en filas de lista
- No mezclar sombras con borders dentro del mismo contexto

---

## Spacing
Base unit: `4px` (Tailwind default). Escala usada:

- `gap-1.5` — micro (icon + label, badge + input)
- `gap-3` — dentro de componentes (columnas de grid)
- `gap-5` — entre secciones del formulario
- `py-3 px-3` — padding de filas en listas de artículos

---

## Typography

### Labels de sección / columnas
```
text-xs font-medium uppercase tracking-wide text-muted-foreground
```
Para cabeceras de columna en tablas internas:
```
text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70
```

### Part numbers (PNs)
```
font-mono text-sm tracking-wide
```
Siempre monospace. Los números de parte son identidad técnica, no texto genérico.

### Valores numéricos / totales
```
font-mono tabular-nums
```
Para totales destacados: `font-mono text-xl font-bold tabular-nums`

### Body / campos normales
`text-sm` — sin modificaciones extra.

---

## Signature Element: Bloque de Identidad de Parte

El elemento visual más característico de SIGEAC. Dos campos apilados que representan la identidad de una parte aeronáutica:

```tsx
{/* PN principal — inset, read-only */}
<Input
  disabled
  className="font-mono text-sm h-8 bg-muted/60 border-border/50 disabled:opacity-100 disabled:cursor-default tracking-wide"
/>

{/* PN alterno — editable, con badge */}
<div className="flex items-center gap-1.5">
  <span className="shrink-0 text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded tracking-widest select-none">
    ALT
  </span>
  <Input
    placeholder="N/A"
    className="font-mono text-sm h-7 text-muted-foreground placeholder:text-muted-foreground/40 border-dashed"
  />
</div>
```

Regla: siempre que aparezcan PNs en formularios o tablas, usar este patrón.

---

## Dialog Headers

No usar `bg-blue-100` genérico. Patrón para diálogos de procurement:

```tsx
<DialogHeader className="pb-2 border-b border-border/60">
  <div className="flex items-center gap-3">
    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-500 shrink-0">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <h2 className="text-base font-semibold leading-tight">Título</h2>
      <p className="text-xs text-muted-foreground mt-0.5">
        Contexto relevante (número de referencia, solicitante, etc.)
      </p>
    </div>
  </div>
</DialogHeader>
```

El subtítulo debe mostrar contexto del documento (número de orden, requisición, etc.) para que el usuario sepa exactamente sobre qué está actuando.

---

## Form Meta Section (fecha / vendor / destino)

Grid de 3 columnas con labels uppercase:

```tsx
<div className="grid grid-cols-3 gap-3">
  {/* campo */}
  <FormItem className="flex flex-col">
    <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
      Etiqueta
    </FormLabel>
    {/* control */}
  </FormItem>
</div>
```

---

## Article Lists (Tablas de artículos en formularios)

Grid `grid-cols-[1fr_72px_130px_88px]` para: Parte/Alt | Cant. | P.Unitario | Total

```tsx
{/* Cabecera */}
<div className="grid grid-cols-[1fr_72px_130px_88px] gap-3 px-3 pb-1 border-b border-border/60">
  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Parte / Alterno</span>
  <span className="text-[11px] ...">Cant.</span>
  <span className="text-[11px] ...">P. Unitario</span>
  <span className="text-[11px] ... text-right">Total</span>
</div>

{/* Fila */}
<div className="grid grid-cols-[1fr_72px_130px_88px] gap-3 items-start px-3 py-3 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
  {/* PN Identity block */}
  {/* Quantity */}
  {/* Price (AmountInput) */}
  {/* Line total — font-mono font-semibold text-right */}
</div>
```

ScrollArea con `h-[260px]` cuando hay más de 3 artículos.

---

## Total Section

Siempre al final del formulario, antes del submit. Alineado a la derecha:

```tsx
<div className="flex justify-end pt-1 border-t border-border/60">
  <div className="flex items-baseline gap-3">
    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</span>
    <span className="font-mono text-xl font-bold tabular-nums">${total.toFixed(2)}</span>
  </div>
</div>
```

---

## Submit Button

Full-width, color primario de shadcn, con ícono contextual:

```tsx
<Button disabled={isPending} type="submit" className="w-full h-10">
  {isPending ? (
    <Loader2 className="size-4 animate-spin" />
  ) : (
    <>
      <IconContextual className="size-4 mr-2" />
      Acción
    </>
  )}
</Button>
```

---

## Navigation / Context

Sidebars y headers usan el mismo background que el canvas — separación por border, no por color de superficie diferente.

---

## Components Built
- `CreateQuoteForm` — Formulario de cotización con bloque de identidad de parte
- `GenerateQuoteDialog` — Diálogo para generar cotización desde una requisición
