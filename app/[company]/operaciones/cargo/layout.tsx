import ProtectedRoute from "@/components/layout/ProtectedRoute";

export default function CargoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      roles={["OPERADOR_CARGA", "ANALISTA_ADMINISTRACION", "SUPERUSER"]}
    >
      {children}
    </ProtectedRoute>
  );
}
