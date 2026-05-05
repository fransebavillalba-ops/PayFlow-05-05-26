# 💳 PayFlow — Digital Wallet v2.0

Sistema de billetera digital desarrollado con **Node.js + Express + Prisma ORM + PostgreSQL** (backend) y **React + TypeScript + Vite** (frontend).

---

## 🆕 Novedades en v2.0

| Área | Mejora |
|------|--------|
| 🔐 Seguridad | Access token (15 min) + Refresh token (7 días) con rotación |
| 🛡️ Rate limiting | `express-rate-limit` en login, registro y transferencias |
| 🔒 Headers | `helmet` para cabeceras HTTP seguras |
| ✅ Validación | Schemas con `zod` en todos los endpoints |
| 💳 CVU simulado | Campo único de 22 dígitos por wallet |
| 📥 Depósito mock | Endpoint para simular carga de saldo |
| 📤 Retiro mock | Endpoint para simular extracción de saldo |
| 📋 Auditoría | Modelo `AuditLog` — registra login, transferencias y errores |
| 👥 Contactos | Guardar y gestionar destinatarios frecuentes |
| 📅 Filtros historial | Filtrar transacciones por fecha (desde/hasta) |
| 🔄 Nuevos estados | `PROCESSING` y `CANCELLED` en el enum de transacciones |
| 🧪 Tests | Suite con Jest para auth y transferencias |
| 🚨 Error handler | Middleware centralizado de errores |

---

## 🚀 Inicio rápido

### Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tu DATABASE_URL y secrets JWT

npm install
npx prisma migrate dev --name v2
# O para DB existente: ejecutar prisma/migrations/manual/v2_migration.sql

npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints v2

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario (rate limited) |
| POST | `/api/auth/login`    | Iniciar sesión (rate limited) |
| POST | `/api/auth/refresh`  | Renovar access token |
| POST | `/api/auth/logout`   | Cerrar sesión (revoca refresh token) |

### Wallet
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | `/api/wallet/me`              | Mi wallet (saldo, alias, CVU) |
| GET    | `/api/wallet/find/:alias`     | Buscar por alias |
| GET    | `/api/wallet/contacts`        | Mis contactos frecuentes |
| POST   | `/api/wallet/contacts`        | Guardar contacto |
| DELETE | `/api/wallet/contacts/:alias` | Eliminar contacto |

### Transacciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/transactions/transfer` | Transferir (rate limited) |
| GET  | `/api/transactions/history`  | Historial (paginado + filtro fecha) |
| POST | `/api/transactions/deposit`  | Cargar saldo (mock) |
| POST | `/api/transactions/withdraw` | Retirar saldo (mock) |

### Admin
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/stats`                  | Estadísticas del sistema |
| GET | `/api/admin/transactions/failed`    | Transacciones fallidas |

---

## 🧪 Tests

```bash
cd backend
npm test
```

---

## 🔐 Variables de entorno

Ver `backend/.env.example` para la lista completa.

---

## 🗃️ Modelos de datos

- **User** — usuario con email, nombre y rol
- **Wallet** — alias único + CVU de 22 dígitos + saldo
- **Transaction** — transferencias, depósitos y retiros con estado y tipo
- **RefreshToken** — tokens de refresco con rotación
- **AuditLog** — registro de acciones del sistema
- **Contact** — destinatarios frecuentes por usuario

---

## 🛠️ Stack tecnológico

**Backend:** Node.js · Express · TypeScript · Prisma ORM · PostgreSQL · JWT · bcryptjs · Zod · Helmet · express-rate-limit · Jest

**Frontend:** React 18 · TypeScript · Vite · React Router v6 · Axios

---

*PayFlow v2 — TP Sistemas Fintech*
