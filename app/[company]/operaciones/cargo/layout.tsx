"use client";

import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { ScaleProvider } from "@/contexts/scale/ScaleContext";

export default function CargoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      roles={["OPERADOR_CARGA", "ANALISTA_ADMINISTRACION", "SUPERUSER"]}
    > 
      <ScaleProvider>{children}</ScaleProvider>
    </ProtectedRoute>
  );
}
