import { redirect } from "next/navigation";
import { warehouseInventoryHref } from "@/lib/inventory-access";

const WarehouseInventoryIndexPage = async ({
  params,
}: {
  params: Promise<{ company: string }>;
}) => {
  const { company } = await params;

  redirect(warehouseInventoryHref(company));
};

export default WarehouseInventoryIndexPage;
