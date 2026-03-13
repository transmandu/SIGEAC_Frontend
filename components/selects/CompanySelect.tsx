import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useRouteSelection } from "@/hooks/helpers/use-route-selection";
import { useGetUserLocationsByCompanyId } from "@/hooks/sistema/usuario/useGetUserLocationsByCompanyId";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Company } from "@/types";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

const CompanySelect = () => {
  const { user, loading: userLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentCompany, currentStation } = useRouteSelection();

  const {
    mutate,
    data: locations,
    isPending: locationsLoading,
    isError,
  } = useGetUserLocationsByCompanyId();

  const { setSelectedCompany, setSelectedStation } = useCompanyStore();

  useEffect(() => {
    if (currentCompany) {
      mutate(currentCompany.id);
    }
  }, [currentCompany, mutate]);

  const stationLabel = useMemo(() => {
    if (!currentStation) {
      return "Estacion";
    }

    const selectedLocation = locations?.find(
      (location) => location.id.toString() === currentStation
    );

    if (selectedLocation) {
      return `${selectedLocation.cod_iata} - ${selectedLocation.type}`;
    }

    return `Estacion ${currentStation}`;
  }, [currentStation, locations]);

  const handleCompanySelect = (companyId: string) => {
    const company = user?.companies?.find((item) => item.id.toString() === companyId);
    if (!company) {
      return;
    }

    setSelectedCompany(company);
    setSelectedStation(null);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("station");

    const nextQuery = nextParams.toString();
    router.push(`/${company.slug}/dashboard${nextQuery ? `?${nextQuery}` : ""}`);
  };

  const handleStationSelect = (value: string) => {
    setSelectedStation(value);

    if (!currentCompany) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("station", value);

    const basePath = pathname.startsWith(`/${currentCompany.slug}/`)
      ? pathname
      : `/${currentCompany.slug}/dashboard`;

    router.push(`${basePath}?${nextParams.toString()}`);
  };

  const companyValue = currentCompany ? currentCompany.id.toString() : "";
  const companyPlaceholder = currentCompany
    ? currentCompany.name[0].toUpperCase() + currentCompany.name.slice(1)
    : "Empresa";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 w-full">
      <Select value={companyValue} onValueChange={handleCompanySelect}>
        <SelectTrigger className="w-[140px] sm:w-[160px] md:w-[180px]">
          <SelectValue placeholder={companyPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {userLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : (
            user?.companies?.map((company: Company) => (
              <SelectItem value={company.id.toString()} key={company.id}>
                {company.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <Select
        disabled={!currentCompany}
        value={currentStation || ""}
        onValueChange={handleStationSelect}
      >
        <SelectTrigger className="w-[140px] sm:w-[160px] md:w-[180px]">
          <SelectValue
            placeholder={
              locationsLoading && !currentStation ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                stationLabel
              )
            }
          />
        </SelectTrigger>
        <SelectContent>
          {locationsLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="animate-spin w-4 h-4" />
            </div>
          ) : isError ? (
            <p className="p-2 text-xs text-muted-foreground italic">
              Ha ocurrido un error al cargar las estaciones...
            </p>
          ) : locations?.length === 0 ? (
            <p className="p-2 text-xs text-muted-foreground italic">
              No hay estaciones disponibles
            </p>
          ) : (
            locations?.map((location) => (
              <SelectItem value={location.id.toString()} key={location.id}>
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
