import ProtectedRoute from "@/components/layout/ProtectedRoute";
import React from "react";

const ReportesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

export default ReportesLayout;
