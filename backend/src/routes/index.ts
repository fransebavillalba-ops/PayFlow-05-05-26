// Rutas PayFlow v2

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller";
import { WalletController } from "../controllers/wallet.controller";
import { TransactionController } from "../controllers/transaction.controller";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// ── Rate limiters ──────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, message: "Demasiados intentos. Intentá en 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

const transferLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20,
  message: { success: false, message: "Límite de transferencias alcanzado. Intentá en 1 minuto." },
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: "Demasiadas peticiones. Intentá más tarde." },
});

router.use(generalLimiter);

// ── AUTH ──────────────────────────────────────────────
router.post("/auth/register", authLimiter, AuthController.register);
router.post("/auth/login",    authLimiter, AuthController.login);
router.post("/auth/refresh",  AuthController.refresh);
router.post("/auth/logout",   authenticate, AuthController.logout);

// ── WALLET ────────────────────────────────────────────
router.get("/wallet/me",              authenticate, WalletController.getMyWallet);
router.get("/wallet/find/:alias",     authenticate, WalletController.findByAlias);
router.get("/wallet/contacts",        authenticate, WalletController.getContacts);
router.post("/wallet/contacts",       authenticate, WalletController.addContact);
router.delete("/wallet/contacts/:alias", authenticate, WalletController.removeContact);

// ── TRANSACCIONES ─────────────────────────────────────
router.post("/transactions/transfer",  authenticate, transferLimiter, TransactionController.transfer);
router.get("/transactions/history",    authenticate, TransactionController.getHistory);
router.post("/transactions/deposit",   authenticate, TransactionController.deposit);
router.post("/transactions/withdraw",  authenticate, TransactionController.withdraw);

// ── ADMIN ─────────────────────────────────────────────
router.get("/admin/transactions/failed", authenticate, requireAdmin, TransactionController.getFailedTransactions);
router.get("/admin/stats",               authenticate, requireAdmin, TransactionController.getAdminStats);

export default router;
