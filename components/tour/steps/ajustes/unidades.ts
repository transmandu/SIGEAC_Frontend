import { StepType } from "@reactour/tour";

export const unidadesSteps: StepType[] = [
  {
    selector: '[data-tour="unidades-title"]',
    content:
      "Catálogo de unidades de medida del almacén (Kg, L, mL, CAJA…). Cada artículo es dueño de sus equivalencias: una CAJA de un artículo no contiene lo mismo que la de otro.",
    position: "center",
  },
  {
    selector: '[data-tour="unidades-tabs"]',
    content:
      "Unidades: el catálogo. Catálogo de equivalencias: plantillas reutilizables (galón a litro, libra a kilo) que cada artículo copia. Conversiones registradas: lo que ya tienen los artículos, para revisarlo y corregirlo. Estas pestañas solo las ve quien revisa conversiones.",
    position: "bottom",
  },
  {
    selector: '[data-tour="unidades-primary-table"]',
    content:
      "Cada fila muestra la unidad con su símbolo (ej. KILOGRAMO (Kg)) y sus características: «Medidas» si se usa para dimensionar piezas que se cortan, «Fracciones» si se despacha por 1/2, 1/4, 1/8, 1/16 o 1/32. Apunte una etiqueta para ver qué significa.",
    position: "top",
  },
  {
    selector: '[data-tour="unidades-primary-new"]',
    content:
      "Cree una unidad: nombre y símbolo, y si sirve para declarar medidas o se despacha por fracciones.",
    position: "left",
  },
  {
    selector: '[data-tour="unidades-primary-actions"]',
    content:
      "Edite la unidad o elimínela. La eliminación pide confirmación y no se puede deshacer.",
    position: "left",
  },
];
