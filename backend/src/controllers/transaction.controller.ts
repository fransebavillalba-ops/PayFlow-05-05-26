// Controlador de Transacciones v2

import { Response } from "express";
import { AuthRequest, ApiResponse, TransferDTO, FundDTO } from "../types";
import { TransactionService } from "../services/transaction.service";

export const TransactionController = {
  async transfer(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await TransactionService.transfer(userId, {
        ...req.body as TransferDTO,
        amount: Number(req.body.amount),
      });
      res.status(201).json({ success: true, message: "Transferencia realizada exitosamente", data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al procesar la transferencia";
      res.status(400).json({ success: false, message });
    }
  },

  async getHistory(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page  = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo   = req.query.dateTo   as string | undefined;
      const result = await TransactionService.getMyHistory(userId, page, limit, dateFrom, dateTo);
      res.status(200).json({ success: true, message: "Historial obtenido correctamente", data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al obtener el historial";
      res.status(500).json({ success: false, message });
    }
  },

  async deposit(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await TransactionService.deposit(userId, { ...req.body as FundDTO, amount: Number(req.body.amount) });
      res.status(201).json({ success: true, message: "Saldo cargado exitosamente", data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al cargar saldo";
      res.status(400).json({ success: false, message });
    }
  },

  async withdraw(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await TransactionService.withdraw(userId, { ...req.body as FundDTO, amount: Number(req.body.amount) });
      res.status(201).json({ success: true, message: "Retiro realizado exitosamente", data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al retirar saldo";
      res.status(400).json({ success: false, message });
    }
  },

  async getFailedTransactions(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const page  = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await TransactionService.getFailedTransactions(page, limit);
      res.status(200).json({ success: true, message: "Transacciones fallidas obtenidas", data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al obtener datos" });
    }
  },

  async getAdminStats(_req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const stats = await TransactionService.getAdminStats();
      res.status(200).json({ success: true, message: "Estadísticas obtenidas", data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al obtener estadísticas" });
    }
  },
};
