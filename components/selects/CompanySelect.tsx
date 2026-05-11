"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserLocationsByCompanyId } from "@/hooks/sistema/usuario/useGetUserLocationsByCompanyId";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Company } from "@/types";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const CompanySelect = () => {
  const { user, loading: userLoading } = useAuth();

  const {
    selectedCompany,
    selectedStation,
    setSelectedCompany,
    setSelectedStation,
  } = useCompanyStore();

  const {
    mutate,
    data: locations,
    isPending: locationsLoading,
    isError,
  } = useGetUserLocationsByCompanyId();

  useEffect(() => {
    if (!selectedCompany?.id) return;

    mutate(selectedCompany.id);
  }, [selectedCompany?.id, mutate]);

  const handleCompanySelect = (companyId: string) => {
    const company = user?.companies?.find(
      (c) => c.id.toString() === companyId
    );

    if (!company) return;

    setSelectedCompany(company);
    setSelectedStation("");
  };

  const handleStationSelect = (stationId: string) => {
    setSelectedStation(stationId);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 w-full">

      <Select
        value={selectedCompany?.id.toString() || ""}
        onValueChange={handleCompanySelect}
      >
        <SelectTrigger className="w-[140px] sm:w-[160px] md:w-[180px]">
          <SelectValue placeholder="Empresa" />
        </SelectTrigger>

        <SelectContent>
          {userLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : (
            user?.companies?.map((company: Company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <Select
        disabled={!selectedCompany}
        value={selectedStation || ""}
        onValueChange={handleStationSelect}
      >
        <SelectTrigger className="w-[140px] sm:w-[160px] md:w-[180px]">
          <SelectValue
            placeholder={
              locationsLoading ? "Cargando..." : "Estación"
            }
          />
        </SelectTrigger>

        <SelectContent>
          {locationsLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : isError ? (
            <p className="p-2 text-xs text-muted-foreground italic">
              Error cargando estaciones
            </p>
          ) : (
            locations?.map((location) => (
              <SelectItem key={location.id} value={location.id.toString()}>
                {location.cod_iata}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

    </div>
  );
};

export default CompanySelect;