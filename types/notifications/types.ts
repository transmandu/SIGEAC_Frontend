export type Notification = {
  id: string;

  type?: string;

  data: {
    title: string;
    message: string;
    [key: string]: any;
  };

  read_at: string | null;
  created_at?: string;
};