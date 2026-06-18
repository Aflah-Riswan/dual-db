import { PrismaClient } from "@prisma/client";
import type { IUserRepository } from "../../../domain/repositories/repo.user.js";
import { User } from "../../../domain/entities/User.js";

export class PrismaUserRepo implements IUserRepository {
  private prisma = new PrismaClient();

  async save(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: { name: user.name, email: user.email, password: user.password!, role: user.role },
    });
    return new User(created.id, created.name, created.email, created.password, created.role, created.isBlocked, created.createdAt);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.isBlocked !== undefined && { isBlocked: data.isBlocked }),
      },
    });
    return new User(updated.id, updated.name, updated.email, updated.password, updated.role, updated.isBlocked, updated.createdAt);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async findById(id: number): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { id } });
    if (!found) return null;
    return new User(found.id, found.name, found.email, found.password, found.role, found.isBlocked, found.createdAt);
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { email } });
    if (!found) return null;
    return new User(found.id, found.name, found.email, found.password, found.role, found.isBlocked, found.createdAt);
  }

  async findAll(): Promise<User[]> {
    const records = await this.prisma.user.findMany();
    return records.map((r : any) => new User(r.id, r.name, r.email, r.password, r.role, r.isBlocked, r.createdAt));
  }
}
