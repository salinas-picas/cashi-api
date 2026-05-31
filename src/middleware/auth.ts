import type { MiddlewareHandler } from 'hono'
import jwt from 'jsonwebtoken'

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'No autorizado' }, 401)
  }
  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; email: string }
    c.set('jwtPayload', payload)
    await next()
  } catch (err) {
    console.error('[auth] jwt.verify falló:', err)
    return c.json({ error: 'Token inválido' }, 401)
  }
}
