import type { Context } from 'hono'
import { randomUUID } from 'crypto'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE = 5 * 1024 * 1024

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png':  '.png',
  'image/webp': '.webp',
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

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
  const buffer = Buffer.from(await file.arrayBuffer())

  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: file.type,
  }))

  return c.json({ receiptUrl: `${process.env.R2_PUBLIC_URL}/${filename}` }, 201)
}
