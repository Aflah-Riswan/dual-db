import { PrismaClient } from "@prisma/client";
import type { IUserRepo } from "../../../domain/repositories/repo.user.js";
import { User } from "../../../domain/entities/User.js";

export class PrismaUserRepo implements IUserRepo {
  private prisma = new PrismaClient();
  async save(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: { name: user.name, email: user.email, password: user.email },
    });
    return new User(created.id, created.name, created.email, created.password, created.role, created.isBlocked, created.createdAt);
  }
  async findByEmail(email: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { email } });
    if (!found) return null;
    return new User(found.id, found.name, found.email, found.password, found.role, found.isBlocked, found.createdAt);
  }
  async findAll(): Promise<User[]> {
    throw new Error('Not used on Primary Database layer.');
  }
}
