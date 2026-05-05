// Tipos globales del sistema PayFlow v2

import { Request } from "express";

export interface JwtPayload {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
  type?: "access" | "refresh";
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// DTOs de autenticación
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// DTO de transferencia
export interface TransferDTO {
  receiverAlias: string;
  amount: number;
  concept: string;
  idempotencyKey: string;
}

// DTO de depósito / retiro
export interface FundDTO {
  amount: number;
  concept?: string;
}

// DTO de contacto
export interface ContactDTO {
  alias: string;
  label?: string;
}
