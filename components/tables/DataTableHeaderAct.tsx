"use client"

import type React from "react"
import type { Column } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowDownNarrowWide, ArrowUpIcon, EyeOff, Calendar } from "lucide-react"
import { parse, format, isValid } from "date-fns"
import { es } from "date-fns/locale/es"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input"
import { useState, useEffect } from "react"

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  filter?: boolean
  isDate?: boolean
}

export function DataTableColumnHeaderAct<TData, TValue>({
  column,
  filter,
  title,
  isDate = false,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    const [localFilterValue, setLocalFilterValue] = useState<string>("")

    // Initialize local filter value from column filter
    useEffect(() => {
      if (isDate && column.getFilterValue()) {
        // Convert yyyy-mm-dd to Spanish format for display
        try {
          const date = parse(column.getFilterValue() as string, "yyyy-MM-dd", new Date())
          if (isValid(date)) {
            setLocalFilterValue(format(date, "PPP", { locale: es }))
          } else {
            setLocalFilterValue(column.getFilterValue() as string)
          }
        } catch (error) {
          setLocalFilterValue(column.getFilterValue() as string)
        }
      } else {
        setLocalFilterValue((column.getFilterValue() as string) || "")
      }
    }, [column.getFilterValue(), isDate])
  
    // Handle filter input change
    const handleFilterChange = (value: string) => {
      // Always update the local display value
      setLocalFilterValue(value)
  
      if (isDate) {
        if (!value) {
          column.setFilterValue("")
          return
        }
  
        // Only try to parse as date if the input has enough characters to be a date
        // This prevents losing input while typing
        if (value.length >= 3) {
          try {
            // Try different date formats
            let parsedDate = null
            let isValidDate = false
  
            // Array of possible formats to try
            const formats = ["d 'de' MMMM 'de' yyyy", "d 'de' MMMM yyyy", "d MMM yyyy", "dd/MM/yyyy", "d/M/yyyy"]
  
            // Try each format
            for (const formatStr of formats) {
              try {
                parsedDate = parse(value, formatStr, new Date(), { locale: es })
                if (isValid(parsedDate)) {
                  isValidDate = true
                  break
                }
              } catch (e) {
                // Continue to next format
              }
            }
  
            if (isValidDate && parsedDate) {
              // Convert to yyyy-MM-dd for backend filtering
              const formattedDate = format(parsedDate, "yyyy-MM-dd")
              column.setFilterValue(formattedDate)
              return
            }
          } catch (error) {
            // If parsing fails, continue to use the raw input
          }
        }
  
        // If we couldn't parse as a date or the input is too short, use the raw input
        // This allows for partial text searching
        column.setFilterValue(value)
      } else {
        // For non-date columns, use the value as-is
        column.setFilterValue(value)
      }
    }
  
    if (!column.getCanSort()) {
      return <div className={cn(className)}>{title}</div>
    }
  
    return (
      <div className={cn("flex flex-col items-center justify-center", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
              <span>{title}</span>
              {column.getIsSorted() === "desc" ? (
                <ArrowDownIcon className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "asc" ? (
                <ArrowUpIcon className="ml-2 h-4 w-4" />
              ) : (
                <ArrowDownNarrowWide className="ml-2 h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Desc
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Ocultar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {filter && (
          <div className="relative w-[150px]">
            <Input
              placeholder={`Busq. - ${title.toLowerCase()}...`}
              value={localFilterValue}
              onChange={(event) => handleFilterChange(event.target.value)}
              className="h-7 mb-2 text-xs text-muted-foreground w-full pr-7"
            />
            {isDate && <Calendar className="absolute right-2 top-1.5 h-4 w-4 text-muted-foreground" />}
          </div>
        )}
      </div>
    )
  }
  