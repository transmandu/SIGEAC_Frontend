"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { CreateVendorDialog } from "@/components/dialogs/general/CreateVendorDialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetVendors } from "@/hooks/general/proveedores/useGetVendors";
import { getColumns } from "./columns";
import { Vendor } from "@/types";
import VendorsToolBar from "./_components/VendorsToolBar";
import VendorsSubRow from "./_components/VendorsSubRow";
import { useTourContext } from "@/components/tour/TourProvider";
import { proveedoresSteps } from "@/components/tour/steps/ajustes/proveedores/proveedores";

const columns = getColumns();

const VendorsPage = () => {
  const { selectedCompany } = useCompanyStore();

  const {
    data: vendors,
    isPending,
    isError,
    refetch,
  } = useGetVendors(selectedCompany?.slug);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (vendors && vendors.length > 0) {
      registerTour("proveedores", "Proveedores", proveedoresSteps);
    }
    return () => unregisterTour("proveedores");
  }, [registerTour, unregisterTour, vendors]);

  const deferredSearch = useDeferredValue(search);

  const filteredVendors = useMemo<Vendor[]>(() => {
    if (!vendors) return [];
    const q = deferredSearch.trim().toLowerCase();

    return vendors.filter((vendor: Vendor) => {
      const matchesSearch =
        !q ||
        vendor.name?.toLowerCase?.().includes(q) ||
        vendor.email?.toLowerCase?.().includes(q) ||
        vendor.phone?.toLowerCase?.().includes(q) ||
        vendor.address?.toLowerCase?.().includes(q);

      const matchesType = type === "ALL" || vendor.type === type;

      return matchesSearch && matchesType;
    });
  }, [vendors, deferredSearch, type]);

  return (
    <SettingsListPage
      title="Proveedores"
      heading="Proveedores"
      description="Visualiza y administra los proveedores y beneficiarios registrados dentro de la configuración global del sistema."
      tourPrefix="proveedores"
      toolbar={
        <VendorsToolBar
          search={search}
          setSearch={setSearch}
          type={type}
          setType={setType}
        />
      }
      count={{
        value: vendors ? filteredVendors.length : undefined,
        singular: "proveedor",
        plural: "proveedores",
      }}
    >
      <SettingsDataTable
        columns={columns}
        data={filteredVendors}
        loading={isPending}
        error={isError}
        errorMessage="No se pudieron cargar los proveedores"
        onRetry={() => refetch()}
        filtered={!!deferredSearch.trim() || type !== "ALL"}
        emptyMessage="No se encontraron proveedores."
        actions={<CreateVendorDialog />}
        tourPrefix="proveedores"
        bodyTourId="proveedores-expand"
        renderSubRow={(vendor: Vendor) => <VendorsSubRow vendor={vendor} />}
      />
    </SettingsListPage>
  );
};

export default VendorsPage;
