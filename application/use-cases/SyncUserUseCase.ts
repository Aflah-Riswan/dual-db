import { User } from "../../domain/entities/User.js";
import type { IUserRepository } from "../../domain/repositories/repo.user.js";

export class SyncUserUseCase {
  constructor(private readonly mongoRepository: IUserRepository) {}

  async execute(action: string, payload: any): Promise<void> {
    if (action === 'DELETE') {
      await this.mongoRepository.delete(payload.id);
      return;
    }

    const userEntity = new User(
      payload.id, payload.name, payload.email, payload.password,
      payload.role, payload.isBlocked, new Date(payload.createdAt)
    );
    await this.mongoRepository.save(userEntity);
  }
}