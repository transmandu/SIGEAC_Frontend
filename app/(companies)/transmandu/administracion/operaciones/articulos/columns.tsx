"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { AdministrationArticle } from "@/types";
import AdministrationArticleDropdownActions from "@/components/misc/AdministrationArticleDropdownActions";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<AdministrationArticle>[] = [
  {
    accessorKey: "serial",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Serial" />
    ),
    meta: { title: "Serial" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.serial}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.name}{" "}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Estado" />
    ),
    meta: { title: "Estado" },
    cell: ({ row }) => {
    let backgroundColor = "";
    switch (row.original.status.toLowerCase()) {
      case "rentado":
        backgroundColor = "bg-yellow-500 hover:bg-yellow-500";
        break;
      case "en posesion":
        backgroundColor = "bg-green-700 hover:bg-green-700";
        break;
      case "vendido":
        backgroundColor = "bg-red-700 hover:bg-red-700";
        break;
    }

    return (
      <div className="flex justify-center">
        <Badge className={`text-white ${backgroundColor}`}>
          {row.original.status}
        </Badge>
      </div>
    );
  },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Precio" />
    ),
    meta: { title: "Precio" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.price} $
        </span>
      </div>
    ),
  },
  {
    accessorKey: "brand",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Marca" />
    ),
    meta: { title: "Marca" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.brand}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Tipo" />
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.type}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id.toString();
      return (
        <AdministrationArticleDropdownActions id={id} />
      );
    },
  },
];
