import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { register, login, me } from '../controllers/auth.controller'

const authRouter = new Hono()

authRouter.post('/register', register)
authRouter.post('/login',    login)
authRouter.get('/me', authMiddleware, me)

export default authRouter
