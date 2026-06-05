'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, SlidersHorizontal } from 'lucide-react';

type Props = {
  search: string;
  setSearch: (value: string) => void;

  filter: 'ALL' | 'READ' | 'UNREAD';
  setFilter: (value: 'ALL' | 'READ' | 'UNREAD') => void;

  placeholder?: string;
};

const selectTriggerClass = `
h-8 w-[130px] pl-8 text-xs bg-white/80 dark:bg-slate-900/60 
border-slate-200/60 dark:border-slate-700/60 
transition-colors focus:ring-1 focus:ring-blue-500/40
data-[placeholder]:text-muted-foreground
`;

const selectContentClass = `
border-slate-200/60 dark:border-slate-700/60
`;

const FilterSelects = ({
  filter,
  setFilter,
}: {
  filter: 'ALL' | 'READ' | 'UNREAD';
  setFilter: (value: 'ALL' | 'READ' | 'UNREAD') => void;
}) => (
  <>
    {/* READ FILTER */}
    <div className="relative">
      <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 z-10 size-3.5 text-muted-foreground" />

      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className={selectTriggerClass}>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>

        <SelectContent className={selectContentClass}>
          <SelectItem value="ALL">Todas</SelectItem>
          <SelectItem value="READ">Leídas</SelectItem>
          <SelectItem value="UNREAD">No leídas</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </>
);

const NotificationsToolBar = ({
  search,
  setSearch,
  filter,
  setFilter,
  placeholder = 'Buscar notificaciones...',
}: Props) => {
  return (
    <div className="flex items-center gap-2 w-full">

      {/* SEARCH */}
      <div className="relative flex-1 sm:flex-none sm:w-72">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="pl-8 h-8 text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 focus-visible:ring-1 focus-visible:ring-blue-500/40"
        />
      </div>

      {/* MOBILE FILTERS */}
      <div className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60"
            >
              <SlidersHorizontal className="size-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="w-72 p-3 space-y-3 border-slate-200/60 dark:border-slate-700/60"
          >
            <FilterSelects
              filter={filter}
              setFilter={setFilter}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* DESKTOP FILTERS */}
      <div className="hidden sm:flex items-center gap-2">
        <FilterSelects
          filter={filter}
          setFilter={setFilter}
        />
      </div>

    </div>
  );
};

export default NotificationsToolBar;