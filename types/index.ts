
export type Role = {
  id: number;
  name: string;
  companyId: number;
  permissions: Permission[];
  company: {
    id: number;
    name: string;
    description: string;
  }[];
};

export type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  isActive: boolean;
  roles?: {
    id: number;
    name: string;
    permissions: Permission[];
  }[];
  permissions: Permission[];
  companies: Company[];
};

export type Permission = {
  id: number;
  name: string;
  label: string;
  modules: {
    id: number;
    name: string;
    description: string;
    registered_by: string;
    company_id: string;
    pivot: {
      permission_id: string;
      module_id: string;
    };
    company: {
      id: number;
      name: string;
      description: string;
    };
  }[];
};

export type Module = {
  id: number;
  name: string;
  description: string;
  company_id: string;
};

export type Condition = {
  id: number;
  name: string;
  description: string;
  registered_by: string;
  updated_by: string;
};

export type Company = {
  id: number;
  name: string;
  description: string;
  rif: string;
  cod_inac: string;
  fiscal_address: string;
  created_at: string;
  updated_at: string;
};

export type Location = {
  id: number;
  address: string;
  type: string;
  isMainBase: boolean;
  cod_iata: string;
  companies: Company[];
};

export type Warehouse = {
    id: string,
    name: string,
    location: {
      address: string,
      type: string,
    },
    company: string,
    type: string,
}

export type Batch = {
  id: number,
  name: string,
  slug: string,
  description: string,
  category: string,
  ata_code: string,
  brand:string,
  is_hazarous: boolean,
  medition_unit: string,
  min_quantity: number,
  zone: string,
  warehouse_id: number,
  warehouse_name: string,
}

export type Article = {
  id?: number,
  article_type?: string,
  part_number: string,
  alternative_part_number?: string,
  status?: string,
  serial?: string,
  description?: string,
  zone?: string,
  manufacturer?: Manufacturer,
  condition?: Condition,
  condition_id?: string,
  weight?: number,
  cost?: number,
  unit?: string,
  quantity?: number,
  batches?: Batch,
  batch_id?: number,
  vendor_id?: string,
  certifcate_8130?: File|string,
  certifcate_vendor?: File|string,
  certifcate_fabricant?: File|string,
  image?:File| string,
}

export interface ConsumableArticle extends Article {
  is_managed?: boolean;
  quantity?: number;
  caducate_date?: string;
  fabrication_date?: string;
}

export interface ComponentArticle extends Article {
  caducate_date?: string;
  fabrication_date?: string;
  hour_date?: number;
  cycle_date?: number;
  calendar_date?: string;
  component_id?: number;
}

export interface ToolArticle extends Article {
  is_special: boolean;
}

export type Request = {
  id: number,
  request_number: string,
  justification: string,
  submission_date: string,
  work_order?: WorkOrder,
  requisition_order?: string,
  article?: Article,
  requested_by: string,
  created_by: string,
}

export type Department = {
  id: number;
  name: string;
  email: string;
};

export type MaintenanceClient = {
  id: number
  name: string,
  email: string,
  address: string,
  phone_number: string,
}

export type JobTitle = {
  id: number;
  name: string;
  description: string;
  department: Department;
};

export type MaintenanceAircraft = {
  id: number,
  client: MaintenanceClient,
  manufacturer: Manufacturer,
  serial: string,
  acronym: string,
  flight_hours: number,
  flight_cycles: number,
  fabricant_date: string,
  aircraft_parts: MaintenanceAircraftPart[],
  location: Location,
  comments: string,
}

export type MaintenanceAircraftPart = {
  part_number: string,
  part_name: string,
  condition_type: string,
  part_hours: number,
  part_cycles: number,
  sub_parts: MaintenanceAircraftPart[],
  aircraft: MaintenanceAircraft,
}

export type FlightControl = {
  flight_number: string,
  aircraft_operator: string,
  origin: string,
  destination: string,
  flight_date: string,
  flight_hours: number,
  flight_cycles: number,
  aircraft: MaintenanceAircraft,
}

export type MaintenanceService = {
  id: number
  origin_manual: string,
  name: string,
  description: string,
  manufacturer: Manufacturer,
  type: "AIRCRAFT" | "PART",
  tasks: ServiceTask[],
}

export type ServiceTask = {
  id: number,
  description: string,
  service: MaintenanceService,
  task_items: {
    id: number
    article_part_number: string,
    article_alt_part_number?: string,
    article_serial: string,
  }[]
}

