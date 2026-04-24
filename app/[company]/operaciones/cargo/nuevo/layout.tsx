import ProtectedRoute from "@/components/layout/ProtectedRoute";

export default function NuevoCargoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute roles={["OPERADOR_CARGA", "SUPERUSER"]}>
      {children}
    </ProtectedRoute>
  );
}
