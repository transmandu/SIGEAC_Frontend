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
import { Company, Location } from "@/types";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CompanySelect = () => {
  const { user, loading: userLoading } = useAuth();
  const [stationAddress, setStationAddress] = useState<string | null>(null);

  const {
    mutate,
    data: locations,
    isPending: locationsLoading,
    isError
  } = useGetUserLocationsByCompanyId();

  const {
    selectedCompany,
    selectedStation,
    setSelectedCompany,
    setSelectedStation,
    initFromLocalStorage
  } = useCompanyStore();

  const router = useRouter();

  useEffect(() => {
    initFromLocalStorage();
  }, [initFromLocalStorage]);

  useEffect(() => {
    if (selectedCompany) {
      const companyId = user?.companies.find(c =>
        c.name.toLowerCase() === selectedCompany.toLowerCase()
      )?.id;

      if (companyId) {
        mutate(companyId);
      }
    }
  }, [selectedCompany, user?.companies, mutate]);

  useEffect(() => {
    if (selectedStation && locations) {
      const selectedLocation = locations.find(location =>
        location.id.toString() === selectedStation
      );

      if (selectedLocation) {
        setStationAddress(`${selectedLocation.cod_iata} - ${selectedLocation.type}`);
      } else {
        setStationAddress(null);
      }
    }
  }, [selectedStation, locations]);

  const handleCompanySelect = (value: string) => {
    setSelectedCompany(value);
    setStationAddress(null);
    setSelectedStation('');

    if (value) {
      router.push(`/${value.toLowerCase().split(" ").join("")}/dashboard`);
    }
  };

  const handleStationSelect = (value: string) => {
    setSelectedStation(value);
    const selectedLocation = locations?.find(location =>
      location.id.toString() === value
    );

    if (selectedLocation) {
      setStationAddress(`${selectedLocation.cod_iata} - ${selectedLocation.type}`);
    } else {
      setStationAddress(null);
    }
  };

  const formatCompanyNameForURL = (name: string): string => {
    return name.toLowerCase().split(" ").join("");
  };

  return (
    <div className="hidden items-center space-x-2 justify-center md:flex md:flex-1">
      <Select
        value={selectedCompany || ''}
        onValueChange={handleCompanySelect}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue
            placeholder={selectedCompany
              ? `${selectedCompany[0].toUpperCase() + selectedCompany.slice(1)}`
              : 'Empresa'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {userLoading && (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="size-4 animate-spin" />
            </div>
          )}
          {user?.companies?.map((company: Company) => (
            <SelectItem
              value={company.name.toLowerCase()}
              key={company.id}
            >
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        disabled={!selectedCompany}
        value={selectedStation || ''}
        onValueChange={handleStationSelect}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue
            placeholder={
              locationsLoading
                ? <Loader2 className="animate-spin size-4" />
                : stationAddress || 'Estación'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {locationsLoading && (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="size-4 animate-spin" />
            </div>
          )}
          {locations?.map((location) => (
            <SelectItem
              value={location.id.toString()}
              key={location.id}
            >
              {location.cod_iata}
            </SelectItem>
          ))}
          {isError && (
            <p className="p-2 text-xs text-muted-foreground italic">
              Ha ocurrido un error al cargar las estaciones...
            </p>
          )}
          {!locationsLoading && locations?.length === 0 && (
            <p className="p-2 text-xs text-muted-foreground italic">
              No hay estaciones disponibles
            </p>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CompanySelect;
