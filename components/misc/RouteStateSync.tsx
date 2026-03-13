'use client';

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getCompanySlugFromPath } from "@/lib/company-route";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";

export function RouteStateSync() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initializedFromStorage = useRef(false);

  const { user, loading } = useAuth();
  const {
    selectedCompany,
    selectedStation,
    setSelectedCompany,
    setSelectedStation,
    initFromLocalStorage,
  } = useCompanyStore();

  const companySlugFromPath = useMemo(
    () => getCompanySlugFromPath(pathname),
    [pathname]
  );
  const stationFromUrl = searchParams.get("station");

  useEffect(() => {
    if (loading || initializedFromStorage.current || companySlugFromPath) {
      return;
    }

    initFromLocalStorage();
    initializedFromStorage.current = true;
  }, [companySlugFromPath, initFromLocalStorage, loading]);

  useEffect(() => {
    if (loading || !user || !companySlugFromPath) {
      return;
    }

    const matchedCompany = user.companies.find(
      (company) => company.slug === companySlugFromPath
    );

    if (!matchedCompany) {
      return;
    }

    if (selectedCompany?.slug !== matchedCompany.slug) {
      setSelectedCompany(matchedCompany);
    }
  }, [companySlugFromPath, loading, selectedCompany?.slug, setSelectedCompany, user]);

  useEffect(() => {
    if (!companySlugFromPath) {
      return;
    }

    if (stationFromUrl) {
      if (selectedStation !== stationFromUrl) {
        setSelectedStation(stationFromUrl);
      }
      return;
    }

    if (!selectedStation) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("station", selectedStation);
    router.replace(`${pathname}?${nextParams.toString()}`);
  }, [
    companySlugFromPath,
    pathname,
    router,
    searchParams,
    selectedStation,
    setSelectedStation,
    stationFromUrl,
  ]);

  return null;
}
