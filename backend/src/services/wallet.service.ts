// Servicio de Wallet v2

import prisma from "../utils/prisma";
import { validate, ContactSchema } from "../utils/validate";
import { ContactDTO } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const WalletService = {
  async getMyWallet(userId: string) {
    const wallet = await db.wallet.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!wallet) throw new Error("Wallet no encontrada");

    return {
      id: wallet.id,
      alias: wallet.alias,
      cvu: wallet.cvu || "",
      balance: Number(wallet.balance),
      owner: wallet.user.name,
      email: wallet.user.email,
      createdAt: wallet.createdAt,
    };
  },

  async findByAlias(alias: string) {
    const wallet = await db.wallet.findUnique({
      where: { alias },
      include: { user: { select: { name: true } } },
    });
    if (!wallet) return null;
    return { id: wallet.id, alias: wallet.alias, cvu: wallet.cvu || "", ownerName: wallet.user.name };
  },

  async getContacts(userId: string) {
    return db.contact.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },

  async addContact(userId: string, dto: ContactDTO) {
    const { alias, label } = validate(ContactSchema, dto);
    const wallet = await db.wallet.findUnique({ where: { alias } });
    if (!wallet) throw new Error(`No existe ninguna wallet con alias "${alias}"`);

    return db.contact.upsert({
      where: { userId_alias: { userId, alias } },
      update: { label },
      create: { userId, alias, label },
    });
  },

  async removeContact(userId: string, alias: string) {
    await db.contact.deleteMany({ where: { userId, alias } });
  },
};
