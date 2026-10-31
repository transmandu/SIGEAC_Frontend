import type { User } from "@/types";

export interface AdministrationDashboardContentProps {
  companySlug: string;
  location_id: string;
  user: User;
  roleNames: string[];
}
