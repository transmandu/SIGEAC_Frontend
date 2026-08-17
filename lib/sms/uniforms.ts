/**
 * Catálogos de uniformes. Deben coincidir con UniformItem::COMPANIES /
 * ::GENDERS y UniformMovement::TYPES del backend, que sirve el valor canónico:
 * la traducción vive aquí.
 */
export const UNIFORM_COMPANIES = [
  "HANGAR",
  "CANAIMA_HOLDING",
  "TRANSMANDU",
  "AB_SECURITY",
  "GLOBAL",
] as const;

export const UNIFORM_GENDERS = ["MALE", "FEMALE", "UNISEX"] as const;

export const UNIFORM_MOVEMENT_TYPES = [
  "ENTRY",
  "ISSUANCE",
  "ADJUSTMENT",
] as const;

export type UniformCompany = (typeof UNIFORM_COMPANIES)[number];
export type UniformGender = (typeof UNIFORM_GENDERS)[number];
export type UniformMovementType = (typeof UNIFORM_MOVEMENT_TYPES)[number];

const COMPANY_ES: Record<string, string> = {
  HANGAR: "HANGAR",
  CANAIMA_HOLDING: "CANAIMA HOLDING",
  TRANSMANDU: "TRANSMANDU",
  AB_SECURITY: "AB SECURITY",
  GLOBAL: "GLOBAL",
};

const GENDER_ES: Record<string, string> = {
  MALE: "MASCULINO",
  FEMALE: "FEMENINO",
  UNISEX: "UNISEX",
};

const MOVEMENT_TYPE_ES: Record<string, string> = {
  ENTRY: "ENTRADA",
  ISSUANCE: "ENTREGA",
  ADJUSTMENT: "AJUSTE",
};

export const uniformCompanyLabel = (company?: string | null) => {
  if (!company) return "";
  const key = company.trim().toUpperCase();
  return COMPANY_ES[key] ?? key;
};

/** Devuelve null cuando no hay género, para las vistas que lo omiten. */
export const uniformGenderLabel = (gender?: string | null) => {
  if (!gender) return null;
  const key = gender.trim().toUpperCase();
  return GENDER_ES[key] ?? key;
};

export const uniformMovementTypeLabel = (type?: string | null) => {
  if (!type) return "";
  const key = type.trim().toUpperCase();
  return MOVEMENT_TYPE_ES[key] ?? key;
};
