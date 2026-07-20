import { StepType } from "@reactour/tour";

export const getCertificadosSteps = (hasData: boolean): StepType[] => {
  const steps: StepType[] = [
    {
      selector: '[data-tour="cert-header"]',
      content:
        "Visualice todos los certificados de capacitación técnica registrados en el sistema.",
      position: "center",
    },
    {
      selector: '[data-tour="cert-create-btn"]',
      content: "Presione para cargar un nuevo certificado a un empleado.",
      position: "bottom",
    },
    {
      selector: '[data-tour="cert-search"]',
      content: "Busque certificados por nombre, empleado o curso.",
      position: "bottom",
    },
    {
      selector: '[data-tour="cert-columns"]',
      content: "Personalice las columnas visibles de la tabla.",
      position: "bottom",
    },
    {
      selector: '[data-tour="cert-table"]',
      content: "Lista de certificados con empleado, curso y fechas.",
      position: "bottom",
    },
    {
      selector: '[data-tour="cert-actions"]',
      content: "Cada certificado tiene un menú de acciones disponibles.",
      position: "bottom",
    },
    {
      selector: '[data-tour="cert-pagination"]',
      content: "Navegue entre páginas de resultados.",
      position: "bottom",
    },
  ];

  return hasData
    ? steps
    : steps.filter((s) => s.selector !== '[data-tour="cert-actions"]');
};
