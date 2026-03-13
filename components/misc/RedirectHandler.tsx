'use client';

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useCompanyStore } from "@/stores/CompanyStore";

const ALLOWED_ROUTES = ['/login', '/register', '/ajustes', '/sistema'];

export const RedirectHandler = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { selectedCompany, selectedStation } = useCompanyStore();

  useEffect(() => {
    if (!selectedCompany || !selectedStation) {
      return;
    }

    const isAllowedRoute = ALLOWED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    const isOnCompanyRoute = pathname.startsWith(`/${selectedCompany.slug}/`);

    if (isAllowedRoute || isOnCompanyRoute) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("station", selectedStation);
    router.replace(`/${selectedCompany.slug}/dashboard?${nextParams.toString()}`);
  }, [pathname, router, searchParams, selectedCompany, selectedStation]);

  return null;
};
