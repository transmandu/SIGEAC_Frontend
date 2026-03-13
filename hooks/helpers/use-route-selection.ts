'use client';

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { getCompanySlugFromPath } from "@/lib/company-route";
import { useCompanyStore } from "@/stores/CompanyStore";

export function useRouteSelection() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { selectedCompany, selectedStation } = useCompanyStore();

  const companySlugFromPath = useMemo(
    () => getCompanySlugFromPath(pathname),
    [pathname]
  );

  const currentCompany = useMemo(() => {
    if (!companySlugFromPath) {
      return selectedCompany;
    }

    return (
      user?.companies.find((company) => company.slug === companySlugFromPath) ||
      selectedCompany
    );
  }, [companySlugFromPath, selectedCompany, user?.companies]);

  const currentStation = searchParams.get("station") || selectedStation || null;

  return {
    currentCompany,
    currentStation,
    companySlugFromPath,
  };
}
