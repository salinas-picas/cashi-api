import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { register, login, me } from '../controllers/auth.controller'

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret'

const authRouter = new Hono()

authRouter.post('/register', register)
authRouter.post('/login',    login)
authRouter.get('/me', jwt({ secret: JWT_SECRET, alg: 'HS256' }), me)

export default authRouter