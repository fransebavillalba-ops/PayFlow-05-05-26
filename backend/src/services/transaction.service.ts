// Servicio de Transacciones v2

import { Decimal } from "@prisma/client/runtime/library";
import prisma from "../utils/prisma";
import { logAudit } from "../utils/audit";
import { validate, TransferSchema, FundSchema } from "../utils/validate";
import { TransferDTO, FundDTO } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const TransactionService = {
  async transfer(senderUserId: string, dto: TransferDTO) {
    const { receiverAlias, amount, concept, idempotencyKey } = validate(TransferSchema, {
      ...dto,
      amount: Number(dto.amount),
    });

    const existing = await db.transaction.findUnique({ where: { idempotencyKey } });
    if (existing) return existing;

    const senderWallet = await db.wallet.findUnique({ where: { userId: senderUserId } });
    if (!senderWallet) throw new Error("Tu wallet no fue encontrada");

    const receiverWallet = await db.wallet.findUnique({ where: { alias: receiverAlias } });
    if (!receiverWallet) throw new Error(`No se encontró ninguna wallet con alias "${receiverAlias}"`);

    if (senderWallet.id === receiverWallet.id) throw new Error("No podés transferirte a vos mismo");

    const amountDecimal = new Decimal(amount);

    const transaction = await db.$transaction(async (tx: any) => {
      const freshSender = await tx.wallet.findUnique({ where: { id: senderWallet.id } });
      if (!freshSender) throw new Error("Wallet emisora no encontrada");

      if (new Decimal(freshSender.balance).lessThan(amountDecimal)) {
        return tx.transaction.create({
          data: {
            amount: amountDecimal,
            concept,
            status: "FAILED",
            idempotencyKey,
            senderWalletId: senderWallet.id,
            receiverWalletId: receiverWallet.id,
          },
        });
      }

      const processingTx = await tx.transaction.create({
        data: {
          amount: amountDecimal,
          concept,
          status: "PROCESSING",
          idempotencyKey,
          senderWalletId: senderWallet.id,
          receiverWalletId: receiverWallet.id,
        },
      });

      await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amountDecimal } },
      });
      await tx.wallet.update({
        where: { id: receiverWallet.id },
        data: { balance: { increment: amountDecimal } },
      });

      return tx.transaction.update({
        where: { id: processingTx.id },
        data: { status: "SUCCESS" },
      });
    });

    if (transaction.status === "FAILED") {
      await logAudit(senderUserId, "TRANSFER_FAILED", {
        receiverAlias, amount, concept, reason: "insufficient_balance",
      });
      throw new Error("Saldo insuficiente para realizar la transferencia");
    }

    await logAudit(senderUserId, "TRANSFER_SUCCESS", {
      receiverAlias, amount, concept, transactionId: transaction.id,
    });

    return transaction;
  },

  async deposit(userId: string, dto: FundDTO) {
    const { amount, concept } = validate(FundSchema, { ...dto, amount: Number(dto.amount) });
    const wallet = await db.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("Wallet no encontrada");

    const amountDecimal = new Decimal(amount);
    const idempotencyKey = `deposit-${userId}-${Date.now()}`;

    const tx = await db.$transaction(async (t: any) => {
      await t.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amountDecimal } },
      });
      return t.transaction.create({
        data: {
          amount: amountDecimal,
          concept: concept || "Carga de saldo",
          status: "SUCCESS",
          idempotencyKey,
          senderWalletId: wallet.id,
          receiverWalletId: wallet.id,
        },
      });
    });

    await logAudit(userId, "DEPOSIT", { amount, transactionId: tx.id });
    return tx;
  },

  async withdraw(userId: string, dto: FundDTO) {
    const { amount, concept } = validate(FundSchema, { ...dto, amount: Number(dto.amount) });
    const wallet = await db.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("Wallet no encontrada");

    const amountDecimal = new Decimal(amount);

    const tx = await db.$transaction(async (t: any) => {
      const fresh = await t.wallet.findUnique({ where: { id: wallet.id } });
      if (!fresh || new Decimal(fresh.balance).lessThan(amountDecimal)) {
        throw new Error("Saldo insuficiente para realizar el retiro");
      }
      await t.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amountDecimal } },
      });
      return t.transaction.create({
        data: {
          amount: amountDecimal,
          concept: concept || "Retiro de saldo",
          status: "SUCCESS",
          idempotencyKey: `withdraw-${userId}-${Date.now()}`,
          senderWalletId: wallet.id,
          receiverWalletId: wallet.id,
        },
      });
    });

    await logAudit(userId, "WITHDRAWAL", { amount, transactionId: tx.id });
    return tx;
  },

  async getMyHistory(userId: string, page = 1, limit = 20, dateFrom?: string, dateTo?: string) {
    const wallet = await db.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("Wallet no encontrada");

    const skip = (page - 1) * limit;
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo)   dateFilter.lte = new Date(dateTo);

    const where = {
      OR: [{ senderWalletId: wallet.id }, { receiverWalletId: wallet.id }],
      ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
    };

    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where,
        include: {
          senderWallet: { include: { user: { select: { name: true } } } },
          receiverWallet: { include: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.transaction.count({ where }),
    ]);

    const enriched = transactions.map((tx: any) => ({
      id: tx.id,
      amount: Number(tx.amount),
      concept: tx.concept,
      status: tx.status,
      type: tx.type || "TRANSFER",
      direction: tx.senderWalletId === wallet.id ? "SENT" : "RECEIVED",
      senderName: tx.senderWallet.user.name,
      senderAlias: tx.senderWallet.alias,
      receiverName: tx.receiverWallet.user.name,
      receiverAlias: tx.receiverWallet.alias,
      createdAt: tx.createdAt,
    }));

    return { transactions: enriched, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getFailedTransactions(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where: { status: "FAILED" },
        include: {
          senderWallet: { include: { user: { select: { name: true, email: true } } } },
          receiverWallet: { include: { user: { select: { name: true, email: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.transaction.count({ where: { status: "FAILED" } }),
    ]);

    return {
      transactions: transactions.map((tx: any) => ({
        id: tx.id,
        amount: Number(tx.amount),
        concept: tx.concept,
        status: tx.status,
        type: tx.type || "TRANSFER",
        sender: { name: tx.senderWallet.user.name, email: tx.senderWallet.user.email, alias: tx.senderWallet.alias },
        receiver: { name: tx.receiverWallet.user.name, email: tx.receiverWallet.user.email, alias: tx.receiverWallet.alias },
        createdAt: tx.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getAdminStats() {
    const [totalUsers, totalWallets, totalTransactions, failedCount, successCount] =
      await Promise.all([
        db.user.count(),
        db.wallet.count(),
        db.transaction.count(),
        db.transaction.count({ where: { status: "FAILED" } }),
        db.transaction.count({ where: { status: "SUCCESS" } }),
      ]);

    const volumeResult = await db.transaction.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    });

    return { totalUsers, totalWallets, totalTransactions, failedCount, successCount, totalVolume: Number(volumeResult._sum.amount || 0) };
  },
};
