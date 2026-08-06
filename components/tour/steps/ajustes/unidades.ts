import { StepType } from "@reactour/tour";

export const unidadesSteps: StepType[] = [
  {
    selector: '[data-tour="unidades-title"]',
    content:
      "Gestione el catálogo de unidades de medida del sistema (Kg, L, mL, CAJA).",
    position: "center",
  },
  {
    selector: '[data-tour="unidades-primary-table"]',
    content:
      "Cada fila muestra el nombre de la unidad y su símbolo abreviado (ej. KILOGRAMO - Kg).",
    position: "top",
  },
  {
    selector: '[data-tour="unidades-primary-new"]',
    content:
      "Cree una nueva unidad. Solo se necesita un nombre y un símbolo.",
    position: "left",
  },
  {
    selector: '[data-tour="unidades-primary-actions"]',
    content:
      "Elimine una unidad mediante el menú de acciones. Esta acción es irreversible.",
    position: "left",
  },
  {
    selector: '[data-tour="unidades-title"]',
    content:
      "Las equivalencias entre unidades se definen dentro de cada artículo, no aquí: una CAJA de un artículo no contiene lo mismo que la de otro. Búsquelas en la ficha del artículo.",
    position: "center",
  },
];
