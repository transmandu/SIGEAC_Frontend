import type { Condition, Manufacturer } from '@/types';

export type TransitStatus = 'ALL' | 'TRANSIT' | 'RECEPTION';

export interface WarehouseLocation {
  id: number;
  address?: string | null;
  cod_iata?: string | null;
}

export interface TransitArticle {
  id: number;
  part_number: string;
  alternative_part_number?: string | null;
  serial?: string | null;
  ata_code?: string | null;
  status: TransitStatus;
  batch_id: string;
  batch?: {
    id: number;
    name: string;
    warehouse?: {
      id: number;
      name: string;
      location?: WarehouseLocation | null;
    } | null;
  } | null;
  reception_date?: string | null;
  condition?: Condition | null;
  manufacturer?: Manufacturer | null;
  quantity?: number | null;
  unit?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type TransitStatusFilter = 'ALL' | 'INCOMING' | TransitStatus;

export type TransitSearchableFields =
  | keyof Pick<
      TransitArticle,
      'part_number' | 'alternative_part_number' | 'serial' | 'ata_code'
    >
  | 'batch_name'
  | 'location';

export interface TransitFilterState {
  status: TransitStatusFilter;
  search: string;
}