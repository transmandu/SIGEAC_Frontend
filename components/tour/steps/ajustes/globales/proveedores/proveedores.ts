import { StepType } from "@reactour/tour";

export const proveedoresSteps: StepType[] = [
  {
    selector: '[data-tour="proveedores-title"]',
    content:
      "Gestione los proveedores y beneficiarios registrados en el sistema. Cada proveedor tiene nombre, correo, teléfono y tipo asociado.",
    position: "center",
  },
  {
    selector: '[data-tour="proveedores-toolbar"]',
    content:
      "Busque proveedores por nombre, correo o teléfono. También puede filtrar por tipo: Proveedor o Beneficiario.",
    position: "bottom",
  },
  {
    selector: '[data-tour="proveedores-table"]',
    content:
      "Cada fila muestra el nombre, correo, teléfono y tipo del proveedor. Los badges azul/verde indican si es Proveedor o Beneficiario.",
    position: "top",
  },
  {
    selector: '[data-tour="proveedores-new"]',
    content:
      "Cree un nuevo proveedor o beneficiario. Debe ingresar nombre, correo, teléfono, tipo y dirección.",
    position: "left",
  },
  {
    selector: '[data-tour="proveedores-actions"]',
    content:
      "Edite los datos del proveedor o elimínelo. Si tiene órdenes de compra asociadas, no podrá ser eliminado.",
    position: "left",
  },
  {
    selector: '[data-tour="proveedores-expand"]',
    content:
      "Haga clic en cualquier fila para expandirla y ver los detalles de contacto: teléfono, correo y dirección.",
    position: "top",
  },
  {
    selector: '[data-tour="proveedores-pagination"]',
    content: "Navegue entre las páginas de resultados.",
    position: "bottom",
  },
];
