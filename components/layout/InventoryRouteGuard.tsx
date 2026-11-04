"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingPage from "@/components/misc/LoadingPage";
import { resolveInventoryRedirect } from "@/lib/inventory-access";

/**
 * Reencamina a quien escribió a mano la pantalla de inventario de la otra área
 * (`almacen/` ↔ `general/`). Debe envolver a la guarda de roles del layout: la
 * del almacén, sin esto, mandaría a /not-authorized a quien tiene su casa en
 * `general`.
 *
 * Solo actúa en las rutas de inventario; en el resto deja pasar sin tocar nada.
 */
export default function InventoryRouteGuard({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const { company } = useParams<{ company: string }>();
  const router = useRouter();

  const target = useMemo(() => {
    if (loading || !user || !company) return null;

    const roles = Array.isArray(user.roles)
      ? user.roles.map((role) => role.name)
      : [];

    return resolveInventoryRedirect(pathname, company, roles);
  }, [loading, user, company, pathname]);

  useEffect(() => {
    // replace: la pantalla equivocada no debe quedar en el historial.
    if (target) router.replace(target);
  }, [target, router]);

  if (target) return <LoadingPage />;

  return <>{children}</>;
}
