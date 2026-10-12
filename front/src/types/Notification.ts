import { EventType } from './event';
export interface User {
  id: number;
  name: string;
  email: string;
}




export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  userId?: string;
}



