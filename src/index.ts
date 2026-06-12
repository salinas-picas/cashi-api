import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { authMiddleware }     from './middleware/auth'
import authRouter             from './routes/auth.routes'
import categoriesRouter       from './routes/categories.routes'
import transactionsRouter     from './routes/transactions.routes'
import uploadRouter           from './routes/upload.routes'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no está definida en las variables de entorno')
}

const app = new Hono()

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: 'Cashi API — Unidad 3' }))

// Rutas públicas
app.route('/auth', authRouter)

// Middleware JWT para rutas protegidas
app.use('/categories/*', authMiddleware)
app.use('/transactions/*', authMiddleware)

// Rutas protegidas
app.route('/categories',   categoriesRouter)
app.route('/transactions', transactionsRouter)
app.route('/transactions', uploadRouter)

const PORT = Number(process.env.PORT) || 3000
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
