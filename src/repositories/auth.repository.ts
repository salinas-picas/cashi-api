import { prisma } from '../lib/prisma'
import type { User } from '../generated/prisma/index'

interface CreateUserData {
  email: string
  passwordHash: string
}

interface AuthRepository {
  findByEmail: (email: string)       => Promise<User | null>
  create:      (data: CreateUserData) => Promise<User>
}

export const authRepository: AuthRepository = {
  findByEmail: (email) =>
    prisma.user.findUnique({ where: { email } }),

  create: (data) =>
    prisma.user.create({ data }),
}
