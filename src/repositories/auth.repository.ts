import { prisma } from '../lib/prisma'
import type { RegisterInput } from '../schemas/auth.schema'
import type { User } from '../generated/prisma/index'

interface AuthRepository {
  findByEmail: (email: string)        => Promise<User | null>
  create:      (data: RegisterInput)  => Promise<User>
}

export const authRepository: AuthRepository = {
  findByEmail: (email) =>
    prisma.user.findUnique({ where: { email } }),

  create: (data) =>
    prisma.user.create({ data }),
}