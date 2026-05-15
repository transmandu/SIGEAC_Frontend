"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";

export default function AuthRedirect() {
  const router = useRouter();

  const navigatingRef = useRef(false);

  const { user, loading } = useAuth();

  const { selectedCompany } = useCompanyStore();

  useEffect(() => {
    if (loading || !user || !selectedCompany) return;

    if (navigatingRef.current) return;

    navigatingRef.current = true;

    router.replace(`/${selectedCompany.slug}/dashboard`);
  }, [loading, user, selectedCompany, router]);

  return null;
}