import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import authRouter         from './routes/auth.routes'
import categoriesRouter   from './routes/categories.routes'
import transactionsRouter from './routes/transactions.routes'

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret'

const app = new Hono()

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: 'Cashi API — Unidad 2' }))

// Rutas públicas
app.route('/auth', authRouter)

// Middleware JWT para rutas protegidas
app.use('/categories/*', jwt({ secret: JWT_SECRET, alg: 'HS256' }))
app.use('/transactions/*', jwt({ secret: JWT_SECRET, alg: 'HS256' }))

// Rutas protegidas
app.route('/categories',   categoriesRouter)
app.route('/transactions', transactionsRouter)

const PORT = Number(process.env.PORT) || 3000
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})