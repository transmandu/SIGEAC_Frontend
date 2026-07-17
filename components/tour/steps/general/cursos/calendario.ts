import { StepType } from "@reactour/tour";

export const calendarioSteps: StepType[] = [
  {
    selector: '[data-tour="calendario-header"]',
    content:
      "Gestione los cursos de la organización a través del calendario. Visualice, cree y modifique cursos según sea necesario.",
    position: "center",
  },
  {
    selector: '[data-tour="calendario-grid"]',
    content:
      "El calendario muestra todos los cursos programados. Los colores indican el estado: verde (abierto), rojo (cerrado). Use las vistas mes/semana/día para navegar. Haga doble clic en una fecha para crear un nuevo curso o arrastre el curso a un nuevo día para reprogramar su fecha.",
    position: "bottom",
  },
];
