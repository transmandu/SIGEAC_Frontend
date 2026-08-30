"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus, Trash2, UserX, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  selectTriggerClass,
  triggerButtonClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { cn } from "@/lib/utils";
import { useGetDepartments } from "@/hooks/ajustes/departamento/useGetDepartment";
import { useGetUsers } from "@/hooks/sistema/usuario/useGetUsers";
import {
  useCreateCalendarVisibilityRule,
  useDeleteCalendarVisibilityRule,
} from "@/actions/general/calendario/actions";
import { CalendarVisibilityGrantType, CalendarVisibilityRule } from "@/types";

const GRANT_LABELS: Record<CalendarVisibilityGrantType, string> = {
  DEPARTMENT: "Departamento",
  DEPARTMENT_TREE: "Departamento + árbol",
  USER: "Usuario puntual",
  EXCLUDE_USER: "Excluir usuario",
  ALL: "Todos",
};

const NEEDS_DEPARTMENT: CalendarVisibilityGrantType[] = ["DEPARTMENT", "DEPARTMENT_TREE"];
const NEEDS_USER: CalendarVisibilityGrantType[] = ["USER", "EXCLUDE_USER"];

interface VisibilityRulesEditorProps {
  company: string;
  subject: { sourceKey?: string; calendarEventId?: number };
  rules: CalendarVisibilityRule[];
  isLoading: boolean;
  /** Si es cumpleaños, las reglas son una ELEVACIÓN sobre el árbol propio, no el único portón — se lo aclaramos al usuario. */
  hint?: string;
}

export function VisibilityRulesEditor({ company, subject, rules, isLoading, hint }: VisibilityRulesEditorProps) {
  const [grantType, setGrantType] = useState<CalendarVisibilityGrantType>("DEPARTMENT");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [userId, setUserId] = useState<number | undefined>();

  const { data: departments = [] } = useGetDepartments(company);
  const { data: users = [] } = useGetUsers();
  const { createCalendarVisibilityRule } = useCreateCalendarVisibilityRule();
  const { deleteCalendarVisibilityRule } = useDeleteCalendarVisibilityRule();

  const selectedUser = useMemo(() => users.find((u) => u.id === userId), [users, userId]);

  const canSubmit =
    grantType === "ALL" ||
    (NEEDS_DEPARTMENT.includes(grantType) && !!departmentId) ||
    (NEEDS_USER.includes(grantType) && !!userId);

  const handleAdd = () => {
    if (!canSubmit) return;

    createCalendarVisibilityRule.mutate(
      {
        company,
        data: {
          scope_type: subject.calendarEventId ? "EVENT" : "SOURCE",
          source_key: subject.sourceKey,
          calendar_event_id: subject.calendarEventId,
          grant_type: grantType,
          department_id: NEEDS_DEPARTMENT.includes(grantType) ? Number(departmentId) : undefined,
          user_id: NEEDS_USER.includes(grantType) ? userId : undefined,
        },
      },
      {
        onSuccess: () => {
          setDepartmentId("");
          setUserId(undefined);
        },
      },
    );
  };

  const describeRule = (rule: CalendarVisibilityRule) => {
    if (rule.grant_type === "ALL") return "Todos los usuarios";
    if (rule.grant_type === "DEPARTMENT") return rule.department?.name ?? `Departamento #${rule.department_id}`;
    if (rule.grant_type === "DEPARTMENT_TREE") {
      return `${rule.department?.name ?? `Departamento #${rule.department_id}`} y su árbol`;
    }
    const user = users.find((u) => u.id === rule.user_id);
    return user ? `${user.first_name} ${user.last_name} (${user.username})` : `Usuario #${rule.user_id}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {hint && (
        <p className="rounded-lg border border-slate-400/30 bg-background/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground dark:border-slate-600/30">
          {hint}
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <Select value={grantType} onValueChange={(value) => setGrantType(value as CalendarVisibilityGrantType)}>
          <SelectTrigger className={cn(selectTriggerClass, "h-9 min-w-0 text-sm")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(GRANT_LABELS) as CalendarVisibilityGrantType[]).map((key) => (
              <SelectItem key={key} value={key}>
                {GRANT_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {NEEDS_DEPARTMENT.includes(grantType) && (
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger className={cn(selectTriggerClass, "h-9 min-w-0 text-sm")}>
              <SelectValue placeholder="Selecciona un departamento" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={String(dept.id)}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {NEEDS_USER.includes(grantType) && (
          <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className={cn(triggerButtonClass, "h-9 min-w-0 text-sm")}>
                <span className="truncate">
                  {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : "Buscar usuario..."}
                </span>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar por nombre o usuario..." />
                <CommandList>
                  <CommandEmpty>Sin resultados.</CommandEmpty>
                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={`${user.first_name} ${user.last_name} ${user.username}`}
                        onSelect={() => {
                          setUserId(user.id);
                          setUserSearchOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 size-4", userId === user.id ? "opacity-100" : "opacity-0")} />
                        {user.first_name} {user.last_name} ({user.username})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        <ActionTriggerButton
          type="button"
          disabled={!canSubmit || createCalendarVisibilityRule.isPending}
          onClick={handleAdd}
          className="h-9 gap-1.5 sm:w-auto"
        >
          {createCalendarVisibilityRule.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Agregar
        </ActionTriggerButton>
      </div>

      <div className="flex flex-col gap-1.5">
        {isLoading ? (
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-2/3 rounded-lg" />
          </div>
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-slate-400/40 py-6 text-center dark:border-slate-600/40">
            <Users className="size-5 text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground">Sin reglas configuradas todavía.</p>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm",
                "bg-gradient-to-br from-background/70 to-background/40 backdrop-blur-md",
                rule.grant_type === "EXCLUDE_USER"
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-slate-400/40 dark:border-slate-600/40",
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                {rule.grant_type === "EXCLUDE_USER" && <UserX className="size-3.5 shrink-0 text-destructive" />}
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {GRANT_LABELS[rule.grant_type]}:
                </span>
                <span className="truncate">{describeRule(rule)}</span>
              </div>

              <TooltipProvider disableHoverableContent>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteCalendarVisibilityRule.mutate({ id: rule.id, company })}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Quitar regla</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
