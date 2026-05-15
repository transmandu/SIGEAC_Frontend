'use client'

import { useMemo, useState, useEffect } from 'react'

import GroupRow from './GroupRow'
import GroupPagination from '../../../../../components/misc/GroupPagination'

type GroupableKey =
  | 'vendor'
  | 'requisition_order'

type Props<T> = {
  data: T[]
  groupBy: GroupableKey
  renderTable: (rows: T[]) => React.ReactNode
}

type Group<T> = {
  key: string
  rows: T[]
}

const PAGE_SIZE = 15

const formatGroupLabel = (value?: string | null) => {
  if (!value || value.trim() === '') return 'Sin valor'
  return value
}

const GroupedQuotesTable = <T extends Record<string, any>>({
  data,
  groupBy,
  renderTable,
}: Props<T>) => {

  const groups = useMemo<Group<T>[]>(() => {
    const groupedMap = new Map<string, T[]>()

    for (const item of data) {

      const rawValue: string | undefined =
        groupBy === 'vendor'
          ? item.vendor?.name
          : item.requisition_order?.order_number

      const key = rawValue?.trim() || 'Sin valor'

      if (!groupedMap.has(key)) {
        groupedMap.set(key, [])
      }

      groupedMap.get(key)!.push(item)
    }

    return Array.from(groupedMap.entries()).map(([key, rows]) => ({
      key,
      rows,
    }))
  }, [data, groupBy])

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(groups.length / pagination.pageSize))
  }, [groups.length, pagination.pageSize])

  const paginatedGroups = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize

    return groups.slice(
      start,
      start + pagination.pageSize
    )
  }, [groups, pagination])

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleGroup = (key: string) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? false),
    }))
  }

  useEffect(() => {
    setPagination({
      pageIndex: 0,
      pageSize: PAGE_SIZE,
    })

    setExpanded({})
  }, [groupBy, data])

  if (!groups.length) {
    return (
      <div
        className="
          rounded-xl border
          bg-white dark:bg-slate-900/60
          border-slate-200 dark:border-slate-700/60
          px-6 py-10
          text-center
        "
      >
        <p className="text-sm text-muted-foreground">
          No hay cotizaciones agrupadas disponibles.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      {/* GROUPS */}
      {paginatedGroups.map((group) => {
        const isOpen = expanded[group.key] ?? false

        return (
          <div
            key={group.key}
            className="
              overflow-hidden
              rounded-2xl border
              border-slate-200/80
              dark:border-slate-700/60
              bg-white/90
              dark:bg-slate-900/60
              backdrop-blur-md
              shadow-sm
              dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]
            "
          >
            <GroupRow
              title={formatGroupLabel(group.key)}
              count={group.rows.length}
              expanded={isOpen}
              onToggle={() => toggleGroup(group.key)}
            />

            {isOpen && (
              <div className="p-2 md:p-3">
                {renderTable(group.rows)}
              </div>
            )}
          </div>
        )
      })}

      <GroupPagination
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        pageCount={totalPages}
        totalGroups={groups.length}
        onPageChange={(page: number) =>
          setPagination((prev) => ({
            ...prev,
            pageIndex: page,
          }))
        }
        onPageSizeChange={(size: number) =>
          setPagination({
            pageIndex: 0,
            pageSize: size,
          })
        }
      />

    </div>
  )
}

export default GroupedQuotesTable