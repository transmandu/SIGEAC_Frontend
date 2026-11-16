"use client";

import { SearchAcrossLocationsDialog } from "@/components/dialogs/mantenimiento/almacen/SearchAcrossLocationsDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/helpers/useDebounce";
import {
  AERONAUTICAL_INVENTORY_ROLES,
  hasAnyRole,
} from "@/lib/inventory-access";
import { MapPin, X } from "lucide-react";
import { useState } from "react";
import { AeronauticalInventory } from "@/app/[company]/general/inventario_articulos/_components/AeronauticalInventory";
import { GeneralInventory } from "@/app/[company]/general/inventario_articulos/_components/GeneralInventory";

type InventoryTab = "aeronautic" | "general";

const PLACEHOLDERS: Record<InventoryTab, string> = {
  aeronautic:
    "Búsqueda Aeronáutica - Nro. de Parte (Ej: 65-50587-4, TORNILLO, ALT-123...)",
  general: "Búsqueda General - Buscar por Descripcion",
};

/**
 * Consulta de inventario para quien no lo opera. Los roles aeronáuticos ven los
 * dos inventarios en tabs; el resto solo el de ferretería, sin tabs.
 */
const InventarioArticulosPage = () => {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<InventoryTab>("aeronautic");
  const [searchAcrossOpen, setSearchAcrossOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400) || undefined;

  if (loading) return <LoadingPage />;

  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((role) => role.name)
    : [];
  const canSeeAeronautical = hasAnyRole(
    userRoles,
    AERONAUTICAL_INVENTORY_ROLES,
  );

  const activeTab: InventoryTab = canSeeAeronautical ? tab : "general";

  return (
    <ContentLayout title="Inventario">
      <div className="flex flex-col gap-y-4">
        <PageHeader className="mb-2" />

        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold">Inventario</h1>
          <p className="text-sm italic text-muted-foreground">
            {canSeeAeronautical
              ? "Visualiza todos los artículos organizados por tipo y sección"
              : "Consulta de artículos generales / ferretería"}
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder={PLACEHOLDERS[activeTab]}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pr-8"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* El buscador de arriba filtra ESTA sede; este consulta las demás
              sin cambiar la estación en la que se trabaja. Solo aeronáutico:
              la consulta es por número de parte y un artículo general no
              tiene. */}
          {activeTab === "aeronautic" && (
            <Button
              type="button"
              variant="outline"
              className="h-11 shrink-0 gap-2"
              onClick={() => setSearchAcrossOpen(true)}
            >
              <MapPin className="size-4" />
              Consultar en sedes
            </Button>
          )}
        </div>

        {canSeeAeronautical ? (
          // forceMount: cada inventario conserva su categoría y filtros al
          // cambiar de tab; el que no está a la vista no consulta.
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as InventoryTab)}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="aeronautic">Aeronáutico</TabsTrigger>
              <TabsTrigger value="general">General / Ferretería</TabsTrigger>
            </TabsList>

            <TabsContent
              value="aeronautic"
              forceMount
              className="data-[state=inactive]:hidden"
            >
              <AeronauticalInventory
                search={debouncedSearch}
                active={tab === "aeronautic"}
              />
            </TabsContent>

            <TabsContent
              value="general"
              forceMount
              className="data-[state=inactive]:hidden"
            >
              <GeneralInventory
                search={debouncedSearch}
                active={tab === "general"}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <GeneralInventory search={debouncedSearch} active />
        )}

        {canSeeAeronautical && (
          <SearchAcrossLocationsDialog
            open={searchAcrossOpen}
            onOpenChange={setSearchAcrossOpen}
            variant="general"
          />
        )}
      </div>
    </ContentLayout>
  );
};

export default InventarioArticulosPage;
