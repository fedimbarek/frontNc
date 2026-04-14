export type ComplaintStatus = 'EN_ATTENTE' | 'TRAITEE' | 'REJETEE';

export interface ComplaintResponse {
  id?: number;
  message: string;
  createdAt?: string;
  complaint?: { id: number };
}

export interface Complaint {
  id?: number;
  title: string;
  description: string;
  status?: ComplaintStatus;
  createdAt?: string;
  updatedAt?: string;
  response?: ComplaintResponse;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface DashboardStats {
  total: number;
  en_attente: number;
  traitee: number;
  rejetee: number;
  averageProcessingTimeHours: number;
  unprocessedRate: number;
  byDay: { [key: string]: number };
  byMonth: { [key: string]: number };
  byYear: { [key: string]: number };
}
