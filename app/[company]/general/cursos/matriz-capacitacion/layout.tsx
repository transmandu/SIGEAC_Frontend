import ProtectedRoute from "@/components/layout/ProtectedRoute";
import React from "react";

const SmsTrainingMatrixLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ProtectedRoute roles={["JEFE_SMS", "ANALISTA_SMS", "SUPERUSER"]}>
      {children}
    </ProtectedRoute>
  );
};

export default SmsTrainingMatrixLayout;
