// Middleware centralizado de manejo de errores

import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void {
  console.error("[Error]", err.message);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Prisma unique constraint
  if (err.message.includes("Unique constraint")) {
    res.status(409).json({ success: false, message: "El recurso ya existe" });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
}
