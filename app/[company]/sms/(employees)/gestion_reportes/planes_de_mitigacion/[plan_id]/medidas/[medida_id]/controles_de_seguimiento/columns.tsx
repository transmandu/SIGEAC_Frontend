"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import DocumentDisplayDialog from "@/components/dialogs/aerolinea/sms/DocumentDisplayDialog";
import ImageDisplayDialog from "@/components/dialogs/aerolinea/sms/ImageDisplayDialog";
import FollowUpControlDropdownActions from "@/components/dropdowns/aerolinea/sms/FollowUpControlDropdownActions";
import { Button } from "@/components/ui/button";
import { FollowUpControl } from "@/types";
import { es } from "date-fns/locale";
import { format, parseISO } from "date-fns";

export const columns: ColumnDef<FollowUpControl>[] = [
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Observacion" />
    ),
    meta: { title: "Control de Segumiento" },
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">{row.original.description}</div>
      );
    },
  },
    {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Fecha del Control" />
    ),
    meta: { title: "Fecha de Control" },
    cell: ({ row }) => {
      const rawDate = row.original.date;

      if (!rawDate) return <p className="text-center">-</p>;

      const dateString = String(rawDate as unknown);

      const parsedDate = parseISO(dateString);

      const year = parsedDate.getUTCFullYear();
      const month = parsedDate.getUTCMonth();
      const day = parsedDate.getUTCDate();

      const normalizedDate = new Date(year, month, day);

      return (
        <p className="font-medium text-center">
          {format(normalizedDate, "PPP", {
            locale: es,
          })}
        </p>
      );
    },
  },
  {
    accessorKey: "implementation_responsible",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Resp. de Implantación" />
    ),
    meta: { title: "Resp. de Implantación" },
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.implementation_responsible || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "follow_up_responsible",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Resp. de Seguimiento" />
    ),
    meta: { title: "Resp. de Seguimiento" },
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.follow_up_responsible || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "document",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Documento" />
    ),
    meta: { title: "Documento" },
    cell: ({ row }) => {
      return (
        <div className="flex justify-center items-center">
          {row.original?.document &&
          (typeof row.original?.document === "string") ? (
            <DocumentDisplayDialog fileName={row.original.document} />
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
    accessorKey: "images",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Imágenes" />
    ),
    meta: { title: "Imágenes" },
    cell: ({ row }) => {
      const images = [
        ...(row.original?.images ?? []),
        ...(row.original?.images?.length
          ? []
          : row.original?.image
            ? [row.original.image]
            : []),
      ];

      return (
        <div className="flex justify-center items-center flex-wrap gap-1">
          {images.length > 0 ? (
            images.map((fileName, index) => (
              <ImageDisplayDialog
                key={`${fileName}-${index}`}
                fileName={fileName}
                triggerText={images.length > 1 ? `Imagen ${index + 1}` : "Imagen"}
              />
            ))
          ) : (
            <Button
              variant="outline"
              size="sm"
              className=" hidden h-8 lg:flex"
              disabled={true}
            >
              Sin imagen
            </Button>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const FollowUpControl = row.original;
      return (
        <FollowUpControlDropdownActions followUpControl={FollowUpControl} />
      );
    },
  },
];
