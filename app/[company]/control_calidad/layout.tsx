import ProtectedLayout from "@/components/layout/ProtectedLayout";
import React from "react";

/**
 * Control de Calidad — exclusivo de JEFE_CONTROL_CALIDAD e INSPECTOR (y SUPERUSER,
 * que entra a todo) y solo en empresas OMAC: incoming y cuarentena son del flujo
 * aeronáutico. El gating real vive en el backend (routes/api/warehouse); este
 * layout evita que la pantalla se abra por URL para quien no corresponde.
 */
const QualityControlLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedLayout
      roles={["JEFE_CONTROL_CALIDAD", "INSPECTOR", "SUPERUSER"]}
      requiresOmac={true}
    >
      {children}
    </ProtectedLayout>
  );
};

export default QualityControlLayout;
