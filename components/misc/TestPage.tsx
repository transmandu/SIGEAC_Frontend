"use client";

import { useCompanyStore } from "@/stores/CompanyStore";
import React from "react";

const TestPage = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return (
    <div>
      {/* {selectedCompany ? selectedCompany : 'No ha elegido una empresa'} */}
      {selectedStation ? selectedStation : "No ha elegido una estacion"}
    </div>
  );
};

export default TestPage;
