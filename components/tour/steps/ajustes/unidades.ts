import { StepType } from "@reactour/tour";

export const unidadesSteps: StepType[] = [
  {
    selector: '[data-tour="unidades-title"]',
    content:
      "Gestione las unidades de medida del sistema. Cree unidades primarias (Kg, L, mL) y defina conversiones entre ellas.",
    position: "center",
  },
  {
    selector: '[data-tour="unidades-tabs"]',
    content:
      "Alternar entre la vista de Unidades Primarias y Unidades Secundarias.",
    position: "bottom",
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
      "Cree una nueva unidad primaria. Solo se necesita un nombre y un símbolo.",
    position: "left",
  },
  {
    selector: '[data-tour="unidades-primary-actions"]',
    content:
      "Elimine una unidad primaria mediante el menú de acciones. Esta acción es irreversible.",
    position: "left",
  },
  {
    selector: '[data-tour="unidades-tabs"]',
    content:
      "Ahora pasaremos a las Unidades Secundarias para ver las conversiones.",
    position: "bottom",
  },
  {
    selector: '[data-tour="unidades-secondary-table"]',
    content:
      "Cada fila muestra el factor de equivalencia entre una unidad primaria y su unidad secundaria.",
    position: "top",
  },
  {
    selector: '[data-tour="unidades-secondary-new"]',
    content:
      "Cree una nueva conversión seleccionando unidad primaria, secundaria y el factor de equivalencia.",
    position: "left",
  },
  {
    selector: '[data-tour="unidades-secondary-actions"]',
    content:
      "Elimine una relación de conversión mediante el menú de acciones. Esta acción es irreversible.",
    position: "left",
  },
];