export type Employee = {
  id: number,
  first_name: string,
  last_name: string,
  company: string,
  dni: string,
  job_title: JobTitle,
  department: Department,
  user?: User,
  location: Location,
}

export type WorkOrderTask = {
  id: number,
  description_task: string,
  status: string,
  technician_responsable?: string,
  inspector_responsable?: string,
  ata: string,
  task_number: string,
  origin_manual: string,
  old_technician?: string[],
  task_items: {
    article_serial: string,
    article_part_number: string,
    article_alt_part_number: string,
  }[],
  non_routine?: {
    id: number,
    ata: string,
    description: string,
    status: string,
    action?: string,
    needs_task: boolean,
    work_order_task: Omit<WorkOrderTask, "non_routine">
    no_routine_task?: Omit<WorkOrderTask, "non_routine">[]
  }
}

export interface WorkOrder extends Request {
  order_number: string
  client: MaintenanceClient,
  aircraft: MaintenanceAircraft,
  status: string,
  date: string,
  description: string,
  elaborated_by: string,
  reviewed_by: string,
  approved_by: string,
  work_order_tasks: WorkOrderTask[]
}

export interface DispatchRequest extends Request {
  part_number: string,
  destination_place: string,
  batch: {
    id: string,
    name: string,
    category: string,
    article_count: number,
    min_quantity: number,
    articles: {
      article_id: string,
      serial: string,
      part_number: string,
      quantity: string,
      unit: Convertion[],
    }[]
  },
  category: string,
}

export type Unit = {
  id: number;
  value: string;
  label: string;
  updated_by: string;
  registered_by: string;
  created_at: Date;
  updated_at: Date;
};

export type Convertion = {
  id: number,
  secondary_unit: string,
  convertion_rate: number,
  unit: Unit,
  quantity_unit: number,
  updated_by: string,
  registered_by: string,
  created_at: Date,
  updated_at: Date,
}

export type ToolBox = {
  id: number;
  name: string;
  created_by: string;
  delivered_by: string;
  employee: Employee;
  tool: {
    serial: string;
    article: ToolArticle;
  }[];
};

export type Manufacturer = {
  id: number,
  name: string,
  type: "AIRCRAFT" | "PART",
  description: string,
}

export type Requisition = {
  id: number,
  order_number: string,
  status: string,
  created_by: User,
  type: string,
  image?: string,
  requested_by: string,
  batch: {
    name: string,
    batch_articles: {
      article_part_number: string,
      quantity: number,
      unit?: Convertion,
      image: string,
    }[]
  }[],
  received_by: string,
  justification: string,
  arrival_date: Date,
  submission_date: Date,
  work_order: WorkOrder,
  aircraft: MaintenanceAircraft,
}

export type Vendor = {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: Date;
  updated_at: Date;
};

export type Quote = {
  id: number;
  quote_number: string;
  justification: string;
  article_quote_order: {
    batch: {
      name: string,
    },
    article_part_number: string,
    quantity: number,
    unit_price: string,
    unit?: Convertion,
    image: string,
  }[],
  sub_total: number,
  total: number,
  vendor: Vendor,
  requisition_order: Requisition,
  quote_date: Date,
  created_by: string,
  status: string,
}

export type PurchaseOrder = {
  id: number;
  order_number: string;
  justification: string;
  article_purchase_order: {
    batch?: {
      name: string,
    }
    id: number,
    article_part_number: string,
    quantity: number,
    unit_price: string,
    article_tax: number,
    usa_tracking: string,
    ock_tracking: string,
    article_location: string,
  }[],
  status: string,
  purchase_date: Date,
  tax: number,
  wire_fee: number,
  card?: Card,
  bank_account?: BankAccount,
  handling_fee: number,
  shipping_fee: number,
  ock_shipping: number,
  usa_shipping: number,
  sub_total: number,
  total: number,
  vendor: Vendor,
  requisition_order: Requisition,
  quote_order: Quote,
  location: Location,
  created_by: string,
  company: string,
}


export type Bank = {
  id: number,
  name: string,
  type: string,
  created_by: string,
  updated_by: string,
}

export type BankAccount = {
  id: number,
  name: string,
  account_number: string,
  account_type: string,
  account_owner: string,
  bank: Bank,
  cards: Card[],
  company: Company,
  created_by: string,
  updated_by: string,
}

export type Card = {
  id: number,
  name: string,
  card_number: string,
  type: string,
  bank_account: BankAccount,
  created_by: string,
  updated_by: string,
}

