export type QuarantineRecord = {
  id: number
  article_id: string
  reason: string
  quarantine_entry_date: string // "YYYY-MM-DD"
  quarantine_exit_date: string | null
  inspector: string
}

export type QuarantineArticle = {
  id: number
  ata_code: string | null
  batch_id: string
  part_number: string
  serial: string
  alternative_part_number: string[] | null
  status: string
  batch?: { id: number; name: string } | null
  quarantine: QuarantineRecord[]
}
