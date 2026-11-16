import ProtectedRoute from "@/components/layout/ProtectedRoute";

export default function NuevoPaxFlightLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute roles={["OPERADOR_COUNTER", "DESPACHADOR", "SUPERUSER"]}>
      {children}
    </ProtectedRoute>
  );
}
