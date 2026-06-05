export type Notification = {
  id: string;
  type: string;
  read_at?: string;
  created_at?: string;
  updated_at?: string;
  notifiable_type?: string;
  notifiable_id?: string | number;
  data: {
    type: string;
    title: string;
    message: string;
    icon?: string;
    url?: string;
    status?: string;
    order_number?: string;
    company?: string;
    [key: string]: any;
    article_number?: string;
    description?: string;
    part_number?: string;
  };
};