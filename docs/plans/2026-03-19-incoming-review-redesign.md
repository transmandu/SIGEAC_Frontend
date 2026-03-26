# Incoming Inspection Review — Redesign

## Layout

**Desktop/Laptop (>=1024px):** Two-column — main content (left) + sticky sidebar (right, ~400px).

**Tablet portrait (<1024px):** Full-width main content. Floating button opens checklist as a right-side sheet/drawer (~85% width).

## Main Area (Left)

1. **Ficha del articulo + Documentos** — Article detail grid (PN, serial, ATA, lote, fabricante, condicion) with document status pills inline. Doc risk warning if declared but not uploaded.
2. **Observaciones** — Article description in muted bordered box. Only if description exists.

## Sidebar (Right / Drawer on tablet)

Scrollable top-to-bottom:

1. **Progress header** — Segmented inspection strip + counters (OK/NO/N/A) + percentage.
2. **Checklist groups** — Icon + title + completion count. Compact segmented toggle on desktop, large stamp buttons in tablet drawer.
3. **Inspector notes** — Collapsible textarea. Auto-opens on quarantine selection.
4. **Destino del articulo** — Store/quarantine decision cards + confirm button.

## Responsive Check Buttons

- **Desktop sidebar:** Compact inline toggle (`h-8`).
- **Tablet drawer:** Large stamp buttons (`h-12 w-16`) with icons.
