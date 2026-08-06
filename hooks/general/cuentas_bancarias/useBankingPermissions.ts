"use client";

import { useAuth } from "@/contexts/AuthContext";

/**
 * El backend es quien decide (ver ScopesFinancialInstruments); esto solo
 * evita ofrecer acciones que terminarían en 403.
 */
export const useBankingPermissions = () => {
  const { user } = useAuth();

  const roles = user?.roles?.map((role) => role.name) ?? [];

  const isSuperuser = roles.includes("SUPERUSER");
  const isChief = roles.includes("JEFE_ADMINISTRACION");
  const isAnalyst = roles.includes("ANALISTA_ADMINISTRACION");

  return {
    isSuperuser,
    canAccessPanel: isSuperuser || isChief || isAnalyst,
    canManageCompanies: isSuperuser,
    canSeeFullNumber: isSuperuser || isChief,
  };
};
