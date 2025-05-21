import { useGetEmployeeById } from "@/hooks/administracion/useGetEmployeeById";
import { useState } from "react";
import LoadingPage from "../misc/LoadingPage";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Loader2 } from "lucide-react";

const ResponsibleResumeDialog = ({ id }: { id: string }) => {
  const { data: employee, isLoading } = useGetEmployeeById(id);
  const [openEmployee, setOpenEmployee] = useState(false);
  if (isLoading) {
    return <Loader2 className="animate-spin" />;
  }
  return (
    <Dialog open={openEmployee} onOpenChange={setOpenEmployee}>
      <DialogTrigger>
        {employee?.first_name} {employee?.last_name}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center font-bold">
          Resumen de Responsable
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Cliente
            </h3>
            <p className="text-lg font-semibold">
              {employee?.first_name}-{employee?.last_name}
            </p>
            <Separator />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Empresa
            </h3>
            <p className="text-lg font-semibold">{employee?.company}</p>
            <Separator />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Trabajo
            </h3>
            <p className="text-lg font-semibold">
              {employee?.job_title ? employee?.job_title.name : "N/A"}
            </p>
            <Separator />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Departamento
            </h3>
            <p className="text-lg font-semibold">
              {employee?.department ? employee.department.name : "N/A"}
            </p>
            <Separator />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Usuario
            </h3>
            <p className="text-lg font-semibold">{employee?.user?.username}</p>
            <Separator />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Dirección
            </h3>
            <p className="text-lg font-semibold">{employee?.location ? employee?.location.name : "N/A"}</p>
            <Separator />
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={() => setOpenEmployee(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResponsibleResumeDialog;
