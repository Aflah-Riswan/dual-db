import express from 'express';
import { UserController } from '../controllers/userController.js';
import { AuthMiddleware } from '../middlewares/AuthMiddleware.js';

export function makeUserRoutes(userController: UserController, authMiddleware: AuthMiddleware) {
  const router = express.Router();

  router.get('/profile', authMiddleware.authenticate, userController.getProfile);

  return router;
}