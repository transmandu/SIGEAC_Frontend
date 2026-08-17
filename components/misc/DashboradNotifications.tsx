import { notifications } from "@/lib/notification-list";
import { toast } from "sonner";
import AlertCard from "@/components/misc/AlertCard";
import { Button } from "@/components/ui/button";

const DashboardNotifications = () => {

  const handleToast = () => {
    toast("¡Aviso!", {
      description: "Revisar almacén: Ctnd. STOCK - TORNILLOS",
      // sonner cierra el toast al pulsar la acción; no hace falta handler.
      action: {
        label: "Cerrar",
        onClick: () => {},
      },
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {
        notifications.map((notification, index) => (
          <AlertCard key={index} title={notification.title} description={notification.description} status={notification.status} />
        ))
      }
      <Button className="w-[250px] text-white bg-black hover:bg-slate-700" onClick={handleToast}>Mostrar Notificacion</Button>
    </div>
  )
}

export default DashboardNotifications
