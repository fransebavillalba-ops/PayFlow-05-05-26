// Controlador de autenticación v2

import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { ApiResponse, RegisterDTO, LoginDTO, AuthRequest } from "../types";

export const AuthController = {
  async register(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const result = await AuthService.register(req.body as RegisterDTO);
      res.status(201).json({ success: true, message: "¡Bienvenido a PayFlow! Tu cuenta fue creada exitosamente.", data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al registrarse";
      res.status(400).json({ success: false, message });
    }
  },

  async login(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const result = await AuthService.login(req.body as LoginDTO);
      res.status(200).json({ success: true, message: "Sesión iniciada correctamente", data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al iniciar sesión";
      res.status(401).json({ success: false, message });
    }
  },

  async refresh(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) { res.status(400).json({ success: false, message: "refreshToken requerido" }); return; }
      const result = await AuthService.refreshSession(refreshToken);
      res.status(200).json({ success: true, message: "Token renovado", data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al renovar sesión";
      res.status(401).json({ success: false, message });
    }
  },

  async logout(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) await AuthService.logout(refreshToken);
      res.status(200).json({ success: true, message: "Sesión cerrada" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al cerrar sesión" });
    }
  },
};
