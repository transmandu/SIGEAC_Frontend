'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetUserActivity } from "@/hooks/aerolinea/desarrollo/useGetUserActivities";
import { Eye, MessageSquare, MoreHorizontal, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "../../../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { useUpdateObservation } from "@/actions/aerolinea/desarrollo/reportes_diarios/actions";
import { useToast } from "../../../ui/use-toast";

interface ActivityReportsDropdownActionsProps {
  id: string;
  existingObservation?: string;
}

const ActivityReportsDropdownActions = ({ id, existingObservation }: ActivityReportsDropdownActionsProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const { data: report, isLoading: isReportLoading } = useGetUserActivity(id);
  const { updateObservation } = useUpdateObservation();

  const [observation, setObservation] = useState("");
  const [isObservationOpen, setIsObservationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasObservation, setHasObservation] = useState(!!existingObservation);

  useEffect(() => {
    setHasObservation(!!existingObservation);
  }, [existingObservation]);

  const handleUpdateObservation = async () => {
    setIsSubmitting(true);
    try {
      await updateObservation.mutateAsync({
        id: id.toString(),
        observation: observation.trim(),
      });

      toast({
        title: "Éxito",
        description: "Observación guardada correctamente",
      });

      setIsObservationOpen(false);
      setHasObservation(true);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la observación",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToDetail = () => {
    router.push(`/transmandu/desarrollo/actividades_diarias/${id}/`);
  };

  return (
    <>
      <Dialog open={isObservationOpen} onOpenChange={setIsObservationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hasObservation ? "Observación Existente" : "Agregar Observación"}
            </DialogTitle>
          </DialogHeader>
          {hasObservation ? (
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{existingObservation}</p>
            </div>
          ) : (
            <>
              <Input
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Escribe tu observación aquí..."
                disabled={isSubmitting}
              />
              <DialogFooter>
                <Button
                  onClick={handleUpdateObservation}
                  disabled={isSubmitting || !observation.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : 'Guardar'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger disabled={isReportLoading} asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56 px-2 py-1.5">
          <DropdownMenuItem
            onClick={navigateToDetail}
            className="cursor-pointer px-3 py-2 text-sm"
          >
            <Eye className="mr-3 h-5 w-5" />
            Ver detalle
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => !hasObservation && setIsObservationOpen(true)}
            className={`px-3 py-2 text-sm ${hasObservation ? 'text-gray-400 cursor-default' : 'cursor-pointer'}`}
            disabled={hasObservation}
          >
            {hasObservation ? (
              <Check className="mr-3 h-5 w-5 text-green-500" />
            ) : (
              <MessageSquare className="mr-3 h-5 w-5" />
            )}
            {hasObservation ? "Observación registrada" : "Agregar observación"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ActivityReportsDropdownActions;
