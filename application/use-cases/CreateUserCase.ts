import { User } from "../../domain/entities/User.js";
import type { IUserRepo } from "../../domain/repositories/repo.user.js";

export interface IMessegingService {
  publish(queue: string, message: any): Promise<void>;
}

export class CreateUserUseCase {
  constructor(
    private readonly sqlRepo: IUserRepo,
    private readonly messageService: IMessegingService,
  ) {}
  async execute(userData: Omit<User, "id" | "role" | "isBlocked" | "createdAt">): Promise<User> {
    const exisitingUser = await this.sqlRepo.findByEmail(userData.email);
    if (exisitingUser) throw new Error("User already existed");
    const userEntity = new User(null, userData.name, userData.email, userData.password);
    const savedUser = this.sqlRepo.save(userEntity);

    await this.messageService.publish("user_sync_queue", savedUser);
    return savedUser;
  }
}
