/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Ticket {
  closedAt: any;
  _id: string;
  userId: string;
  user?: User;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'closed';
  createdAt: string;
  updatedAt: string;
  responses?: TicketResponse[];
}

export interface TicketResponse {
  _id: string;
  ticketId: string;
  responderId: string;
  responderType: 'AI' | 'agent';
  response: string;
  confidence?: number;
  createdAt: string;
}

export interface KnowledgeBase {
  views: number;
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  ticketId: string;
  action: string;
  performedBy?: {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'agent' | 'admin';
  } | null;
  performedByType: 'AI' | 'agent' | 'admin' | 'system';
  details: string;
  confidence?: number;
  createdAt: string; // match backend
}


export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byCategory: Record<string, number>;
}