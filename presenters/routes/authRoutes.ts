import express from 'express';
import type { UserController } from '../controllers/userController.js';


export function makeAuthRoutes(userController: UserController) {
  const router = express.Router();

  router.post('/register', userController.register);
  router.post('/login', userController.login);

  return router;
}