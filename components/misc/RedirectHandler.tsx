// components/CompanyRedirectHandler.tsx
'use client';
import { useCompanyStore } from "@/stores/CompanyStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const ALLOWED_ROUTES = ['/login', '/register', '/ajustes', "/sistema"];

export const RedirectHandler = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedCompany, selectedStation } = useCompanyStore();

  useEffect(() => {
    if (selectedCompany && selectedStation) {
      const isAllowedRoute = ALLOWED_ROUTES.some(route =>
        pathname.startsWith(route)
      );
      const isOnCompanyRoute = pathname.startsWith(`/${selectedCompany.slug}/`);

      if (!isAllowedRoute && !isOnCompanyRoute) {
        router.push(`/${selectedCompany.slug}/dashboard`);
      }
    }
  }, [selectedStation, selectedCompany, pathname, router]);

  return null;
};
