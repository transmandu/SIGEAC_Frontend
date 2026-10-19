"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingPage from "@/components/misc/LoadingPage";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
  directPermissions?: string[];
}

const ProtectedRoute = ({
  children,
  roles,
  permissions,
  directPermissions,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Navegar durante el render dispara el aviso de React por actualizar el
  // Router mientras se pinta otro componente, y se repetía en cada render hasta
  // que la ruta cambiaba. replace: la página protegida no debe quedar en el
  // historial, o "atrás" rebota por el proxy hacia el login.
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) return <LoadingPage />;

  if (!user) return null;

  // Guardas defensivas: roles o permissions pueden llegar como objeto `{}`
  // en lugar de `[]` si el localStorage tiene datos de una sesión antigua o
  // si el backend devuelve una forma inesperada. Sin Array.isArray() el
  // .map() / .flatMap() lanzaría "e.map is not a function".
  const userRoles = Array.isArray(user.roles)
    ? user.roles.map((role) => role.name)
    : [];

  const userPermissions = Array.isArray(user.roles)
    ? user.roles.flatMap((role) =>
        Array.isArray(role.permissions)
          ? role.permissions.map((permission) => permission.name)
          : [],
      )
    : [];

  const userDirectPermissions = Array.isArray(user.permissions)
    ? user.permissions.map((p) => p.name)
    : [];

  if (roles && !roles.some((role) => userRoles.includes(role))) {
    router.push("/not-authorized");
    return null;
  }

  if (
    permissions &&
    !permissions.some((permission) => userPermissions.includes(permission))
  ) {
    router.push("/not-authorized");
    return null;
  }

  if (
    directPermissions &&
    !directPermissions.some((permission) =>
      userDirectPermissions.includes(permission),
    )
  ) {
    router.push("/not-authorized");
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
