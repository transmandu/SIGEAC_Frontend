"use client";

import { useEffect } from "react";

import CreateErrorReportDialog from "@/components/dialogs/sistema/CreateErrorReportDialog";
import { useAuth } from "@/contexts/AuthContext";
import { ERROR_REPORT_VISIBLE_TO_NORMAL_USERS } from "@/lib/errorReportModules";
import { useErrorReportDraftStore } from "@/stores/ErrorReportDraftStore";

/**
 * Monta una sola vez el formulario de reportes que abre el botón "Reportar" de
 * los avisos de error.
 *
 * Los avisos los lanza código que no es un componente, así que no pueden
 * renderizar un diálogo por su cuenta: lo piden por la tienda y este
 * componente lo muestra. Respeta el mismo permiso que el botón del navbar.
 */
export default function ErrorReportDraftHost() {
  const { user } = useAuth();
  const { open, draft, closeDraft, setCanReport, setIsSuperUser } =
    useErrorReportDraftStore();

  const isSuperUser = !!user?.roles?.some((role) => role.name === "SUPERUSER");
  const allowed =
    !!user && (isSuperUser || ERROR_REPORT_VISIBLE_TO_NORMAL_USERS);

  useEffect(() => {
    setCanReport(allowed);

    return () => setCanReport(false);
  }, [allowed, setCanReport]);

  useEffect(() => {
    setIsSuperUser(isSuperUser);

    return () => setIsSuperUser(false);
  }, [isSuperUser, setIsSuperUser]);

  if (!allowed) return null;

  return (
    <CreateErrorReportDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeDraft();
      }}
      draft={draft ?? undefined}
    />
  );
}
