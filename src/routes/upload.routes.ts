import { Hono } from 'hono'
import { uploadReceipt } from '../controllers/upload.controller'

const uploadRouter = new Hono()

uploadRouter.post('/upload', uploadReceipt)

export default uploadRouter
