/**
 * Mismo lenguaje visual "glass" que ya usan el login, el selector de compañía
 * y los formularios de artículos (gradiente + blur + borde suave + resplandor
 * azul al pasar el mouse). Se reexporta acá para que Control de Mantenimiento
 * no quede visualmente aislado del resto de SIGEAC, sin que sus archivos
 * tengan que importar de una ruta de "almacén".
 */
export {
  fieldClass,
  numericFieldClass,
  selectTriggerClass,
  triggerButtonClass,
  textareaClass,
  labelClass,
  hintClass,
  sectionClass,
  SectionTitle,
  FormSection,
  onlyNumeric,
  onlyInteger,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";

export { SearchableSelect } from "@/components/forms/mantenimiento/almacen/articulos/sections/IdentificationSection";
