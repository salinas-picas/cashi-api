import { z } from 'zod'

export const createTransactionSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
  type: z.enum(['income', 'expense']),
  description: z.string().optional(),
  date: z.string().datetime(),
  categoryId: z.number().int().positive(),
})

export const updateTransactionSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo').optional(),
  type: z.enum(['income', 'expense']).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  categoryId: z.number().int().positive().optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>