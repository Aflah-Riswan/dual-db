import { User } from "../../domain/entities/User.js";
import type { IUserRepository } from "../../domain/repositories/repo.user.js";

import type { IEncryptionService } from "../../domain/services/IEncryptionService.js";

export interface IMessagingService {
  publish(queue: string, action: string, message: any): Promise<void>;
}

export class CreateUserUseCase {
  constructor(
    private readonly sqlRepository: IUserRepository,
    private readonly messagingService: IMessagingService,
    private readonly encryptionService: IEncryptionService
  ) {}

  async execute(userData: Omit<User, 'id' | 'role' | 'isBlocked' | 'createdAt'> & { role?: string }): Promise<User> {
    const existingUser = await this.sqlRepository.findByEmail(userData.email);
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await this.encryptionService.hash(userData.password!);
    
    const userEntity = new User(null, userData.name, userData.email, hashedPassword, userData.role || 'user');
    const savedUser = await this.sqlRepository.save(userEntity);

    await this.messagingService.publish('user_sync_queue', 'CREATE', savedUser);
    return savedUser;
  }
}
