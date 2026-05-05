// Servicio de autenticación v2 - con refresh tokens y auditoría

import bcrypt from "bcryptjs";
import prisma from "../utils/prisma";
import { generateToken, generateRefreshToken, verifyRefreshToken, getRefreshExpiry } from "../utils/jwt";
import { generateAlias, generateCVU } from "../utils/helpers";
import { logAudit } from "../utils/audit";
import { validate, RegisterSchema, LoginSchema } from "../utils/validate";
import { RegisterDTO, LoginDTO } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const BCRYPT_ROUNDS = 12;

export const AuthService = {
  async register(data: RegisterDTO) {
    const { name, email, password } = validate(RegisterSchema, data);

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("El email ya está registrado en PayFlow");

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let alias = generateAlias(name);
    while (await db.wallet.findUnique({ where: { alias } })) {
      alias = generateAlias(name);
    }

    let cvu = generateCVU();
    while (await db.wallet.findUnique({ where: { cvu } })) {
      cvu = generateCVU();
    }

    const user = await db.$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER",
        },
      });

      await tx.wallet.create({
        data: {
          alias,
          cvu,
          balance: 10000,
          userId: newUser.id,
        },
      });

      return newUser;
    });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshExpiry(),
      },
    });

    await logAudit(user.id, "REGISTER", { email, name });

    return {
      accessToken,
      refreshToken,
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async login(data: LoginDTO) {
    const { email, password } = validate(LoginSchema, data);

    const user = await db.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user) throw new Error("Email o contraseña incorrectos");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      await logAudit(user.id, "LOGIN_FAILED", {
        email,
        reason: "wrong_password",
      });
      throw new Error("Email o contraseña incorrectos");
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshExpiry(),
      },
    });

    await logAudit(user.id, "LOGIN", { email });

    return {
      accessToken,
      refreshToken,
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async refreshSession(refreshTokenStr: string) {
    const stored = await db.refreshToken.findUnique({
      where: { token: refreshTokenStr },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new Error("Refresh token inválido o expirado");
    }

    const payload = verifyRefreshToken(refreshTokenStr);

    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) throw new Error("Usuario no encontrado");

    await db.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccess = generateToken(tokenPayload);
    const newRefresh = generateRefreshToken(tokenPayload);

    await db.refreshToken.create({
      data: {
        token: newRefresh,
        userId: user.id,
        expiresAt: getRefreshExpiry(),
      },
    });

    return {
      accessToken: newAccess,
      refreshToken: newRefresh,
      token: newAccess,
    };
  },

  async logout(refreshTokenStr: string) {
    await db.refreshToken.updateMany({
      where: { token: refreshTokenStr },
      data: { revoked: true },
    });
  },
};