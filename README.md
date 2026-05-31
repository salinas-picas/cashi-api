# Cashi API

REST API para gestión de finanzas personales. Los usuarios se registran con email y contraseña, autentican mediante JWT y operan exclusivamente sobre sus propias transacciones. Cada transacción puede tener coordenadas GPS y un comprobante de imagen subido al servidor.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js >= 18 |
| Framework | [Hono](https://hono.dev/) v4 |
| Lenguaje | TypeScript 5 |
| ORM | Prisma 6 |
| Base de datos | PostgreSQL 16 |
| Validación | Zod |
| Hash de contraseñas | bcryptjs |
| Tokens | jsonwebtoken + hono/jwt |
| Contenedor local | Docker Compose |

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```env
# Cadena de conexión a PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cashidb"

# Secreto para firmar y verificar tokens JWT (mínimo 32 caracteres recomendado)
JWT_SECRET="tu_secreto_seguro_aqui"

# Puerto en el que escucha el servidor (opcional, default 3000)
PORT=3000
```

> El servidor lanza un error al iniciar si `JWT_SECRET` no está definida.

## Endpoints

### Auth (públicos)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Health check |
| POST | `/auth/register` | Registro — devuelve JWT |
| POST | `/auth/login` | Login — devuelve JWT |
| GET | `/auth/me` | Perfil del usuario autenticado |

### Categorías (requieren JWT)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/categories` | Listar todas las categorías |
| POST | `/categories` | Crear categoría |
| PATCH | `/categories/:id` | Actualizar categoría |
| DELETE | `/categories/:id` | Eliminar categoría |

### Transacciones (requieren JWT, filtradas por usuario)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/transactions` | Listar transacciones del usuario autenticado |
| GET | `/transactions/balance` | Balance (ingresos, gastos, neto) del usuario |
| GET | `/transactions/:id` | Detalle de una transacción (403 si no es dueño) |
| POST | `/transactions` | Crear transacción |
| PATCH | `/transactions/:id` | Actualizar transacción (403 si no es dueño) |
| DELETE | `/transactions/:id` | Eliminar transacción (403 si no es dueño) |
| POST | `/transactions/upload` | Subir imagen de comprobante (JPEG/PNG/WebP, máx 5 MB) |

## Instalación

### Requisitos previos

- Node.js >= 18
- Docker Desktop (para levantar PostgreSQL con Compose)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd cashi-api

# 2. Instalar dependencias
yarn install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env — mínimo: DATABASE_URL y JWT_SECRET

# 4. Levantar la base de datos
docker compose up -d

# 5. Ejecutar migraciones y generar el cliente Prisma
yarn prisma migrate dev
yarn prisma generate

# 6. Iniciar el servidor en modo desarrollo
yarn dev
```

El servidor queda disponible en `http://localhost:3000`.

## Comandos disponibles

```bash
yarn dev              # Desarrollo con ts-node (sin compilar)
yarn build            # Compila TypeScript a dist/
yarn start            # Ejecuta la versión compilada
yarn prisma:migrate   # Crea y aplica migraciones pendientes
yarn prisma:generate  # Regenera el cliente Prisma
yarn prisma:studio    # Abre el explorador visual de la BD
```

## Arquitectura

```
src/
├── middleware/    # authMiddleware — verifica JWT e inyecta jwtPayload
├── controllers/   # Lógica HTTP: validación de input, ownership, respuesta
├── repositories/  # Acceso a datos (Prisma) — sin lógica de negocio
├── routes/        # Definición de rutas Hono
├── schemas/       # Schemas Zod + tipos inferidos
└── lib/           # Cliente Prisma singleton y parser de errores Prisma
prisma/
├── schema.prisma  # Modelos: User, Category, Transaction
└── migrations/    # Historial de migraciones SQL
uploads/           # Imágenes de comprobantes (local)
```

### Decisiones de diseño

**Middleware de auth en archivo separado (`src/middleware/auth.ts`)**
El middleware de Hono (`hono/jwt`) es conveniente, pero acopla la configuración del secreto directamente en cada archivo de rutas. Al extraerlo a un módulo propio, el secreto se lee en un solo lugar, el comportamiento ante token inválido o ausente es consistente en toda la API, y el middleware se puede testear de forma aislada.

**Ownership check en el controller, no en el repository**
El repository es responsable exclusivamente de acceso a datos: recibe parámetros y ejecuta queries. Verificar si un usuario es dueño de un recurso es lógica de negocio — depende de quién hace la petición (contexto HTTP). Colocar esa verificación en el repository requeriría pasarle el `userId` a métodos como `findById`, `update` y `remove`, lo que contamina la interfaz de datos con preocupaciones de autorización. El controller ya tiene acceso al `jwtPayload`; es el lugar natural para hacer el check y retornar 403 antes de delegar al repository.

### Almacenamiento de imágenes

En esta implementación las imágenes se guardan localmente en `uploads/` con un nombre UUID para evitar colisiones. La carpeta se sirve como archivos estáticos en `/uploads/*`.

En un entorno de producción se reemplazaría el `writeFile` por una llamada a un object storage (Cloudflare R2, AWS S3 o similar) y la URL devuelta apuntaría al CDN correspondiente, sin cambios en el contrato de la API (`{ receiptUrl: "..." }`).

## Uso de IA

Este proyecto fue desarrollado con asistencia de **Claude** ([claude.ai](https://claude.ai) y **Claude Code**) para diseño de la arquitectura N-Layer, implementación de los módulos de autenticación y ownership, y revisión del código generado.

## Demo en video

[Ver demo en Loom](https://www.loom.com/share/0286a1956a2b4480b9127beff6909388)
