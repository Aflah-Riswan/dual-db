import { User } from "../../domain/entities/User.js";
import type { IUserRepo } from "../../domain/repositories/repo.user.js";

export class SyncUserUseCase {
  constructor(private readonly mongoRepository: IUserRepo) {}
  async execute(userData: any): Promise<void> {
    const userEntity = new User(
      userData.id,
      userData.name,
      userData.email,
      userData.password,
      userData.role,
      userData.isBlocked,
      new Date(userData.createdAt),
    );
    await this.mongoRepository.save(userEntity);
  }
}
