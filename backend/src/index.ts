// PayFlow Backend v2 - Entry Point

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3001;

// ── Seguridad base ────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────────────
app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "PayFlow API", version: "2.0.0", timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint no encontrado" });
});

// ── Error handler centralizado ────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║       PayFlow API Server v2.0         ║
║       http://localhost:${PORT}           ║
║       Entorno: ${process.env.NODE_ENV || "development"}              ║
╚═══════════════════════════════════════╝
  `);
});

export default app;
