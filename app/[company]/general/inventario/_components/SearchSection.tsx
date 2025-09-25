import { Input } from "@/components/ui/input";

const SearchSection = ({
  searchTerm,
  onSearchChange,
  debouncedSearchTerm,
  showNoResults
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  debouncedSearchTerm: string;
  showNoResults: boolean
}) => (
  <div className="flex flex-col items-center justify-center max-w-md mx-auto w-full mb-4 space-y-2 mt-4">
    <h3 className='font-bold text-lg'>Búsqueda Organizada - Nro. de Parte</h3>
    <Input
        placeholder="Ej: 65-50587-4, TORNILLO, ALT-123..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className='max-w-[300px]'
    />
    {showNoResults && (
      <div className="text-center py-3 text-muted-foreground">
        No se encontraron renglones con artículos que coincidan con: &quot;{searchTerm}&quot;
      </div>
    )}
  </div>
);

export default SearchSection
