// Tipos TypeScript del frontend PayFlow v2

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface Wallet {
  id: string;
  alias: string;
  cvu: string;
  balance: number;
  owner: string;
  email: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  concept: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  type: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  direction: 'SENT' | 'RECEIVED';
  senderName: string;
  senderAlias: string;
  receiverName: string;
  receiverAlias: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  alias: string;
  label?: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionHistory {
  transactions: Transaction[];
  pagination: Pagination;
}

export interface AdminStats {
  totalUsers: number;
  totalWallets: number;
  totalTransactions: number;
  failedCount: number;
  successCount: number;
  totalVolume: number;
}

export interface FailedTransaction {
  id: string;
  amount: number;
  concept: string;
  status: string;
  type: string;
  sender: { name: string; email: string; alias: string };
  receiver: { name: string; email: string; alias: string };
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
