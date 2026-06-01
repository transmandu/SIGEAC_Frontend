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

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const BASE_TRIGGER =
  "h-9 w-[180px] rounded-lg border border-border/85 bg-background text-sm text-foreground/90 transition-colors duration-200";

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
    <motion.div
      className="flex items-center justify-center gap-2 w-full"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* COMPANY */}
      <Select
        value={selectedCompany?.id.toString() || ""}
        onValueChange={handleCompanySelect}
      >
        <SelectTrigger
          className={cn(
            BASE_TRIGGER,
            "bg-gradient-to-br from-background/70 to-background/40",
            "backdrop-blur-md",
            "border border-slate-400/60 dark:border-slate-600/60",
            "shadow-sm",
            "text-slate-700 dark:text-slate-200",
            "hover:border-blue-400/30",
            "hover:shadow-md hover:shadow-blue-500/10",
            "data-[state=open]:border-blue-400/40",
            "data-[state=open]:ring-2 data-[state=open]:ring-blue-500/15",
            "data-[state=open]:shadow-md data-[state=open]:shadow-blue-500/15",
            "transition-all duration-200",
            "active:scale-[0.99]"
          )}
        >
          {userLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-xs text-muted-foreground">
                Cargando
              </span>
            </div>
          ) : (
            <SelectValue placeholder="Empresa" />
          )}
        </SelectTrigger>

        <SelectContent>
          {user?.companies?.map((company: Company) => (
            <SelectItem
              key={company.id}
              value={company.id.toString()}
            >
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* STATION */}
      <Select
        disabled={!selectedCompany}
        value={selectedStation || ""}
        onValueChange={handleStationSelect}
      >
        <SelectTrigger
          className={cn(
            BASE_TRIGGER,
            "bg-gradient-to-br from-background/70 to-background/40",
            "backdrop-blur-md",
            "border border-slate-400/60 dark:border-slate-600/60",
            "shadow-sm",
            "text-slate-700 dark:text-slate-200",
            "hover:border-blue-400/30",
            "hover:shadow-md hover:shadow-blue-500/10",
            "data-[state=open]:border-blue-400/40",
            "data-[state=open]:ring-2 data-[state=open]:ring-blue-500/15",
            "data-[state=open]:shadow-md data-[state=open]:shadow-blue-500/15",
            "transition-all duration-200",
            "active:scale-[0.99]"
          )}
        >
          {locationsLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-xs text-muted-foreground">
                Cargando
              </span>
            </div>
          ) : (
            <SelectValue placeholder="Estación" />
          )}
        </SelectTrigger>

        <SelectContent>
          {isError ? (
            <div className="p-2 text-xs text-muted-foreground">
              Error cargando estaciones
            </div>
          ) : (
            locations?.map((location) => (
              <SelectItem
                key={location.id}
                value={location.id.toString()}
              >
                {location.cod_iata}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </motion.div>
  );
};

export default CompanySelect;