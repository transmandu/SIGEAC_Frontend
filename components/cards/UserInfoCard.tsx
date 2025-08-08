import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Trash2, UserPen } from "lucide-react"
import Image from "next/image"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { User } from "@/types"
import { EditUserDialog } from "../dialogs/ajustes/EditUserDialog"

const UserInfoCard = ({ user }: {
  user: User
}) => {
  return (
    <Card className="w-[380px]">
      <CardHeader>
        <div className="flex flex-col items-center justify-between">
          <Image className="rounded-full" alt="profile picture" src={'/kanye.png'} width={250} height={250} />
          <div className="flex flex-col gap-2 items-center">
            <CardTitle className="text-4xl">{user.first_name} {user.last_name}</CardTitle>
            <CardDescription>
              {
                user.roles?.map((role, index) => (
                  <Badge key={index} className="bg-black text-[10px]">{role.name}</Badge>
                ))
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardFooter className="flex justify-center items-center gap-4">
        <EditUserDialog user={user} />
      </CardFooter>
    </Card>

  )
}

export default UserInfoCard
