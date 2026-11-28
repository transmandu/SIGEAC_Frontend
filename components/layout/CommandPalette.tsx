"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { motion } from "motion/react";
import { Compass, CornerDownLeft, Search, SearchX } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  dialogPane,
  FormDialogHeader,
  fullScreenOnMobile,
} from "@/components/dialogs/shared/FormDialogContent";
import CreateErrorReportDialog from "@/components/dialogs/sistema/CreateErrorReportDialog";
import { SearchBarTitle } from "@/components/layout/SearchBarTitle";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { useSystemPaletteSections } from "@/hooks/helpers/use-system-palette-sections";
import { useMenuInputs } from "@/hooks/helpers/use-session-snapshot";
import { getMenuList, getQuickActionGroups } from "@/lib/menu-list";
import {
  buildPaletteSections,
  scoreEntry,
  treeShape,
  type PaletteEntry,
} from "@/lib/navigation-palette";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";

const noopSubscribe = () => () => {};

const OPEN_DIALOG_SELECTOR = '[role="dialog"][data-state="open"]';

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border bg-background px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}

function NoResults() {
  const search = useCommandState((state) => state.search);

  return (
    <div className="flex h-full min-h-60 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <span className="grid size-10 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <SearchX className="size-5" />
      </span>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
        No hay resultados para «{search.trim()}»
      </p>
      <p className="text-sm text-muted-foreground">
        Solo se muestran las pantallas a las que su perfil tiene acceso.
      </p>
    </div>
  );
}

function ResultCount() {
  const count = useCommandState((state) => state.filtered.count);

  return (
    <span className="ml-auto tabular-nums">
      {count} {count === 1 ? "resultado" : "resultados"}
    </span>
  );
}

const GROUP_CLASS =
  "p-0 **:[[cmdk-group-heading]]:border-b **:[[cmdk-group-heading]]:border-border/60 **:[[cmdk-group-heading]]:bg-muted/30 **:[[cmdk-group-heading]]:px-4 sm:**:[[cmdk-group-heading]]:px-6 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-[13px] **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:text-slate-600 dark:**:[[cmdk-group-heading]]:text-slate-300 **:[[cmdk-group-items]]:p-2";

const ITEM_CLASS =
  "group relative gap-3 rounded-lg px-3 py-2.5 max-sm:py-3 aria-selected:bg-primary/5 aria-selected:text-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary before:opacity-0 aria-selected:before:opacity-100";

/**
 * Geometría del árbol, en píxeles. Cada nivel se sangra `INDENT_PX`; la línea de
 * un nivel baja por el centro del icono de su padre (a 38 px del borde de la
 * lista en el primer nivel y 34 px más por cada nivel siguiente).
 */
const INDENT_PX = 36;
const ELBOW_BASE_PX = 16;

const lineLeft = (level: number, depth: number) =>
  38 + 34 * (level - 1) - 8 - INDENT_PX * depth;

function PaletteBody({
  onSelect,
  onReportProblem,
}: {
  onSelect: (entry: PaletteEntry) => void;
  onReportProblem: () => void;
}) {
  const pathname = usePathname();
  const { selectedCompany } = useCompanyStore();
  const { roles, tables: availableTables } = useMenuInputs(
    selectedCompany?.slug,
  );
  const systemSections = useSystemPaletteSections(onReportProblem);

  const sections = useMemo(() => {
    return buildPaletteSections(
      getMenuList(pathname ?? "", selectedCompany, roles, availableTables),
      getQuickActionGroups(selectedCompany, roles, availableTables),
      systemSections,
    );
  }, [roles, pathname, selectedCompany, availableTables, systemSections]);

  return (
    <Command
      loop
      filter={(_value, search, keywords) => scoreEntry(search, keywords ?? [])}
      className="min-h-0 flex-1 rounded-none bg-transparent"
    >
      <div className={cn(dialogPane, "shrink-0 border-b py-3")}>
        <div
          cmdk-input-wrapper=""
          className="flex h-10 items-center gap-2 rounded-lg border border-slate-400/60 bg-linear-to-br from-background/70 to-background/40 px-3 shadow-xs backdrop-blur-md transition-colors focus-within:border-blue-400/40 focus-within:ring-2 focus-within:ring-blue-500/15 dark:border-slate-600/60"
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <CommandPrimitive.Input
            placeholder="Buscar una pantalla o una acción…"
            className="h-full w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground max-sm:text-base"
          />
        </div>
      </div>

      <CommandList className="max-h-none min-h-0 flex-1 pb-2">
        <CommandEmpty>
          <NoResults />
        </CommandEmpty>

        {sections.map((section) => (
          <CommandGroup
            key={section.id}
            heading={section.heading}
            className={GROUP_CLASS}
          >
            {section.entries.map((entry, index) => {
              const Icon = entry.icon;
              const { depth, isFirst, isLast, continuing } = treeShape(
                section.entries,
                index,
              );

              return (
                <CommandItem
                  key={entry.id}
                  value={entry.id}
                  keywords={entry.keywords}
                  onSelect={() => onSelect(entry)}
                  style={
                    entry.action
                      ? { marginLeft: (entry.depth ?? 1) * INDENT_PX }
                      : undefined
                  }
                  className={cn(
                    ITEM_CLASS,
                    entry.action && "py-2 before:hidden",
                    entry.view && "aria-selected:bg-muted/70",
                  )}
                >
                  {entry.attached && (
                    <>
                      {continuing.map((level) => (
                        <span
                          key={level}
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 w-px bg-slate-300 dark:bg-slate-600"
                          style={{ left: lineLeft(level, depth) }}
                        />
                      ))}
                      <span
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute w-px bg-slate-300 dark:bg-slate-600",
                          entry.view
                            ? "group-aria-selected:bg-slate-500 dark:group-aria-selected:bg-slate-300"
                            : "group-aria-selected:bg-primary dark:group-aria-selected:bg-primary",
                          isLast ? "bottom-1/2" : "bottom-0",
                        )}
                        style={{
                          left: lineLeft(depth, depth),
                          top: isFirst ? -(depth === 1 ? 10 : 8) : 0,
                        }}
                      />
                      <span
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute top-1/2 h-px bg-slate-300 dark:bg-slate-600",
                          entry.view
                            ? "group-aria-selected:bg-slate-500 dark:group-aria-selected:bg-slate-300"
                            : "group-aria-selected:bg-primary dark:group-aria-selected:bg-primary",
                        )}
                        style={{
                          left: lineLeft(depth, depth),
                          width: ELBOW_BASE_PX + 2 * depth,
                        }}
                      />
                    </>
                  )}

                  <span
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-lg border transition-colors",
                      entry.action ? "size-8" : "size-9",
                      entry.action && !entry.view
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-transparent bg-slate-200/70 text-slate-600 dark:bg-muted/40 dark:text-muted-foreground group-aria-selected:border-border/60 group-aria-selected:bg-background/70 group-aria-selected:text-foreground",
                    )}
                  >
                    <Icon className={entry.action ? "size-4" : "size-4.5"} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {entry.label}
                    </span>
                    {entry.context && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {entry.action
                          ? `${entry.view ? "Vista" : "Acción"} · ${entry.context}`
                          : entry.context}
                      </span>
                    )}
                  </span>

                  <CornerDownLeft className="size-4 shrink-0 text-muted-foreground opacity-0 group-aria-selected:opacity-100 max-sm:hidden" />
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>

      <div
        className={cn(
          dialogPane,
          "flex shrink-0 items-center gap-4 border-t bg-linear-to-t from-slate-50 to-background py-2.5 text-xs text-muted-foreground max-sm:hidden dark:from-slate-900/40",
        )}
      >
        <span className="flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          Moverse
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Enter</Kbd>
          Abrir
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Esc</Kbd>
          Cerrar
        </span>
        <ResultCount />
      </div>
    </Command>
  );
}

