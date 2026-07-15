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

interface UserInfoTabsProps {
  user: User
  value?: string
  onValueChange?: (value: string) => void
}

const UserInfoTabs = ({ user, value, onValueChange }: UserInfoTabsProps) => {
  const isControlled = value !== undefined && onValueChange !== undefined

  return (
    <Tabs
      {...(isControlled ? { value, onValueChange } : { defaultValue: "user_info" })}
      className="w-[400px]"
    >
      <TabsList className="grid w-full grid-cols-3 bg-primary/30" data-tour="cuenta-tabs">
        <TabsTrigger value="user_info">Información</TabsTrigger>
        <TabsTrigger value="company_info">Empresa</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
      </TabsList>
      <TabsContent value="user_info" forceMount className="data-[state=inactive]:hidden">
        <PersonalInfoCard user={user} />
      </TabsContent>
      <TabsContent value="company_info" forceMount className="data-[state=inactive]:hidden">
        <CompanyInfoCard user={user} />
      </TabsContent>
      <TabsContent value="roles" forceMount className="data-[state=inactive]:hidden">
        <UserRolesTab user={user} />
      </TabsContent>
    </Tabs>
  )
}

export default UserInfoTabs
