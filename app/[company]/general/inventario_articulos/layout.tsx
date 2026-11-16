import InventoryRouteGuard from "@/components/layout/InventoryRouteGuard";
import type { ReactNode } from "react";

const GeneralInventoryLayout = ({ children }: { children: ReactNode }) => (
  <InventoryRouteGuard>{children}</InventoryRouteGuard>
);

export default GeneralInventoryLayout;
