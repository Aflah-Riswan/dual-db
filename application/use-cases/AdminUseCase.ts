import type { User } from "../../domain/entities/User.js";
import type { IUserRepository } from "../../domain/repositories/repo.user.js";
import type { IMessagingService } from "./CreateUserCase.js";


export class AdminCrudUseCase {
  constructor(
    private readonly sqlRepository: IUserRepository,
    private readonly messagingService: IMessagingService
  ) {}

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const updatedUser = await this.sqlRepository.update(id, updateData);
    await this.messagingService.publish('user_sync_queue', 'UPDATE', updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    await this.sqlRepository.delete(id);
    await this.messagingService.publish('user_sync_queue', 'DELETE', { id });
  }
}