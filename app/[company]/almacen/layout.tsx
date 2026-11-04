import InventoryRouteGuard from "@/components/layout/InventoryRouteGuard";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { WAREHOUSE_ROLES } from "@/lib/inventory-access";
import React from "react";

const WarehouseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <InventoryRouteGuard>
      <ProtectedLayout roles={[...WAREHOUSE_ROLES]}>{children}</ProtectedLayout>
    </InventoryRouteGuard>
  );
};

export default WarehouseLayout;
