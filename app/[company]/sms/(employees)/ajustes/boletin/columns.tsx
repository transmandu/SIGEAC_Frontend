"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import { dateFormat } from "@/lib/utils";
import { SafetyBulletin } from "@/types";
import DocumentDisplayDialog from "@/components/dialogs/aerolinea/sms/DocumentDisplayDialog";
import { Button } from "@/components/ui/button";
import SafetyBulletinDropdownActions from "@/components/dropdowns/aerolinea/sms/SafetyBulletinDropDownActions";

export const columns: ColumnDef<SafetyBulletin>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Titulo" />
    ),
    meta: { title: "Titulo" },
    cell: ({ row }) => {
      return <p className="font-medium text-center">{row.original.title}</p>;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Fecha" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">
          {row.original.date ? dateFormat(row.original.date, "PPP") : "N/A"}
        </p>
      );
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      return (
        <p className="text-xs sm:text-sm line-clamp-4 text-center">
          {row.original.description ?? "N/A"}
        </p>
      );
    },
  },
  {
    accessorKey: "document",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Documento" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center items-center">
          {row.original?.document &&
          typeof row.original?.document === "string" ? (
            <DocumentDisplayDialog
              fileName={row.original.document}
              isPublic={true}
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="hidden h-8 lg:flex"
              disabled={true}
            >
              Sin documento
            </Button>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const SafetyBulletin = row.original;
      return <SafetyBulletinDropdownActions safetyBulletin={SafetyBulletin} />;
    },
  },
];
