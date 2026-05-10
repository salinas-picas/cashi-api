import type { Context } from 'hono'
import { sign } from 'hono/jwt'
import bcrypt from 'bcryptjs'
import { authRepository } from '../repositories/auth.repository'
import { registerSchema, loginSchema } from '../schemas/auth.schema'
import { parsePrismaError } from '../lib/prisma-error'

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret'

// POST /auth/register
export const register = async (c: Context) => {
  const body = await c.req.json()
  const result = registerSchema.safeParse(body)
  if (!result.success) return c.json({ errors: result.error.issues }, 400)
  try {
    const hashedPassword = await bcrypt.hash(result.data.password, 10)
    const user = await authRepository.create({
      email: result.data.email,
      password: hashedPassword,
    })
    const { password: _, ...userWithoutPassword } = user
    return c.json(userWithoutPassword, 201)
  } catch (error) {
    const { status, message } = parsePrismaError(error)
    return c.json({ error: message }, status)
  }
}

// POST /auth/login
export const login = async (c: Context) => {
  const body = await c.req.json()
  const result = loginSchema.safeParse(body)
  if (!result.success) return c.json({ errors: result.error.issues }, 400)
  const user = await authRepository.findByEmail(result.data.email)
  if (!user) return c.json({ error: 'Credenciales inválidas' }, 401)
  const validPassword = await bcrypt.compare(result.data.password, user.password)
  if (!validPassword) return c.json({ error: 'Credenciales inválidas' }, 401)
  const token = await sign({ userId: user.id, email: user.email }, JWT_SECRET, 'HS256')
  return c.json({ token })
}

// GET /auth/me
export const me = async (c: Context) => {
  const payload = c.get('jwtPayload')
  return c.json(payload)
}