import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "../ui/badge"
import { EditUserDialog } from "../dialogs/ajustes/EditUserDialog"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { User } from "@/types"
import { useMyEmployee } from "@/hooks/sistema/usuario/useMyEmployee"

const UserInfoCard = ({ user }: { user: User }) => {

  const { data: employee } = useMyEmployee()

  const fullName = `${user.first_name} ${user.last_name}`

  return (
    <Card className="w-[380px]">
      <CardHeader>
        <div className="flex flex-col items-center justify-between gap-4">

          {/* AVATAR */}
          <Avatar className="w-[180px] h-[200px] overflow-hidden">
            <AvatarImage
              src={employee?.photo_url ? `${employee.photo_url}?size=360` : "/kanye.png"}
              className="w-full h-full object-cover"
              style={{
                transform: "translateZ(0)",
              }}
            />
          </Avatar>

          {/* INFO */}
          <div className="flex flex-col gap-2 items-center">
            <CardTitle className="text-4xl text-center">
              {fullName}
            </CardTitle>

            <CardDescription className="flex flex-wrap justify-center gap-2">
              {user.roles?.map((role, index) => (
                <Badge key={index} className="bg-black text-[10px]">
                  {role.name}
                </Badge>
              ))}
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