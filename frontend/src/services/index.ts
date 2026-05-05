// Servicios del frontend v2 — wrappers sobre la API REST

import api from './api';
import type { ApiResponse, Wallet, TransactionHistory, AdminStats, FailedTransaction, Contact } from '../types';

// AUTH
export const AuthService = {
  async register(name: string, email: string, password: string) {
    const { data } = await api.post<ApiResponse<{ token: string; accessToken: string; refreshToken: string; user: { id: string; name: string; email: string; role: 'USER' | 'ADMIN' } }>>('/auth/register', { name, email, password });
    return data;
  },
  async login(email: string, password: string) {
    const { data } = await api.post<ApiResponse<{ token: string; accessToken: string; refreshToken: string; user: { id: string; name: string; email: string; role: 'USER' | 'ADMIN' } }>>('/auth/login', { email, password });
    return data;
  },
};

// WALLET
export const WalletService = {
  async getMyWallet() {
    const { data } = await api.get<ApiResponse<Wallet>>('/wallet/me');
    return data;
  },
  async findByAlias(alias: string) {
    const { data } = await api.get<ApiResponse<{ id: string; alias: string; cvu: string; ownerName: string }>>(`/wallet/find/${alias}`);
    return data;
  },
  async getContacts() {
    const { data } = await api.get<ApiResponse<Contact[]>>('/wallet/contacts');
    return data;
  },
  async addContact(alias: string, label?: string) {
    const { data } = await api.post<ApiResponse<Contact>>('/wallet/contacts', { alias, label });
    return data;
  },
  async removeContact(alias: string) {
    const { data } = await api.delete<ApiResponse>(`/wallet/contacts/${alias}`);
    return data;
  },
};

// TRANSACCIONES
export const TransactionService = {
  async transfer(receiverAlias: string, amount: number, concept: string, idempotencyKey: string) {
    const { data } = await api.post<ApiResponse>('/transactions/transfer', { receiverAlias, amount, concept, idempotencyKey });
    return data;
  },
  async getHistory(page = 1, limit = 20, dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo)   params.append('dateTo', dateTo);
    const { data } = await api.get<ApiResponse<TransactionHistory>>(`/transactions/history?${params}`);
    return data;
  },
  async deposit(amount: number, concept?: string) {
    const { data } = await api.post<ApiResponse>('/transactions/deposit', { amount, concept });
    return data;
  },
  async withdraw(amount: number, concept?: string) {
    const { data } = await api.post<ApiResponse>('/transactions/withdraw', { amount, concept });
    return data;
  },
};

// ADMIN
export const AdminService = {
  async getStats() {
    const { data } = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return data;
  },
  async getFailedTransactions(page = 1) {
    const { data } = await api.get<ApiResponse<{ transactions: FailedTransaction[]; pagination: { total: number } }>>(`/admin/transactions/failed?page=${page}`);
    return data;
  },
};
