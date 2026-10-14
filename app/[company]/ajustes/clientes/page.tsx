"use client";

import { useCompanyStore } from "@/stores/CompanyStore";
import { AeronauticalClientsView } from "./_components/AeronauticalClientsView";
import { AirlineClientsView } from "./_components/AirlineClientsView";

const ClientsPage = () => {
  const { selectedCompany } = useCompanyStore();

  return selectedCompany?.isOMAC ? (
    <AeronauticalClientsView />
  ) : (
    <AirlineClientsView />
  );
};

export default ClientsPage;
