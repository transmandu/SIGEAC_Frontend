import ProtectedLayout from "@/components/layout/ProtectedLayout";
import React from "react";

const RecepcionGeneralLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedLayout roles={["ASISTENTE_COMPRAS", "SUPERUSER"]}>
      {children}
    </ProtectedLayout>
  );
};

export default RecepcionGeneralLayout;
