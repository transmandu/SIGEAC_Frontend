"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { BookOpen, Layers3, Users } from "lucide-react";
import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateSmsTrainingGroupDialog } from "@/components/dialogs/general/CreateSmsTrainingGroupDialog";
import { CreateSmsTrainingModuleDialog } from "@/components/dialogs/general/CreateSmsTrainingModuleDialog";
import { CreateSmsTrainingModulePatternDialog } from "@/components/dialogs/general/CreateSmsTrainingModulePatternDialog";
import { useGetSmsTrainingGroups } from "@/hooks/curso/useGetSmsTrainingGroups";
import { useGetSmsTrainingModules } from "@/hooks/curso/useGetSmsTrainingModules";
import { useGetSmsTrainingModulePatterns } from "@/hooks/curso/useGetSmsTrainingModulePatterns";
import { useCompanyStore } from "@/stores/CompanyStore";
import { SmsTrainingGroupEmployees } from "./_components/SmsTrainingGroupEmployees";
import { columns as groupColumns } from "./columns";
import { moduleColumns } from "./module-columns";
import { patternColumns } from "./pattern-columns";

type TabValue = "groups" | "modules" | "patterns";

const SmsTrainingMatrixPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [tab, setTab] = useState<TabValue>("groups");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const groupsQuery = useGetSmsTrainingGroups(selectedCompany?.slug);
  const modulesQuery = useGetSmsTrainingModules(selectedCompany?.slug);
  const patternsQuery = useGetSmsTrainingModulePatterns(selectedCompany?.slug);

  const filteredGroups = useMemo(() => {
    const data = groupsQuery.data ?? [];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return data;

    return data.filter(
      (group) =>
        group.name?.toLowerCase().includes(q) ||
        group.description?.toLowerCase().includes(q) ||
        group.pattern?.name?.toLowerCase().includes(q) ||
        group.job_titles.some((jobTitle) =>
          jobTitle.name.toLowerCase().includes(q),
        ),
    );
  }, [groupsQuery.data, deferredSearch]);

  const filteredModules = useMemo(() => {
    const data = modulesQuery.data ?? [];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return data;

    return data.filter(
      (module) =>
        String(module.number).includes(q) ||
        module.name?.toLowerCase().includes(q) ||
        module.description?.toLowerCase().includes(q),
    );
  }, [modulesQuery.data, deferredSearch]);

  const filteredPatterns = useMemo(() => {
    const data = patternsQuery.data ?? [];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return data;

    return data.filter(
      (pattern) =>
        pattern.name?.toLowerCase().includes(q) ||
        pattern.description?.toLowerCase().includes(q) ||
        pattern.modules.some((module) => module.name.toLowerCase().includes(q)),
    );
  }, [patternsQuery.data, deferredSearch]);

  const activeData =
    tab === "groups"
      ? {
          count: filteredGroups.length,
          singular: "grupo",
          plural: "grupos",
          placeholder: "Buscar grupos, patrones o cargos...",
        }
      : tab === "modules"
        ? {
            count: filteredModules.length,
            singular: "módulo",
            plural: "módulos",
            placeholder: "Buscar módulos por número o nombre...",
          }
        : {
            count: filteredPatterns.length,
            singular: "patrón",
            plural: "patrones",
            placeholder: "Buscar patrones o módulos...",
          };

  return (
    <SettingsListPage
      title="Programación de Personal Aeronáutico"
      heading="Programación de Personal Aeronáutico"
      description="Administra grupos, módulos y patrones de capacitación del personal aeronáutico."
      search={{
        value: search,
        onChange: setSearch,
        placeholder: activeData.placeholder,
      }}
      count={{
        value: activeData.count,
        singular: activeData.singular,
        plural: activeData.plural,
      }}
    >
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as TabValue);
          setSearch("");
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="groups" className="gap-2">
            <Users className="h-4 w-4" />
            Grupos
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2">
            <Layers3 className="h-4 w-4" />
            Patrones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <SettingsDataTable
            columns={groupColumns}
            data={filteredGroups}
            error={groupsQuery.isError}
            errorMessage="No se pudieron cargar los grupos de capacitación"
            onRetry={() => groupsQuery.refetch()}
            filtered={!!deferredSearch.trim()}
            loading={groupsQuery.isPending}
            emptyMessage="No se han encontrado grupos de capacitación."
            actions={<CreateSmsTrainingGroupDialog />}
            renderSubRow={(group) => (
              <SmsTrainingGroupEmployees group={group} />
            )}
          />
        </TabsContent>

        <TabsContent value="modules">
          <SettingsDataTable
            columns={moduleColumns}
            data={filteredModules}
            error={modulesQuery.isError}
            errorMessage="No se pudieron cargar los módulos"
            onRetry={() => modulesQuery.refetch()}
            filtered={!!deferredSearch.trim()}
            loading={modulesQuery.isPending}
            emptyMessage="No se han encontrado módulos."
            actions={<CreateSmsTrainingModuleDialog />}
          />
        </TabsContent>

        <TabsContent value="patterns">
          <SettingsDataTable
            columns={patternColumns}
            data={filteredPatterns}
            error={patternsQuery.isError}
            errorMessage="No se pudieron cargar los patrones"
            onRetry={() => patternsQuery.refetch()}
            filtered={!!deferredSearch.trim()}
            loading={patternsQuery.isPending}
            emptyMessage="No se han encontrado patrones."
            actions={<CreateSmsTrainingModulePatternDialog />}
          />
        </TabsContent>
      </Tabs>
    </SettingsListPage>
  );
};

export default SmsTrainingMatrixPage;
