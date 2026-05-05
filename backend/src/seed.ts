// Seed: pobla la base de datos con datos de prueba
// Ejecutar con: npm run prisma:seed

import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "./utils/prisma";

async function main() {
  console.log("🌱 Iniciando seed de PayFlow...");

  // Limpiar datos existentes (en orden por dependencias)
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  // ── Crear usuario ADMIN ──────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Admin PayFlow",
      email: "admin@payflow.com",
      password: adminPassword,
      role: "ADMIN",
      wallet: {
        create: {
          alias: "admin.payflow.9999",
          balance: 999999,
        },
      },
    },
    include: { wallet: true },
  });
  console.log(`✅ Admin creado: ${admin.email}`);

  // ── Crear usuario Juan ────────────────────────────
  const juanPassword = await bcrypt.hash("juan123", 12);
  const juan = await prisma.user.create({
    data: {
      name: "Juan Pérez",
      email: "juan@example.com",
      password: juanPassword,
      role: "USER",
      wallet: {
        create: {
          alias: "juan.perez.1234",
          balance: 25000,
        },
      },
    },
    include: { wallet: true },
  });
  console.log(`✅ Usuario creado: ${juan.email}`);

  // ── Crear usuario María ───────────────────────────
  const mariaPassword = await bcrypt.hash("maria123", 12);
  const maria = await prisma.user.create({
    data: {
      name: "María González",
      email: "maria@example.com",
      password: mariaPassword,
      role: "USER",
      wallet: {
        create: {
          alias: "maria.gonzalez.5678",
          balance: 15000,
        },
      },
    },
    include: { wallet: true },
  });
  console.log(`✅ Usuario creado: ${maria.email}`);

  // ── Crear transacciones de ejemplo ────────────────
  if (juan.wallet && maria.wallet) {
    await prisma.transaction.createMany({
      data: [
        {
          amount: 5000,
          concept: "Pago de alquiler",
          status: "SUCCESS",
          idempotencyKey: "seed-tx-001",
          senderWalletId: juan.wallet.id,
          receiverWalletId: maria.wallet.id,
        },
        {
          amount: 1500,
          concept: "División de cena",
          status: "SUCCESS",
          idempotencyKey: "seed-tx-002",
          senderWalletId: maria.wallet.id,
          receiverWalletId: juan.wallet.id,
        },
        {
          amount: 999999, // fallida por saldo insuficiente simulado
          concept: "Prueba de saldo insuficiente",
          status: "FAILED",
          idempotencyKey: "seed-tx-003",
          senderWalletId: juan.wallet.id,
          receiverWalletId: maria.wallet.id,
        },
        {
          amount: 2000,
          concept: "Pago de servicios",
          status: "SUCCESS",
          idempotencyKey: "seed-tx-004",
          senderWalletId: juan.wallet.id,
          receiverWalletId: maria.wallet.id,
        },
      ],
    });
    console.log("✅ Transacciones de ejemplo creadas");
  }

  console.log(`
🎉 Seed completado exitosamente!

Usuarios de prueba:
──────────────────────────────────────────
👤 Admin
   Email: admin@payflow.com
   Pass:  admin123

👤 Juan Pérez
   Email: juan@example.com
   Pass:  juan123
   Alias: juan.perez.1234

👤 María González
   Email: maria@example.com
   Pass:  maria123
   Alias: maria.gonzalez.5678
──────────────────────────────────────────
  `);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
