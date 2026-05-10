# Cashi API

REST API para gestión de finanzas personales. Permite registrar y consultar transacciones categorizadas, con autenticación JWT.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js |
| Framework | [Hono](https://hono.dev/) v4 |
| Lenguaje | TypeScript 5 |
| ORM | Prisma 6 |
| Base de datos | PostgreSQL |
| Validación | Zod |
| Autenticación | JWT + bcryptjs |

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | No | Health check |
| POST | `/auth/register` | No | Registro de usuario |
| POST | `/auth/login` | No | Login — retorna JWT |
| GET | `/categories` | JWT | Listar categorías |
| POST | `/categories` | JWT | Crear categoría |
| GET | `/transactions` | JWT | Listar transacciones |
| POST | `/transactions` | JWT | Crear transacción |

## Instalación

### Requisitos previos

- Node.js >= 18
- PostgreSQL en ejecución

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd cashi-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Ejecutar migraciones y generar el cliente Prisma
npm run prisma:migrate
npm run prisma:generate
```

## Variables de entorno

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/cashi"
JWT_SECRET="tu_secreto_jwt"
PORT=3000
```

## Comandos

```bash
# Desarrollo (hot-reload con ts-node)
npm run dev

# Compilar a JavaScript
npm run build

# Producción
npm start

# Abrir Prisma Studio (explorador visual de la BD)
npm run prisma:studio
```

## Arquitectura

```
src/
├── controllers/   # Lógica de cada endpoint
├── repositories/  # Acceso a la base de datos (Prisma)
├── routes/        # Definición de rutas Hono
├── schemas/       # Validaciones Zod
└── lib/           # Cliente Prisma y utilidades
prisma/
├── schema.prisma  # Modelos: User, Category, Transaction
└── migrations/    # Historial de migraciones SQL
```
