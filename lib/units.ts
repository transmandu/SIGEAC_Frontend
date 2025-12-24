// lib/units.ts

/**
 * Mapeo de abreviaturas de unidades a sus nombres completos
 */
export const UNIT_LABELS: Record<string, { singular: string; plural: string }> = {
    'u': { singular: 'unidad', plural: 'unidades' },
    'Kg': { singular: 'kilogramo', plural: 'kilogramos' },
    'kg': { singular: 'kilogramo', plural: 'kilogramos' },
    'g': { singular: 'gramo', plural: 'gramos' },
    'L': { singular: 'litro', plural: 'litros' },
    'l': { singular: 'litro', plural: 'litros' },
    'GAL': { singular: 'galón', plural: 'galones' },
    'gal': { singular: 'galón', plural: 'galones' },
    'ml': { singular: 'mililitro', plural: 'mililitros' },
    'mL': { singular: 'mililitro', plural: 'mililitros' },
    'oz': { singular: 'onza', plural: 'onzas' },
    'lb': { singular: 'libra', plural: 'libras' },
    'm': { singular: 'metro', plural: 'metros' },
    'cm': { singular: 'centímetro', plural: 'centímetros' },
    'mm': { singular: 'milímetro', plural: 'milímetros' },
    'ft': { singular: 'pie', plural: 'pies' },
    'in': { singular: 'pulgada', plural: 'pulgadas' },
  };
  
  /**
   * Obtiene el nombre de la unidad en singular o plural según la cantidad
   * @param unitValue - Abreviatura de la unidad (ej: 'Kg', 'L', 'u')
   * @param quantity - Cantidad para determinar singular/plural
   * @returns Nombre de la unidad (ej: 'kilogramo', 'kilogramos')
   */
  export const getUnitLabel = (unitValue: string, quantity: number): string => {
    const unitMap = UNIT_LABELS[unitValue];
    if (!unitMap) return unitValue; // Si no está mapeada, devolver la abreviatura
    return quantity === 1 ? unitMap.singular : unitMap.plural;
  };