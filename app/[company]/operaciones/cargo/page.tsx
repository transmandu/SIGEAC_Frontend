"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetCargoStatsByAircraft } from "@/hooks/operaciones/cargo/useGetCargoStatsByAircraft";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MonthYearPicker } from "@/components/selects/MonthYearPicker";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Loader2,
  Plane,
  Package,
  ChevronRight,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { AircraftCargoStats } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useManageExternalAircraft } from "@/hooks/operaciones/cargo/useManageExternalAircraft";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const AircraftCard = ({
  aircraft,
  company,
  month,
  year,
}: {
  aircraft: AircraftCargoStats;
  company: string;
  month: number;
  year: number;
}) => {
  // Manejo de menús y diálogos
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newName, setNewName] = useState(aircraft.acronym || "");

  const { bulkRename, isRenaming, bulkDelete, isDeleting } =
    useManageExternalAircraft(company);

  // Verificamos si estamos viendo el mes actual
  const isCurrentMonth =
    Number(month) === new Date().getMonth() + 1 &&
    Number(year) === new Date().getFullYear();

  const handleRename = () => {
    if (!newName.trim() || newName.trim() === aircraft.acronym) return;
    bulkRename(
      {
        month,
        year,
        oldName: aircraft.external_aircraft || aircraft.acronym,
        newName: newName,
      },
      {
        onSuccess: () => setShowRenameDialog(false),
      },
    );
  };

  const handleDelete = () => {
    bulkDelete(
      {
        month,
        year,
        externalAircraft: aircraft.external_aircraft || aircraft.acronym,
      },
      {
        onSuccess: () => setShowDeleteDialog(false),
      },
    );
  };

  return (
    <>
      <Card className="flex flex-col justify-between hover:shadow-lg hover:border-primary/50 transition-all duration-200 group relative overflow-visible">
        {/* MENÚ DE ACCIONES (SOLO APLICA A AERONAVES EXTERNAS EN MES ACTUAL) */}
        {aircraft.is_external && isCurrentMonth && (
          <div className="absolute top-2 right-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowRenameDialog(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Actualizar Datos</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-100 focus:text-red-600 dark:focus:bg-red-900/30"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Eliminar Registro</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <CardContent className="pt-6 pb-2 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Plane className="h-5 w-5" />
              </div>
              <div className="pr-4">
                <p className="text-2xl font-bold tracking-tight break-all">
                  {aircraft.acronym}
                </p>
                <p className="text-sm text-muted-foreground">
                  {aircraft.model}
                </p>
              </div>
            </div>

            {/* Solo se renderiza si NO hay menú colisionando (es registrada o no es mes actual) */}
            {(!aircraft.is_external || !isCurrentMonth) && (
              <span
                className={`text-xs font-mono px-2 py-1 rounded shrink-0 ${
                  aircraft.is_external
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {aircraft.is_external ? "Externa" : aircraft.serial}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 border rounded-lg p-3 bg-muted/30">
            <Package className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Guías registradas
              </p>
              <p className="text-xl font-bold text-primary">
                {aircraft.cargo_count}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  este mes
                </span>
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-5">
          <Button asChild className="w-full gap-2" variant="outline">
            <Link
              href={
                aircraft.is_external
                  ? `/${company}/operaciones/cargo/externa/${encodeURIComponent(aircraft.external_aircraft || aircraft.acronym)}?month=${month}&year=${year}`
                  : `/${company}/operaciones/cargo/${aircraft.id}?month=${month}&year=${year}`
              }
            >
              Ver Registros de Carga
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* DIÁLOGO RENOMBRAR */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar Aeronave</DialogTitle>
            <DialogDescription>
              Esto actualizará el nombre <b>{aircraft.acronym}</b> a la nueva
              sigla en todas las <b>guías de carga</b> registradas este mes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              className="uppercase"
              value={newName}
              onChange={(e) => setNewName(e.target.value.toUpperCase())}
              placeholder="NUEVA SIGLA"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRenameDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={
                !newName.trim() ||
                newName.trim() === aircraft.acronym ||
                isRenaming
              }
              onClick={handleRename}
            >
              {isRenaming ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO ELIMINAR */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará <b>{aircraft.cargo_count} registros</b> de
              carga asociados a la aeronave {aircraft.acronym} para el mes en
              curso. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Sí, eliminar registros"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const CargoPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("registered");

  const {
    data: statsData,
    isLoading,
    isError,
  } = useGetCargoStatsByAircraft(selectedCompany?.slug, month, year);

  const registeredAircrafts = statsData?.registered || [];
  const externalAircrafts = statsData?.external || [];

  return (
    <ContentLayout title="Carga">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Operaciones</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Carga</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-4xl font-bold text-center">Módulo de Carga</h1>
          <p className="text-sm text-muted-foreground text-center italic">
            Selecciona una aeronave para ver o registrar sus guías de carga.
          </p>
        </div>

        {/* Filtro de Mes y Año */}
        <div className="flex justify-between bg-muted/30 p-3 rounded-lg border mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Período:
            </span>
            <MonthYearPicker
              month={month}
              year={year}
              onMonthChange={setMonth}
              onYearChange={setYear}
            />
          </div>

          <div className="flex justify-end">
            <Button asChild>
              <Link
                href={
                  activeTab === "registered"
                    ? `/${selectedCompany?.slug}/operaciones/cargo/nuevo`
                    : `/${selectedCompany?.slug}/operaciones/cargo/externa/nuevo`
                }
              >
                <Plus className="size-4 mr-2" />
                Nuevo Registro de Carga
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs de Aeronaves */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="registered">
              Aeronaves de la Empresa ({registeredAircrafts.length})
            </TabsTrigger>
            <TabsTrigger value="external">
              Aeronaves Externas ({externalAircrafts.length})
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : isError ? (
            <p className="text-muted-foreground text-sm italic text-center py-10">
              Ha ocurrida un error al cargar las eronaves...
            </p>
          ) : (
            <>
              <TabsContent value="registered">
                {registeredAircrafts.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <Plane className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No hay aeronaves registradas.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {registeredAircrafts.map((aircraft) => (
                      <AircraftCard
                        key={`reg-${aircraft.id}`}
                        aircraft={aircraft}
                        company={selectedCompany?.slug || ""}
                        month={month}
                        year={year}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="external">
                {externalAircrafts.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <Plane className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">
                      No hay aeronaves externas este mes.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {externalAircrafts.map((aircraft) => (
                      <AircraftCard
                        key={`ext-${aircraft.external_aircraft}`}
                        aircraft={aircraft}
                        company={selectedCompany?.slug || ""}
                        month={month}
                        year={year}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default CargoPage;
