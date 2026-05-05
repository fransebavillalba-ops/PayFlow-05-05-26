// Controlador de Wallet v2

import { Response } from "express";
import { AuthRequest, ApiResponse, ContactDTO } from "../types";
import { WalletService } from "../services/wallet.service";

export const WalletController = {
  async getMyWallet(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const wallet = await WalletService.getMyWallet(req.user!.userId);
      res.status(200).json({ success: true, message: "Wallet obtenida correctamente", data: wallet });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al obtener la wallet";
      res.status(500).json({ success: false, message });
    }
  },

  async findByAlias(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const wallet = await WalletService.findByAlias(req.params.alias);
      if (!wallet) {
        res.status(404).json({ success: false, message: `No existe ninguna cuenta con el alias "${req.params.alias}"` });
        return;
      }
      res.status(200).json({ success: true, message: "Destinatario encontrado", data: wallet });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al buscar wallet" });
    }
  },

  async getContacts(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const contacts = await WalletService.getContacts(req.user!.userId);
      res.status(200).json({ success: true, message: "Contactos obtenidos", data: contacts });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al obtener contactos" });
    }
  },

  async addContact(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const contact = await WalletService.addContact(req.user!.userId, req.body as ContactDTO);
      res.status(201).json({ success: true, message: "Contacto guardado", data: contact });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al guardar contacto";
      res.status(400).json({ success: false, message });
    }
  },

  async removeContact(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      await WalletService.removeContact(req.user!.userId, req.params.alias);
      res.status(200).json({ success: true, message: "Contacto eliminado" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al eliminar contacto" });
    }
  },
};
