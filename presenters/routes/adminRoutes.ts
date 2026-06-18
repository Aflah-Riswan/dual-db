import express from 'express';
import { UserController } from '../controllers/userController.js';
import { AuthMiddleware } from '../middlewares/AuthMiddleware.js';

export function makeAdminRoutes(userController: UserController, authMiddleware: AuthMiddleware) {
  const router = express.Router();
  router.use(authMiddleware.authenticate, authMiddleware.authorize(['admin']));
  router.get('/users/sql', userController.adminGetAllSqlUsers);     
  router.get('/users/mongo', userController.adminGetAllMongoUsers); 
  router.put('/users/:id', userController.adminUpdateUser);         
  router.delete('/users/:id', userController.adminDeleteUser);      

  return router;
}