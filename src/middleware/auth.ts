import type { MiddlewareHandler } from 'hono'
import { verify } from 'hono/jwt'

const JWT_SECRET = process.env.JWT_SECRET!

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'No autorizado' }, 401)
  }
  const token = authHeader.slice(7)
  try {
    const payload = await verify(token, JWT_SECRET, 'HS256')
    c.set('jwtPayload', payload)
    await next()
  } catch {
    return c.json({ error: 'Token inválido' }, 401)
  }
}
