import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import CompanyInfoCard from "./CompanyInfoCard"
import PersonalInfoCard from "./PersonalInfoCard"
import UserRolesTab from "./UserRolesTab"
import { User } from "@/types"


const UserInfoTabs = ({user}: {
    user: User
}) => {
  return (
    <Tabs defaultValue="user_info" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-3 bg-primary/30">
        <TabsTrigger value="user_info">Información</TabsTrigger>
        <TabsTrigger value="company_info">Empresa</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
      </TabsList>
      <TabsContent value="user_info">
        <PersonalInfoCard user={user} />
      </TabsContent>
      <TabsContent value="company_info">
        <CompanyInfoCard user={user} />
      </TabsContent>
      <TabsContent value="roles">
        <UserRolesTab user={user} />
      </TabsContent>
    </Tabs>
  )
}

export default UserInfoTabs
