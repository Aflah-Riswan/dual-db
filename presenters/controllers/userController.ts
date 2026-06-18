import type { Request, Response } from "express";
import type { IEncryptionService } from "../../domain/services/IEncryptionService.js";
import type { ITokenService } from "../../domain/services/service.token.js";
import type { IUserRepository } from "../../domain/repositories/repo.user.js";
import type { AdminCrudUseCase } from "../../application/use-cases/AdminUseCase.js";
import type { CreateUserUseCase } from "../../application/use-cases/CreateUserCase.js";

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly adminCrudUseCase: AdminCrudUseCase,
    private readonly sqlRepository: IUserRepository,
    private readonly mongoRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly encryptionService: IEncryptionService,
  ) {}

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.createUserUseCase.execute(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await this.sqlRepository.findByEmail(email);
      if (!user || !(await this.encryptionService.compare(password, user.password!))) {
        res.status(401).json({ success: false, message: "Invalid credentials." });
        return;
      }

      if (user.isBlocked) {
        res.status(403).json({ success: false, message: "Your account has been deactivated by an admin." });
        return;
      }

      const token = this.tokenService.generateToken({ id: user.id!, email: user.email, role: user.role });
      res.status(200).json({ success: true, token });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  };

  getProfile = async (req: Request, res: Response) => {
    const user = await this.sqlRepository.findById(req.user!.id);

    if (!user) {
      res.status(444).json({ success: false, message: "User not found." });
      return;
    }

    if (user.isBlocked) {
      res.status(403).json({ success: false, message: "Your account has been deactivated by an admin." });
      return;
    }
    res.status(200).json({ success: true, data: user });
  };

  // Admin Operations
  adminGetAllSqlUsers = async (req: Request, res: Response) => {
    res.status(200).json(await this.sqlRepository.findAll());
  };

  adminGetAllMongoUsers = async (req: Request, res: Response) => {
    res.status(200).json(await this.mongoRepository.findAll());
  };

  adminUpdateUser = async (req: Request, res: Response) => {
    const updated = await this.adminCrudUseCase.updateUser(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data: updated });
  };

  adminDeleteUser = async (req: Request, res: Response) => {
    await this.adminCrudUseCase.deleteUser(Number(req.params.id));
    res.status(200).json({ success: true, message: "Deleted successfully." });
  };
}
