import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
  
const TestSales = () => {
  return (
    <Card className="p-[18px]">
        <CardHeader>
            <CardTitle>Últimas ventas</CardTitle>
            <CardDescription>Se han hecho 94 ventas este mes.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="p-2 flex flex-col gap-4">
                <div className="w-full flex justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar><AvatarFallback>AA</AvatarFallback></Avatar>
                        <div className="flex flex-col justify-center">
                            <p className="text-sm font-medium">Angel Anton</p>
                            <p className="text-xs text-muted-foreground">test@example.com</p>
                        </div>
                    </div>
                    <p className="font-bold text-xl">+$1,952.32</p>
                </div>
                <div className="w-full flex justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar><AvatarFallback>OB</AvatarFallback></Avatar>
                        <div className="flex flex-col justify-center">
                            <p className="text-sm font-medium">Osmary Barriga</p>
                            <p className="text-xs text-muted-foreground">test@example.com</p>
                        </div>
                    </div>
                    <p className="font-bold text-xl">+$1,952.32</p>
                </div>
                <div className="w-full flex justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar><AvatarFallback>AM</AvatarFallback></Avatar>
                        <div className="flex flex-col justify-center">
                            <p className="text-sm font-medium">Alexis Mata</p>
                            <p className="text-xs text-muted-foreground">test@example.com</p>
                        </div>
                    </div>
                    <p className="font-bold text-xl">+$1,952.32</p>
                </div>
                <div className="w-full flex justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar><AvatarFallback>JA</AvatarFallback></Avatar>
                        <div className="flex flex-col justify-center">
                            <p className="text-sm font-medium">Joel Abreu</p>
                            <p className="text-xs text-muted-foreground">test@example.com</p>
                        </div>
                    </div>
                    <p className="font-bold text-xl">+$1,952.32</p>
                </div>
                <div className="w-full flex justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar><AvatarFallback>HG</AvatarFallback></Avatar>
                        <div className="flex flex-col justify-center">
                            <p className="text-sm font-medium">Henry Gúzman</p>
                            <p className="text-xs text-muted-foreground">test@example.com</p>
                        </div>
                    </div>
                    <p className="font-bold text-xl">+$1,952.32</p>
                </div>
            </div>
        </CardContent>
    </Card>

  )
}

export default TestSales