import ProtectedRoute from "@/components/layout/ProtectedRoute";
import React from "react";

const ReportesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute roles={["SUPERUSER"]}>
      {children}
    </ProtectedRoute>
  );
};

export default ReportesLayout;
