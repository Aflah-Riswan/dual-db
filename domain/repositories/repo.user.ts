import type { User } from "../entities/User.js";

export interface IUserRepo {
  save(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}
