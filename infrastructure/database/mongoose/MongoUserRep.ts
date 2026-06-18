import mongoose from "mongoose";
import type { IUserRepo } from "../../../domain/repositories/repo.user.js";
import { User } from "../../../domain/entities/User.js";

const MongoUserSchema = new mongoose.Schema({
  sqlId: Number,
  name: String,
  email: String,
  role: String,
  isBlocked: Boolean,
  createdAt: Date,
});
const MongoUserModel = mongoose.model("User", MongoUserSchema);

export class MongoUserRepo implements IUserRepo {
  async save(user: User): Promise<User> {
    await MongoUserModel.findOneAndUpdate(
      { sqlId: user.id },
      { name: user.name, email: user.email, password: user.password, role: user.role, isBlocked: user.isBlocked, createdAt: user.createdAt },
      { upsert: true },
    );
    return user;
  }
  async findByEmail(email: string): Promise<User | null> {
    return null;
  }
  async findAll(): Promise<User[]> {
    const docs = await MongoUserModel.find();
    return docs.map((d : any) => new User(d.sqlId!, d.name!, d.email!, undefined, d.role!, d.isBlocked!, d.createdAt!));
  }
}
