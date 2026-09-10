/** Un artículo dentro del detalle de DISPATCH_RETURN_REGISTERED. */
export type DispatchReturnNotificationItem = {
  part_number: string;
  batch_name: string | null;
  category: string | null;
  quantity: number;
  unit: string;
  damaged: boolean;
};

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
    // DISPATCH_RETURN_REGISTERED: sin url a propósito, administración y
    // mantenimiento no pueden abrir /almacen/solicitudes/salida. El detalle
    // completo viaja aquí para que el frontend lo muestre en un diálogo.
    dispatch_order_id?: number;
    request_number?: string;
    returned_at?: string;
    justification?: string;
    items?: DispatchReturnNotificationItem[];
  };
};