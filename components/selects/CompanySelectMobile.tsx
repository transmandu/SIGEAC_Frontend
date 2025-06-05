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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CompanySelect = () => {

  const { user, loading: userLoading } = useAuth();

  const [stationAddress, setStationAddress] = useState<string | null>(null);

  const { mutate, data: locations, isPending: locationsLoading, isError } = useGetUserLocationsByCompanyId();

  const { selectedCompany, selectedStation, setSelectedCompany, setSelectedStation, initFromLocalStorage } = useCompanyStore();

  const router = useRouter();

  useEffect(() => {
    initFromLocalStorage();
  }, [initFromLocalStorage]);


  useEffect(() => {
    if (selectedCompany) {
      const companyId = user?.companies.find(c => c.name.toLowerCase() === selectedCompany.toLowerCase())?.id;
      if (companyId) {
        mutate(companyId);  // Invoca la mutación con el ID de la compañía
      }
    }
  }, [selectedCompany, user?.companies, mutate]);

  useEffect(() => {
    if (selectedStation && locations) {
      const selectedLocation = locations.find(location => location.id.toString() === selectedStation);
      if (selectedLocation) {
        setStationAddress(`${selectedLocation.cod_iata} - ${selectedLocation.type}`)
      } else {
        setStationAddress(null);
      }
    }
  }, [selectedStation, locations]);

  const handleCompanySelect = (value: 'transmandu' | 'hangar 74') => {
    setSelectedCompany(value);
    setStationAddress(null);  // Resetea la dirección al seleccionar una nueva compañía
    if (selectedStation) {
      router.push(`/${value.split(" ").join("")}/dashboard`);
    }
  };

  const handleStationSelect = (value: 'transmandu' | 'hangar 74') => {
    setSelectedStation(value);
    const selectedLocation = locations?.find(location => location.id.toString() === value);
    if (selectedLocation) {
      setStationAddress(`${selectedLocation.cod_iata} - ${selectedLocation.type}`)
    } else {
      setStationAddress(null);
    }
  };

  return (
    <div className="flex flex-col justify-center gap-2 items-center md:hidden">
      <Select onValueChange={handleCompanySelect}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={selectedCompany ? `${selectedCompany[0].toUpperCase() + selectedCompany.slice(1)}` : 'Empresa'} />
        </SelectTrigger>
        <SelectContent defaultValue={''}>
          {userLoading && <Loader2 className="size-4 animate-spin" />}
          {user && user.companies && user?.companies.map((c: Company) => (
            <SelectItem value={c.name.toLowerCase()} key={c.name}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select disabled={!selectedCompany} onValueChange={handleStationSelect}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={locationsLoading ? <Loader2 className="animate-spin size-4" /> : stationAddress || 'Estación'} />
        </SelectTrigger>
        <SelectContent>
          {
            locationsLoading && <Loader2 className="size-4 animate-spin" />
          }
          {
            locations && locations?.map((location) => (
              <SelectItem value={location.id.toString()} key={location.cod_iata}>{location.cod_iata}</SelectItem>
            ))
          }
          {
            isError && <p className="p-2 text-xs text-muted-foreground italic">Ha ocurrido un error al cargar las estaciones...</p>
          }
        </SelectContent>
      </Select>
    </div>
  );
};

export default CompanySelect;
