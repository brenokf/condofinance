export type UserRole = 'admin' | 'resident' | 'auditor';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  unit?: string;
  createdAt: string;
}

export interface FinanceRecord {
  id?: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  status: 'paid' | 'pending';
  tags: string[];
  unit?: string; // Associated unit for income records
}

export interface MaintenanceTask {
  id?: string;
  type: 'preventive' | 'corrective';
  title: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  cost: number;
  provider: string;
}

export interface Ticket {
  id?: string;
  userId: string;
  type: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  description: string;
  createdAt: string;
  resolvedAt?: string;
  feedback?: number;
}

export interface Forecast {
  id?: string;
  type: 'income' | 'expense';
  amount: number;
  month: number;
  year: number;
  category?: string;
  description?: string;
}
