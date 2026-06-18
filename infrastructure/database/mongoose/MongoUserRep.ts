import mongoose from "mongoose";
import type { IUserRepository } from "../../../domain/repositories/repo.user.js";
import { User } from "../../../domain/entities/User.js";

const MgoUserSchema = new mongoose.Schema({
  sqlId: Number, name: String, email: String, role: String, isBlocked: Boolean, createdAt: Date
});
const MgoUserModel = mongoose.model('User', MgoUserSchema);

export class MongoUserRepository implements IUserRepository {
  async save(user: User): Promise<User> {
    await MgoUserModel.findOneAndUpdate(
      { sqlId: user.id },
      { name: user.name, email: user.email, role: user.role, isBlocked: user.isBlocked, createdAt: user.createdAt },
      { upsert: true }
    );
    return user;
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    await MgoUserModel.findOneAndUpdate({ sqlId: id }, { name: user.name, role: user.role, isBlocked: user.isBlocked });
    return user as User;
  }

  async delete(id: number): Promise<void> {
    await MgoUserModel.deleteOne({ sqlId: id });
  }

  async findById(id: number): Promise<User | null> { return null; }
  async findByEmail(email: string): Promise<User | null> { return null; }

  async findAll(): Promise<User[]> {
    const docs = await MgoUserModel.find();
    return docs.map(d => new User(d.sqlId!, d.name!, d.email!, undefined, d.role!, d.isBlocked!, d.createdAt!));
  }
}
