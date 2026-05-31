import type { Context } from 'hono'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE = 5 * 1024 * 1024

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png':  '.png',
  'image/webp': '.webp',
}

// POST /transactions/upload
export const uploadReceipt = async (c: Context) => {
  const body = await c.req.parseBody()
  const file = body['receipt']

  if (!file || typeof file === 'string') {
    return c.json({ error: 'Se requiere el campo receipt' }, 400)
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return c.json({ error: 'Tipo de archivo no permitido. Use JPEG, PNG o WebP' }, 400)
  }

  if (file.size > MAX_SIZE) {
    return c.json({ error: 'El archivo supera el límite de 5 MB' }, 400)
  }

  const filename = `${randomUUID()}${MIME_TO_EXT[file.type]}`
  const filepath = join(process.cwd(), 'uploads', filename)

  await writeFile(filepath, Buffer.from(await file.arrayBuffer()))

  return c.json({ receiptUrl: `/uploads/${filename}` }, 201)
}
