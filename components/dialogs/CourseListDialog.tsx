"use client";

import Loading from "@/app/[company]/loading";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetCoursesByStatusDateRange } from "@/hooks/curso/useGetCoursesByStatusDateRange";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { useEffect } from "react";

interface FormProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export default function CourseListDialog({
  title,
  open,
  onOpenChange,
}: FormProps) {
  const searchParams = useSearchParams();
  const { selectedCompany, selectedStation } = useCompanyStore();
  const router = useRouter();
  //const searchStatus = searchParams.get("searchStatus");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const {
    data: charData,
    isLoading: isLoadingCharData,
    isError: isErrorCharData,
    refetch: refetchCharData,
  } = useGetCoursesByStatusDateRange({
    from,
    to,
    status: "ABIERTO",
    company: selectedCompany?.slug,
    location_id: selectedStation!,
  });

  useEffect(() => {
    refetchCharData();
  }, [from, to]);

  console.log("from", from, "to", to);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-w-2xl m-2">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Lista de cursos {from && to ? `entre ${from} y ${to}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
          {isLoadingCharData ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="size-24 animate-spin" />
            </div>
          ) : isErrorCharData ? (
            <p className="text-sm text-muted-foreground">
              Ha ocurrido un error al cargar los datos de los cursos...
            </p>
          ) : charData && charData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Curso</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charData.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          router.push(
                            `/${selectedCompany?.slug}/general/cursos/${course.id}`
                          );
                        }}
                        size="sm"
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No se encontraron cursos para los filtros seleccionados.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
