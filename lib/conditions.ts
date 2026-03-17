export interface Condition {
  value: string;
  label: string;
  label_en: string;
}

export const getConditionLabel = (key: string) => {
  const CONDITIONS = [
    { key: "NEW", label: "Nuevo" },
    { key: "FACTORY NEW", label: "Nuevo de Fábrica" },
    { key: "OVERHAULED", label: "Overhauled" },
    { key: "INSPECTED", label: "Inspeccionado" },
    { key: "REPAIRABLE", label: "Reparable" },
    { key: "REPAIRED", label: "Reparado" },
    { key: "TESTED", label: "Testeado" },
    { key: "AS REMOVED", label: "Removido" },
    { key: "SAFEKEEPING", label: "Resguardo" },
  ];

  const condition = CONDITIONS.find((c) => c.key === key);
  
  return condition ? condition.label : "Unknown";
};
