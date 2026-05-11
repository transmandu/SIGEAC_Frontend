export type TransitStatus =
  | 'ALL'
  | 'TRANSIT'
  | 'RECEPTION'

export type WarehouseLocation = {
  id: number
  address: string
  cod_iata?: string | null
}

export type Warehouse = {
  id: number
  name: string
  location?: WarehouseLocation | null
}

export type Batch = {
  id: number
  name: string
  warehouse?: Warehouse | null
}

export type TransitArticle = {
  id: number
  part_number: string
  alternative_part_number?: string | null
  serial?: string | null
  ata_code?: string | null
  status: TransitStatus
  batch_id: string
  batch?: Batch | null
  reception_date?: string | null
  condition?: {
    id: number
    name: string
  } | null
  manufacturer?: {
    id: number
    name: string
  } | null
  quantity?: number | null
  unit?: string | null
  created_at?: string
  updated_at?: string
}

export type TransitStatusFilter =
  | 'ALL'
  | 'INCOMING'
  | TransitStatus

export type TransitSearchableFields =
  | keyof Pick<
      TransitArticle,
      | 'part_number'
      | 'alternative_part_number'
      | 'serial'
      | 'ata_code'
    >
  | 'batch_name'
  | 'location'

export type TransitFilterState = {
  status: TransitStatusFilter
  search: string
}