export type GeneralSalesReport = {
  requisition_order: Requisition,
  purchase_order?: PurchaseOrder,
  quote_order?: Quote[],
}[]

export type ActivityReport = {
  id: number,
  date: string,
  user: User,
  activities: Activity[],
  observation?: string,
}

export type Activity = {
  id: number,
  start_hour: string,
  final_hour: string,
  description: string,
  result?: string,
}

export type Pilot = {
  id: number;
  dni: string;
  first_name: string;
  last_name: string;
  license_number: string;
  phone: string;
  email: string;
};

export type InformationSource = {
  id: string;
  name: string;
  type: "PROACTIVO" | "REACTIVO" | "PREDICTIVO";
};

export type ObligatoryReport = {
  id: number;
  report_number: string;
  incident_location: string;
  description: string;
  report_date: Date;
  incident_date: Date;
  incident_time: Date;
  flight_time: Date;
  pilot_id: number;
  copilot_id: number;
  pilot: Pilot;
  copilot: Pilot;
  aircraft_acronym: string;
  aircraft_model: string;
  flight_number: string;
  flight_origin: string;
  flight_destiny: string;
  flight_alt_destiny: string;
  incidents: string;
  other_incidents: string;
  status: string;
  danger_identification_id: number;
  image?:File | string,
  document?: File | string;
};

export type VoluntaryReport = {
  id: number;
  report_number: string;
  report_date: Date;
  identification_date: Date;
  danger_location: string;
  danger_area: string;
  description: string;
  airport_location: string;
  possible_consequences: string;
  danger_identification_id: number;
  danger_identification: DangerIdentification; //TENER EN CUENTA QUE CREO QUE HAY  QUE AGREGARLO AL ROS, O ELIMIANR ESTE QUE NO CREO PERO BUENO GGs
  status: string;
  reporter_name?: string;
  reporter_last_name?: string;
  reporter_phone?: string;
  reporter_email?: string;
  image?:File | string,
  document?: File | string;
};

export type DangerIdentification = {
  id: number;
  danger: string;
  current_defenses: string;
  danger_area: string;
  danger_type: string;
  description: string;
  possible_consequences: string;
  consequence_to_evaluate: string;
  root_cause_analysis: string;
  information_source: InformationSource;
  risk_management_start_date: Date;
  analysis: Analysis;
  voluntary_report: VoluntaryReport;
  obligatory_report: ObligatoryReport;
};

export type FollowUpControl = {
  id: number;
  date: Date;
  description: string;
  mitigation_measure_id: number;
};

export type MitigationMeasure = {
  id: number;
  description: string;
  implementation_supervisor: string;
  implementation_responsible: string;
  estimated_date: Date;
  execution_date: Date;
  mitigation_plan_id: number;
  follow_up_control: FollowUpControl[];
};

export type MitigationPlan = {
  id: number;
  description: string;
  responsible: string;
  start_date: Date;
  measures: MitigationMeasure[];
  analysis: Analysis;
};

export type Analysis = {
  id: number;
  probability: string;
  severity: string;
  result: string;
};

export type MitigationTable = {
  id: number;
  danger: string;
  current_defenses: string;
  risk_management_start_date: Date;
  danger_location: string;
  danger_area: string;
  description: string;
  possible_consequences: string;
  consequence_to_evaluate: string;
  danger_type: string;
  root_cause_analysis: string;
  information_source_id: number;
  information_source: InformationSource;
  analysis: Analysis;
  mitigation_plan: MitigationPlan | null;
  obligatory_report: ObligatoryReport;
  voluntary_report: VoluntaryReport;
};

export type ReportsByArea = {
  name: string;
  reports_number: string;
};

export type DangerIdentificationsByType = {
  name: string;
  identifications_number: string;
};

export type ReportingStats = {
  total_reports: number;
  open_reports: number;
  closed_reports: number;
};

export type pieChartData = {
  name: string;
  value: number;
};

export type Areas = {
  id: number;
  name: string;
};

export type StatsByMonth = {
  average_per_month: number;
  months: number;
  result: number;
  percentage_change: number;
  from: string;
  to: string;
};

export type AverageReportsResponse = {
  oldest_range: StatsByMonth;
  newest_range: StatsByMonth;
};

export type DangerIdentificationWithAll = {
  id: number;
  description: string;
  measures: MitigationMeasure[];
  analysis: Analysis;
};
