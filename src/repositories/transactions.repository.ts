import { prisma } from '../lib/prisma'
import type { CreateTransactionInput, UpdateTransactionInput } from '../schemas/transactions.schema'
import type { Transaction, Category } from '../generated/prisma/index'

export type TransactionWithRelations = Transaction & {
  category: Category
}

const transactionInclude = {
  category: true,
} as const

interface TransactionRepository {
  findAll:    ()                                         => Promise<TransactionWithRelations[]>
  findById:   (id: number)                               => Promise<TransactionWithRelations | null>
  create:     (data: CreateTransactionInput)             => Promise<TransactionWithRelations>
  update:     (id: number, data: UpdateTransactionInput) => Promise<TransactionWithRelations>
  remove:     (id: number)                               => Promise<void>
  getBalance: ()                                         => Promise<{ totalIncome: number; totalExpense: number; balance: number }>
}

export const transactionsRepository: TransactionRepository = {
  findAll: () =>
    prisma.transaction.findMany({ include: transactionInclude }),

  findById: (id) =>
    prisma.transaction.findUnique({ where: { id }, include: transactionInclude }),

  create: (data) =>
    prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        description: data.description ?? '',
        date: new Date(data.date),
        categoryId: data.categoryId,
      },
      include: transactionInclude,
    }),

  update: (id, data) =>
    prisma.transaction.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      },
      include: transactionInclude,
    }),

  remove: (id) =>
    prisma.transaction.delete({ where: { id } }).then(() => undefined),

  getBalance: async () => {
    const transactions = await prisma.transaction.findMany()
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense }
  },
}