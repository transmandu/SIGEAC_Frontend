import { CreateCertificateDialog } from '@/components/dialogs/ajustes/CreateCertificateDialog';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGetCertificates } from '@/hooks/mantenimiento/ingenieria/useGetCertificates';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

const CertificatesCombobox = ({
  selectedCertificates,
  onCertificatesChange,
}: {
  selectedCertificates: string[];
  onCertificatesChange: (certificates: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: certificates } = useGetCertificates();

  const filteredCertificates = certificates?.filter((cert) =>
    cert.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSelect = (cert: string) => {
    const newSelected = selectedCertificates.includes(cert)
      ? selectedCertificates.filter((cert) => cert !== cert)
      : [...selectedCertificates, cert];
    onCertificatesChange(newSelected);
  };

  const removeCertificate = (cert: string) => {
    onCertificatesChange(selectedCertificates.filter((c) => c !== cert));
  };
  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {
              selectedCertificates.length > 0
                ? `Cert. seleccionados: ${selectedCertificates.length}`
                : (
                  <>Seleccionar cert... <ChevronsUpDown className="ml-2 h-4 w-4" /></>
                )
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder="Buscar certificados..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No se encontraron certificados</CommandEmpty>
              <CommandGroup>
                {filteredCertificates.map((cert) => (
                  <CommandItem
                    key={cert.id}
                    value={cert.name}
                    onSelect={() => handleSelect(cert.name)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCertificates.includes(cert.name)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {cert.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2 mt-2">
        {selectedCertificates.map((cert) => {
          const certFound = certificates?.find((c) => c.name === cert);
          return (
            <div
              key={cert}
              className="flex items-center bg-gray-100 px-2 py-1 rounded-full text-xs font-semibold"
            >
              {certFound?.name}
              <button
                onClick={() => removeCertificate(cert)}
                className="ml-1 text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CertificatesCombobox
