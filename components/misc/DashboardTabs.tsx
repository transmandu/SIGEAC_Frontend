import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs"
import OverviewTab from "@/components/tabs/dashboardTabs/OverviewTab"

const DashboardTabs = () => {
  return (
    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList className="h-12">
        <TabsTrigger value="overview" className="text-base">Overview</TabsTrigger>
        <TabsTrigger value="analytics" className="text-base">Analiticas</TabsTrigger>
        <TabsTrigger value="reports" className="text-base">Reportes</TabsTrigger>
        <TabsTrigger value="notifications" className="text-base">Notificaciones</TabsTrigger>
      </TabsList>
      <TabsContent value="overview"><OverviewTab/></TabsContent>
      <TabsContent value="analytics"><OverviewTab/></TabsContent>
    </Tabs>

  )
}

export default DashboardTabs
