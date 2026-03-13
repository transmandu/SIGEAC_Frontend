const NON_COMPANY_PREFIXES = new Set([
  "login",
  "inicio",
  "ajustes",
  "sistema",
  "not-authorized",
  "acceso_publico",
]);

export function getCompanySlugFromPath(pathname: string): string | null {
  const [firstSegment] = pathname.split("/").filter(Boolean);

  if (!firstSegment || NON_COMPANY_PREFIXES.has(firstSegment)) {
    return null;
  }

  return firstSegment;
}