export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const { title } = usePageTitle();
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const openReport = useCallback(() => setReportOpen(true), []);

  const isMac = useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/i.test(navigator.userAgent),
    () => false,
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !(event.ctrlKey || event.metaKey) ||
        event.key.toLowerCase() !== "k"
      ) {
        return;
      }

      event.preventDefault();
      if (event.repeat) return;

      setOpen((current) => {
        if (current) return false;
        // Sobre un formulario abierto se perdería lo escrito al navegar.
        return !document.querySelector(OPEN_DIALOG_SELECTOR);
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSelect = (entry: PaletteEntry) => {
    setOpen(false);

    if (entry.run) {
      entry.run();
      return;
    }

    if (entry.href && entry.href !== pathname) router.push(entry.href);
  };

  const shortcut = isMac ? "⌘ K" : "Ctrl K";

  return (
    <>
      {title && <h1 className="sr-only">{title}</h1>}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Catálogo de accesos rápidos"
        aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
        className={cn(
          "group relative hidden h-9 w-full min-w-0 items-center gap-2 rounded-lg border px-3 text-left @min-[11rem]:flex",
          "border-slate-400/60 bg-linear-to-br from-background/70 to-background/40 shadow-xs backdrop-blur-md dark:border-slate-600/60",
          "text-slate-700 dark:text-slate-200",
          "transition-all duration-200 active:scale-[0.99]",
          "hover:border-blue-400/30 hover:shadow-md hover:shadow-blue-500/10",
          open &&
            "border-blue-400/40 shadow-md shadow-blue-500/15 ring-2 ring-blue-500/15",
        )}
      >
        <Search className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />

        <SearchBarTitle />

        <kbd className="hidden shrink-0 rounded bg-slate-200/70 px-1 dark:bg-muted/60 py-px text-xs font-normal text-muted-foreground @min-[15rem]:inline-flex">
          {shortcut}
        </kbd>
      </button>

      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={120}>
          <TooltipTrigger asChild>
            <motion.button
              type="button"
              initial="rest"
              whileHover="hover"
              onClick={() => setOpen(true)}
              aria-label="Catálogo de accesos rápidos"
              aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
              className={cn(
                "glass-control",
                "relative flex items-center justify-center",
                "size-9 rounded-full",
                "border",
                "border-slate-400/60! hover:border-blue-400/30! dark:border-slate-600/60!",
                "text-foreground/90",
                "hover:text-foreground",
                "active:scale-95",
                "shrink-0 @min-[11rem]:hidden",
                open && "bg-muted/60",
              )}
            >
              <motion.span
                variants={{
                  rest: { scale: 1, rotate: 0 },
                  hover: { scale: 1.12, rotate: -8 },
                }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="flex"
              >
                <Search className="size-4" />
              </motion.span>
            </motion.button>
          </TooltipTrigger>

          <TooltipContent side="bottom">
            Catálogo de accesos rápidos{" "}
            <span className="ml-1 text-xs opacity-70">{shortcut}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            "flex flex-col gap-0 overflow-hidden p-0 sm:h-152 sm:max-h-[90vh] sm:max-w-2xl sm:rounded-xl",
            fullScreenOnMobile,
          )}
        >
          <FormDialogHeader
            icon={Compass}
            title="Catálogo de accesos rápidos"
            description="Pantallas, vistas y acciones disponibles para su perfil."
          />

          <PaletteBody onSelect={handleSelect} onReportProblem={openReport} />
        </DialogContent>
      </Dialog>

      <CreateErrorReportDialog open={reportOpen} onOpenChange={setReportOpen} />
    </>
  );
}
