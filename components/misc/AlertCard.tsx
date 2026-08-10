import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCheckIcon, CircleX, ClockArrowUp, FileWarning } from "lucide-react"

type NotificationProps = {
    title: string,
    description: string,
    status?: string,
}

const AlertCard = ({title, description, status}: NotificationProps) => {
  return (
    <Alert className="dark:bg-slate-700" variant={status === 'error' ? 'destructive' : status === 'warning' ? 'warning' : status === 'success' ? "success" : status === 'inProgress' ? "inProgress" : 'default'}>
      {
        status === 'success' && <CheckCheckIcon className="size-4 text-green-500"/> 
      }
      {
        status === 'warning' && <FileWarning className="size-4 text-yellow-400"/>
      }
      {
        status === 'error' && <CircleX className="size-4 text-red-500"/>
      }
      {
        status === 'inProgress' && <ClockArrowUp className="size-4"/>
      }
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {description}
      </AlertDescription>
    </Alert>
  )
}

export default AlertCard