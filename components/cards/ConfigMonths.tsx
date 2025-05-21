// Configuración de meses
const months = [
  { name: "Enero", short: "Ene", number: "01" },
  { name: "Febrero", short: "Feb", number: "02" },
  { name: "Marzo", short: "Mar", number: "03" },
  { name: "Abril", short: "Abr", number: "04" },
  { name: "Mayo", short: "May", number: "05" },
  { name: "Junio", short: "Jun", number: "06" },
  { name: "Julio", short: "Jul", number: "07" },
  { name: "Agosto", short: "Ago", number: "08" },
  { name: "Septiembre", short: "Sep", number: "09" },
  { name: "Octubre", short: "Oct", number: "10" },
  { name: "Noviembre", short: "Nov", number: "11" },
  { name: "Diciembre", short: "Dic", number: "12" },
] as const;

export type Month = (typeof months)[number];
export type MonthName = Month['name'];
export type ShortMonthName = Month['short'];
export type MonthNumber = Month['number'];

export const getMonthByNumber = (monthNumber: string | null | undefined): Month | undefined => {
  if (!monthNumber) {
    return undefined;
  }
  return months.find(month => month.number === monthNumber);
};

export default months;