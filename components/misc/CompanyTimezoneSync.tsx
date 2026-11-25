"use client";

import { useEffect } from "react";

import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { setActiveTimeZone } from "@/lib/date";

/**
 * Mantiene al día la zona que usa `companyNow()` (lib/date): quien no puede
 * llamar al hook —un esquema, un valor por defecto— lee la zona de aquí.
 */
export default function CompanyTimezoneSync() {
  const timeZone = useCompanyTimezone();

  useEffect(() => {
    setActiveTimeZone(timeZone);
  }, [timeZone]);

  return null;
}