import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { PrismaUserRepo } from './infrastructure/database/prisma-db/PrismaUserRepo.js';
import { MongoUserRepository } from './infrastructure/database/mongoose/MongoUserRep.js';
import { RabbitMQService } from './infrastructure/messaging/rabbitmq/RabbitMQService.js';
import { BcryptEncryptionService } from './infrastructure/security/BCryptService.js';
import { JwtTokenService } from './infrastructure/security/JwtTokenService.js';
import { CreateUserUseCase } from './application/use-cases/CreateUserCase.js';
import { AdminCrudUseCase } from './application/use-cases/AdminUseCase.js';
import { SyncUserUseCase } from './application/use-cases/SyncUserUseCase.js';
import { UserController } from './presenters/controllers/userController.js';
import { AuthMiddleware } from './presenters/middlewares/AuthMiddleware.js';

dotenv.config();
const app = express();
app.use(express.json());

async function bootstrap() {
  const sqlRepo = new PrismaUserRepo();
  const mongoRepo = new MongoUserRepository();
  const rabbitService = new RabbitMQService();
  const encryptionService = new BcryptEncryptionService();
  const tokenService = new JwtTokenService();

  await mongoose.connect(process.env.MONGO_DB_URL || 'mongodb://127.0.0.1:27017/dual_db_project');
  await rabbitService.initialize(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');

  const createUserUseCase = new CreateUserUseCase(sqlRepo, rabbitService, encryptionService);
  const adminCrudUseCase = new AdminCrudUseCase(sqlRepo, rabbitService);
  const syncUserUseCase = new SyncUserUseCase(mongoRepo);

  const userController = new UserController(createUserUseCase, adminCrudUseCase, sqlRepo, mongoRepo, tokenService, encryptionService);
  const authMiddleware = new AuthMiddleware(tokenService);

  await rabbitService.consume('user_sync_queue', syncUserUseCase);

  // 🚪 OPEN ROUTES
  app.post('/auth/register', userController.register);
  app.post('/auth/login', userController.login);

  // 👤 USER ROUTE
  app.get('/user/profile', authMiddleware.authenticate, userController.getProfile);

  // 🔑 ADMIN PROTECTED ROUTES (CRUD)
  const adminRouter = express.Router();
  adminRouter.use(authMiddleware.authenticate, authMiddleware.authorize(['admin']));
  
  adminRouter.get('/users/sql', userController.adminGetAllSqlUsers);     // Read MySQL
  adminRouter.get('/users/mongo', userController.adminGetAllMongoUsers); // Read MongoDB
  adminRouter.put('/users/:id', userController.adminUpdateUser);         // Update
  adminRouter.delete('/users/:id', userController.adminDeleteUser);      // Delete

  app.use('/admin', adminRouter);

  app.listen(3000, () => console.log('🚀 Secure Clean Architecture Service Active on Port 3000'));
}

bootstrap().catch(console.error);